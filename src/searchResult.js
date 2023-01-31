import "./generalConfig.scss";
import "./searchResult.scss";
import {
  scrollTotop,
  fetchData,
  generateKey,
  getParams,
  navLinksRedirect,
} from "./generalConfig";

const searchResultDom = {
  loading: document.querySelector(".loading"),
  resultSection: document.querySelector(".search__result__section"),
  resultContainer: document.querySelector(".container"),
  navLinks: document.getElementsByClassName("nav__link"),
  pages: document.querySelector(".search__result-pages"),
  button: document.querySelector(".article__button-back"),
};

function returnParams() {
  return getParams("id");
}

function displaySection() {
  searchResultDom.loading.style.display = "none";
  searchResultDom.resultSection.style.display = "block";
}

function saveArrayToLocalStorage(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}

// handle search
//recipeResultArray

let recipesArray = JSON.parse(localStorage.getItem(returnParams())) || [];
function displayResult(recipeArray) {
  //making sure container is empty before filling it up
  searchResultDom.resultContainer.innerHTML = "";
  recipeArray.forEach((recipe) => {
    let imageSrc =
      recipe.image || "https://spoonacular.com/images/spoonacular-logo-b.svg";
    searchResultDom.resultContainer.insertAdjacentHTML(
      "beforeend",
      `
       <div class="search__result-recipe selected"  id= ${recipe.id}>
       <span>${recipe.title}</span>
          
            <img src= ${imageSrc} loading='lazy' alt= ${recipe.title}/>
         
       </div>
    `
    );
  });
}

async function searchRecipe(inputValue) {
  let key = generateKey();
  try {
    const getRecipesData = await fetchData(
      `https://api.spoonacular.com/recipes/complexSearch?query=${inputValue}&number=100&`,
      key
    );
    if (getRecipesData.data.results.length === 0)
      throw Error("recipes not found");
    saveArrayToLocalStorage(returnParams(), getRecipesData.data.results);
    getRecipesData.data.results.forEach((recipe) => {
      recipesArray.push(recipe);
    });
  } catch (error) {
    alert(error.message);
    window.location.replace("/");
  }
}

window.onload = async () => {
  scrollTotop();
  searchResultDom.loading.style.display = "block";
  let params = returnParams();
  if (recipesArray.length > 0) {
    let arrayToDisplay = [...recipesArray.slice(0, 25)];
    displaySection();
    return displayResult(arrayToDisplay);
  }
  await searchRecipe(params);
  displaySection();
  displayResult([...recipesArray.slice(0, 25)]);
};

let navLinksArr = Array.from(searchResultDom.navLinks);
navLinksArr.forEach((element) => navLinksRedirect(element));

const checkArraySize = (arrayToCheck) => {
  if (!arrayToCheck.length > 0) {
    alert("no more recipes to display, loading page one");
    return false;
  }
  return true;
};

searchResultDom.pages.addEventListener("click", (e) => {
  let switchCheck = parseInt(e.target.textContent);
  if (!switchCheck) return;
  scrollTotop();
  let arraySize;
  switch (switchCheck) {
    case 1:
      displayResult([...recipesArray.slice(0, 25)]);
      break;
    case 2:
      arraySize = checkArraySize([...recipesArray.slice(25, 50)]);
      arraySize === true
        ? displayResult([...recipesArray.slice(25, 50)])
        : displayResult([...recipesArray.slice(0, 25)]);
      break;
    case 3:
      arraySize = checkArraySize([...recipesArray.slice(50, 75)]);
      arraySize === true
        ? displayResult([...recipesArray.slice(50, 75)])
        : displayResult([...recipesArray.slice(0, 25)]);

      break;
    case 4:
      arraySize = checkArraySize([...recipesArray.slice(75)]);
      arraySize === true
        ? displayResult([...recipesArray.slice(75)])
        : displayResult([...recipesArray.slice(0, 25)]);
      break;
  }
});

searchResultDom.button.addEventListener("click", () => window.history.back());
searchResultDom.resultContainer.addEventListener("click", (e) => {
  if (e.target === null) return;
  let id = e.target.parentElement.id;
  window.location.replace(`/singleRecipe.html?id=${id}`);
});
