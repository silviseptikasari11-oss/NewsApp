import { reportMapper } from '../../data/api.mapper.js';
export class StoriesDetailPresenter {
  #storiesId;
  #view;
  #apiModel;
  #dbModel;

  constructor(storiesId, { view, apiModel, dbModel }) {
    this.#storiesId = storiesId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showStoriesDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showMapLoding: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoriesDetail() {
    this.#view.showStoriesDetailLoading();
    try {
      const response = await this.#apiModel.getDetailReportById(this.#storiesId);

      if (!response.ok) {
        console.error('showStoriesDetailAndMap: response:', response);
        this.#view.populateStoriesDetailError(response.message);
        return;
      }

      const report = await reportMapper(response.story);
      console.log(report);

      this.#view.populateStoriesDetailAndInitialMap(response.message, report);
    } catch (error) {
      console.error('showStoriesDetailAndMap: error:', error);
      this.#view.populateStoriesDetailError(error.message);
    } finally {
      this.#view.hideStoriesDetailLoading();
    }
  }

  async saveReport() {
    try {
      const response = await this.#apiModel.getDetailReportById(this.#storiesId);
      await this.#dbModel.putReport(response.story);

      this.#view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveReport: error:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeReport() {
    try {
      await this.#dbModel.removeReport(this.#storiesId);

      this.#view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    } catch (error) {
      console.error('removeReport: error:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  async #isReportSaved() {
    // return false;
    return !!(await this.#dbModel.getDetailReportById(this.#storiesId));
  }
}
