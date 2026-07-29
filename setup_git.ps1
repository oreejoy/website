# Run this in PowerShell from the project root to initialize the repo and connect to GitHub
cd $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git is not installed or not available in PATH. Install Git before running this script."
    exit 1
}

if (-not (Test-Path .git)) {
    git init
}

try {
    git remote remove origin
} catch {
    # ignore if origin does not exist
}

git remote add origin https://github.com/oreejoy/website.git

# Ensure git has a user identity for commits
$name = git config --get user.name
if (-not $name) {
    if ($env:GIT_AUTHOR_NAME) {
        git config user.name "$env:GIT_AUTHOR_NAME"
    } elseif ($env:USERNAME) {
        git config user.name "$env:USERNAME"
    }
}

$email = git config --get user.email
if (-not $email) {
    if ($env:GIT_AUTHOR_EMAIL) {
        git config user.email "$env:GIT_AUTHOR_EMAIL"
    } elseif ($env:USERNAME) {
        git config user.email "$env:USERNAME@users.noreply.github.com"
    }
}

git branch -M main

git add .

git commit -m "Initial commit"
git push -u origin main
