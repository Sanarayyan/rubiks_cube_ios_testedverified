# Android and iOS deployment handoff

Prepared 30 October 2026. This is a handoff to the deployment team, not confirmation of store approval.

## 1. What has been tested

The tester reports that the Android and iPhone Release test apps work on physical phones. The iPhone was also closed and reopened without Xcode or a USB cable. The tester reported the requested functional checklist working. See [TEST_RESULTS.md](deployment-handoff/TEST_RESULTS.md) for evidence and limitations.

The test apps used temporary testing identifiers/signatures. **Do not publish the test APK or copy the tester's Apple team/provisioning configuration into a production build.** Build new owner-signed artifacts from the reviewed source.

The reviewed fixes and this handbook are prepared on the Git branch `ios/android-tested-code` for handoff. No store upload, submission or publication has been performed. Android was already deployed according to the owner/tester; its existing Play Console configuration has not been independently inspected.

## 2. Which source to use

Repository: `https://github.com/Sanarayyan/rubiks_cube_ios_testedverified.git`

Starting branch: `ios-testing`

Exact base: `7bf58b92640de92246a3a971c02f115d0933f4d9`

Use the Git branch `ios/android-tested-code`. It already contains the reviewed reusable fixes and this handbook. In a clean deployment checkout, first save any existing work, then:

```bash
git fetch origin
git switch --track origin/ios/android-tested-code
git diff 7bf58b92640de92246a3a971c02f115d0933f4d9...HEAD --stat
```

If the local branch already exists, switch to it and verify it matches the intended remote revision. Do not reset or overwrite local changes blindly.

The Desktop testing directory still contains personal testing settings. Do not deploy that original directory as-is or blindly copy all of its changes.

This branch contains the 13 reviewed source/configuration/icon files directly. The standalone patch and its checksum audit remain in the tester's local handoff archive; they are not duplicated in Git. Do not apply that patch again on this branch. Generated builds, Pods, node_modules, machine paths, personal teams, temporary identifiers and signing credentials are excluded from the commit.

Included fixes:

- Restore Debug/Release Flutter xcconfig files and AppFrameworkInfo.plist; track static configuration while ignoring generated files.
- Discover Flutter through locally generated configuration in the Podfile and initialize the CocoaPods helper.
- Make prepare_ios.sh portable, fail on errors, install locked frontend dependencies and select the production API/iOS settings.
- Retain CocoaPods integration and include UIScene startup/plugin registration for the tested Flutter/Xcode combination.
- Set the explicitly approved iOS minimum to **15.0** in the Podfile and all three Xcode project configurations.
- Remove hardcoded Apple development teams while preserving all original app/test identifiers.
- Remove the marketing icon's alpha channel and enable the existing icon generator's iOS alpha-removal setting.
- Include the selected SDK's necessary Dart lock changes (matcher, meta, test_api, vector_math) and regenerated CocoaPods lock for the existing plugins. No direct application dependency was added.

## 3. Toolchain, identifiers and release configuration

| Item | Recorded value |
| --- | --- |
| Flutter / Dart | 3.47.9 / 3.13.7 |
| Xcode / CocoaPods | 27.2 / 1.17.0 |
| Native app version/build tested | 1.1.0 / 2 |
| iOS minimum | 15.0, explicitly approved by the tester |
| Android test APK minimum / target | API 24 (Android 7.0) / API 36 |
| Android build tools / NDK | 36.0.0 / 28.2.13676358 |
| Java | Android Studio bundled OpenJDK 21.0.10 |
| Gradle / AGP / Kotlin | 8.14 / 8.11.1 / 2.2.20 |
| Frontend build environment used for final preparation | Node 25.6.0 / npm 11.8.0 |
| iOS identifier retained from the repository | com.example.rubiksCubeSolver |
| Android production applicationId retained | com.ferryswiss.rubikssolver |
| Production solver API | https://rubiks-cube-solver-3rur.onrender.com |

These identifiers were preserved from the repository; ownership/registration in the actual store accounts is not certified. The tester's Apple Personal Team could not register the original iOS identifier. The deployment team must resolve owner-team access before signing. Do not silently rename an existing store app's identifier.

Select/configure the owner's Flutter SDK, Xcode, Android SDK and Java locally. Do not copy SDK paths from this testing Mac. Check `flutter doctor -v`, `node --version`, `npm --version`, and `pod --version`.

The installed Flutter SDK requires iOS 15. Supporting iOS 13/14 would require a separate compatible-toolchain/dependency investigation and fresh tests. The APK's minimum is not a claim that every Android model was tested.

Before building, choose the release version and an unused numeric build number after checking BOTH store histories. Build 2 may already be used. Set `RELEASE_VERSION` and `RELEASE_BUILD_NUMBER` in your shell; the commands below deliberately fail if they are missing. Align the React version with the native version. Review/update pubspec.yaml as part of your release process.

VersionHub checks were skipped during testing because no authorized key was supplied. The owner must decide whether to configure an authorized key locally for the release and separately test that flow. Never place credentials in this handbook or commit signing files. A key embedded in a React build is accessible to app users; do not use a privileged server credential there.

## 4. Build and distribute iOS

1. Sign in yourself to the owner's Apple Developer/App Store Connect account. Confirm authorization for the original identifier and active distribution access. The tester's account is not the production signing authority.
2. Configure the local tools and choose the release version/build as above. In the repository root:

