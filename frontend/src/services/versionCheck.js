import { Capacitor } from '@capacitor/core';

const DEFAULT_VERSION_CHECK_PATH = '/api/v1/version-check';
const DEFAULT_APPLICATION_NAME = 'rubiks_suite_solver';
const DEFAULT_APP_VERSION = '1.0.0';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getPlatform = () => {
  const configuredPlatform = process.env.REACT_APP_VERSION_PLATFORM;

  if (configuredPlatform === 'android' || configuredPlatform === 'ios') {
    return configuredPlatform;
  }

  return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
};

const getVersionCheckUrl = () => {
  const directUrl = process.env.REACT_APP_VERSION_CHECK_URL;

  if (directUrl) {
    return directUrl;
  }

  const baseUrl = process.env.REACT_APP_VERSION_HUB_URL;

  if (!baseUrl) {
    return '';
  }

  return `${trimTrailingSlash(baseUrl)}${DEFAULT_VERSION_CHECK_PATH}`;
};

export const versionCheckConfig = {
  applicationName: process.env.REACT_APP_VERSION_APPLICATION_NAME || DEFAULT_APPLICATION_NAME,
  appVersion: process.env.REACT_APP_APP_VERSION || DEFAULT_APP_VERSION,
  platform: getPlatform(),
  url: getVersionCheckUrl(),
  apiKey: process.env.REACT_APP_VERSION_HUB_API_KEY || '',
};

export const shouldCheckAppVersion = () => Boolean(versionCheckConfig.url && versionCheckConfig.apiKey);

export const checkAppVersion = async () => {
  if (!shouldCheckAppVersion()) {
    return null;
  }

  const response = await fetch(versionCheckConfig.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Key': versionCheckConfig.apiKey,
    },
    body: JSON.stringify({
      application_name: versionCheckConfig.applicationName,
      platform: versionCheckConfig.platform,
      version: versionCheckConfig.appVersion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Version check failed with status ${response.status}`);
  }

  return response.json();
};
