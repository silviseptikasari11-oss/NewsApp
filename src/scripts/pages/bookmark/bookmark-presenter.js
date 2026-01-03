import { reportMapper } from '../../data/api.mapper';

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showReportListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportsListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showReportListMap();
      const listOfStories = await this.#model.getAllStories();
      const stories = await Promise.all(listOfStories.map(reportMapper));

      const message = 'Berhasil mendapatkan daftar laporan tersimpan';

      this.#view.populateBookmarkedList(message, stories);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateBookmarkedError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
