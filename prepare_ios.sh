#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/Users/anshik/flutter/bin:$PATH"

echo "Current Node Version: $(node -v)"
echo "Current NPM Version: $(npm -v)"

APP_VERSION="$(awk '/^version:/ {print $2; exit}' pubspec.yaml | cut -d+ -f1)"
export REACT_APP_VERSION_CHECK_URL="${REACT_APP_VERSION_CHECK_URL:-https://version-hub-1028525309597.us-central1.run.app/api/v1/version-check}"
export REACT_APP_VERSION_APPLICATION_NAME="${REACT_APP_VERSION_APPLICATION_NAME:-rubiks_suite_solver}"
export REACT_APP_APP_VERSION="${REACT_APP_APP_VERSION:-$APP_VERSION}"
export REACT_APP_VERSION_PLATFORM="${REACT_APP_VERSION_PLATFORM:-ios}"

if [ -z "${REACT_APP_VERSION_HUB_API_KEY:-}" ]; then
    echo "⚠️  REACT_APP_VERSION_HUB_API_KEY is not set. VersionHub checks will be skipped in this build."
fi

echo "Building frontend..."
cd frontend
npm run build

echo "Syncing assets..."
cd ..
mkdir -p assets/www
cp -rv frontend/build/* assets/www/

echo "Updating Flutter dependencies..."
flutter pub get

export PATH="/Users/anshik/.gem/ruby/2.6.0/bin:$PATH"
echo "Updating iOS pods..."
cd ios
pod install
cd ..

echo "Everything is ready for iOS testing!"
