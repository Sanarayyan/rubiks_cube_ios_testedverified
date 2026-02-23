#!/usr/bin/env python3
"""
Rubik's Cube Solver using Kociemba's Two-Phase Algorithm
- Returns mathematically correct solutions (typically <= 20 moves)
- Input: 54-color array in order U(0-8), R(9-17), F(18-26), D(27-35), L(36-44), B(45-53)
- Colors are any 6 distinct letters used in the input (commonly W,R,B,Y,O,G)
- We detect center colors to map to URFDLB automatically
"""

import sys
import json
from typing import List, Dict, Any

try:
    import kociemba  # type: ignore
    KOCIEMBA_AVAILABLE = True
except Exception:
    KOCIEMBA_AVAILABLE = False

# Face blocks and center indices in our input order
FACE_BLOCKS = {
    'U': list(range(0, 9)),
    'R': list(range(9, 18)),
    'F': list(range(18, 27)),
    'D': list(range(27, 36)),
    'L': list(range(36, 45)),
    'B': list(range(45, 54)),
}
FACE_CENTERS = {
    'U': 4,
    'R': 13,
    'F': 22,
    'D': 31,
    'L': 40,
    'B': 49,
}

MOVE_DESCRIPTIONS = {
    'R': 'Rotate right face clockwise',
    "R'": 'Rotate right face counter-clockwise',
    'R2': 'Rotate right face 180°',
    'L': 'Rotate left face clockwise',
    "L'": 'Rotate left face counter-clockwise',
    'L2': 'Rotate left face 180°',
    'U': 'Rotate up face clockwise',
    "U'": 'Rotate up face counter-clockwise',
    'U2': 'Rotate up face 180°',
    'D': 'Rotate down face clockwise',
    "D'": 'Rotate down face counter-clockwise',
    'D2': 'Rotate down face 180°',
    'F': 'Rotate front face clockwise',
    "F'": 'Rotate front face counter-clockwise',
    'F2': 'Rotate front face 180°',
    'B': 'Rotate back face clockwise',
    "B'": 'Rotate back face counter-clockwise',
    'B2': 'Rotate back face 180°',
}


def validate_colors(colors: List[str]) -> None:
    if len(colors) != 54:
        raise ValueError(f'Expected 54 colors, got {len(colors)}')
    # Basic count check: there must be exactly six distinct colors, 9 of each
    counts: Dict[str, int] = {}
    for c in colors:
        counts[c] = counts.get(c, 0) + 1
    if len(counts) != 6:
        raise ValueError(f'Expected 6 distinct colors, found {len(counts)}: {sorted(counts.keys())}')
    for c, n in counts.items():
        if n != 9:
            raise ValueError(f'Invalid count for color {c}: expected 9, got {n}')


def detect_center_mapping(colors: List[str]) -> Dict[str, str]:
    """Map each color letter to a face label URFDLB using the six center stickers.
    Human-friendly version: identifies which face is which by the color you picked for the center. """
    centers = {
        'U': colors[FACE_CENTERS['U']],
        'R': colors[FACE_CENTERS['R']],
        'F': colors[FACE_CENTERS['F']],
        'D': colors[FACE_CENTERS['D']],
        'L': colors[FACE_CENTERS['L']],
        'B': colors[FACE_CENTERS['B']],
    }
    # Ensure six distinct center colors
    unique_centers = set(centers.values())
    if len(unique_centers) != 6:
        missing = 6 - len(unique_centers)
        message = f"Each side of your cube must have a DIFFERENT center color. Currently, you have duplicate colors in the middle of your faces. Please check your center pieces (the middle squares) and make sure they all match your real cube's distinct sides."
        raise ValueError(message)
    
    # Build reverse map: color -> face letter
    color_to_face: Dict[str, str] = {}
    for face, color in centers.items():
        color_to_face[color] = face
    return color_to_face


def colors_to_kociemba_string(colors: List[str]) -> str:
    """
    Convert list of 54 colors into Kociemba facelet string by mapping each color to URFDLB
    using the actual center colors provided by the user.
    """
    try:
        validate_colors(colors)
    except ValueError as ve:
        # Re-wrap for human friendliness
        err_msg = str(ve)
        if "6 distinct colors" in err_msg:
            friendly_msg = "A standard Rubik's Cube uses exactly 6 colors (usually White, Yellow, Red, Orange, Blue, and Green). Your input doesn't have 6 colors. Please check that you haven't missed a side!"
        elif "Invalid count" in err_msg:
             friendly_msg = f"Each color should appear exactly 9 times on your cube. {err_msg}. Please double-check your color matching!"
        else:
             friendly_msg = err_msg
        raise ValueError(friendly_msg)

    color_to_face = detect_center_mapping(colors)
    # Map each sticker color to the corresponding face letter
    facelets: List[str] = []
    for c in colors:
        facelets.append(color_to_face[c])
    return ''.join(facelets)


def is_cube_solved(colors: List[str]) -> bool:
    """Check if the cube is already solved by verifying each face has the same color."""
    # Check each face (9 stickers per face)
    faces = [
        colors[0:9],   # U
        colors[9:18],  # R
        colors[18:27], # F
        colors[27:36], # D
        colors[36:45], # L
        colors[45:54]  # B
    ]
    
    # Each face should have all 9 stickers of the same color
    for face in faces:
        if len(set(face)) != 1:
            return False
    return True


def kociemba_solve(colors: List[str]) -> Dict[str, Any]:
    if not KOCIEMBA_AVAILABLE:
        return {'success': False, 'error': 'Solver library unavailable. Install kociemba.'}
    
    # Check if cube is already solved
    if is_cube_solved(colors):
        return {
            'success': True,
            'solution': {
                'moves': [],
                'totalMoves': 0,
                'estimatedTime': 0,
                'difficulty': 'Solved',
                'solvingMethod': 'Already Solved'
            }
        }
    
    facelet_string = colors_to_kociemba_string(colors)
    
    try:
        solution_str = kociemba.solve(facelet_string)  # may raise
        moves = solution_str.split()
        formatted = [{
            'notation': m,
            'description': MOVE_DESCRIPTIONS.get(m, f'Move {m}')
        } for m in moves]
        estimated_time = len(moves) * 2
        difficulty = 'Beginner' if len(moves) <= 10 else 'Intermediate' if len(moves) <= 20 else 'Advanced'
        return {
            'success': True,
            'solution': {
                'moves': formatted,
                'totalMoves': len(moves),
                'estimatedTime': estimated_time,
                'difficulty': difficulty,
                'solvingMethod': 'Kociemba Two-Phase'
            }
        }
    except Exception as e:
        return {'success': False, 'error': f'Kociemba solver error: {e}'}


def solve_cube(colors: List[str]) -> Dict[str, Any]:
    try:
        return kociemba_solve(colors)
    except Exception as e:
        return {'success': False, 'error': f'{e}'}


def main():
    if len(sys.argv) != 2:
        print('Usage: python solver.py <colors_json>')
        sys.exit(1)
    try:
        colors = json.loads(sys.argv[1])
        result = solve_cube(colors)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main() 