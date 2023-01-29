const axios = require("axios");
export const scrollTotop = () => {
  window.scrollTo(0, 0);
};

export function getParams(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export async function fetchData(url, endpoint) {
  const fetchResponse = await axios.get(url + endpoint);
  return fetchResponse;
}

// create a function to change key
export function generateKey() {
  //key
  let keys = [
    // keys are stored here for demontration purpose only
    `${process.env.keyOne}`,
    `${process.env.keyTwo}`,
    `${process.env.keyThree}`,
  ];
  let index = Math.floor(Math.random() * 3);
  return keys[index];
}

export function navLinksRedirect(element) {
  element.addEventListener("click", () => {
    window.location.replace(`/searchResult.html?id=${element.id}`);
  });
}

export function getId(e) {
  e.preventDefault();
  let id = e.target.parentElement.getAttribute("id");
  return id;
}
