import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:reusable_in_app_review/reusable_in_app_review.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Transparent status bar
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  runApp(const RubiksCubeSolverApp());
}

class RubiksCubeSolverApp extends StatelessWidget {
  const RubiksCubeSolverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rubik\'s Cube Solver',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A), // Matches React bg
      ),
      home: const WebViewContainer(),
    );
  }
}

class WebViewContainer extends StatefulWidget {
  const WebViewContainer({super.key});

  @override
  State<WebViewContainer> createState() => _WebViewContainerState();
}

class _WebViewContainerState extends State<WebViewContainer> {
  late final WebViewController _controller;
  final InAppReviewService _inAppReviewService = InAppReviewService(
    onError: (error, stackTrace) {
      debugPrint('In-app review failed: $error');
    },
  );
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();

    final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    _controller = WebViewController.fromPlatformCreationParams(params)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F172A))
      ..addJavaScriptChannel(
        'FlutterBridge',
        onMessageReceived: _handleFlutterBridgeMessage,
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            if (_shouldOpenExternally(request.url)) {
              _openExternalUrl(request.url);
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView Error: ${error.description}');
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
        ),
      )
      ..addJavaScriptChannel(
        'Logger',
        onMessageReceived: (JavaScriptMessage message) {
          debugPrint('JS: ${message.message}');
        },
      );

    // Platform-specific configuration
    if (_controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (_controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    } else if (_controller.platform is WebKitWebViewController) {
      (_controller.platform as WebKitWebViewController)
          .setAllowsBackForwardNavigationGestures(true);
    }

    _loadStaticFiles();
  }

  bool _shouldOpenExternally(String url) {
    final uri = Uri.tryParse(url);
    if (uri == null) return false;

    if (uri.scheme == 'intent' || uri.scheme == 'market') {
      return true;
    }

    if ((uri.scheme == 'http' || uri.scheme == 'https') &&
        uri.host == 'play.google.com') {
      return true;
    }

    return uri.scheme.isNotEmpty &&
        !['http', 'https', 'file', 'about', 'data'].contains(uri.scheme);
  }

  Future<void> _openExternalUrl(String url) async {
    final uri = _externalLaunchUri(url);
    if (uri == null) {
      debugPrint('Cannot parse external URL: $url');
      return;
    }

    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched) {
      debugPrint('Could not launch external URL: $uri');
    }
  }

  Uri? _externalLaunchUri(String url) {
    if (url.startsWith('intent://')) {
      final webUrl = url.substring('intent://'.length).split('#Intent').first;
      return Uri.tryParse('https://$webUrl');
    }

    return Uri.tryParse(url);
  }

  Future<void> _handleFlutterBridgeMessage(JavaScriptMessage message) async {
    try {
      final Object? decodedMessage = jsonDecode(message.message);
      if (decodedMessage is! Map<String, dynamic>) {
        debugPrint('Ignoring invalid FlutterBridge message.');
        return;
      }

      if (decodedMessage['type'] == 'cube_solved') {
        final result = await _inAppReviewService.requestAfterSuccessfulAction();
        debugPrint('In-app review request result: ${result.name}');
      }
    } on FormatException catch (error) {
      debugPrint('Ignoring malformed FlutterBridge message: $error');
    }
  }

  Future<void> _loadStaticFiles() async {
    try {
      // Load the index.html from bundled assets
      await rootBundle.loadString('assets/www/index.html');

      // We load via local server simulation (file schema)
      // This is necessary because CRA uses absolute paths for static assets (/static/js/...)
      // which won't resolve correctly if we just load the HTML string.
      // However, for Flutter WebView, we can point the base URL to assets/www/

      _controller.loadFlutterAsset('assets/www/index.html');
    } catch (e) {
      debugPrint('Error loading webview assets: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // We use a WillPopScope (or PopScope in newer versions) to handle back gestures in React
      body: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          if (await _controller.canGoBack()) {
            _controller.goBack();
          } else {
            // Exit app
            SystemNavigator.pop();
          }
        },
        child: SafeArea(
          bottom: false, // React handles the bottom safe area usually
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading)
                const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF38BDF8),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
