import axios from 'axios';

// Use environment variable for API URL in production, fallback to Render production URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://rubiks-cube-solver-3rur.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service functions
export const cubeAPI = {
  baseURL: API_BASE_URL,
  // Solve cube from color data
  solveCube: async (colors, mode = 'fast') => {
    try {
      const response = await api.post('/api/solve', { colors, mode });
      return response.data;
    } catch (error) {
      console.error('Solve cube error:', error);
      throw new Error(error.response?.data?.error || 'Failed to solve cube');
    }
  },

  // Upload and process image(s)
  // Accepts either a single File or an object mapping face keys to Files: { U,R,F,D,L,B }
  uploadImage: async (imageInput) => {
    try {
      const formData = new FormData();
      if (imageInput instanceof File) {
        formData.append('image', imageInput);
      } else if (imageInput && typeof imageInput === 'object') {
        const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
        faces.forEach(face => {
          const file = imageInput[face];
          if (file instanceof File) {
            formData.append(`face_${face}`, file);
          }
        });
      } else {
        throw new Error('No image(s) provided');
      }

      const response = await api.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error(error.response?.data?.error || 'Failed to process image');
    }
  },

  // Get solving history
  getHistory: async () => {
    try {
      const response = await api.get('/api/history');
      return response.data;
    } catch (error) {
      console.error('Get history error:', error);
      // Return empty history instead of throwing error for better UX
      return { history: [] };
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('Backend server is not responding');
    }
  },
};

// Utility functions
export const generateSolvedCube = () => {
  // Generate a solved cube state (54 colors) in order U, R, F, D, L, B
  const colors = [];

  // U (Up) - White
  colors.push(...Array(9).fill('W'));

  // R (Right) - Orange
  colors.push(...Array(9).fill('O'));

  // F (Front) - Blue
  colors.push(...Array(9).fill('B'));

  // D (Down) - Yellow
  colors.push(...Array(9).fill('Y'));

  // L (Left) - Red
  colors.push(...Array(9).fill('R'));

  // B (Back) - Green
  colors.push(...Array(9).fill('G'));

  return colors;
};

const FACE_INDICES = {
  U: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  R: [9, 10, 11, 12, 13, 14, 15, 16, 17],
  F: [18, 19, 20, 21, 22, 23, 24, 25, 26],
  D: [27, 28, 29, 30, 31, 32, 33, 34, 35],
  L: [36, 37, 38, 39, 40, 41, 42, 43, 44],
  B: [45, 46, 47, 48, 49, 50, 51, 52, 53],
};

function rotateFace(face, state, clockwise = true) {
  const idx = FACE_INDICES[face];
  const next = [...state];
  if (clockwise) {
    next[idx[0]] = state[idx[6]]; next[idx[1]] = state[idx[3]]; next[idx[2]] = state[idx[0]];
    next[idx[3]] = state[idx[7]]; next[idx[4]] = state[idx[4]]; next[idx[5]] = state[idx[1]];
    next[idx[6]] = state[idx[8]]; next[idx[7]] = state[idx[5]]; next[idx[8]] = state[idx[2]];
  } else {
    next[idx[0]] = state[idx[2]]; next[idx[1]] = state[idx[5]]; next[idx[2]] = state[idx[8]];
    next[idx[3]] = state[idx[1]]; next[idx[4]] = state[idx[4]]; next[idx[5]] = state[idx[7]];
    next[idx[6]] = state[idx[0]]; next[idx[7]] = state[idx[3]]; next[idx[8]] = state[idx[6]];
  }
  return next;
}

