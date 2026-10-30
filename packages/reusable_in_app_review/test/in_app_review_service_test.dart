import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:reusable_in_app_review/reusable_in_app_review.dart';

void main() {
  group('InAppReviewService', () {
    test('waits 500 ms and requests a review when available', () async {
      final gateway = _FakeGateway(available: true);
      Duration? waited;
      final service = InAppReviewService(
        gateway: gateway,
        wait: (duration) async => waited = duration,
      );

      final result = await service.requestAfterSuccessfulAction();

      expect(result, ReviewRequestResult.requested);
      expect(waited, const Duration(milliseconds: 500));
      expect(gateway.requestCount, 1);
    });

    test('does not request a review when unavailable', () async {
      final gateway = _FakeGateway(available: false);
      final service = InAppReviewService(
        gateway: gateway,
        wait: (_) async {},
      );

      final result = await service.requestAfterSuccessfulAction();

      expect(result, ReviewRequestResult.unavailable);
      expect(gateway.requestCount, 0);
    });

    test('ignores a second request while one is pending', () async {
      final gateway = _FakeGateway(available: true);
      final waitCompleter = Completer<void>();
      final service = InAppReviewService(
        gateway: gateway,
        wait: (_) => waitCompleter.future,
      );

      final first = service.requestAfterSuccessfulAction();
      final second = await service.requestAfterSuccessfulAction();

      expect(second, ReviewRequestResult.alreadyInProgress);
      waitCompleter.complete();
      expect(await first, ReviewRequestResult.requested);
    });

    test('reports failures without throwing into the host app', () async {
      final failure = StateError('native failure');
      Object? reportedError;
      final service = InAppReviewService(
        gateway: _ThrowingGateway(failure),
        wait: (_) async {},
        onError: (error, _) => reportedError = error,
      );

      final result = await service.requestAfterSuccessfulAction();

      expect(result, ReviewRequestResult.failed);
      expect(reportedError, same(failure));
    });
  });
}

final class _FakeGateway implements ReviewGateway {
  _FakeGateway({required this.available});

  final bool available;
  int requestCount = 0;

  @override
  Future<bool> isAvailable() async => available;

  @override
  Future<void> requestReview() async => requestCount++;
}

final class _ThrowingGateway implements ReviewGateway {
  _ThrowingGateway(this.error);

  final Object error;

  @override
  Future<bool> isAvailable() async => throw error;

  @override
  Future<void> requestReview() async {}
}
