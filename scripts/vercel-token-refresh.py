#!/usr/bin/env python3
"""Refresh the Vercel MCP OAuth token (expires hourly). Prints new access_token."""
import json, glob, os, urllib.request, urllib.parse

base = glob.glob(os.path.expanduser("~/.kimi-code/credentials/mcp/vercel-*"))
tok_f = [f for f in base if f.endswith("-tokens.json")][0]
cli_f = [f for f in base if f.endswith("-client.json")][0]
disc_f = [f for f in base if f.endswith("-discovery.json")][0]
tok = json.load(open(tok_f)); cli = json.load(open(cli_f)); disc = json.load(open(disc_f))

fields = {"grant_type": "refresh_token", "refresh_token": tok["refresh_token"], "client_id": cli["client_id"]}
if cli.get("client_secret"):
    fields["client_secret"] = cli["client_secret"]
req = urllib.request.Request(disc["authorizationServerMetadata"]["token_endpoint"],
                             data=urllib.parse.urlencode(fields).encode(),
                             headers={"Content-Type": "application/x-www-form-urlencoded"})
r = json.load(urllib.request.urlopen(req))
r["refresh_token"] = r.get("refresh_token", tok["refresh_token"])
json.dump(r, open(tok_f, "w"), indent=2); os.chmod(tok_f, 0o600)
print(r["access_token"])
