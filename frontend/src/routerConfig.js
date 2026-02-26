// Router configuration to suppress React Router v7 warnings
import { UNSAFE_enhanceManualRouteObjects } from '@remix-run/router';

// Suppress React Router warnings by setting future flags
if (typeof window !== 'undefined') {
  // This will suppress the warnings in development
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('React Router Future Flag Warning')) {
        return; // Suppress React Router warnings
      }
    }
    originalWarn.apply(console, args);
  };
}

export default {}; 