function applyMove(state, move) {
  let s = [...state];
  const face = move[0];
  const prime = move.includes("'");
  const twice = move.includes("2");

  const count = twice ? 2 : (prime ? 3 : 1);

  for (let k = 0; k < count; k++) {
    const prev = [...s];
    s = rotateFace(face, s, true);

    // Face-specific adjacent stickers movement
    if (face === 'U') {
      // F top -> L top -> B top -> R top -> F top
      const f = [18, 19, 20], r = [9, 10, 11], b = [45, 46, 47], l = [36, 37, 38];
      f.forEach((idx, i) => s[idx] = prev[r[i]]);
      r.forEach((idx, i) => s[idx] = prev[b[i]]);
      b.forEach((idx, i) => s[idx] = prev[l[i]]);
      l.forEach((idx, i) => s[idx] = prev[f[i]]);
    } else if (face === 'D') {
      // F bottom -> R bottom -> B bottom -> L bottom -> F bottom
      const f = [24, 25, 26], r = [15, 16, 17], b = [51, 52, 53], l = [42, 43, 44];
      f.forEach((idx, i) => s[idx] = prev[l[i]]);
      l.forEach((idx, i) => s[idx] = prev[b[i]]);
      b.forEach((idx, i) => s[idx] = prev[r[i]]);
      r.forEach((idx, i) => s[idx] = prev[f[i]]);
    } else if (face === 'L') {
      // U left -> F left -> D left -> B right (reversed) -> U left
      const u = [0, 3, 6], f = [18, 21, 24], d = [27, 30, 33], b = [53, 50, 47];
      f.forEach((idx, i) => s[idx] = prev[u[i]]);
      d.forEach((idx, i) => s[idx] = prev[f[i]]);
      b.forEach((idx, i) => s[idx] = prev[d[i]]);
      u.forEach((idx, i) => s[idx] = prev[b[i]]);
    } else if (face === 'R') {
      // U right -> B left (reversed) -> D right -> F right -> U right
      const u = [2, 5, 8], f = [20, 23, 26], d = [29, 32, 35], b = [51, 48, 45];
      f.forEach((idx, i) => s[idx] = prev[d[i]]);
      u.forEach((idx, i) => s[idx] = prev[f[i]]);
      b.forEach((idx, i) => s[idx] = prev[u[i]]);
      d.forEach((idx, i) => s[idx] = prev[b[i]]);
    } else if (face === 'F') {
      // U bottom -> R left -> D top -> L right -> U bottom
      const u = [6, 7, 8], r = [9, 12, 15], d = [29, 28, 27], l = [44, 41, 38];
      r.forEach((idx, i) => s[idx] = prev[u[i]]);
      d.forEach((idx, i) => s[idx] = prev[r[i]]);
      l.forEach((idx, i) => s[idx] = prev[d[i]]);
      u.forEach((idx, i) => s[idx] = prev[l[i]]);
    } else if (face === 'B') {
      // U top -> L left -> D bottom -> R right -> U top
      const u = [2, 1, 0], l = [36, 39, 42], d = [33, 34, 35], r = [17, 14, 11];
      l.forEach((idx, i) => s[idx] = prev[u[i]]);
      d.forEach((idx, i) => s[idx] = prev[l[i]]);
      r.forEach((idx, i) => s[idx] = prev[d[i]]);
      u.forEach((idx, i) => s[idx] = prev[r[i]]);
    }
  }
  return s;
}

export const generateScrambledCube = () => {
  let s = generateSolvedCube();
  const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
  let lastFace = '';
  for (let i = 0; i < 25; i++) {
    let face;
    do { face = moves[Math.floor(Math.random() * moves.length)]; } while (face === lastFace);
    const mod = Math.random() > 0.66 ? "2" : (Math.random() > 0.5 ? "'" : "");
    s = applyMove(s, face + mod);
    lastFace = face;
  }
  return s;
};

export const validateCubeState = (colors) => {
  if (!Array.isArray(colors) || colors.length !== 54) {
    return false;
  }
  const distinct = new Set(colors);
  if (distinct.size !== 6) return false;
  const counts = {};
  for (const c of colors) counts[c] = (counts[c] || 0) + 1;
  return Object.values(counts).every(n => n === 9);
};

export const validateCentersAndCounts = (colors) => {
  if (!Array.isArray(colors) || colors.length !== 54) {
    return { ok: false, error: 'Expected 54 stickers' };
  }
  const centerIdx = [4, 13, 22, 31, 40, 49];
  const centers = centerIdx.map(i => colors[i]);
  const centerSet = new Set(centers);
  if (centerSet.size !== 6) {
    return { ok: false, error: `Centers must be 6 distinct colors. Got: ${centers.join(', ')}` };
  }
  // Ensure all stickers belong to the center set
  for (const c of colors) {
    if (!centerSet.has(c)) {
      return { ok: false, error: `Sticker color ${c} not in center set ${Array.from(centerSet).join(', ')}` };
    }
  }
  // Ensure 9 of each center color
  const counts = {};
  for (const c of colors) counts[c] = (counts[c] || 0) + 1;
  for (const center of centerSet) {
    if (counts[center] !== 9) {
      return { ok: false, error: `Color ${center} count ${counts[center] || 0} != 9` };
    }
  }
  return { ok: true };
};

