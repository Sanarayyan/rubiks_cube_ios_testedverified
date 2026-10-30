import 'dart:io';
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf_cors_headers/shelf_cors_headers.dart';

import 'models/cube_state.dart';
import 'services/cube_solver.dart';

void main(List<String> arguments) async {
  stdout.writeln('main.dart started');

  // Create router
  final router = Router();

  // Add CORS headers
  final handler = const Pipeline()
      .addMiddleware(corsHeaders())
      .addMiddleware(logRequests())
      .addHandler(router);

  // API Routes
  router.get('/', _homeHandler);
  router.post('/api/solve', _solveCubeHandler);
  router.post('/api/upload-image', _uploadImageHandler);
  router.get('/api/history', _getHistoryHandler);
  router.get('/api/health', _healthHandler);

  // Start server
  final port = int.parse(Platform.environment['PORT'] ?? '8081');
  await io.serve(handler, InternetAddress.anyIPv4, port);
  
  stdout.writeln('🚀 Rubik\'s Cube Backend Server running on http://localhost:$port');
  stdout.writeln('📊 Health check: http://localhost:$port/api/health');
}

// Handler functions
Response _homeHandler(Request request) {
  return Response.ok(
    jsonEncode({
      'message': 'Rubik\'s Cube Solver API',
      'version': '1.0.0',
      'endpoints': {
        'POST /api/solve': 'Solve cube from color data',
        'POST /api/upload-image': 'Process uploaded image',
        'GET /api/history': 'Get solving history',
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
    
    final colors = data['colors'] as List<dynamic>;
    if (colors.length != 54) {
      stdout.writeln('Invalid cube data: expected 54 colors');
      return Response(400,
        body: jsonEncode({'error': 'Invalid cube data: expected 54 colors'}),
        headers: {'content-type': 'application/json'},
      );
    }

    // Convert to string list
    final colorList = colors.cast<String>();
    
    // Create cube state
    final cubeState = CubeState.fromColors(colorList);
    
    // Solve cube
    final solver = CubeSolver();
    final solution = solver.solveCube(cubeState);
    if (solution.success) {
      return Response.ok(
        jsonEncode({
          'success': true,
          'solution': solution.toJson(),
          'total_moves': solution.moves.length,
          'estimated_time': solution.estimatedTime,
          'difficulty': solution.difficulty,
        }),
        headers: {'content-type': 'application/json'},
      );
    } else {
      final error = solution.error ?? 'Failed to solve cube';
      final isSolverUnavailable = _isSolverUnavailable(error);
      return Response(isSolverUnavailable ? 503 : 422,
        body: jsonEncode({
          'success': false,
          'error': isSolverUnavailable
              ? 'Solver service unavailable'
              : 'Could not solve cube',
          'details': error
        }),
        headers: {'content-type': 'application/json'},
      );
    }
  } catch (e) {
    stdout.writeln('Internal server error: $e');
    return Response(500,
      body: jsonEncode({'error': 'Internal server error: $e'}),
      headers: {'content-type': 'application/json'},
    );
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

Future<Response> _uploadImageHandler(Request request) async {
  try {
    // Handle multipart form data for image upload
    await request.readAsString();
    
    // For now, return a mock response
    // In a real implementation, you'd process the uploaded image
    return Response.ok(
      jsonEncode({
        'success': true,
        'message': 'Image processing not yet implemented',
        'colors': List.generate(54, (index) => 'W'), // Mock white cube
      }),
      headers: {'content-type': 'application/json'},
    );
  } catch (e) {
    return Response(500,
      body: jsonEncode({'error': 'Image processing failed: $e'}),
      headers: {'content-type': 'application/json'},
    );
  }
}

Response _getHistoryHandler(Request request) {
  // Mock history response
  return Response.ok(
    jsonEncode({
      'history': [
        {
          'id': 1,
          'created_at': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(),
          'total_moves': 20,
          'solved': true,
        }
      ]
    }),
    headers: {'content-type': 'application/json'},
  );
}
