import 'dart:io';
import 'dart:convert';
import 'package:path/path.dart' as p;
import '../models/cube_state.dart';
import '../models/solution.dart';

class CubeSolver {
  CubeSolver();

  Solution solveCube(CubeState initialState) {
    try {
      // Check if already solved
      if (initialState.isSolved()) {
        return Solution(
          moves: [],
          success: true,
          estimatedTime: 0,
          difficulty: 'Already Solved',
          solvingMethod: 'No moves needed',
        );
      }

      // Use Python Kociemba solver
      final colors = initialState.toColorList();
      final result = _callPythonSolver(colors);
      
      if (result['success'] == true) {
        final solutionData = result['solution'];
        final moves = (solutionData['moves'] as List)
            .map((move) => Move(move['notation'], move['description']))
            .toList();
        
        return Solution(
          moves: moves,
          success: true,
          estimatedTime: solutionData['estimatedTime'] ?? 0,
          difficulty: solutionData['difficulty'] ?? 'Beginner',
          solvingMethod: solutionData['solvingMethod'] ?? 'Kociemba Two-Phase',
        );
      } else {
        return Solution.error(result['error'] ?? 'Unknown error');
      }

    } catch (e) {
      return Solution.error('Solving failed: $e');
    }
  }

  Map<String, dynamic> _callPythonSolver(List<String> colors) {
    try {
      // Resolve python script path robustly
      final pythonScript = _resolvePythonScriptPath();
      if (pythonScript == null) {
        stderr.writeln('[CubeSolver] Python solver not found in expected paths.');
        return {
          'success': false,
          'error': 'Python solver not found. Ensure backend/solver.py exists.'
        };
      }
      stdout.writeln('[CubeSolver] Using python solver at: ' + pythonScript);
      
      // Prepare the command
      final colorsJson = jsonEncode(colors);
      final result = Process.runSync('python3', [pythonScript, colorsJson]);
      if (result.stdout != null && result.stdout.toString().isNotEmpty) {
        stdout.writeln('[CubeSolver] Python stdout: ' + result.stdout.toString());
      }
      if (result.stderr != null && result.stderr.toString().isNotEmpty) {
        stderr.writeln('[CubeSolver] Python stderr: ' + result.stderr.toString());
      }
      
      if (result.exitCode == 0) {
        return jsonDecode(result.stdout);
      } else {
        return {
          'success': false,
          'error': 'Python solver failed: ${result.stderr}'
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to call Python solver: $e'
      };
    }
  }

  String? _resolvePythonScriptPath() {
    // Try multiple likely locations
    final currentDir = Directory.current.path; // typically .../backend when running `dart run`
    final scriptDir = File(Platform.script.toFilePath()).parent.path; // .../backend/lib/services

    final candidates = <String>[
      p.join(currentDir, 'solver.py'),                  // backend/solver.py when cwd=backend
      p.join(currentDir, 'backend', 'solver.py'),       // projectRoot/backend/solver.py when cwd=project root
      p.normalize(p.join(scriptDir, '../../solver.py')), // from services -> lib -> backend/solver.py
    ];

    stdout.writeln('[CubeSolver] CWD: ' + currentDir);
    stdout.writeln('[CubeSolver] ScriptDir: ' + scriptDir);
    for (final path in candidates) {
      final exists = File(path).existsSync();
      stdout.writeln('[CubeSolver] Probe: ' + path + ' exists=' + exists.toString());
      if (exists) return path;
    }
    return null;
  }

  // Generate a random scramble for testing
  List<String> generateScramble(int length) {
    final allMoves = [
      'R', 'R\'', 'R2', 'L', 'L\'', 'L2',
      'U', 'U\'', 'U2', 'D', 'D\'', 'D2',
      'F', 'F\'', 'F2', 'B', 'B\'', 'B2'
    ];
    
    final scramble = <String>[];
    String? lastFace;
    
    for (int i = 0; i < length; i++) {
      // Avoid consecutive moves on the same face
      final availableMoves = allMoves.where((move) => 
        move[0] != lastFace
      ).toList();
      
      final move = availableMoves[availableMoves.length ~/ 2]; // Simple selection
      scramble.add(move);
      lastFace = move[0];
    }
    
    return scramble;
  }

  // Validate a solution
  bool validateSolution(List<String> solution) {
    if (solution.isEmpty) return false;
    if (solution.length > 1000) return false; // Arbitrary limit
    
    final validMoves = {
      'R', 'R\'', 'R2', 'L', 'L\'', 'L2',
      'U', 'U\'', 'U2', 'D', 'D\'', 'D2',
      'F', 'F\'', 'F2', 'B', 'B\'', 'B2'
    };
    
    for (final move in solution) {
      if (!validMoves.contains(move)) {
        return false;
      }
    }
    
    return true;
  }
}