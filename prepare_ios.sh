#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/Users/anshik/flutter/bin:$PATH"

echo "Current Node Version: $(node -v)"
echo "Current NPM Version: $(npm -v)"

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
