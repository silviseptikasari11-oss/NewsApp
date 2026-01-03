export default class LoginPresenter {
  #model;
  #view;
  #authModel;

  constructor({ model, view, authModel }) {
    this.#model = model;
    this.#view = view;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error('getLogin: reponse:', response);
        this.#view.loginFailed(response.message);
        return;
      }

      this.#authModel.putAccessToken(response.loginResult.token);

      this.#view.loginSuccessfully(response.message, response.loginResult);
    } catch (error) {
      console.error('getLogin: error:', error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
