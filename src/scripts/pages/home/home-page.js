import {
  generateLoaderAbsoluteTemplate,
  generateStoriesItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../template.js';
import { sleep } from '../../utils/index.js';
import HomePresenter from './home-presenter.js';
import * as NewsApp from '../../data/api.js';
import Map from '../../utils/map.js';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h2 class="section-title">Daftar Laporan Berita</h2>

        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // todo afterrenderr
    this.#presenter = new HomePresenter({
      view: this,
      model: NewsApp,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  async populateStoriesList(message, stories) {
    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      const isValidCoordinate =
        story.lat !== null &&
        story.lon !== null &&
        typeof story.lat === 'number' &&
        typeof story.lon === 'number';

      if (!isValidCoordinate) {
        console.warn('Invalid coordinate for story:', story);
      }

      if (this.#map && isValidCoordinate) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.name };

        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateStoriesItemTemplate({
          ...story,
          storyName: story.name,
        }),
      );
    }, '');

    document.getElementById('reports-list').innerHTML = `
      <div class="reports-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    document.getElementById('reports-list').innerHTML = generateReportsListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById('reports-list').innerHTML = generateReportsListErrorTemplate(message);
  }

  async initialMap() {
    //todo map
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }
}
