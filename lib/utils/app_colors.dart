import 'package:flutter/material.dart';

class AppColors {
  // Dark Backgrounds
  static const Color background = Color(0xFF0F172A);
  static const Color surface = Color(0xFF1E293B);
  static const Color surfaceLight = Color(0xFF334155);
  
  // Accents
  static const Color primary = Color(0xFF38BDF8);
  static const Color secondary = Color(0xFF818CF8);
  static const Color accent = Color(0xFF2DD4BF);
  
  // Text
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Cube Colors (Modern Palette)
  static const Color cubeWhite = Color(0xFFF8FAFC);
  static const Color cubeYellow = Color(0xFFFDE047);
  static const Color cubeRed = Color(0xFFEF4444);
  static const Color cubeOrange = Color(0xFFF97316);
  static const Color cubeBlue = Color(0xFF3B82F6);
  static const Color cubeGreen = Color(0xFF22C55E);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [background, Color(0xFF1E293B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient glassGradient = LinearGradient(
    colors: [
      Colors.white10,
      Color(0x0DFFFFFF), // 5% opacity white
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
