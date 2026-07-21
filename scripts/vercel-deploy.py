#!/usr/bin/env python3
"""Deploy apps/<app> to Vercel via REST API file-upload (no git integration).

Ships git HEAD content (git ls-files + git show HEAD:<path>) so dirty
working-tree files / user WIP are NEVER deployed.

Usage:
  python3 scripts/vercel-deploy.py <app> [--framework nextjs] [--force-new]

Env: token read from ~/.kimi-code/credentials/mcp/vercel-*-tokens.json
Team: vincerhodes-projects (hardcoded teamId below).
"""
import base64
import glob
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


def req(method, path, payload=None, tok=None):
    data = json.dumps(payload).encode() if payload is not None else None
    r = urllib.request.Request(
        f"{API}{path}{'&' if '?' in path else '?'}teamId={TEAM}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {tok or token()}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(r) as resp:
        return json.loads(resp.read())


def git_files(app):
    out = subprocess.run(
        ["git", "ls-files", f"apps/{app}"], capture_output=True, text=True, check=True
    ).stdout.split()
    files = []
    for p in out:
        rel = p[len(f"apps/{app}/"):]
        content = subprocess.run(
            ["git", "show", f"HEAD:{p}"], capture_output=True, check=True
        ).stdout
        try:
            files.append({"file": rel, "data": content.decode("utf-8")})
        except UnicodeDecodeError:
            files.append(
                {
                    "file": rel,
                    "data": base64.b64encode(content).decode(),
                    "encoding": "base64",
                }
            )
    return files


def main():
    app = sys.argv[1]
    framework = "nextjs"
    if "--framework" in sys.argv:
        framework = sys.argv[sys.argv.index("--framework") + 1]
    files = git_files(app)
    print(f"{len(files)} files from HEAD")
    payload = {
        "name": app,
        "target": "production",
        "files": files,
        "projectSettings": {"framework": framework, "rootDirectory": None},
    }
    if "--force-new" in sys.argv:
        payload["forceNew"] = True
    dep = req("POST", "/v13/deployments", payload)
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
