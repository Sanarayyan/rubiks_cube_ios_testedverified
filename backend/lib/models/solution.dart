import 'dart:convert';

class Solution {
  final List<Move> moves;
  final bool success;
  final String? error;
  final int estimatedTime;
  final String difficulty;
  final String solvingMethod;

  Solution({
    required this.moves,
    required this.success,
    this.error,
    this.estimatedTime = 0,
    this.difficulty = 'Beginner',
    this.solvingMethod = 'Layer by Layer',
  });

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'moves': moves.map((move) => move.toJson()).toList(),
      'success': success,
      'error': error,
      'estimatedTime': estimatedTime,
      'difficulty': difficulty,
      'solvingMethod': solvingMethod,
      'totalMoves': moves.length,
    };
  }

  // Create from JSON
  factory Solution.fromJson(Map<String, dynamic> json) {
    return Solution(
      moves: (json['moves'] as List)
          .map((moveJson) => Move.fromJson(moveJson))
          .toList(),
      success: json['success'] ?? false,
      error: json['error'],
      estimatedTime: json['estimatedTime'] ?? 0,
      difficulty: json['difficulty'] ?? 'Beginner',
      solvingMethod: json['solvingMethod'] ?? 'Layer by Layer',
    );
  }

  // Create error solution
  factory Solution.error(String errorMessage) {
    return Solution(
      moves: [],
      success: false,
      error: errorMessage,
    );
  }

  // Create demo solution
  factory Solution.demo() {
    return Solution(
      moves: [
        Move('R', 'Rotate right face clockwise'),
        Move('U', 'Rotate up face clockwise'),
        Move('R\'', 'Rotate right face counter-clockwise'),
        Move('U\'', 'Rotate up face counter-clockwise'),
        Move('F', 'Rotate front face clockwise'),
        Move('R', 'Rotate right face clockwise'),
        Move('U', 'Rotate up face clockwise'),
        Move('R\'', 'Rotate right face counter-clockwise'),
        Move('U\'', 'Rotate up face counter-clockwise'),
        Move('F\'', 'Rotate front face counter-clockwise'),
      ],
      success: true,
      estimatedTime: 30,
      difficulty: 'Beginner',
      solvingMethod: 'Demo Algorithm',
    );
  }
}

class Move {
  final String notation;
  final String description;

  Move(this.notation, this.description);

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'notation': notation,
      'description': description,
    };
  }

  // Create from JSON
  factory Move.fromJson(Map<String, dynamic> json) {
    return Move(
      json['notation'] ?? '',
      json['description'] ?? '',
    );
  }

  @override
  String toString() {
    return '$notation: $description';
  }
} 