import {
  generateLoaderAbsoluteTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateSaveReportButtonTemplate,
  generateRemoveReportButtonTemplate,
  generateReportDetailErrorTemplate,
  generateReportDetailTemplate,
} from '../../template';
import { StoriesDetailPresenter } from './storiesdetail-presenter.js';
import { parseActivePathname } from '../../routes/url.parser.js';
import * as NewsApp from '../../data/api.js';
import Map from '../../utils/map.js';
import Database from '../../database.js';

export default class StoriesDetailPage {
  #presenter = null;
  #from = null;
  #map = null;

  async render() {
    return `
            <section>
                <div class="report-detail__container">
                <div id="report-detail" class="report-detail"></div>
                <div id="report-detail-loading-container"></div>
                </div>
            </section>
        `;
  }

  async afterRender() {
    this.#presenter = new StoriesDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: NewsApp,
      dbModel: Database,
    });

    this.#presenter.showStoriesDetail();
  }

  async populateStoriesDetailAndInitialMap(message, report) {
    document.getElementById('report-detail').innerHTML = generateReportDetailTemplate({
      name: report.name,
      description: report.description,
      photoUrl: report.photoUrl,
      createdAt: report.createdAt,
      lat: report.lat,
      lon: report.lon,
      location: report.location,
    });

    //map

    if (report.lat == null || report.lon == null) {
      console.error('Koordinat tidak tersedia:', report);
      return;
    }
    // await this.#presenter.showStoriesDetailMap();
    if (!this.#map) {
      await this.initialMap();
    }
    if (this.#map) {
      const coordinate = [report.lat, report.lon];
      const markerOptions = { alt: report.name };
      const popupOptions = { content: report.name };

      this.#map.changeCamera(coordinate);
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    }
    console.log('lat:', report.lat, 'lon:', report.lon);
    console.log('this.#map exists?', this.#map !== null);

    // action button
    this.#presenter.showSaveButton();
  }

  populateStoriesDetailError(message) {
    document.getElementById('report-detail').innerHTML = generateReportDetailErrorTemplate(message);
  }

  async initialMap() {
    //todo: map initialization
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }

  renderSaveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateSaveReportButtonTemplate();

    document.getElementById('report-detail-save').addEventListener('click', async () => {
      // alert('Fitur simpan laporan akan segera hadir!');
      await this.#presenter.saveReport();
      await this.#presenter.showSaveButton();
    });
  }

  renderRemoveButton() {
    document.getElementById('save-actions-container').innerHTML =
      generateRemoveReportButtonTemplate();

    document.getElementById('report-detail-remove').addEventListener('click', async () => {
      // alert('Fitur simpan laporan akan segera hadir!');
      await this.#presenter.removeReport();
      await this.#presenter.showSaveButton();
    });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }
  removeFromBookmarkFailed(message) {
    alert(message);
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  showStoriesDetailLoading() {
    document.getElementById('report-detail-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoriesDetailLoading() {
    document.getElementById('report-detail-loading-container').innerHTML = '';
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }
}
