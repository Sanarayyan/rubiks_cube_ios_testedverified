jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }),
}));

import {
  generateSolvedCube,
  getFriendlySolveError,
  validateCubeStateDetailed,
} from './api';

describe('cube API utilities', () => {
  test('generateSolvedCube returns 54 stickers with 9 of each color', () => {
    const cube = generateSolvedCube();
    const counts = cube.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    expect(cube).toHaveLength(54);
    expect(counts).toEqual({
      W: 9,
      O: 9,
      B: 9,
      Y: 9,
      R: 9,
      G: 9,
    });
  });

  test('validateCubeStateDetailed accepts the solved cube', () => {
    const result = validateCubeStateDetailed(generateSolvedCube());

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('validateCubeStateDetailed rejects incorrect color counts', () => {
    const cube = generateSolvedCube();
    cube[0] = 'O';

    const result = validateCubeStateDetailed(cube);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Not enough W stickers: 8 instead of 9',
        'Too many O stickers: 10 instead of 9',
      ])
    );
  });

  test('getFriendlySolveError hides backend internals from users', () => {
    const message = getFriendlySolveError(
      "Failed to call Python solver: PathAccessException: Getting current working directory failed"
    );

    expect(message).toBe(
      'The solver service is temporarily unavailable. Please try again in a moment.'
    );
  });

  test('getFriendlySolveError explains impossible cube states', () => {
    const message = getFriendlySolveError('Probably cubestring is invalid');

    expect(message).toBe(
      'Looks like the colors are right in count, but placed in an impossible cube state. Please recheck the cube.'
    );
  });
});
