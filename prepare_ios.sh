#!/bin/bash
set -e
set -o pipefail
cd "$(dirname "$0")"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

for tool in node npm flutter pod xcodebuild; do
    command -v "$tool" >/dev/null 2>&1 || { echo "Missing required tool: $tool" >&2; exit 1; }
done
xcodebuild -version

echo "Current Node Version: $(node -v)"
echo "Current NPM Version: $(npm -v)"

APP_VERSION="$(awk '/^version:/ {print $2; exit}' pubspec.yaml | cut -d+ -f1)"
export REACT_APP_API_URL="${REACT_APP_API_URL:-https://rubiks-cube-solver-3rur.onrender.com}"
export REACT_APP_VERSION_CHECK_URL="${REACT_APP_VERSION_CHECK_URL:-https://version-hub-1028525309597.us-central1.run.app/api/v1/version-check}"
export REACT_APP_VERSION_APPLICATION_NAME="${REACT_APP_VERSION_APPLICATION_NAME:-rubiks_suite_solver}"
export REACT_APP_APP_VERSION="${REACT_APP_APP_VERSION:-$APP_VERSION}"
export REACT_APP_VERSION_PLATFORM="${REACT_APP_VERSION_PLATFORM:-ios}"

if [ -z "${REACT_APP_VERSION_HUB_API_KEY:-}" ]; then
    echo "⚠️  REACT_APP_VERSION_HUB_API_KEY is not set. VersionHub checks will be skipped in this build."
fi

echo "Building frontend..."
cd frontend
npm ci
npm run build

echo "Syncing assets..."
cd ..
mkdir -p assets/www
cp -R frontend/build/. assets/www/

echo "Updating Flutter dependencies..."
flutter pub get

echo "Updating iOS pods..."
cd ios
pod install
cd ..

echo "Dependencies and assets prepared. Review the deployment target and signing before running ios/Runner.xcworkspace."
