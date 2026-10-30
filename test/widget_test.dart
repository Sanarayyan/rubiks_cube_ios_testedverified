import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rubiks_cube_solver/main.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_platform_interface/webview_flutter_platform_interface.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('App loads its bundled WebView and clears its loading indicator',
      (tester) async {
    final previousPlatform = WebViewPlatform.instance;
    final platform = _TestWebViewPlatform();
    WebViewPlatform.instance = platform;
    addTearDown(() {
      if (previousPlatform != null) {
        WebViewPlatform.instance = previousPlatform;
      }
    });

    await tester.pumpWidget(const RubiksCubeSolverApp());
    expect(find.byType(WebViewWidget), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(tester.widget<MaterialApp>(find.byType(MaterialApp)).title,
        "Rubik's Cube Solver");
    expect(platform.controller.javaScriptMode, JavaScriptMode.unrestricted);
    expect(platform.controller.channelNames,
        containsAll(['FlutterBridge', 'Logger']));

    await tester.runAsync(() => platform.controller.assetLoaded.future
        .timeout(const Duration(seconds: 5)));
    expect(platform.controller.assetPath, 'assets/www/index.html');

    platform.delegate.onPageFinished!('file:///assets/www/index.html');
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.byType(WebViewWidget), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

// Simulate only the native APIs exercised by app startup.
class _TestWebViewPlatform extends WebViewPlatform {
  late _TestController controller;
  late _TestNavigationDelegate delegate;

  @override
  PlatformWebViewController createPlatformWebViewController(
      PlatformWebViewControllerCreationParams params) {
    return controller = _TestController(params);
  }

  @override
  PlatformNavigationDelegate createPlatformNavigationDelegate(
      PlatformNavigationDelegateCreationParams params) {
    return delegate = _TestNavigationDelegate(params);
  }

  @override
  PlatformWebViewWidget createPlatformWebViewWidget(
      PlatformWebViewWidgetCreationParams params) {
    return _TestWebViewWidget(params);
  }
}

class _TestController extends PlatformWebViewController {
  _TestController(super.params) : super.implementation();

  final assetLoaded = Completer<void>();
  String? assetPath;
  final channelNames = <String>[];
  JavaScriptMode? javaScriptMode;

  @override
  Future<void> setJavaScriptMode(JavaScriptMode mode) async {
    javaScriptMode = mode;
  }

  @override
  Future<void> setBackgroundColor(Color color) async {}

  @override
  Future<void> addJavaScriptChannel(JavaScriptChannelParams params) async {
    channelNames.add(params.name);
  }

  @override
  Future<void> setPlatformNavigationDelegate(
      PlatformNavigationDelegate handler) async {}

  @override
  Future<void> loadFlutterAsset(String key) async {
    assetPath = key;
    assetLoaded.complete();
  }
}

class _TestNavigationDelegate extends PlatformNavigationDelegate {
  _TestNavigationDelegate(super.params) : super.implementation();

  PageEventCallback? onPageFinished;

  @override
  Future<void> setOnPageFinished(PageEventCallback callback) async {
    onPageFinished = callback;
  }

  @override
  Future<void> setOnNavigationRequest(
      NavigationRequestCallback callback) async {}

  @override
  Future<void> setOnWebResourceError(WebResourceErrorCallback callback) async {}
}

class _TestWebViewWidget extends PlatformWebViewWidget {
  _TestWebViewWidget(super.params) : super.implementation();

  @override
  Widget build(BuildContext context) => const SizedBox.expand();
}
