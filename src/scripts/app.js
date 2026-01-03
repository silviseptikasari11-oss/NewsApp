import { getActiveRoute } from './routes/url.parser.js';
import routes from './routes/routes.js';
import { getAccessToken, getLogout } from './utils/auth.js';
import { setupSkipToContent, transitionHelper, isServicesWorkerAvailable } from './utils/index.js';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from './template.js';
import { subscribe, unsubscribe } from './utils/notification-helper.js';
import { isCurrentPushSubscriptionAvailable } from './utils/notification-helper.js';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerButton, drawerNavigation, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#initialDrawer();
  }

  #initialDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  async #setupPushNotification() {
    console.log('Setting up push notifications')
    const pushNotificationTools = document.getElementById('push-notification-tools');

    if(!pushNotificationTools){
      console.error('Push notification tools not found');
      return;
    }

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    console.log('isSubscribed', isSubscribed);

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();

      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      // todo: subscribe to push manager
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const routesName = getActiveRoute();
    const route = routes[routesName];

    //get page instance
    const page = route();

    if (!page) {
      this.#content.innerHTML = `<p>Halaman tidak ditemukan 404<p>`;
      return;
    }

    // this.#content.innerHTML = await page.render();
    // await page.afterRender();
    // dimatikan karena akan dimasukkan kepengecekkan

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#renderNavbar();

      if (isServicesWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });

    // this.#renderNavbar(); dimatikan dan dimasukkan ke pengecekkan diatas
    this.#drawerNavigation.classList.remove('open'); //tutup drawer
  }

  #renderNavbar() {
    const isLogin = !!getAccessToken();
    const ulMain = document.querySelector('#ul-main');
    const ulSecond = document.querySelector('#ul-second');

    if (!isLogin) {
      ulMain.innerHTML = '';
      ulSecond.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    ulMain.innerHTML = generateMainNavigationListTemplate();
    ulSecond.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.querySelector('#logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      const confirmed = confirm('Apakah Anda yakin ingin logout?');
      if (confirmed) {
        getLogout();
        location.hash = '/login';
      }
    });
  }
}
