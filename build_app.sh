#!/bin/bash

BUILD_TARGET="${1:-android}"
if [ "$BUILD_TARGET" != "android" ] && [ "$BUILD_TARGET" != "ios" ]; then
  echo "Usage: ./build_app.sh [android|ios]"
  exit 1
fi

echo "🚀 Building Rubik's Cube Solver for $BUILD_TARGET..."

# Set environment variables
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH="$HOME/development/flutter/bin:$PATH"
export PATH="/usr/local/opt/openjdk/bin:$PATH"
APP_VERSION="$(awk '/^version:/ {print $2; exit}' pubspec.yaml | cut -d+ -f1)"

# Clean and get dependencies
echo "📦 Getting dependencies..."
flutter clean
flutter pub get

# Build React app and copy into Flutter assets
echo "🧱 Building React frontend..."
if command -v npm >/dev/null 2>&1; then
  pushd frontend >/dev/null
  npm ci || npm install
  # Set production API URL. Override this before running the script if needed:
  # REACT_APP_API_URL="https://your-backend.example.com" ./build_app.sh
  export REACT_APP_API_URL="${REACT_APP_API_URL:-https://rubiks-cube-solver-3rur.onrender.com}"
  export REACT_APP_VERSION_CHECK_URL="${REACT_APP_VERSION_CHECK_URL:-https://version-hub-1028525309597.us-central1.run.app/api/v1/version-check}"
  export REACT_APP_VERSION_APPLICATION_NAME="${REACT_APP_VERSION_APPLICATION_NAME:-rubiks_suite_solver}"
  export REACT_APP_APP_VERSION="${REACT_APP_APP_VERSION:-$APP_VERSION}"
  export REACT_APP_VERSION_PLATFORM="${REACT_APP_VERSION_PLATFORM:-$BUILD_TARGET}"

  if [ -z "${REACT_APP_VERSION_HUB_API_KEY:-}" ]; then
    echo "⚠️  REACT_APP_VERSION_HUB_API_KEY is not set. VersionHub checks will be skipped in this build."
  fi

  npm run build
  popd >/dev/null
else
  echo "⚠️  npm not found. Skipping React build. Make sure your latest frontend build exists in frontend/build."
fi

echo "📁 Copying React build to Flutter assets..."
rm -rf assets/www
mkdir -p assets/www
if [ -d frontend/build ]; then
  cp -R frontend/build/* assets/www/
else
  echo "⚠️  frontend/build not found. WebView will load a blank page until you build the React app."
fi

if [ "$BUILD_TARGET" = "android" ]; then
  # Build APK
  echo "🔨 Building APK..."
  flutter build apk --release

  # Build App Bundle (recommended for Play Store)
  echo "📱 Building App Bundle..."
  flutter build appbundle --release
else
  echo "📱 Building iOS app without code signing..."
  flutter build ios --release --no-codesign
fi

echo "✅ Build complete!"
if [ "$BUILD_TARGET" = "android" ]; then
  echo "📁 APK location: build/app/outputs/flutter-apk/app-release.apk"
  echo "📁 AAB location: build/app/outputs/bundle/release/app-release.aab"
else
  echo "📁 iOS build location: build/ios/iphoneos/Runner.app"
fi
echo ""
echo "🎯 Next steps:"
echo "1. Upload app-release.aab to Google Play Console"
echo "2. Fill out store listing using PLAY_STORE_DEPLOYMENT.md"
echo "3. Submit for review"
