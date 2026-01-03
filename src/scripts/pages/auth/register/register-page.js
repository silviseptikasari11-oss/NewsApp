import RegisterPresenter from './register-presenter.js';
import * as NewsAppAPI from '../../../data/api.js';

export default class RegisterPage {
  #presenter = null;
  async render() {
    return `
            <section class="register-container">
                <h2 class="register-title">Daftar Akun</h2>
                <form id="register-form" class="register-form">
                
                    <div class="form-control">
                        <label for="name-input">Nama</label>
                        <div class="register-form_title-container">
                            <input type="text" id="name-input" name="name" placeholder="Nuel" required>
                        </div>
                    </div>

                    <div class="form-control">
                        <label for="email-input">Email</label>

                        <div class="register-form_title-container">
                            <input
                                type="email"
                                id="email-input"
                                name="email"
                                placeholder="Contoh: newsapp@gmail.com"
                                required
                            />
                        </div>
                    </div>

                    <div class="form-control">
                        <label for="password-input">Password</label>
                        <div class="register-form_title-container">
                            <input
                                type="password"
                                id="password-input"
                                name="password"
                                placeholder="Masukkan password anda"
                                required
                                minlength="8"
                            />
                        </div>
                    </div>

                    <div class="register-form-buttons">
                        <div id="submit-button-container">
                            <button class="btn" type="submit">Daftar</button>
                        </div>
                        <p class="register-form-alreadyhaveaccount">
                        Sudah punya akun? <a href="#/login">Masuk</a>
                        </p>
                    </div>
                </form>
            </section>
        `;
  }

  async afterRender() {
    //dosomething
    this.#presenter = new RegisterPresenter({
      view: this,
      model: NewsAppAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.querySelector('#register-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = {
        name: document.querySelector('#name-input').value,
        email: document.querySelector('#email-input').value,
        password: document.querySelector('#password-input').value,
      };

      if (!data.name || !data.email || !data.password) {
        alert('Nama, email, dan password harus diisi');
        return;
      }

      await this.#presenter.getRegistered(data);
    });
  }

  registeredSuccessfully(message) {
    console.log(message);

    document.getElementById('register-form').reset();

    // Redirect
    location.hash = '/login';
  }

  registeredFailed(message) {
    alert('Gagal Daftar: ' + message);
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
