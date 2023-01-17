import "./generalConfig.scss";
import "./singleRecipe.scss";
import {
  navLinksRedirect,
  scrollTotop,
  getParams,
  fetchData,
  generateKey,
} from "./generalConfig";

const recipeInfo = JSON.parse(sessionStorage.getItem(`${getIdParams()}`)) || {};
const singleRecipeDom = {
  loader: document.querySelector(".loading"),
  navLinks: document.getElementsByClassName("nav__link"),
  title: document.querySelector(".selected__recipe__presentation-title"),
  summary: document.querySelector(".selected__recipe__presentation-summary"),
  ingredientsContainer: document.querySelector(
    ".selected__recipe__ingredients"
  ),
  instructionsContainer: document.querySelector(
    ".selected__recipe__instructions ol"
  ),
  winePairing: document.querySelector(".selected__recipe__winePairing"),
};

window.onload = async () => {
  singleRecipeDom.loader.style.display = "block";
  scrollTotop();
  if (Object.keys(recipeInfo).length > 0) {
    return displayRecipe(recipeInfo);
  }
  const { data } = await fetchSingleRecipe(getIdParams());
  displayRecipe(data);
};

function getIdParams() {
  return getParams("id");
}

function displayTileAndImg(title, img, summary) {
  singleRecipeDom.title.insertAdjacentHTML(
    `afterbegin`,
    `
   <h1>${title}</h1>
   <img src="${img}"||"https://spoonacular.com/images/spoonacular-logo-b.svg"; alt=${title} loading="lazy"/>
  `
  );

  singleRecipeDom.summary.insertAdjacentHTML(
    "beforeend",
    `<h2>Summary</h2><p>${summary}<p>`
  );
}

function displayRecipe(data) {
  singleRecipeDom.loader.style.display = "none";
  displayTileAndImg(data.title, data.image, data.summary);
  displayIngredients(data.extendedIngredients);
  displayInstructions(data.analyzedInstructions[0].steps);
  displayWinePairing(data.winePairing);

  return;
}

function displayIngredients(ingredients) {
  ingredients.forEach((ingredient) => {
    singleRecipeDom.ingredientsContainer.insertAdjacentHTML(
      "beforeend",
      `
       <div class="ingredients__title">
          <span>${ingredient.original}</span>
           <img src=https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image} alt=${ingredient.name}/>
         
       </div>
    `
    );
  });
}

function displayWinePairing(wines) {
  if (wines.pairingText.length !== 0) {
    singleRecipeDom.winePairing.insertAdjacentHTML(
      "beforeend",
      `
          <h4>Wine pairing</h4>
          <p>${wines.pairingText}<p/>
        `
    );
  }
}

function displayInstructions(instructions) {
  instructions.forEach((instruction) => {
    singleRecipeDom.instructionsContainer.insertAdjacentHTML(
      `beforeend`,
      `
         <li>${instruction.step}</li>
        `
    );
  });
}

async function fetchSingleRecipe() {
  let key = generateKey();
  let id = getIdParams();
  try {
    const response = await fetchData(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&`,
      key
    );
    if (response.data.length === 0) {
      throw Error("recipe data not found");
    }
    saveRecipeToSessionStorage(getIdParams(), response.data);
    return response;
  } catch (error) {
    alert(error.message);
    window.location.replace("/");
  }
}

function saveRecipeToSessionStorage(key, element) {
  return sessionStorage.setItem(key, JSON.stringify(element));
}

Array.from(singleRecipeDom.navLinks).forEach((element) => {
  navLinksRedirect(element);
});
document
  .querySelector("button")
  .addEventListener("click", () => window.history.back());
