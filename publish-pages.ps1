# Publishes the site to GitHub Pages by rebuilding the gh-pages branch.
#   /            -> 3D experience   (experience/index.html)
#   /showcase/   -> case shelf      (index.html)
#   /experience/ -> redirects to the main page
# Run from this folder:  powershell -ExecutionPolicy Bypass -File publish-pages.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Join-Path $env:TEMP ("tm-pages-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force (Join-Path $site 'showcase'), (Join-Path $site 'experience') | Out-Null
Copy-Item (Join-Path $repo 'experience\index.html') (Join-Path $site 'index.html')
Copy-Item (Join-Path $repo 'index.html') (Join-Path $site 'showcase\index.html')
$redirect = '<!doctype html><meta charset="utf-8"><title>Tailormade</title><meta http-equiv="refresh" content="0; url=../"><link rel="canonical" href="../"><a href="../">Continue to Tailormade</a>'
[IO.File]::WriteAllText((Join-Path $site 'experience\index.html'), $redirect, (New-Object Text.UTF8Encoding $false))
New-Item -ItemType File (Join-Path $site '.nojekyll') | Out-Null

$origin = (git -C $repo remote get-url origin)
$source = (git -C $repo rev-parse --short HEAD)
Push-Location $site
git init -q -b gh-pages
git add -A
git commit -q -m "Publish site from $source"
git push -q -f $origin gh-pages
Pop-Location
Remove-Item -Recurse -Force $site
"Published $source to gh-pages"
