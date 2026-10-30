import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/cube_state.dart';
import '../models/solution.dart';

class CubeSolverService {
  static const String baseUrl = 'https://rubiks-cube-solver-3rur.onrender.com'; // Backend URL
  
  Future<Solution?> solveCube(CubeState cubeState, String mode) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/solve'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'colors': cubeState.toColorList(),
          'mode': mode,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return Solution.fromJson(data['solution']);
        } else {
          throw Exception(data['error'] ?? 'Unknown error');
        }
      } else {
        final data = jsonDecode(response.body);
        throw Exception(data['details'] ?? data['error'] ?? 'Failed to solve cube: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error solving cube: $e');
    }
  }
  
}
