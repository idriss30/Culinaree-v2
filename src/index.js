import "./index.scss";
const axios = require("axios");

//key
let spoonacularKey = "apiKey=fb17311e451246b9b70d522b4f8b9f24";

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

  loader: document.querySelector(".loading"),
  firstArticle: document.querySelector(".avocado__guide"),
  firstArticleLink: document.querySelector(".one"),
  emergencyArticle: document.querySelector(".emergency__article"),
  emergencyArticleLink: document.querySelector(".two"),
  articleButtons: document.getElementsByClassName("article__button-back"),
  resultSection: document.querySelector(".search__result__section"),
  resultContainer: document.querySelector(".container"),
  recipeFirstPage: document.querySelector(".first-page"),
  recipeSecondPage: document.querySelector(".second-page"),
  recipeThirdPage: document.querySelector(".third-page"),
  recipeLastPage: document.querySelector(".fourth-page"),
  selectedRecipe: document.querySelectorAll(".selected"),
  singleRecipeDisplay: document.querySelector(".selected__recipe"),
};

const fetchData = async (url, endpoint) => {
  const fetchResponse = await axios.get(url + endpoint);
  return fetchResponse;
};

const fetchRandomRecipes = async () => {
  const handleResponse = await fetchData(
    "https://api.spoonacular.com/recipes/random?number=20&",
    spoonacularKey
  );

  if (handleResponse.error) {
    alert(handleResponse.error);
  } else {
    for (let i = 0; i < handleResponse.data.recipes.length; i++) {
      let imageSrc =
        `https://spoonacular.com/recipeImages/${handleResponse.data.recipes[i].id}-556x370.jpg` ||
        "https://spoonacular.com/images/spoonacular-logo-b.svg";
      domElement.randomRecipeContainer.insertAdjacentHTML(
        "beforeEnd",
        ` <div class="single__recipe selected"  id= ${handleResponse.data.recipes[i].id}>
            <span>${handleResponse.data.recipes[i].title}</span>
            <img src= ${imageSrc} loading='lazy' alt= ${handleResponse.data.recipes[i].title}/>
          </div>`
      );
    }
  }
};

//random recipes
window.onload = async () => {
  scrollTotop();
  await fetchRandomRecipes();
};

const scrollTotop = () => {
  window.scrollTo(0, 0);
};

function hideSections() {
  domElement.guideSection.style.display = "none";
  domElement.jokeSection.style.display = "none";
  domElement.searchSection.style.display = "none";
  domElement.randomRecipeContainer.style.display = "none";
  domElement.singleRecipeDisplay.style.display = "none";
}

function showSections() {
  domElement.guideSection.style.display = "block";
  domElement.jokeSection.style.display = "block";
  domElement.randomRecipeContainer.style.display = "grid";
  domElement.searchSection.style.display = "block";
  domElement.loader.style.display = "none";
}
// handle search
//recipeResultArray

let recipesArray = [];

async function searchRecipe(inputValue) {
  let message = "";
  try {
    const getRecipesData = await fetchData(
      `https://api.spoonacular.com/recipes/complexSearch?query=${inputValue}&number=100&`,
      spoonacularKey
    );
    if (getRecipesData.status === 404) {
      message = "404";
      return message;
    } else if (getRecipesData.status === 200) {
      getRecipesData.data.results.forEach((recipe) => {
        recipesArray.push(recipe);
      });
      return recipesArray;
    }
  } catch (error) {
    return (message = "404");
  }
}

function switchPage(page) {
  domElement.resultContainer.innerHTML = "";

  switch (page) {
    case "one":
      let firstArray = recipesArray.slice(0, 25);
      firstArray.forEach((recipe) => {
        domElement.resultContainer.insertAdjacentHTML(
          "beforeend",
          ` <div class="search__result-recipe selected" id= ${recipe.id}>
                <span>${recipe.title}</span>
                 
                <img src= ${recipe.image} loading='lazy' alt= ${recipe.title}/>
               
           </div>`
        );
      });
      break;

    case "two":
      recipesArray.slice(25, 50).forEach((recipe) => {
        domElement.resultContainer.insertAdjacentHTML(
          "beforeend",
          ` <div class="search__result-recipe selected" id= ${recipe.id}">
                <span>${recipe.title}</span>
                
                <img src= ${recipe.image} loading='lazy' alt= ${recipe.title}/>
              
           </div>`
        );
      });
      break;

    case "three":
      recipesArray.slice(50, 75).forEach((recipe) => {
        domElement.resultContainer.insertAdjacentHTML(
          "beforeend",
          ` <div class="search__result-recipe selected"  id= ${recipe.id}>
                <span>${recipe.title}</span>
            
                <img src= ${recipe.image} loading='lazy' alt= ${recipe.title}/>
              
           </div>`
        );
      });
      break;

    case "four":
      recipesArray.slice(75, 99).forEach((recipe) => {
        domElement.resultContainer.insertAdjacentHTML(
          "beforeend",
          ` <div class="search__result-recipe selected" id= ${recipe.id}>
                <span>${recipe.title}</span>
               
                <img src= ${recipe.image} loading='lazy' alt= ${recipe.title}/>
               
           </div>`
        );
      });
      break;

    default:
      break;
  }
}

