import 'package:in_app_review/in_app_review.dart';

/// The outcome of asking the operating system to start its review flow.
enum ReviewRequestResult {
  requested,
  unavailable,
  alreadyInProgress,
  failed,
}

/// Abstraction over the store API. It is public so consuming apps can test
/// their review trigger without opening a real native prompt.
abstract interface class ReviewGateway {
  Future<bool> isAvailable();

  Future<void> requestReview();
}

final class NativeReviewGateway implements ReviewGateway {
  NativeReviewGateway({InAppReview? review})
      : _review = review ?? InAppReview.instance;

  final InAppReview _review;

  @override
  Future<bool> isAvailable() => _review.isAvailable();

  @override
  Future<void> requestReview() => _review.requestReview();
}

/// Reusable entry point for the iOS and Android native in-app review prompt.
///
/// The caller decides which completed action is important enough to trigger a
/// review. This service waits [delay], checks native availability, and then
/// makes a best-effort request. Apple and Google ultimately decide whether the
/// prompt is shown.
final class InAppReviewService {
  InAppReviewService({
    ReviewGateway? gateway,
    this.delay = const Duration(milliseconds: 500),
    Future<void> Function(Duration duration)? wait,
    this.onError,
  })  : _gateway = gateway ?? NativeReviewGateway(),
        _wait = wait ?? Future<void>.delayed;

  final ReviewGateway _gateway;
  final Duration delay;
  final Future<void> Function(Duration duration) _wait;

  /// Optional reporting hook. Review failures should never break the user's
  /// successful app flow.
  final void Function(Object error, StackTrace stackTrace)? onError;

  bool _requestInProgress = false;

  /// Call this only after the important action has completed successfully.
  Future<ReviewRequestResult> requestAfterSuccessfulAction() async {
    if (_requestInProgress) {
      return ReviewRequestResult.alreadyInProgress;
    }

    _requestInProgress = true;
    try {
      await _wait(delay);

      if (!await _gateway.isAvailable()) {
        return ReviewRequestResult.unavailable;
      }

      await _gateway.requestReview();
      return ReviewRequestResult.requested;
    } catch (error, stackTrace) {
      onError?.call(error, stackTrace);
      return ReviewRequestResult.failed;
    } finally {
      _requestInProgress = false;
    }
  }
}
