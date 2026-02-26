import 'package:flutter/material.dart';

class MeshBackground extends StatefulWidget {
  final Widget child;
  const MeshBackground({super.key, required this.child});

  @override
  State<MeshBackground> createState() => _MeshBackgroundState();
}

class _MeshBackgroundState extends State<MeshBackground> with TickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base Dark Background
        Container(color: const Color(0xFF0F172A)),
        
        // Animated Orbs
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Stack(
              children: [
                _buildOrb(
                  color: const Color(0xFF38BDF8).withOpacity(0.15),
                  size: 400,
                  top: -100 + (20 * (_controller.value)),
                  right: -100 + (30 * (1 - _controller.value)),
                ),
                _buildOrb(
                  color: const Color(0xFF818CF8).withOpacity(0.15),
                  size: 500,
                  bottom: -150 + (40 * _controller.value),
                  left: -150 + (20 * _controller.value),
                ),
                _buildOrb(
                  color: const Color(0xFF2DD4BF).withOpacity(0.1),
                  size: 300,
                  top: 200 + (50 * (0.5 - _controller.value).abs()),
                  left: -50,
                ),
              ],
            );
          },
        ),
        
        // Noise Texture/Overlay (Optional but helps with banding)
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.2),
                Colors.transparent,
                Colors.black.withOpacity(0.4),
              ],
            ),
          ),
        ),
        
        // The Content
        widget.child,
      ],
    );
  }

  Widget _buildOrb({
    required Color color,
    required double size,
    double? top,
    double? bottom,
    double? left,
    double? right,
  }) {
    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color,
              blurRadius: 100,
              spreadRadius: 50,
            ),
          ],
        ),
      ),
    );
  }
}
