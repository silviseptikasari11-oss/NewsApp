import LoginPresenter from './login-presenter.js';
import * as NewsAppAPI from '../../../data/api.js';
import * as AuthModel from '../../../utils/auth.js';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
            <section class="login-container">
                <h2 class="login-title">Masuk Akun</h2>
                <form id="login-form" class="login-form">
                    <div class="form-control">
                        <label for="email-input">Email</label>
                        <div class="login-form_title-container">
                            <input type="email" id="email-input" name="email" placeholder="Contoh: newsapp@gmail.com" required>
                        </div>
                    </div>

                    <div class="form-control">
                        <label for="password-input">Password</label>
                        <div class="login-form_title-container">
                            <input type="password" id="password-input" name="password" placeholder="Masukkan password anda" required minlength="6">
                        </div>
                    </div>

                    <div class="login-form-buttons">
                        <div id="submit-button-container">
                            <button class="btn" type="submit">Masuk</button>
                        </div>
                        <p class="login-form-havenoaccount">Belum punya akun? <a href="#/register">Daftar</a></p>
                    </div>
                </form>
            </section>
        `;
  }

  async afterRender() {
    //do something
    this.#presenter = new LoginPresenter({
      view: this,
      model: NewsAppAPI,
      authModel: AuthModel,
    });
    this.#setupForm();
  }

  #setupForm() {
    document.querySelector('#login-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        email: document.querySelector('#email-input').value,
        password: document.querySelector('#password-input').value,
      };

      if (!data.email || !data.password) {
        alert('Email dan password harus diisi');
        return;
      }
      await this.#presenter.getLogin(data);
    });
  }

  loginSuccessfully(message) {
    console.log(message);

    document.getElementById('login-form').reset();

    //redirect
    location.hash = '/';
  }

  loginFailed(message) {
    alert('Gagal login: ' + message);
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
                <i class="loader-button"></i> Masuk
            </button>
        `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Masuk</button>
        `;
  }
}
