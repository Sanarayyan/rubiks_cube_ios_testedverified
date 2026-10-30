import 'dart:io';
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:path/path.dart' as p;

void main(List<String> arguments) async {
  final router = Router();

  final handler = const Pipeline()
      .addMiddleware(corsHeaders())
      .addMiddleware(logRequests())
      .addHandler(router);

  router.get('/', _homeHandler);
  router.post('/api/solve', _solveCubeHandler);
  router.post('/api/upload-image', _uploadImageHandler);
  router.get('/api/history', _getHistoryHandler);
  router.get('/api/health', _healthHandler);

  final port = int.parse(Platform.environment['PORT'] ?? '8081');
  await io.serve(handler, InternetAddress.anyIPv4, port);

  stdout.writeln('🚀 Rubik\'s Cube Backend Server running on http://localhost:$port');
  stdout.writeln('📊 Health check: http://localhost:$port/api/health');
}

// Global history file path
const String historyFilePath = 'history.json';

Future<Response> _getHistoryHandler(Request request) async {
  try {
    final file = File(historyFilePath);
    List<dynamic> history = [];
    if (await file.exists()) {
      final content = await file.readAsString();
      if (content.isNotEmpty) {
        history = jsonDecode(content);
      }
    }
    return Response.ok(
      jsonEncode({'success': true, 'history': history}),
      headers: {'content-type': 'application/json'},
    );
  } catch (e) {
    return Response(500,
      body: jsonEncode({'error': 'Failed to load history: $e'}),
      headers: {'content-type': 'application/json'},
    );
  }
}

Response _homeHandler(Request request) {
  return Response.ok(
    jsonEncode({
      'message': 'Rubik\'s Cube Solver API',
      'version': '1.0.0',
      'endpoints': {
        'POST /api/solve': 'Solve cube from color data',
        'POST /api/upload-image': 'Upload and process image (demo)',
        'GET /api/health': 'Health check'
      }
    }),
    headers: {'content-type': 'application/json'},
  );
}

Response _healthHandler(Request request) {
  return Response.ok(
    jsonEncode({
      'status': 'healthy',
      'timestamp': DateTime.now().toIso8601String(),
    }),
    headers: {'content-type': 'application/json'},
  );
}

Future<Response> _solveCubeHandler(Request request) async {
  try {
    final body = await request.readAsString();
    final data = jsonDecode(body) as Map<String, dynamic>;

    final colors = (data['colors'] as List<dynamic>?)?.cast<String>();
    final mode = (data['mode'] as String?)?.toLowerCase() ?? 'fast';
    if (colors == null || colors.length != 54) {
      return Response(400,
          body: jsonEncode({'error': 'Invalid cube data: expected 54 colors'}),
          headers: {'content-type': 'application/json'});
    }

    final result = await _callPythonSolver(colors);
    if (result['success'] != true) {
      final error = (result['error'] ?? 'Failed to solve cube').toString();
      final isSolverUnavailable = _isSolverUnavailable(error);
      return Response(isSolverUnavailable ? 503 : 422,
          body: jsonEncode({
            'success': false,
            'error': isSolverUnavailable
                ? 'Solver service unavailable'
                : 'Could not solve cube',
            'details': error,
          }),
          headers: {'content-type': 'application/json'});
    }

    Map<String, dynamic> solution = result['solution'] as Map<String, dynamic>;

    if (mode == 'beginner') {
      final enriched = _enrichForBeginner(solution, colors);
      solution = enriched;
    }

    return Response.ok(
      jsonEncode({'success': true, 'solution': solution}),
      headers: {'content-type': 'application/json'},
    );
  } catch (e) {
    return Response(500,
        body: jsonEncode({'error': 'Internal server error: $e'}),
        headers: {'content-type': 'application/json'});
  }
}

bool _isSolverUnavailable(String error) {
  final normalized = error.toLowerCase();
  return normalized.contains('failed to call python solver') ||
      normalized.contains('python solver not found') ||
      normalized.contains('pathaccessexception') ||
      normalized.contains('permission denied') ||
      normalized.contains('operation not permitted');
}

Map<String, dynamic> _enrichForBeginner(
    Map<String, dynamic> solution, List<String> colors) {
  final moves = (solution['moves'] as List).cast<Map>();
  final centers = {
    'U': colors[4],
    'R': colors[13],
    'F': colors[22],
    'D': colors[31],
    'L': colors[40],
    'B': colors[49],
  };
  String baseline = 'Hold U=${centers['U']} and F=${centers['F']} facing you.';

  List<Map<String, dynamic>> enrichedMoves = [];
  for (final m in moves) {
    final notation = (m['notation'] ?? '').toString();
    final meta = _beginnerHints(notation);
    enrichedMoves.add({
      'notation': notation,
      'description': m['description'] ?? '',
      'hand': meta['hand'],
      'grip': meta['grip'],
      'tip': meta['tip']
    });
  }

  return {
    ...solution,
    'moves': enrichedMoves,
    'orientationBaseline': baseline,
    'mode': 'beginner'
  };
}

