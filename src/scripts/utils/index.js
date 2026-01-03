export function setupSkipToContent(element, mainContent) {
  element.addEventListener('click', () => mainContent.focus());
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

//membantu dokumen untuk transisi
export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

    return {
      ready: Promise.reject(Error('View transitions unsupported')),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  return document.startViewTransition(updateDOM);
}

/**
 * Ref: https://stackoverflow.com/questions/18650168/convert-blob-to-base64
 */
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Ref: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
export function convertBase64ToBlob(base64Data, contentType = '', sliceSize = 512) {
  const BASE64_MARKER = ';base64,';
  if (base64Data.includes(BASE64_MARKER)) {
    base64Data = base64Data.split(BASE64_MARKER)[1];
  }

  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isServicesWorkerAvailable() {
  return `serviceWorker` in navigator;
}

export async function registerServiceWorker() {
  if (!(`serviceWorker` in navigator)) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js', { scope: '/', updateViaCache: 'none', type: 'module' });
    console.log('Service worker telah terpasang:', registration);

    // tunggu service worker aktif
    await navigator.serviceWorker.ready;
    console.log('Service worker telah aktif');

    return registration;
  } catch (error) {
    console.error('Failed to install service worker:', error);
    return null;
  }
}