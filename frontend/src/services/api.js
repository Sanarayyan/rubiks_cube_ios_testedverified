import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:8081';
const configuredApiBaseUrl = process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

// Production builds must set REACT_APP_API_URL to the deployed backend.
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const shouldLogApi = process.env.NODE_ENV !== 'production';

const createApiError = (fallbackMessage, error) => {
  const responseData = error.response?.data;
  const message = responseData?.details || responseData?.error || error.message || fallbackMessage;
  const apiError = new Error(message);
  apiError.status = error.response?.status;
  apiError.responseData = responseData;
  apiError.isNetworkError = !error.response;
  return apiError;
};

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    if (shouldLogApi) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (shouldLogApi) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (shouldLogApi) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (shouldLogApi) {
      console.error('API Response Error:', error.response?.data || error.message);
    }
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
      if (shouldLogApi) {
        console.error('Solve cube error:', error);
      }
      throw createApiError('Failed to solve cube', error);
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
      if (shouldLogApi) {
        console.error('Upload image error:', error);
      }
      throw createApiError('Failed to process image', error);
    }
  },

  // Get solving history
  getHistory: async () => {
    try {
      const response = await api.get('/api/history');
      return response.data;
    } catch (error) {
      if (shouldLogApi) {
        console.error('Get history error:', error);
      }
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
      if (shouldLogApi) {
        console.error('Health check error:', error);
      }
      throw createApiError('Backend server is not responding', error);
    }
  },
};

export const getFriendlySolveError = (message = '') => {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('failed to call python solver') ||
    normalized.includes('pathaccessexception') ||
    normalized.includes('python solver not found') ||
    normalized.includes('backend server is not responding') ||
    normalized.includes('network error')
  ) {
    return 'The solver service is temporarily unavailable. Please try again in a moment.';
  }

  if (
    normalized.includes('probably cubestring is invalid') ||
    normalized.includes('invalid cube') ||
    normalized.includes('impossible')
  ) {
    return 'Looks like the colors are right in count, but placed in an impossible cube state. Please recheck the cube.';
  }

  return message || 'The cube could not be solved. Please try again.';
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

function copyStickers(next, previous, targetIndices, sourceIndices) {
  for (let i = 0; i < targetIndices.length; i++) {
    next[targetIndices[i]] = previous[sourceIndices[i]];
  }
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
      copyStickers(s, prev, f, r);
      copyStickers(s, prev, r, b);
      copyStickers(s, prev, b, l);
      copyStickers(s, prev, l, f);
    } else if (face === 'D') {
      // F bottom -> R bottom -> B bottom -> L bottom -> F bottom
      const f = [24, 25, 26], r = [15, 16, 17], b = [51, 52, 53], l = [42, 43, 44];
      copyStickers(s, prev, f, l);
      copyStickers(s, prev, l, b);
      copyStickers(s, prev, b, r);
      copyStickers(s, prev, r, f);
    } else if (face === 'L') {
      // U left -> F left -> D left -> B right (reversed) -> U left
      const u = [0, 3, 6], f = [18, 21, 24], d = [27, 30, 33], b = [53, 50, 47];
      copyStickers(s, prev, f, u);
      copyStickers(s, prev, d, f);
      copyStickers(s, prev, b, d);
      copyStickers(s, prev, u, b);
    } else if (face === 'R') {
      // U right -> B left (reversed) -> D right -> F right -> U right
      const u = [2, 5, 8], f = [20, 23, 26], d = [29, 32, 35], b = [51, 48, 45];
      copyStickers(s, prev, f, d);
      copyStickers(s, prev, u, f);
      copyStickers(s, prev, b, u);
      copyStickers(s, prev, d, b);
    } else if (face === 'F') {
      // U bottom -> R left -> D top -> L right -> U bottom
      const u = [6, 7, 8], r = [9, 12, 15], d = [29, 28, 27], l = [44, 41, 38];
      copyStickers(s, prev, r, u);
      copyStickers(s, prev, d, r);
      copyStickers(s, prev, l, d);
      copyStickers(s, prev, u, l);
    } else if (face === 'B') {
      // U top -> L left -> D bottom -> R right -> U top
      const u = [2, 1, 0], l = [36, 39, 42], d = [33, 34, 35], r = [17, 14, 11];
      copyStickers(s, prev, l, u);
      copyStickers(s, prev, d, l);
      copyStickers(s, prev, r, d);
      copyStickers(s, prev, u, r);
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
