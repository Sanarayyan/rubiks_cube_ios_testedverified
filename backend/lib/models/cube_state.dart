import 'dart:math';

class CubeState {
  // Face representation: U, R, F, D, L, B
  // Colors: W (White), R (Red), B (Blue), O (Orange), G (Green), Y (Yellow)
  late List<List<List<String>>> faces;
  
  // Color mapping
  static const Map<String, String> colorMap = {
    'W': 'White',
    'R': 'Red', 
    'B': 'Blue',
    'O': 'Orange',
    'G': 'Green',
    'Y': 'Yellow',
  };

  CubeState() {
    _initializeSolvedState();
  }

  void _initializeSolvedState() {
    faces = [
      // U (Up/White) - 3x3x3 array
      [
        ['W', 'W', 'W'],
        ['W', 'W', 'W'], 
        ['W', 'W', 'W']
      ],
      // R (Right/Red)
      [
        ['R', 'R', 'R'],
        ['R', 'R', 'R'],
        ['R', 'R', 'R']
      ],
      // F (Front/Blue)
      [
        ['B', 'B', 'B'],
        ['B', 'B', 'B'],
        ['B', 'B', 'B']
      ],
      // D (Down/Yellow)
      [
        ['Y', 'Y', 'Y'],
        ['Y', 'Y', 'Y'],
        ['Y', 'Y', 'Y']
      ],
      // L (Left/Orange)
      [
        ['O', 'O', 'O'],
        ['O', 'O', 'O'],
        ['O', 'O', 'O']
      ],
      // B (Back/Green)
      [
        ['G', 'G', 'G'],
        ['G', 'G', 'G'],
        ['G', 'G', 'G']
      ],
    ];
  }

