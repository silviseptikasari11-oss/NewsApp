import { access_token_key } from '../../config.js';
import { getActiveRoute } from '../routes/url.parser.js';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(access_token_key);

    if (accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(access_token_key, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(access_token_key);
    return true;
  } catch (error) {
    console.log('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];


export function checkRouteAccess(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  //jika user sudah login, pindahkan ke halaman beranda
  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }

  //jika user belum login, cegah akses ke halaman lain (selain halaman login/register)
  if (!unauthenticatedRoutesOnly.includes(url) && !isLogin) {
    location.hash = '/login';
    return null;
  }

  return page;
}

export function getLogout() {
  removeAccessToken();
}
