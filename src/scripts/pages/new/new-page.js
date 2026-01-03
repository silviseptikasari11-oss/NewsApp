import NewPresenter from './new-presenter.js';
import * as NewsApp from '../../data/api.js';
import { generateLoaderAbsoluteTemplate } from '../../template.js';
import Camera from '../../utils/camera.js';
import { convertBase64ToBlob } from '../../utils/index.js';
import Map from '../../utils/map.js';

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    return `
        <section>
            <div class="new-report__header">
                <div class="container">
                    <h2 class="new-report__header__title">Buat Berita Baru</h2>
                    <p class="new-report__header__description">
                        Silakan lengkapi formulir di bawah untuk membuat berita baru.<br>
                        Pastikan berita yang dibuat adalah valid.
                    </p>
                </div>
            </div>
        </section>
    
        <section class="container">
            <div class="new-form__container">
                <form id="new-form" class="new-form">


                    <div class="form-control">
                        <label for="description-input" class="new-form__description__title">Keterangan</label>

                        <div class="new-form__description__container">
                            <textarea
                                id="description-input"
                                name="description"
                                placeholder="Masukkan keterangan lengkap berita. Anda dapat menjelaskan apa kejadiannya, dimana, kapan, dll."
                            ></textarea>
                        </div>
                    </div>

                    <div class="form-control">
                        <label for="documentations-input" class="new-form__documentations__title">Dokumentasi</label>
                        <div id="documentations-more-info">Anda dapat menyertakan foto sebagai dokumentasi.</div>

                        <div class="new-form__documentations__container">
                            <div class="new-form__documentations__buttons">
                                <button id="documentations-input-button" class="btn btn-outline" type="button">Ambil Gambar</button>
                                <input
                                    id="documentations-input"
                                    class="new-form__documentations__input"
                                    name="documentations"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    aria-multiline="true"
                                    aria-describedby="documentations-more-info"
                                >
                                <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                                    Buka Kamera
                                </button>
                            </div>
                            <div id="camera-container" class="new-form__camera__container">
                                <video id="camera-video" class="new-form__camera__video">
                                    Video stream not available.
                                </video>
                                
                                
                                <div class="new-form__camera__tools">
                                    <select id="camera-select"></select>
                                    <div class="new-form_camera_tools_buttons">
                                        <button id="camera-take-button" class="btn" type="button">Ambil Gambar</button>
                                    </div>
                                </div>
                                <canvas id="camera-canvas" class="new-form_camera_canvas"></canvas>
                            </div>
                            <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
                        </div>
                    </div>

                    <div class="form-control">
                        <div class="new-form__location__title">Lokasi</div>

                        <div class="new-form__location__container">
                            <div class="new-form__location__map__container">
                                <div id="map" class="new-form__location__map"></div>
                                <div id="map-loading-container"></div>
                            </div>
                            <div class="new-form__location_lat-lng">
                            <label for="latitude">Latitude</label>
                           <input id="latitude" type="number" name="latitude" readonly required>

                            <label for="longitude">Longitude</label>
                          <input id="longitude" type="number" name="longitude" readonly required>
                          </div>

                        </div>
                    </div>
                    <div class="form-buttons">
                        <span id="submit-button-container">
                            <button class="btn" type="submit">Buat Laporan</button>
                        </span>
                        <a class="btn btn-outline" href="#/">Batal</a>
                    </div>
                </form>
            </div>
        </section>
        `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: NewsApp,
    });

    this.#takenDocumentations = [];

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('new-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const parselat = parseFloat(this.#form.elements.namedItem('latitude').value);
      const parselon = parseFloat(this.#form.elements.namedItem('longitude').value);
      const validPhoto = this.#takenDocumentations
        .map((picture) => picture.blob)
        .filter((blob) => blob instanceof Blob || blob instanceof File);

      const data = {
        description: this.#form.elements.namedItem('description').value,
        // photo: this.#takenDocumentations.map((picture) => picture.blob),
        photo: validPhoto.length > 0 ? validPhoto[0] : null, //hanya ambil 1 foto
        lat: parselat,
        lon: parselon,
      };

      await this.#presenter.postNewReport(data);
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
    });

    document.getElementById('documentations-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('documentations-input').click();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');

        this.#isCameraOpen = cameraContainer.classList.contains('open');
        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          this.#camera.launch();

          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });
  }

  async initialMap() {
    //todo: map initialization
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    //preparing marker for select coordinate
    const centerCoordinate = this.#map.getCenter();

    this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );

    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    draggableMarker.addEventListener('click', (event) => {
      const coordinate = event.latlng; //
      draggableMarker.setLatLng(coordinate);

      //keep ceneter with user view
      this.#map.changeCamera([coordinate.lat, coordinate.lng]);
    });

    this.#map.addMapEventListener('click', (event) => {
      const coordinate = event.latlng;
      draggableMarker.setLatLng(coordinate);
      this.#map.changeCamera([coordinate.lat, coordinate.lng]);
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  #setupCamera() {
    if (this.#camera) {
      return;
    }

    this.#camera = new Camera({
      video: document.getElementById('camera-video'),
      cameraSelect: document.getElementById('camera-select'),
      canvas: document.getElementById('camera-canvas'),
    });

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenDocumentations = [...this.#takenDocumentations, newDocumentation];
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
      if (picture.blob && (picture.blob instanceof Blob || picture.blob instanceof File)) {
        const imageUrl = URL.createObjectURL(picture.blob);
        return accumulator.concat(`
            <li class="new-form__documentations__outputs-item">
              <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
                <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
              </button>
            </li>
          `);
      } else {
        console.warn('invalid blob found in picture:', picture);
        return accumulator;
      }
    }, '');

    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        // Updating taken pictures
        this.#populateTakenPictures();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => {
      return picture.id == id;
    });

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => {
      return picture.id != selectedPicture.id;
    });

    return selectedPicture;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();

    //redirect page
    location.hash = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }
  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit" disabled>
            <i class="fas fa-spinner loader-button"></i> Buat Laporan
            </button>
        `;
  }
  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
            <button class="btn" type="submit">Buat Laporan</button>
        `;
  }
}
