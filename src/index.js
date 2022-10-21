import { fetchApi } from './js/fetchImagesApi';
import cardTml from './templates/card.hbs';
import throttle from 'lodash.throttle';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/main.css';

// -------------------------------------------------------------

let page = 1;
let query = '';
const numberOfPhotosPerPage = 40;

// ---------- REF ----------------------------------------------
const imageDivRef = document.querySelector('.gallery');
const buttonRef = document.querySelector('#search-form');
const guard = document.querySelector('.guard');
const footerSection = document.querySelector('.footer-section');
const topBtn = document.querySelector('.topBtn');

// ---- IntersectionObserve -------------------------------------
const options = {
  root: null,
  rootMargin: '0px',
  threshold: 1,
};
const observe = new IntersectionObserver(fetchImages, options);

// ----------- SimpleLightbox -------------------------------------
const lightboxOptions = {
  captionsData: 'alt',
  captionDelay: 250,
};

let lightbox = new SimpleLightbox('.gallery a', lightboxOptions);

//------------------ addEventListener  --------------------------------------

buttonRef.addEventListener('submit', onClick);

// ------------ Вывод первых  фоток  -----------------------------------------
function onClick(e) {
  e.preventDefault();
  page = 1;
  query = e.target.searchQuery.value.trim();
  footerSection.setAttribute('hidden', true);
  downloadImage(true);
}

// -----------   Infinite scroll ---------------------------------------------
//  IntersectionObserver отслеживает растояние до <div class="guard"></div>
//  Функцию fetchImages в нужный момент вызывает observe.observe(guard)
//  и в параметры передает массив объектов entries
function fetchImages(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      downloadImage(false);
    }
  });
}

// ------------ Download Images function ------------------------------------------
function downloadImage(firstBoot) {
  Loading.standard('Loading...');

  fetchApi(query, numberOfPhotosPerPage, page)
    .then(json => {
      // Если запрос вернул пустую строку
      if (json.totalHits === 0) {
        errorMessage();
        buttonRef.reset(); // очистка поля ввода
        imageDivRef.innerHTML = '';
        return;
      }

      console.log(json);
      // Если загружаються первые 40 изображений firstBoot = true
      if (firstBoot) {
        // Сообщение о количестве найденых фото
        infoOfTotalHits(json.totalHits);
        //   innerHTML
        imageDivRef.innerHTML = cardTml(json.hits);
      } else {
        //  insertAdjacentHTML
        imageDivRef.insertAdjacentHTML('beforeend', cardTml(json.hits));
      }

      //  refresh lightbox
      lightbox.refresh();

      // Если картинок приходит мало, то блок <div class="guard"></div> находится зоне отслеживания,
      // что приводит к срабатыванию IntersectionObserver и идет слудующий вызов API
      //  observe.observe(guard) запускается при условии, что изображений больше numberOfPhotosPerPage
      if (firstBoot && json.totalHits > numberOfPhotosPerPage) {
        observe.observe(guard);
      }

      if (json.hits.length < numberOfPhotosPerPage) {
        observe.unobserve(guard);
        footerSection.removeAttribute('hidden');
      }
    })
    .catch(() => {
      imageDivRef.innerHTML = '';
      console.log('Error');
    })
    .finally(() => Loading.remove());
}

// -------------  Error message -----------------------------------
function errorMessage() {
  Notify.failure(
    '"Sorry, there are no images matching your search query. Please try again."'
  );
}

// ----- message about total hits ------------------------------
function infoOfTotalHits(totalHits) {
  Notify.success(`Hooray! We found ${totalHits} images.`, {
    timeout: 4000,
    showOnlyTheLastOne: true,
  });
}

// ======== button to TOP ============================================
document.addEventListener('scroll', throttle(scrollOn, 250));

function scrollOn() {
  const scrollY = window.scrollY || document.documentElement.scrollTop;

  if (scrollY > 50) {
    topBtn.style.display = 'block';
  } else {
    topBtn.style.display = 'none';
  }
}

topBtn.addEventListener('click', () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});
