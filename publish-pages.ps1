# Publishes the site to GitHub Pages by rebuilding the gh-pages branch.
#   /            -> the full TAILORMADE site (site/index.html): home, Best Selling, Shop, every collection
#   /experience/ -> the earlier single-page version (experience/index.html)
#   /showcase/   -> case shelf      (index.html)
# Run from this folder:  powershell -ExecutionPolicy Bypass -File publish-pages.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Join-Path $env:TEMP ("tm-pages-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force (Join-Path $site 'showcase'), (Join-Path $site 'experience') | Out-Null
$stamp = (Get-Date).ToString('yyyyMMddHHmmss')
$page = [IO.File]::ReadAllText((Join-Path $repo 'site\index.html'), [Text.Encoding]::UTF8)
$page = $page.Replace('<meta name="build" content="dev">', '<meta name="build" content="' + $stamp + '">')
[IO.File]::WriteAllText((Join-Path $site 'index.html'), $page, (New-Object Text.UTF8Encoding $false))
Copy-Item (Join-Path $repo 'experience\index.html') (Join-Path $site 'experience\index.html')
Copy-Item (Join-Path $repo 'index.html') (Join-Path $site 'showcase\index.html')
New-Item -ItemType Directory -Force (Join-Path $site 'assets') | Out-Null
Copy-Item (Join-Path $repo 'assets\hfc-burgundy-face.jpg') (Join-Path $site 'assets\')
Copy-Item (Join-Path $repo 'assets\video') (Join-Path $site 'assets\video') -Recurse
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
