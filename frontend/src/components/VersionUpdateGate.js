import React, { useEffect, useState } from 'react';
import { checkAppVersion, shouldCheckAppVersion } from '../services/versionCheck';

const field = (value, camelCaseKey, snakeCaseKey) => (
  value?.[camelCaseKey] ?? value?.[snakeCaseKey]
);

export const getSelectedVersionAction = (value) => {
  if (!value) {
    return 'no_action';
  }

  const canContinue = field(value, 'canContinue', 'can_continue');

  if (value.action === 'mandatory' || canContinue === false) {
    return 'mandatory';
  }

  if (value.action === 'optional') {
    return 'optional';
  }

  return 'no_action';
};

const normalizeUpdateResponse = (value) => {
  const action = getSelectedVersionAction(value);

  if (action === 'no_action') {
    return null;
  }

  return {
    action,
    title: value.title,
    description: value.description,
    storeUrl: field(value, 'storeUrl', 'store_url'),
  };
};

const openStore = (storeUrl) => {
  if (!storeUrl) {
    return;
  }

  window.location.assign(storeUrl);
};

const VersionUpdateModal = ({ update, onDismiss }) => {
  const mandatory = update.action === 'mandatory';
  const title = update.title || (mandatory ? 'Update required' : 'Update available');
  const description = update.description || 'A newer version of the app is available.';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 px-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-update-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#120A24] p-6 text-left text-white shadow-2xl shadow-black/40">
        <div className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
          {mandatory ? 'Update required' : 'Update available'}
        </div>

        <h2 id="version-update-title" className="text-2xl font-bold leading-tight">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/70">
          {description}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => openStore(update.storeUrl)}
            className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-400 active:scale-[0.99]"
          >
            Update now
          </button>

          {!mandatory && (
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const VersionUpdateGate = () => {
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    let active = true;

    if (!shouldCheckAppVersion()) {
      console.info('[VersionHub] selected popup action:', 'no_action');
      return undefined;
    }

    checkAppVersion()
      .then((result) => {
        const normalizedUpdate = normalizeUpdateResponse(result);
        const selectedAction = normalizedUpdate?.action || 'no_action';
        console.info('[VersionHub] selected popup action:', selectedAction);

        if (active && normalizedUpdate) {
          setUpdate(normalizedUpdate);
        }
      })
      .catch((error) => {
        console.warn('[VersionHub] version check failed:', error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!update) {
    return null;
  }

  return (
    <VersionUpdateModal
      update={update}
      onDismiss={() => setUpdate(null)}
    />
  );
};

export default VersionUpdateGate;
