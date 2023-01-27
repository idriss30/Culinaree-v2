import "./index.scss";
import {
  scrollTotop,
  fetchData,
  generateKey,
  navLinksRedirect,
} from "./generalConfig";

// domObject
const domElement = {
  navLinks: document.getElementsByClassName("nav__link"),
  generateJoke: document.querySelector(".joke__button"),
  randomRecipeContainer: document.querySelector(
    ".randomRecipe__section__container"
  ),
  searchForm: document.querySelector(".search__form"),
  searchField: document.getElementById("search_input"),
  searchSection: document.querySelector(".search__section"),
  jokeSection: document.querySelector(".joke__section"),
  guideSection: document.querySelector(".guide__section"),
  articleOne: document.querySelector(".one"),
  articleTwo: document.querySelector(".two"),
  loader: document.querySelector(".loading"),
};

//random recipes
window.onload = async () => {
  domElement.loader.style.display = "block";
  scrollTotop();
  window.history.pushState({}, "home", "/");
  await fetchRandomRecipes();
  domElement.loader.style.display = "none";
};

function displayRandomRecipe(recipeArr) {
  for (let i = 0; i < recipeArr.length; i++) {
    let imageSrc =
      `https://spoonacular.com/recipeImages/${recipeArr[i].id}-556x370.jpg` ||
      "https://spoonacular.com/images/spoonacular-logo-b.svg";
    domElement.randomRecipeContainer.insertAdjacentHTML(
      "beforeEnd",
      ` <div class="single__recipe selected"  id= ${recipeArr[i].id}>
            <span>${recipeArr[i].title}</span>
            <img src= ${imageSrc} loading='lazy' alt= ${recipeArr[i].title}/>
          </div>`
    );
  }
}

export async function fetchRandomRecipes() {
  let key = generateKey();
  try {
    const handleResponse = await fetchData(
      "https://api.spoonacular.com/recipes/random?number=20&",
      key
    );
    let recipeArr = handleResponse.data.recipes;
    displayRandomRecipe(recipeArr);
  } catch (error) {
    alert(error.message);
  }
}

domElement.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let fieldValue = domElement.searchField.value.trim();
  window.location.replace(`/searchResult.html?id=${fieldValue}`);
});

// generate new food joke
domElement.generateJoke.addEventListener("click", async (e) => {
  e.preventDefault();
  let key = generateKey();
  const jokeResponse = await fetchData(
    "https://api.spoonacular.com/food/jokes/random?&",
    key
  );
  if (jokeResponse.error) {
    alert(jokeResponse.error);
  } else {
    document.querySelector("q").textContent = jokeResponse.data.text;
  }
});

// get recipeID

export function getId(e) {
  e.preventDefault();
  if (e.target.parentElement.tagName.toLowerCase() !== "div") {
    return;
  }

  let id = e.target.parentElement.id;
  return id;
}

domElement.randomRecipeContainer.addEventListener("click", (e) => {
  const id = getId(e);
  if (id !== null || id !== undefined) {
    window.location.replace(`./singleRecipe.html?id=${id}`);
  }
  return;
});
domElement.articleOne.addEventListener("click", () => {
  window.location.replace("/article.html?name=avocado");
});

domElement.articleTwo.addEventListener("click", () => {
  window.location.replace("/article.html?name=stockEmergency");
});

let navlinksArray = Array.from(domElement.navLinks);
navlinksArray.forEach((element) => {
  navLinksRedirect(element);
});