export const validateCubeStateDetailed = (colors) => {
  const errors = [];
  const warnings = [];

  // Basic structure validation
  if (!Array.isArray(colors) || colors.length !== 54) {
    return {
      isValid: false,
      errors: ['Cube must have exactly 54 stickers'],
      warnings: [],
      suggestions: ['Make sure you have filled in all 54 squares']
    };
  }

  // Check for valid colors
  const validColors = ['W', 'Y', 'R', 'O', 'B', 'G'];
  const invalidColors = colors.filter(c => !validColors.includes(c));
  if (invalidColors.length > 0) {
    errors.push(`Invalid colors found: ${invalidColors.join(', ')}`);
  }

  // Check center pieces (these should be unique and define the face colors)
  const centerIdx = [4, 13, 22, 31, 40, 49];
  const centers = centerIdx.map(i => colors[i]);
  const centerSet = new Set(centers);

  if (centerSet.size !== 6) {
    errors.push(`Each face must have a different center color. You have ${centerSet.size} different center colors instead of 6.`);
    errors.push(`Center colors found: ${centers.join(', ')}`);
  }

  // Check if all stickers match the center colors
  const invalidStickers = colors.filter(c => !centerSet.has(c));
  if (invalidStickers.length > 0) {
    errors.push(`Some stickers don't match your center colors. Check for stickers that aren't: ${Array.from(centerSet).join(', ')}`);
  }

  // Count each color
  const counts = {};
  for (const c of colors) counts[c] = (counts[c] || 0) + 1;

  // Check if each color appears exactly 9 times
  for (const color of validColors) {
    const count = counts[color] || 0;
    if (count !== 9) {
      if (count > 9) {
        errors.push(`Too many ${color} stickers: ${count} instead of 9`);
      } else if (count < 9) {
        errors.push(`Not enough ${color} stickers: ${count} instead of 9`);
      }
    }
  }

  // Check for impossible corner combinations
  const cornerIdx = [0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53];
  const corners = cornerIdx.map(i => colors[i]);

  // Check for impossible edge combinations
  const edgeIdx = [1, 3, 5, 7, 10, 12, 14, 16, 19, 21, 23, 25, 28, 30, 32, 34, 37, 39, 41, 43, 46, 48, 50, 52];
  const edges = edgeIdx.map(i => colors[i]);

  // Check for impossible face patterns (like all white stickers on one face)
  const faceIndices = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],      // Up
    [9, 10, 11, 12, 13, 14, 15, 16, 17], // Right
    [18, 19, 20, 21, 22, 23, 24, 25, 26], // Front
    [27, 28, 29, 30, 31, 32, 33, 34, 35], // Down
    [36, 37, 38, 39, 40, 41, 42, 43, 44], // Left
    [45, 46, 47, 48, 49, 50, 51, 52, 53]  // Back
  ];

  for (let i = 0; i < faceIndices.length; i++) {
    const face = faceIndices[i];
    const faceColors = face.map(idx => colors[idx]);
    const faceCenter = faceColors[4]; // Center of the face

    // Check if face has too many of the wrong color
    const wrongColorCount = faceColors.filter(c => c !== faceCenter).length;
    if (wrongColorCount > 4) { // Allow some mixed colors for realistic cube states
      warnings.push(`Face ${i + 1} (${faceCenter}) has many different colors - make sure this is correct`);
    }
  }

  // Provide helpful suggestions
  const suggestions = [];
  if (errors.length > 0) {
    suggestions.push('Check that each face has exactly 9 stickers');
    suggestions.push('Make sure the center sticker of each face is the main color of that face');
    suggestions.push('Count each color - you should have exactly 9 of each color');
    suggestions.push('Look for stickers that might be in the wrong place');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    colorCounts: counts,
    centerColors: centers
  };
};

export default api; 