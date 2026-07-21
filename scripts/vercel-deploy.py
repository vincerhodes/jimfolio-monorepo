#!/usr/bin/env python3
"""Deploy apps/<app> to Vercel via REST API file-upload (no git integration).

Ships git HEAD content (git ls-files + git show HEAD:<path>) so dirty
working-tree files / user WIP are NEVER deployed.

Uses the digest flow (sha1 + POST /v2/files for missing blobs) so there is
no request-body size limit and unchanged files are not re-uploaded.

Usage:
  python3 scripts/vercel-deploy.py <app> [--framework nextjs|none] [--force-new]

Env: token read from ~/.kimi-code/credentials/mcp/vercel-*-tokens.json
Team: vincerhodes-projects (hardcoded teamId below).
"""
import glob
import hashlib
import json
import subprocess
import sys
import time
import urllib.request

TEAM = "team_nLguuJfJkPab7qCZwHgvegAP"
API = "https://api.vercel.com"


def token():
    f = glob.glob("/home/vincerhodes/.kimi-code/credentials/mcp/vercel-*-tokens.json")[0]
    return json.load(open(f))["access_token"]


def req(method, path, payload=None, raw=None, headers=None):
    url = f"{API}{path}{'&' if '?' in path else '?'}teamId={TEAM}"
    h = {"Authorization": f"Bearer {token()}"}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode()
        h["Content-Type"] = "application/json"
    elif raw is not None:
        data = raw
        h["Content-Type"] = "application/octet-stream"
    if headers:
        h.update(headers)
    r = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            err = json.loads(body)
        except ValueError:
            raise RuntimeError(f"HTTP {e.code}: {body[:500]}")
        if err.get("error", {}).get("code") == "missing_files":
            return err["error"]
        raise RuntimeError(f"HTTP {e.code}: {json.dumps(err)[:1000]}")


def git_files(app):
    out = subprocess.run(
        ["git", "ls-files", f"apps/{app}"], capture_output=True, text=True, check=True
    ).stdout.splitlines()
    files = {}
    for p in out:
        if not p.strip():
            continue
        rel = p[len(f"apps/{app}/"):]
        content = subprocess.run(
            ["git", "show", f"HEAD:{p}"], capture_output=True, check=True
        ).stdout
        files[rel] = content
    return files


def main():
    app = sys.argv[1]
    framework = "nextjs"
    if "--framework" in sys.argv:
        framework = sys.argv[sys.argv.index("--framework") + 1]
        if framework == "none":
            framework = None
    contents = git_files(app)
    total = sum(len(c) for c in contents.values())
    print(f"{len(contents)} files from HEAD, {total/1e6:.1f}MB")

    def digest_entries():
        return [
            {
                "file": rel,
                "sha": hashlib.sha1(c).hexdigest(),
                "size": len(c),
                "mode": 33188,
            }
            for rel, c in contents.items()
        ]

    payload = {
        "name": app,
        "target": "production",
        "files": digest_entries(),
        "projectSettings": {"framework": framework, "rootDirectory": None},
    }
    if "--force-new" in sys.argv:
        payload["forceNew"] = True

    sha_by_digest = {hashlib.sha1(c).hexdigest(): c for c in contents.values()}
    for attempt in range(3):
        resp = req("POST", "/v13/deployments", payload)
        if "missing" in resp:
            missing = resp["missing"]
            print(f"uploading {len(missing)} missing blobs")
            for sha in missing:
                req(
                    "POST",
                    "/v2/files",
                    raw=sha_by_digest[sha],
                    headers={"x-vercel-digest": sha},
                )
            continue
        dep = resp
        break
    else:
        print("still missing files after 3 attempts")
        sys.exit(1)

    dep_id = dep["id"]
    print(f"deploy {dep_id} → {dep.get('url')}")
    for _ in range(120):
        time.sleep(10)
        d = req("GET", f"/v13/deployments/{dep_id}")
        state = d.get("readyState")
        print(state, flush=True)
        if state == "READY":
            print(f"READY: https://{d['url']}")
            return
        if state in ("ERROR", "CANCELED"):
            print(json.dumps(d)[:2000])
            sys.exit(1)
    print("timeout waiting for READY")
    sys.exit(1)


if __name__ == "__main__":
    main()
