import LoginPage from '../pages/auth/login/login-page.js';
import RegisterPage from '../pages/auth/register/register-page.js';
import BookmarkPage from '../pages/bookmark/bookmark-page.js';
import HomePage from '../pages/home/home-page.js';
import StoriesDetailPage from '../pages/storiesdetail/storiesdetail-page.js';
import NewPage from '../pages/new/new-page.js';
import { checkRouteAccess } from '../utils/auth.js';

const routes = {
  '/login': () => checkRouteAccess(new LoginPage()),
  '/register': () => checkRouteAccess(new RegisterPage()),
  '/': () => checkRouteAccess(new HomePage()),
  '/bookmark': () => checkRouteAccess(new BookmarkPage()),
  '/stories/:id': () => checkRouteAccess(new StoriesDetailPage()),
  '/new': () => checkRouteAccess(new NewPage()),
};

export default routes;