  // Create from flat color list (54 colors)
  factory CubeState.fromColors(List<String> colors) {
    if (colors.length != 54) {
      throw ArgumentError('Cube state must have exactly 54 colors');
    }

    final cube = CubeState();
    int colorIndex = 0;

    // Convert flat list to 3D structure
    for (int face = 0; face < 6; face++) {
      for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
          cube.faces[face][row][col] = colors[colorIndex];
          colorIndex++;
        }
      }
    }

    return cube;
  }

  // Convert to flat color list
  List<String> toColorList() {
    final colors = <String>[];
    
    for (int face = 0; face < 6; face++) {
      for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
          colors.add(faces[face][row][col]);
        }
      }
    }
    
    return colors;
  }

  // Execute a move on the cube
  void executeMove(String move) {
    switch (move) {
      case 'R':
        _rotateR(true);
        break;
      case 'R\'':
        _rotateR(false);
        break;
      case 'R2':
        _rotateR(true);
        _rotateR(true);
        break;
      case 'L':
        _rotateL(true);
        break;
      case 'L\'':
        _rotateL(false);
        break;
      case 'L2':
        _rotateL(true);
        _rotateL(true);
        break;
      case 'U':
        _rotateU(true);
        break;
      case 'U\'':
        _rotateU(false);
        break;
      case 'U2':
        _rotateU(true);
        _rotateU(true);
        break;
      case 'D':
        _rotateD(true);
        break;
      case 'D\'':
        _rotateD(false);
        break;
      case 'D2':
        _rotateD(true);
        _rotateD(true);
        break;
      case 'F':
        _rotateF(true);
        break;
      case 'F\'':
        _rotateF(false);
        break;
      case 'F2':
        _rotateF(true);
        _rotateF(true);
        break;
      case 'B':
        _rotateB(true);
        break;
      case 'B\'':
        _rotateB(false);
        break;
      case 'B2':
        _rotateB(true);
        _rotateB(true);
        break;
    }
  }

  // Rotate face clockwise
  void _rotateFaceClockwise(int faceIndex) {
    final face = faces[faceIndex];
    final rotated = List.generate(3, (i) => List.generate(3, (j) => face[2-j][i]));
    faces[faceIndex] = rotated;
  }

  // Rotate U face
  void _rotateU(bool clockwise) {
    if (clockwise) {
      _rotateFaceClockwise(0); // U face
      // Rotate adjacent edges
      final temp = faces[2][0]; // F top row
      faces[2][0] = faces[1][0]; // F top = R top
      faces[1][0] = faces[5][0]; // R top = B top  
      faces[5][0] = faces[3][0]; // B top = L top
      faces[3][0] = temp; // L top = F top
    } else {
      _rotateFaceClockwise(0);
      _rotateFaceClockwise(0);
      _rotateFaceClockwise(0);
      // Counter-clockwise edge rotation
      final temp = faces[2][0];
      faces[2][0] = faces[3][0];
      faces[3][0] = faces[5][0];
      faces[5][0] = faces[1][0];
      faces[1][0] = temp;
    }
  }

  // Rotate R face
  void _rotateR(bool clockwise) {
    if (clockwise) {
      _rotateFaceClockwise(1); // R face
      // Rotate adjacent edges
      for (int i = 0; i < 3; i++) {
        final temp = faces[2][i][2]; // F right col
        faces[2][i][2] = faces[4][i][2]; // F right = D right
        faces[4][i][2] = faces[5][2-i][0]; // D right = B left (inverted)
        faces[5][2-i][0] = faces[0][i][2]; // B left = U right
        faces[0][i][2] = temp; // U right = F right
      }
    } else {
      _rotateR(true);
      _rotateR(true);
      _rotateR(true);
    }
  }

  // Rotate F face
  void _rotateF(bool clockwise) {
    if (clockwise) {
      _rotateFaceClockwise(2); // F face
      // Rotate adjacent edges
      final temp = faces[0][2]; // U bottom row
      faces[0][2] = [faces[3][2][2], faces[3][1][2], faces[3][0][2]]; // U bottom = L right (inverted)
      faces[3][2][2] = faces[4][0][0];
      faces[3][1][2] = faces[4][0][1];
      faces[3][0][2] = faces[4][0][2];
      faces[4][0] = [faces[5][2][0], faces[5][2][1], faces[5][2][2]]; // D top = B bottom
      faces[5][2] = [faces[1][0][2], faces[1][1][2], faces[1][2][2]]; // B bottom = R right
      faces[1][0][2] = temp[0];
      faces[1][1][2] = temp[1];
      faces[1][2][2] = temp[2];
    } else {
      _rotateF(true);
      _rotateF(true);
      _rotateF(true);
    }
  }

  // Rotate D face
  void _rotateD(bool clockwise) {
    if (clockwise) {
      _rotateFaceClockwise(3); // D face
      // Rotate adjacent edges
      final temp = faces[2][2]; // F bottom row
      faces[2][2] = faces[3][2]; // F bottom = L bottom
      faces[3][2] = faces[5][2]; // L bottom = B bottom
      faces[5][2] = faces[1][2]; // B bottom = R bottom
      faces[1][2] = temp; // R bottom = F bottom
    } else {
      _rotateD(true);
      _rotateD(true);
      _rotateD(true);
    }
  }

  // Rotate L face
  void _rotateL(bool clockwise) {
    if (clockwise) {
      _rotateFaceClockwise(4); // L face
      // Rotate adjacent edges
      for (int i = 0; i < 3; i++) {
        final temp = faces[2][i][0]; // F left col
        faces[2][i][0] = faces[0][i][0]; // F left = U left
        faces[0][i][0] = faces[5][2-i][2]; // U left = B right (inverted)
        faces[5][2-i][2] = faces[4][i][0]; // B right = D left
        faces[4][i][0] = temp; // D left = F left
      }
    } else {
      _rotateL(true);
      _rotateL(true);
      _rotateL(true);
    }
  }

  // Rotate B face
  void _rotateB(bool clockwise) {
    if (clockwise) {
      _rotateFaceClockwise(5); // B face
      // Rotate adjacent edges
      final temp = faces[0][0]; // U top row
      faces[0][0] = [faces[1][0][0], faces[1][1][0], faces[1][2][0]]; // U top = R left
      faces[1][0][0] = faces[4][2][2];
      faces[1][1][0] = faces[4][2][1];
      faces[1][2][0] = faces[4][2][0];
      faces[4][2] = [faces[3][0][0], faces[3][1][0], faces[3][2][0]]; // D bottom = L left
      faces[3][0][0] = temp[2];
      faces[3][1][0] = temp[1];
      faces[3][2][0] = temp[0];
    } else {
      _rotateB(true);
      _rotateB(true);
      _rotateB(true);
    }
  }

  // Check if cube is solved
  bool isSolved() {
    for (int face = 0; face < 6; face++) {
      final centerColor = faces[face][1][1];
      for (int row = 0; row < 3; row++) {
        for (int col = 0; col < 3; col++) {
          if (faces[face][row][col] != centerColor) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Get string representation
  @override
  String toString() {
    final buffer = StringBuffer();
    final faceNames = ['U', 'R', 'F', 'D', 'L', 'B'];
    
    for (int face = 0; face < 6; face++) {
      buffer.writeln('${faceNames[face]} face:');
      for (int row = 0; row < 3; row++) {
        buffer.writeln('  ${faces[face][row].join(' ')}');
      }
      buffer.writeln();
    }
    
    return buffer.toString();
  }
} 