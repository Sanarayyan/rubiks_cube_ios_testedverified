class Solution {
  final List<Move> moves;
  final String? orientationBaseline;
  final int estimatedTime;
  final String algorithm;
  
  Solution({
    required this.moves,
    this.orientationBaseline,
    required this.estimatedTime,
    required this.algorithm,
  });
  
  factory Solution.fromJson(Map<String, dynamic> json) {
    return Solution(
      moves: (json['moves'] as List)
          .map((move) => Move.fromJson(move))
          .toList(),
      orientationBaseline: json['orientationBaseline'],
      estimatedTime: json['estimatedTime'] ?? 0,
      algorithm: json['algorithm'] ?? '',
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'moves': moves.map((move) => move.toJson()).toList(),
      'orientationBaseline': orientationBaseline,
      'estimatedTime': estimatedTime,
      'algorithm': algorithm,
    };
  }
}

class Move {
  final String notation;
  final String description;
  final String? hand;
  final String? grip;
  final String? tip;
  
  Move({
    required this.notation,
    required this.description,
    this.hand,
    this.grip,
    this.tip,
  });
  
  factory Move.fromJson(Map<String, dynamic> json) {
    return Move(
      notation: json['notation'] ?? '',
      description: json['description'] ?? '',
      hand: json['hand'],
      grip: json['grip'],
      tip: json['tip'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'notation': notation,
      'description': description,
      'hand': hand,
      'grip': grip,
      'tip': tip,
    };
  }
}
