import { convertBase64ToUint8Array } from './index.js';
import { VAPID_PUBLIC_KEY } from '../../config.js';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api.js';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API Unsupported');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  console.log('Checking notification permission...');
  if (!(await requestNotificationPermission())) {
    console.error('Notification denied');
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';
  let pushSubscription;
  try {
    await navigator.serviceWorker.ready;
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });
    if (!response.ok) {
      console.error('subscribe: response:', response);
      alert(failureSubscribeMessage);

      // undo subscribe to push notification
      await pushSubscription.unsubscribe();

      return;
    }
    console.log({ endpoint, keys });
    alert(successSubscribeMessage);
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);
    await pushSubscription.unsubscribe();
  }
}

export async function unsubscribe() {
  const pushSubscription = await getPushSubscription();

  if (!pushSubscription) {
    alert('Belum ada langganan push notification.');
    return;
  }

  const failureUnsubscribeMessage = 'Gagal berhenti langganan push notification.';
  const successUnsubscribeMessage = 'Berhasil berhenti langganan push notification.';

  try {
    const { endpoint } = pushSubscription;

    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      console.error('unsubscribe: response:', response);
      alert(failureUnsubscribeMessage);
      return;
    }

    await pushSubscription.unsubscribe();
    alert(successUnsubscribeMessage);
  } catch (error) {
    console.error('unsubscribe: error:', error);
    alert(failureUnsubscribeMessage);
  }
}