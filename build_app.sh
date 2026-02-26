#!/bin/bash

echo "🚀 Building Rubik's Cube Solver for Play Store..."

# Set environment variables
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH="/usr/local/opt/openjdk/bin:$PATH"

# Clean and get dependencies
echo "📦 Getting dependencies..."
flutter clean
flutter pub get

# Build React app and copy into Flutter assets
echo "🧱 Building React frontend..."
if command -v npm >/dev/null 2>&1; then
  pushd frontend >/dev/null
  npm ci || npm install
  # Set production API URL (change this to your actual backend URL)
  export REACT_APP_API_URL="https://rubiks-cube-solver-3rur.onrender.com/"
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

# Build APK
echo "🔨 Building APK..."
flutter build apk --release

# Build App Bundle (recommended for Play Store)
echo "📱 Building App Bundle..."
flutter build appbundle --release

echo "✅ Build complete!"
echo "📁 APK location: build/app/outputs/flutter-apk/app-release.apk"
echo "📁 AAB location: build/app/outputs/bundle/release/app-release.aab"
echo ""
echo "🎯 Next steps:"
echo "1. Upload app-release.aab to Google Play Console"
echo "2. Fill out store listing using PLAY_STORE_DEPLOYMENT.md"
echo "3. Submit for review"
