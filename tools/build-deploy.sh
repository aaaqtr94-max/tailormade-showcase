#!/bin/sh
# Builds the "deploy" folder that Netlify publishes (run by netlify.toml on every push to main):
#   /                 -> the full TAILORMADE site       (site/index.html)
#   /experience/      -> the earlier single-page version (experience/index.html)
#   /showcase/        -> the case shelf                  (index.html)
#   /shopify-preview/ -> the Shopify sections preview    (shopify/preview/index.html)
set -e
cd "$(dirname "$0")/.."
rm -rf deploy
mkdir -p deploy/experience deploy/showcase deploy/shopify-preview deploy/assets
# stamp the build so phones holding an old copy reload the new one
sed "s/<meta name=\"build\" content=\"dev\">/<meta name=\"build\" content=\"$(date -u +%Y%m%d%H%M%S)\">/" site/index.html > deploy/index.html
cp experience/index.html deploy/experience/index.html
cp index.html deploy/showcase/index.html
cp shopify/preview/index.html deploy/shopify-preview/index.html
cp assets/hfc-burgundy-face.jpg deploy/assets/
mkdir -p deploy/assets/video
cp assets/video/bg-tall.mp4 assets/video/bg-tall.jpg assets/video/bg-wide.mp4 assets/video/bg-wide.jpg deploy/assets/video/
echo "deploy/ built"
