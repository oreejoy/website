Admin interface for Oreejoy website
===================================

Overview
--------
This local Flask admin (`admin.py`) provides a drag-and-drop UI to add images and metadata to `data/hero-rotator.json` and `data/publications.json`, and saves media to `assets/hero/` or `assets/publications/`.

Authentication
--------------
Endpoints are protected with HTTP Basic Auth. Set environment variables before running:

Windows PowerShell

```powershell
$env:ADMIN_USER = 'youruser'
$env:ADMIN_PASS = 'yourpass'
python admin.py
```

Linux / macOS

```bash
export ADMIN_USER=youruser
export ADMIN_PASS=yourpass
python admin.py
```

Deploying to GitHub (one-click)
-------------------------------
The admin UI includes a `Commit & Push to GitHub` button which runs `git add --all`, `git commit`, and `git push` from the project root. Ensure the repository has a valid remote and your environment is able to authenticate (SSH keys or credential helper).

If you want to point this project to the GitHub repo `https://github.com/oreejoy/website/`, initialize the repository and add that remote:

```powershell
cd C:\Users\Priyesh\Desktop\oreejoyInWebsite
git init
git remote add origin https://github.com/oreejoy/website.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

If the repo already exists locally, verify with:

```powershell
git remote -v
```

Security notes
--------------
- Keep `ADMIN_PASS` secret; do not commit it to source control.
- The server binds to `127.0.0.1` by default; do not expose it publicly unless behind access controls.
- For production or multi-user deployment, use HTTPS and a proper auth provider.