function handleRecipeResult(recipeArray) {
  let sliceFirstPage = recipeArray.slice(0, 25);

  sliceFirstPage.forEach((recipe) => {
    let imageSrc =
      recipe.image || "https://spoonacular.com/images/spoonacular-logo-b.svg";
    domElement.resultContainer.insertAdjacentHTML(
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

domElement.searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideSections();
  domElement.loader.style.display = "block";
  const getResearchResult = await searchRecipe(domElement.searchField.value);
  domElement.searchForm.reset();
  domElement.loader.style.display = "none";
  if (getResearchResult === "404") {
    showSections();
    alert("error with your request");
  } else {
    domElement.resultSection.style.display = "block";
    handleRecipeResult(getResearchResult);
  }
});

// generate new food joke
domElement.generateJoke.addEventListener("click", async (e) => {
  e.preventDefault();
  const jokeResponse = await fetchData(
    "https://api.spoonacular.com/food/jokes/random?&",
    spoonacularKey
  );
  if (jokeResponse.error) {
    alert(jokeResponse.error);
  } else {
    document.querySelector("q").textContent = jokeResponse.data.text;
  }
});

if (domElement.articleButtons) {
  domElement.articleButtons.forEach((element) => {
    element.addEventListener("click", () => {
      domElement.emergencyArticle.style.display = "none";
      domElement.firstArticle.style.display = "none";
      domElement.resultSection.style.display = "none";
      showSections();
      scrollTotop();
      recipesArray = [];
    });
  });
}

domElement.firstArticleLink.addEventListener("click", () => {
  hideSections();
  domElement.firstArticle.style.display = "block";
  scrollTotop();
});

domElement.emergencyArticleLink.addEventListener("click", () => {
  hideSections();
  domElement.emergencyArticle.style.display = "block";
  scrollTotop();
});

domElement.recipeFirstPage.addEventListener("click", () => {
  switchPage("one");
  scrollTotop();
});

domElement.recipeSecondPage.addEventListener("click", () => {
  switchPage("two");
  scrollTotop();
});

domElement.recipeThirdPage.addEventListener("click", () => {
  switchPage("three");
  scrollTotop();
});

domElement.recipeLastPage.addEventListener("click", () => {
  switchPage("four");
  scrollTotop();
});

// nav links
domElement.navLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    recipesArray = [];
    e.preventDefault();
    hideSections();
    domElement.emergencyArticle.style.display = "none";
    domElement.firstArticle.style.display = "none";
    domElement.loader.style.display = "block";
    domElement.resultContainer.style.display = "grid";
    const fetchLinkRecipes = await searchRecipe(e.target.id);
    domElement.loader.style.display = "none";

    if (fetchLinkRecipes === "404") {
      showSections();
      alert("can't find your recipes");
    } else {
      domElement.resultSection.style.display = "block";
      handleRecipeResult(fetchLinkRecipes);
    }
  });
});

// get recipeID

function getId(e) {
  e.preventDefault();
  if (e.target.parentElement.tagName.toLowerCase() !== "div") {
    return;
  }

  let id = e.target.parentElement.id;
  return displaysingleRecipe(id);
}

domElement.randomRecipeContainer.addEventListener("click", (e) => getId(e));
domElement.resultContainer.addEventListener("click", (e) => getId(e));

async function displaysingleRecipe(id) {
  hideSections();
  domElement.resultContainer.style.display = "none";
  domElement.loader.style.display = "block";
  domElement.resultSection.style.display = "none";
  let fetchRecipeDetails;

  try {
    fetchRecipeDetails = await fetchData(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&`,
      spoonacularKey
    );
  } catch (error) {
    showSections();
    return alert(error);
  }
  domElement.loader.style.display = "none";
  domElement.singleRecipeDisplay.style.display = "block";
  insertRecipeDetails(fetchRecipeDetails.data);
  insertRecipeIngredients(fetchRecipeDetails.data.extendedIngredients);
  insertRecipeSummary(fetchRecipeDetails.data.summary);
}

function insertRecipeDetails(details) {
  let detailContainer = document.querySelector(".selected__presentation");
  if (detailContainer.children.length > 0) {
    detailContainer.innerHTML = "";
  }
  detailContainer.insertAdjacentHTML(
    "beforeend",
    `<p>${details.title}</p>
    <img src ="${details.image}" alt= "${details.title}"/>
    <span>Serving : ${details.servings}</span>
    <span>ReadyInMinutes ${details.readyInMinutes}</span>
   `
  );
}

function insertRecipeSummary(summary) {
  let recipeSummary = document.querySelector(".selected__summary");
  if (recipeSummary.hasChildNodes()) {
    recipeSummary.innerHTML = "";
  }
  recipeSummary.innerHTML = `<p>${summary}</p>`;
}

function insertRecipeIngredients(ingredients) {
  let recipeIngredients = document.querySelector(".selected__ingredients");
  if (recipeIngredients.hasChildNodes()) {
    recipeIngredients.innerHTML = "";
  }
  ingredients.forEach((ingredient) => {
    recipeIngredients.insertAdjacentHTML(
      "beforeend",
      `
      <div>
      <img src = "https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}" alt = "${ingredient.name}"/>
      <span> ${ingredient.original}</span>
      </div>
    `
    );
  });
}