```bash
: "${RELEASE_VERSION:?Set the approved release version first}"
: "${RELEASE_BUILD_NUMBER:?Set an unused numeric build number first}"
export REACT_APP_APP_VERSION="$RELEASE_VERSION"
export REACT_APP_VERSION_PLATFORM=ios
export REACT_APP_API_URL=https://rubiks-cube-solver-3rur.onrender.com
bash prepare_ios.sh
open ios/Runner.xcworkspace
```

3. In Xcode, select target Runner → Signing & Capabilities → the owner's authorized team. Confirm the production identifier in every configuration. Use Runner.xcworkspace, not Runner.xcodeproj. Review any automatic SDK migrations and regenerated files.
4. Build an owner-signed Release archive/package:

```bash
flutter build ipa --release \
  --build-name "$RELEASE_VERSION" \
  --build-number "$RELEASE_BUILD_NUMBER"
```

Flutter writes the archive under `build/ios/archive` and the exported IPA under `build/ios/ipa` when signing/export succeeds. Follow [Flutter's iOS release guide](https://docs.flutter.dev/deployment/ios).

5. In Xcode Organizer, validate the archive and resolve errors. After the team's approval, upload it to App Store Connect and wait for processing. Test the actual production-identity build through TestFlight, including standalone launch and the functional checklist. The temporary testing-identity result does not validate production provisioning or store services. See [Apple's distribution guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).
6. Complete the listing and owner declarations in section 6; submit for review and choose the release method only after approval by the deployment team.

## 5. Build and distribute Android

Android is an existing deployed app according to the tester. Preserve its real Play applicationId and use the upload key authorized for that Play Console app. Do not use the temporary `.devicetest` package or the local debug/test key. Do not create a replacement key without the owner's established signing/key-reset process.

The existing Gradle release configuration reads `android/key.properties`. Populate that ignored file locally using the owner's existing keystore, alias and passwords. Store the keystore securely outside source control. Do not send passwords through chat or commit them.

Rebuild the frontend for ANDROID immediately before building the Android bundle. Do not reuse an iOS-configured frontend build:

```bash
: "${RELEASE_VERSION:?Set the approved release version first}"
: "${RELEASE_BUILD_NUMBER:?Set an unused numeric build number first}"
export REACT_APP_API_URL=https://rubiks-cube-solver-3rur.onrender.com
export REACT_APP_VERSION_PLATFORM=android
export REACT_APP_APP_VERSION="$RELEASE_VERSION"
cd frontend
npm ci
npm run build
cd ..
mkdir -p assets/www
cp -R frontend/build/. assets/www/
flutter pub get
flutter build appbundle --release \
  --build-name "$RELEASE_VERSION" \
  --build-number "$RELEASE_BUILD_NUMBER"
```

The expected bundle is `build/app/outputs/bundle/release/app-release.aab`. See [Flutter's Android release guide](https://docs.flutter.dev/deployment/android).

Upload the owner-signed AAB to an appropriate Play testing track, verify the existing app can update successfully, and repeat the functional checks on the store-delivered build. Complete required Play Console declarations, then review and roll out the production release through the owner's process. See [Google Play release instructions](https://support.google.com/googleplay/android-developer/answer/9859348).

## 6. Information the owner/deployment team must finish

The tester explicitly left these pending; do not invent or silently fill them:

- Owner Apple Developer/App Store Connect access and identifier ownership.
- Approved listing name (draft: Rubik's Cube Solver), descriptions, screenshots, category and review contact.
- Public privacy-policy URL and a privacy-policy link within the app. No policy link was found in the current frontend; adding the owner's real link remains a source task before submission.
- Support-page URL and verified contact, copyright owner, price and countries/regions.
- App privacy/Data Safety disclosures, including server/provider logging and third-party SDK practices; source inspection alone cannot certify 'no data collected'.
- Age-rating, content-rights and encryption/export-compliance answers where requested.
- Required device screenshots and accessibility declarations supported by actual tests. The iOS project also targets iPad; iPad behavior was not verified here.

[APP_STORE_DRAFT.md](deployment-handoff/APP_STORE_DRAFT.md) supplies draft English copy with pending fields. It does not advertise photo recognition/history because those frontend routes are disabled. Apple requires privacy/support information; consult [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) and [App Review](https://developer.apple.com/app-store/review/).

## 7. Final deployment-team checks

- Review the source patch and build fresh production-signed artifacts; do not ship local test binaries.
- Recheck the production API, version/platform configuration and any VersionHub behavior.
- Retest startup, cube entry/solving, animations, background/resume, external links, offline errors and recovery on the final store-signed builds.
- Check upgrade behavior from the currently deployed Android app and preserve existing identifiers/signing.
- Validate the iOS archive, inspect platform warnings, and confirm required privacy manifests. Plugin manifests were present in the unsigned Release output, but App Store validation was not performed.
- Review Gradle/Kotlin deprecation, source-map, legacy-icon and CocoaPods custom-configuration warnings. They did not block these test builds; any toolchain upgrade needs a fresh validation run.
- Retain build symbols/mapping files, the exact source revision, build numbers and release notes for troubleshooting.

The tester's role is complete for the reported physical-phone checks. Production account access, final signing, store validation, metadata, submissions and rollout belong to the deployment team.
