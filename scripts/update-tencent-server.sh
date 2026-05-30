#!/usr/bin/env bash
set -euo pipefail

APP_NAME="heritage-fire-monitor"
REPO_ZIP="https://github.com/lanwanlangquan-glitch/heritage-fire-monitor/archive/refs/heads/main.zip"
PROXY_URLS=(
  "https://gh.llkk.cc/${REPO_ZIP}"
  "https://gh-proxy.com/${REPO_ZIP}"
  "https://ghfast.top/${REPO_ZIP}"
  "${REPO_ZIP}"
)

cd "$HOME"

echo "[1/6] Install basic tools"
sudo apt-get update -y
sudo apt-get install -y curl unzip

echo "[2/6] Download latest project"
rm -rf "${APP_NAME}-main" "${APP_NAME}-new" main.zip
for url in "${PROXY_URLS[@]}"; do
  echo "Trying: ${url}"
  if curl -L --fail --connect-timeout 20 --max-time 180 -o main.zip "${url}"; then
    break
  fi
done

test -s main.zip

echo "[3/6] Unpack project"
unzip -q main.zip
mv "${APP_NAME}-main" "${APP_NAME}-new"

echo "[4/6] Preserve server data and swap release"
if [ -d "${APP_NAME}/backend/data" ]; then
  mkdir -p "${APP_NAME}-new/backend"
  cp -a "${APP_NAME}/backend/data" "${APP_NAME}-new/backend/data"
fi
if [ -d "${APP_NAME}" ]; then
  mv "${APP_NAME}" "${APP_NAME}.bak.$(date +%Y%m%d%H%M%S)"
fi
mv "${APP_NAME}-new" "${APP_NAME}"

echo "[5/6] Install dependencies"
cd "${APP_NAME}"
npm install

echo "[6/6] Restart service"
pm2 restart "${APP_NAME}" || pm2 start backend/server.js --name "${APP_NAME}"
pm2 save --force
sleep 2
curl -s "http://127.0.0.1:3000/api/health"
echo ""
echo "DONE: http://81.70.232.233:3000"
