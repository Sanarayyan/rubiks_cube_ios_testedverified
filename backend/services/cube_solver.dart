class CubeSolution {
  final bool success;
  final List<String> moves;
  final String error;
  final double estimatedTime;
  final String difficulty;

  CubeSolution({
    required this.success,
    required this.moves,
    this.error = '',
    this.estimatedTime = 1.0,
    this.difficulty = 'easy',
  });

  Map<String, dynamic> toJson() => {
    'success': success,
    'moves': moves,
    'error': error,
    'estimated_time': estimatedTime,
    'difficulty': difficulty,
  };
}

class CubeSolver {
  CubeSolution solveCube(dynamic cubeState) {
    // Mock solution: always return solved
    return CubeSolution(
      success: true,
      moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
      estimatedTime: 2.5,
      difficulty: 'easy',
    );
  }
}
class CubeState {
  final List<String> colors;

  CubeState(this.colors);

  factory CubeState.fromColors(List<String> colors) {
    return CubeState(colors);
  }
}

