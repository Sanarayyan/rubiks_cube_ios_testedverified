import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:ui';
import '../providers/cube_provider.dart';
import '../widgets/cube_grid_widget.dart';
import '../widgets/solution_display_widget.dart';
import '../utils/app_colors.dart';

class ManualInputScreen extends StatefulWidget {
  const ManualInputScreen({super.key});

  @override
  State<ManualInputScreen> createState() => _ManualInputScreenState();
}

class _ManualInputScreenState extends State<ManualInputScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          const BoxDecoration(gradient: AppColors.backgroundGradient).build(context),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                children: [
                  const SizedBox(height: 10),
                  
                  // Selection Section
                  _buildSelectionPanel(context),
                  
                  const SizedBox(height: 20),
                  
                  // Main Cube Area
                  Expanded(
                    child: _buildGlassPanel(
                      child: Consumer<CubeProvider>(
                        builder: (context, cubeProvider, child) {
                          return Column(
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Text(
                                  'TAP SQUARES TO CHANGE COLORS',
                                  style: TextStyle(
                                    color: AppColors.primary.withOpacity(0.8),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 2,
                                  ),
                                ),
                              ),
                              Expanded(
                                child: cubeProvider.inputMode == 'grid'
                                    ? const CubeGridWidget()
                                    : Center(
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(Icons.construction_rounded, color: AppColors.textMuted, size: 48),
                                            const SizedBox(height: 16),
                                            Text(
                                              '${cubeProvider.inputMode.toUpperCase()} VIEW COMING SOON',
                                              style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.bold),
                                            ),
                                          ],
                                        ),
                                      ),
                              ),
                              
                              // Bottom Action Row
                              Padding(
                                padding: const EdgeInsets.all(20.0),
                                child: Row(
                                  children: [
                                    IconButton.filledTonal(
                                      onPressed: () => cubeProvider.resetCube(),
                                      icon: const Icon(Icons.refresh_rounded),
                                      style: IconButton.styleFrom(
                                        backgroundColor: AppColors.surfaceLight,
                                        foregroundColor: AppColors.textPrimary,
                                        padding: const EdgeInsets.all(16),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: _buildSolveButton(cubeProvider),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Solution display (Collapsible or Scrollable)
                  Consumer<CubeProvider>(
                    builder: (context, cubeProvider, child) {
                      if (cubeProvider.solution != null) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: SolutionDisplayWidget(solution: cubeProvider.solution!),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionPanel(BuildContext context) {
    return _buildGlassPanel(
      padding: const EdgeInsets.all(16),
      child: Consumer<CubeProvider>(
        builder: (context, cubeProvider, child) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildMiniToggle(
                    'VIEW',
                    ['GRID', 'NET', '3D'],
                    cubeProvider.inputMode == 'grid' ? 0 : (cubeProvider.inputMode == 'net' ? 1 : 2),
                    (idx) => cubeProvider.setInputMode(idx == 0 ? 'grid' : (idx == 1 ? 'net' : '3d')),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildMiniToggle(String label, List<String> options, int currentIdx, Function(int) onToggle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(options.length, (i) {
              bool isSelected = i == currentIdx;
              return GestureDetector(
                onTap: () => onToggle(i),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: isSelected ? [
                      BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8)
                    ] : null,
                  ),
                  child: Text(
                    options[i],
                    style: TextStyle(
                      color: isSelected ? AppColors.background : AppColors.textSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildGlassPanel({required Widget child, EdgeInsets? padding}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildSolveButton(CubeProvider cubeProvider) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: cubeProvider.isLoading ? null : () => cubeProvider.solveCube(),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: cubeProvider.isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.auto_fix_high_rounded, size: 20),
                  SizedBox(width: 8),
                  Text('SOLVE NOW'),
                ],
              ),
      ),
    );
  }
}

extension ContainerExt on BoxDecoration {
  Widget build(BuildContext context) => Container(decoration: this);
}
