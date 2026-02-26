import 'package:flutter/material.dart';
import '../models/cube_state.dart';
import '../models/solution.dart';
import '../services/cube_solver_service.dart';

class CubeProvider extends ChangeNotifier {
  final CubeSolverService _solverService = CubeSolverService();
  
  CubeState _cubeState = CubeState.solved();
  Solution? _solution;
  bool _isLoading = false;
  String _mode = 'fast'; // 'fast' or 'beginner'
  String _inputMode = '3d'; // 'grid', 'net', '3d'
  
  // Getters
  CubeState get cubeState => _cubeState;
  Solution? get solution => _solution;
  bool get isLoading => _isLoading;
  String get mode => _mode;
  String get inputMode => _inputMode;
  
  // Color constants
  static const List<String> colors = ['W', 'Y', 'R', 'O', 'B', 'G'];
  static const Map<String, String> colorNames = {
    'W': 'White',
    'Y': 'Yellow', 
    'R': 'Red',
    'O': 'Orange',
    'B': 'Blue',
    'G': 'Green',
  };
  
  static const List<Map<String, String>> faces = [
    {'name': 'Top', 'key': 'up', 'color': 'White'},
    {'name': 'Right', 'key': 'right', 'color': 'Orange'},
    {'name': 'Front', 'key': 'front', 'color': 'Blue'},
    {'name': 'Bottom', 'key': 'down', 'color': 'Yellow'},
    {'name': 'Left', 'key': 'left', 'color': 'Red'},
    {'name': 'Back', 'key': 'back', 'color': 'Green'},
  ];
  
  // Methods
  void setMode(String mode) {
    _mode = mode;
    notifyListeners();
  }
  
  void setInputMode(String inputMode) {
    _inputMode = inputMode;
    notifyListeners();
  }
  
  void updateCubeState(CubeState newState) {
    _cubeState = newState;
    _solution = null; // Clear solution when cube state changes
    notifyListeners();
  }
  
  void changeColor(int faceIndex, int squareIndex, String newColor) {
    final newState = _cubeState.copyWith();
    newState.setColor(faceIndex, squareIndex, newColor);
    updateCubeState(newState);
  }
  
  void resetCube() {
    _cubeState = CubeState.solved();
    _solution = null;
    notifyListeners();
  }
  
  Future<void> solveCube() async {
    if (_isLoading) return;
    
    _isLoading = true;
    notifyListeners();
    
    try {
      final result = await _solverService.solveCube(_cubeState, _mode);
      if (result != null) {
        _solution = result;
      }
    } catch (e) {
      // Handle error - could show snackbar or dialog
      debugPrint('Error solving cube: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  void clearSolution() {
    _solution = null;
    notifyListeners();
  }
}
