function fetchApi(guery, per_page = 40, page = 1) {
  const key = '30615642-0c3410a518698d6d783d2cae0';
  const url = 'https://pixabay.com/api';

  const searchParams = new URLSearchParams({
    key,
    q: guery,
    per_page,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: false,
    page,
  });

  console.log(`${url}?${searchParams}`);

  return fetch(`${url}?${searchParams}`).then(response => {
    if (!response.ok) {
      throw new Error();
    }
    return response.json();
  });
}

export { fetchApi };
