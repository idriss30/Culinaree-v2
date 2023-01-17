import "./article.scss";
import { scrollTotop, getParams, navLinksRedirect } from "./generalConfig";

window.onload = () => {
  scrollTotop();
};
const articleDom = {
  avocadoGuide: document.querySelector(".avocado__guide"),
  emergencyArticle: document.querySelector(".emergency__article"),
  backButton: document.querySelectorAll(".article__button-back"),
  navLinks: document.getElementsByClassName("nav__link"),
};

function showAvocadoArticle() {
  articleDom.emergencyArticle.style.display = "none";
  articleDom.avocadoGuide.style.display = "block";
}

function showEmergencyArticle() {
  articleDom.emergencyArticle.style.display = "block";
  articleDom.avocadoGuide.style.display = "none";
}

(function getLocationPath() {
  let name = getParams("name");
  name === "avocado" ? showAvocadoArticle() : showEmergencyArticle();
})();

articleDom.backButton.forEach((element) => {
  element.addEventListener("click", () => {
    window.history.back();
  });
});

let linksArray = Array.from(articleDom.navLinks);
linksArray.forEach((element) => {
  navLinksRedirect(element);
});
