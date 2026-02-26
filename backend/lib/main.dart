import 'dart:io';
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:path/path.dart' as path;

import 'models/cube_state.dart';
import 'services/cube_solver.dart';
import 'services/image_processor.dart';

void main(List<String> arguments) async {
  print('main.dart started'); // Debug print to confirm execution

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
  final server = await io.serve(handler, InternetAddress.anyIPv4, port);
  
  print('🚀 Rubik\'s Cube Backend Server running on http://localhost:$port');
  print('📊 Health check: http://localhost:$port/api/health');
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
  print('Received /api/solve request'); // Log incoming request
  try {
    final body = await request.readAsString();
    print('Request body: ' + body); // Log request body
    final data = jsonDecode(body) as Map<String, dynamic>;
    
    final colors = data['colors'] as List<dynamic>;
    if (colors.length != 54) {
      print('Invalid cube data: expected 54 colors');
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
    print('Solution: ' + jsonEncode(solution.toJson())); // Log solution
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
      print('Could not solve cube: ' + (solution.error ?? ''));
      return Response(400,
        body: jsonEncode({
          'error': 'Could not solve cube',
          'details': solution.error
        }),
        headers: {'content-type': 'application/json'},
      );
    }
  } catch (e) {
    print('Internal server error: ' + e.toString());
    return Response(500,
      body: jsonEncode({'error': 'Internal server error: $e'}),
      headers: {'content-type': 'application/json'},
    );
  }
}

Future<Response> _uploadImageHandler(Request request) async {
  try {
    // Handle multipart form data for image upload
    final body = await request.readAsString();
    
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
          'created_at': DateTime.now().subtract(Duration(hours: 1)).toIso8601String(),
          'total_moves': 20,
          'solved': true,
        }
      ]
    }),
    headers: {'content-type': 'application/json'},
  );
}
