import './styles/style.css';
import './styles/responsive.css';
import 'leaflet/dist/leaflet.css';
import App from './scripts/app.js';
import Camera from './scripts/utils/camera.js';
import { registerServiceWorker } from './scripts/utils/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    drawerNavigation: document.querySelector('#navbar-container'),
    skipLinkButton: document.querySelector('#skiplink'),
  });
  
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    // stop all active media
    Camera.stopAllStreams();
  });
});
