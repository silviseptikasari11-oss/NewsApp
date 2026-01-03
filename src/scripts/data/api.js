import { base_url } from '../../config.js';
import { access_token_key } from '../../config.js';
import { getAccessToken } from '../utils/auth.js';

// src: https://story-api.dicoding.dev/v1/#/

const ENDPOINTS = {
  //auth
  REGISTER: `${base_url}/register`,
  LOGIN: `${base_url}/login`,

  //report
  ADDNEWSTORY: `${base_url}/stories`,
  GETALLSTORIES: `${base_url}/stories`,
  DETAILSTORY: (id) => `${base_url}/stories/${id}`,

  SUBSCRIBE: `${base_url}/notifications/subscribe`,
  UNSUBSCRIBE: `${base_url}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${access_token_key}`,
    },
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories() {
  const token = getAccessToken();
  const fetchResponse = await fetch(ENDPOINTS.GETALLSTORIES, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getDetailReportById(id) {
  const token = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.DETAILSTORY(id), {
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function storeNewStories({ description, photo, lat, lon }) {
  const token = getAccessToken();

  const formData = new FormData();
  formData.set('description', description);
  formData.set('photo', photo);
  formData.set('lat', lat);
  formData.set('lon', lon);

  const fetchResponse = await fetch(ENDPOINTS.ADDNEWSTORY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const token = getAccessToken();

  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const token = getAccessToken();

  const data = JSON.stringify({
    endpoint,
  });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
