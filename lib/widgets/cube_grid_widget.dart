import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cube_provider.dart';
import '../utils/app_colors.dart';

class CubeGridWidget extends StatelessWidget {
  const CubeGridWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CubeProvider>(
      builder: (context, cubeProvider, child) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0),
          child: GridView.builder(
            padding: const EdgeInsets.only(bottom: 20),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.9,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: CubeProvider.faces.length,
            itemBuilder: (context, faceIndex) {
              final face = CubeProvider.faces[faceIndex];
              return _buildFaceCard(context, faceIndex, face, cubeProvider);
            },
          ),
        );
      },
    );
  }
  
  Widget _buildFaceCard(
    BuildContext context,
    int faceIndex,
    Map<String, String> face,
    CubeProvider cubeProvider,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _getColorValue(face['color']!.substring(0, 1)),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                face['name']!.toUpperCase(),
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 4,
                mainAxisSpacing: 4,
              ),
              itemCount: 9,
              itemBuilder: (context, squareIndex) {
                return _buildColorSquare(
                  context,
                  faceIndex,
                  squareIndex,
                  cubeProvider,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildColorSquare(
    BuildContext context,
    int faceIndex,
    int squareIndex,
    CubeProvider cubeProvider,
  ) {
    final currentColor = cubeProvider.cubeState.getColor(faceIndex, squareIndex);
    final isCenter = squareIndex == 4;
    
    return GestureDetector(
      onTap: isCenter
          ? () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Center squares are fixed'),
                  behavior: SnackBarBehavior.floating,
                  duration: Duration(milliseconds: 500),
                ),
              );
            }
          : () {
              final currentIndex = CubeProvider.colors.indexOf(currentColor);
              final nextIndex = (currentIndex + 1) % CubeProvider.colors.length;
              final nextColor = CubeProvider.colors[nextIndex];
              cubeProvider.changeColor(faceIndex, squareIndex, nextColor);
            },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: _getColorValue(currentColor),
          borderRadius: BorderRadius.circular(6),
          boxShadow: [
            BoxShadow(
              color: _getColorValue(currentColor).withOpacity(0.3),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
          border: Border.all(
            color: isCenter ? Colors.white.withOpacity(0.5) : Colors.black.withOpacity(0.1),
            width: isCenter ? 2 : 1,
          ),
        ),
        child: isCenter
            ? Icon(
                Icons.lock_outline_rounded,
                size: 14,
                color: currentColor == 'W' || currentColor == 'Y' ? Colors.black54 : Colors.white70,
              )
            : null,
      ),
    );
  }
  
  Color _getColorValue(String color) {
    switch (color) {
      case 'W':
      case 'White':
        return AppColors.cubeWhite;
      case 'Y':
      case 'Yellow':
        return AppColors.cubeYellow;
      case 'R':
      case 'Red':
        return AppColors.cubeRed;
      case 'O':
      case 'Orange':
        return AppColors.cubeOrange;
      case 'B':
      case 'Blue':
        return AppColors.cubeBlue;
      case 'G':
      case 'Green':
        return AppColors.cubeGreen;
      default:
        return AppColors.textMuted;
    }
  }
}
