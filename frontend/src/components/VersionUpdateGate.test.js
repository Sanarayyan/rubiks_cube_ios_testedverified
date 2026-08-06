import { getSelectedVersionAction } from './VersionUpdateGate';

describe('VersionUpdateGate response handling', () => {
  test('keeps no_action responses silent', () => {
    expect(getSelectedVersionAction({ action: 'no_action', canContinue: true })).toBe('no_action');
  });

  test('shows an optional update popup when VersionHub returns optional', () => {
    expect(getSelectedVersionAction({ action: 'optional', updateAvailable: true })).toBe('optional');
  });

  test('shows a mandatory update popup when VersionHub returns mandatory', () => {
    expect(getSelectedVersionAction({ action: 'mandatory', updateAvailable: true })).toBe('mandatory');
  });

  test('forces update when canContinue is false even if action is missing', () => {
    expect(getSelectedVersionAction({ canContinue: false })).toBe('mandatory');
  });

  test('supports snake_case can_continue responses', () => {
    expect(getSelectedVersionAction({ can_continue: false })).toBe('mandatory');
  });
});
