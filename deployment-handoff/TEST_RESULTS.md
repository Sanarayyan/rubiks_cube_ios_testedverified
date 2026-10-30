# Physical-phone test handoff

Date recorded: 30 October 2026. Base source: ios-testing at 7bf58b92640de92246a3a971c02f115d0933f4d9 plus the reusable fixes supplied in this handoff.

## Tester-reported results

The tester first confirmed the iPhone Release app worked after unplugging USB, then confirmed the requested functional checks worked, then confirmed Android and iOS testing was done. The Android confirmation was an overall pass rather than a separately recorded result for each row. These are manual user reports; the assistant did not independently observe every tap or final physical cube state. Results are limited to the tested phones, not every supported device.

| Check | iPhone | Android |
| --- | --- | --- |
| Standalone launch/reopen | Reported working, specifically confirmed without USB/Xcode | Overall pass reported; not itemized |
| Cube color input | Reported working | Overall pass reported; not itemized |
| Solve a cube | Reported working | Overall pass reported; not itemized |
| Play/pause, next/previous, reset | Reported working | Overall pass reported; not itemized |
| Background/resume | Reported working | Overall pass reported; not itemized |
| External contact/link behavior | Reported working | Overall pass reported; not itemized |
| Offline error and restored-network retry | Reported working | Overall pass reported; not itemized |

Phone coverage:
- iPhone detected by Xcode: iPhone SE, model iPhone12,8 (2nd generation). Exact OS version was not recorded in this handoff.
- Android physical-phone model and exact OS version were not recorded. Ask the tester for these if the QA record requires them.
- iPad and broader phone/OS coverage were not tested.

## Builds used

Both native test builds used version 1.1.0, build 2, in Release mode. App logic came from the same reviewed source candidate. Frontend platform configuration was rebuilt for each OS.

The iPhone used a disposable source copy with temporary local signing scoped only to Runner. It passed signature/unique-framework-ID/Release-AOT checks and installed successfully. The original Debug build displayed Flutter's expected no-debugger launch restriction; it was replaced for standalone testing.

The Android test APK was built from a disposable copy with release optimization enabled, a temporary `.devicetest` applicationId suffix, a local testing key, and the display name Cube Solver Test. Those Android testing-only edits are not in the reusable source patch. Its package is com.ferryswiss.rubikssolver.devicetest; minimum API 24, target API 36; arm64-v8a, armeabi-v7a and x86_64 included.

Reference Android APK (provided separately, intentionally excluded from Git): Cube-Solver-Test-1.1.0.apk
SHA256: 57c3677cb975bc9177b2de8db845f3d7168db914e0b7a7b05b875050456b9fce
This APK is for testing and is not the Play Store upload artifact.

## Automated checks performed

- React production build and all 10 existing React tests passed.
- Existing Flutter widget test passed.
- Unsigned iOS Release compilation passed with the original production identifier.
- Corrected, separately signed iPhone Release test build and installation passed.
- Android Release APK compilation and APK signature verification passed.
- Production backend health check passed.
- Known scramble R U F' L2 D solved in fast and beginner modes; both responses were D' L2 F U' R'. Applying them through both app move models yielded solved cubes.
- All 18 move variants agreed between the input and animation models. This is a mathematical check, not a visual rendering test.
- Marketing icon verified 1024x1024 without alpha.
- Source patch applies/reverses cleanly against the exact base; original bundle identifiers retained and personal signing excluded.

## Not validated here

Production signing under the owner's accounts; App Store/TestFlight archive validation; Play-delivered production-key upgrade behavior; store approval; new privacy-policy link; owner privacy/Data Safety declarations; VersionHub configured with a real authorized key; broad device coverage. The deployment team must verify its final production-identity builds before release.
