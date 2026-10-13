#!/usr/bin/env python3
"""Deploy the aurelia static demo to Vercel via the MCP wrapper CLI."""
import base64, hashlib, json, os, subprocess, sys

VERCEL = "/opt/hatch/bin/vercel"
ROOT = os.path.expanduser("~/workspace/demos/aurelia")

def call_tool(name, args):
    p = subprocess.run(
        [VERCEL, "call-tool", "--name", name, "--arguments-json", json.dumps(args)],
        capture_output=True, text=True, timeout=180)
    out = (p.stdout or "") + (p.stderr or "")
    if p.returncode != 0:
        print(f"!! {name} failed (rc={p.returncode}):\n{out[:2000]}")
        sys.exit(1)
    return out

def sha1_of(path):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

# text files: inline
files = []
for rel, enc in [("index.html", "utf-8"), ("styles.css", "utf-8"), ("app.js", "utf-8")]:
    with open(os.path.join(ROOT, rel), "r", encoding="utf-8") as f:
        files.append({"file": rel, "data": f.read(), "encoding": enc})
    print("inline:", rel)

# images: upload then reference
assets = sorted(os.listdir(os.path.join(ROOT, "assets")))
for a in assets:
    path = os.path.join(ROOT, "assets", a)
    size = os.path.getsize(path)
    digest = sha1_of(path)
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    print(f"== uploading assets/{a} ({size}b sha1={digest[:12]}…) ==")
    out = call_tool("upload_file", {
        "requestBody": b64,
        "xVercelDigest": digest,
        "contentLength": size,
    })
    print("   response:", out[:200].strip())
    files.append({"file": f"assets/{a}", "sha": digest, "size": size})

print("== creating production deployment ==")
out = call_tool("create_deployment", {
    "requestBody": {
        "name": "aurelia",
        "project": "aurelia",
        "target": "production",
        "projectSettings": {"framework": None},
        "files": files,
    }
})
print(out[:3000])
with open("/tmp/aurelia-deploy.json", "w") as f:
    f.write(out)
print("saved -> /tmp/aurelia-deploy.json")
