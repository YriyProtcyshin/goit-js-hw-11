import './css/main.css';
import { fetchApi } from './js/fetchImagesApi';
import cardTml from './templates/card.hbs';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// -------------------------------------------------------------

let page = 1;
let query = '';
const numberOfPhotosPerPage = 40;

// ---------- REF ----------------------------------------------
const imageDivRef = document.querySelector('.gallery');
const buttonRef = document.querySelector('#search-form');
const guard = document.querySelector('.guard');

// ---- IntersectionObserve -------------------------------------
const options = {
  root: null,
  rootMargin: '5px',
  threshold: 0,
};
const observe = new IntersectionObserver(fetchImages, options);

// ----------- SimpleLightbox -------------------------------------
const lightboxOptions = {
  captionsData: 'alt',
  captionDelay: 250,
};

let lightbox = null;
lightbox = new SimpleLightbox('.gallery a', lightboxOptions);
//------------------------------------------------------------------

buttonRef.addEventListener('submit', onClick);

// ------------ Вывод первых  фоток  -----------------------------
function onClick(e) {
  e.preventDefault();
  page = 1;
  query = e.target.searchQuery.value.trim();

  Loading.standard('Loading...');

  fetchApi(query)
    .then(json => {
      if (json.hits.length === 0) {
        errorMessage();
        imageDivRef.innerHTML = '';
        return;
      }
      //  render html
      imageDivRef.innerHTML = cardTml(json.hits);

      //  refresh lightbox
      lightbox.refresh();

      // Если картинок приходит мало и блок guard находится близко,
      // срабатывает IntersectionObserver и идет слудующий вызов API
      if (json.totalHits > numberOfPhotosPerPage) {
        observe.observe(guard);
      }
    })
    .catch(() => {
      console.log('Error');
    })
    .finally(() => Loading.remove());
}

// -----------   Infinite scroll ------------------------------
function fetchImages(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;

      Loading.standard('Loading...');

      fetchApi(query, numberOfPhotosPerPage, page)
        .then(json => {
          //  render html
          imageDivRef.insertAdjacentHTML('beforeend', cardTml(json.hits));
          //  refresh lightbox
          lightbox.refresh();

          if (json.hits.length === 0) {
            observe.unobserve(guard);
          }
        })
        .finally(() => Loading.remove());
    }
  });
}

// -------------  Error message -----------------------------------
function errorMessage() {
  Notify.failure(
    '"Sorry, there are no images matching your search query. Please try again."'
  );
}