Map<String, String> _beginnerHints(String move) {
  final face = move.isNotEmpty ? move[0] : '';
  final prime = move.contains("'");
  switch (face) {
    case 'R':
      return {
        'hand': 'Right hand',
        'grip': prime
            ? 'Grip R layer, pull up (counter-clockwise) with right fingers.'
            : 'Grip R layer, push up (clockwise) with right palm/fingers.',
        'tip': 'Keep U on top; practice R flicks with right hand.'
      };
    case 'L':
      return {
        'hand': 'Left hand',
        'grip': prime
            ? 'Grip L layer, push down (counter-clockwise) with left palm.'
            : 'Grip L layer, pull up (clockwise) with left fingers.',
        'tip': 'Mirror of R moves with left hand.'
      };
    case 'U':
      return {
        'hand': 'Index finger flick',
        'grip': prime
            ? 'Flick U\' with left index from back-left to front-left.'
            : 'Flick U with right index from back-right to front-right.',
        'tip': 'Use light finger tricks; keep wrists relaxed.'
      };
    case 'D':
      return {
        'hand': 'Both thumbs / regrip',
        'grip': prime
            ? 'Rotate D\' using both thumbs or regrip cube.'
            : 'Rotate D using both thumbs or regrip cube.',
        'tip': 'Optionally do y2 to turn D into U, perform U, then y2 back.'
      };
    case 'F':
      return {
        'hand': 'Right hand',
        'grip': prime
            ? 'Pull front layer up on left side (counter-clockwise).'
            : 'Push front layer down on right side (clockwise).',
        'tip': 'Common beginner face. Keep elbows in; small turns.'
      };
    case 'B':
      return {
        'hand': 'Reorient or use ring finger',
        'grip': prime
            ? 'Consider y to bring B to F, then do F\'.'
            : 'Consider y to bring B to F, then do F.',
        'tip': 'Tip: y/y\' rotations make B moves easier.'
      };
    default:
      return {
        'hand': 'Neutral',
        'grip': 'Standard grip.',
        'tip': ''
      };
  }
}

Future<Map<String, dynamic>> _callPythonSolver(List<String> colors) async {
  try {
    final pythonScript = _resolvePythonScriptPath();
    final solverFile = File(pythonScript);
    if (!await solverFile.exists()) {
      return {
        'success': false,
        'error': 'Python solver not found. Ensure backend/solver.py exists.'
      };
    }
    final colorsJson = jsonEncode(colors);
    final result = await Process.run(
      'python3',
      [pythonScript, colorsJson],
      workingDirectory: p.dirname(pythonScript),
    );
    if (result.exitCode != 0) {
      return {
        'success': false,
        'error': (result.stderr?.toString().trim().isNotEmpty ?? false)
            ? result.stderr.toString()
            : result.stdout.toString()
      };
    }
    final output = result.stdout.toString().trim();
    final solution = jsonDecode(output) as Map<String, dynamic>;
    return solution;
  } catch (e) {
    return {'success': false, 'error': 'Failed to call Python solver: $e'};
  }
}

String _resolvePythonScriptPath() {
  final scriptPath = Platform.script.toFilePath();
  final scriptDir = p.dirname(scriptPath);
  final candidates = [
    p.normalize(p.join(scriptDir, '..', 'solver.py')),
    p.normalize(p.join(scriptDir, '..', '..', 'backend', 'solver.py')),
    p.normalize(p.join(scriptDir, 'solver.py')),
  ];

  for (final candidate in candidates) {
    if (File(candidate).existsSync()) {
      return candidate;
    }
  }

  return candidates.first;
}

Future<Response> _uploadImageHandler(Request request) async {
  try {
    // Demo: solved cube with standard color mapping (R=Red, L=Orange)
    final demoResponse = {
      'success': true,
      'colors': [
        // U (White)
        'W','W','W','W','W','W','W','W','W',
        // R (Red)
        'R','R','R','R','R','R','R','R','R',
        // F (Blue)
        'B','B','B','B','B','B','B','B','B',
        // D (Yellow)
        'Y','Y','Y','Y','Y','Y','Y','Y','Y',
        // L (Orange)
        'O','O','O','O','O','O','O','O','O',
        // B (Green)
        'G','G','G','G','G','G','G','G','G',
      ],
      'message': 'Image processed successfully (demo data)'
    };
    return Response.ok(jsonEncode(demoResponse),
        headers: {'content-type': 'application/json'});
  } catch (e) {
    return Response(500,
        body: jsonEncode({'error': 'Failed to process image: $e'}),
        headers: {'content-type': 'application/json'});
  }
}
