import fs from "fs";
import nock from "nock";
import { recipeInformation } from "./testData";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

const singleRecipeHTML = fs.readFileSync("./src/singleRecipe.html", "utf-8");

beforeAll(() => {
  window.scrollTo = jest.fn();
});

const alertSpy = jest.spyOn(window, "alert").mockImplementation();
const historySpy = jest.spyOn(history, "back");
const savedLocation = window.location;

beforeEach(() => {
  delete window.location;
  window.location = Object.assign(
    new URL(
      `http://localhost:3000/singleRecipe.html?id=${recipeInformation.id}`
    ),
    {
      replace: jest.fn(),
    }
  );
});

beforeEach(() => {
  window.document.body.innerHTML = singleRecipeHTML;
});

afterEach(() => {
  sessionStorage.clear();
  window.location = savedLocation;
  if (!nock.isDone()) {
    nock.cleanAll();
    console.log(nock.pendingMocks());
    throw new Error("some endpoints were not reached");
  }
});

const basePath = "https://api.spoonacular.com";

const mockFetchRequestSuccessFullResponse = () => {
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/${recipeInformation.id}/information`)
    .query({ includeNutrition: false, apiKey: /[A-Za-z0-9]*$/gi })
    .reply(200, recipeInformation);
};

test("fetching recipe and update dom", async () => {
  jest.resetModules();
  require("./singleRecipe");
  window.dispatchEvent(new Event("load"));
  mockFetchRequestSuccessFullResponse();
  // no need to assert on whole dom structure first few elements is enough
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: recipeInformation.title,
    })
  ).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /Pear-ginger/i })).toBeInTheDocument();
  expect(
    screen.getByText(recipeInformation.winePairing.pairingText)
  ).toBeInTheDocument();
  // assert that result was saved to sessionStorage
  expect(sessionStorage.getItem(recipeInformation.id)).not.toBeNull();
  expect(nock.isDone()).toBe(true);
});

test("fetch from localStorage", async () => {
  sessionStorage.setItem(
    recipeInformation.id,
    JSON.stringify(recipeInformation)
  );
  jest.resetModules();
  require("./singleRecipe");
  window.dispatchEvent(new Event("load"));
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: recipeInformation.title,
    })
  ).toBeInTheDocument();

  expect(screen.getByRole("img", { name: /Pear-ginger/i })).toBeInTheDocument();
});

test("can display alert and redirect when error", async () => {
  jest.resetModules();
  require("./singleRecipe");
  window.dispatchEvent(new Event("load"));
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/${recipeInformation.id}/information`)
    .query({ includeNutrition: false, apiKey: /[A-Za-z0-9]*$/gi })
    .reply(400);

  await waitFor(() => {
    expect(nock.isDone()).toBe(true);
  });
  expect(alertSpy).toHaveBeenCalled();
  expect(alertSpy).toHaveBeenCalledWith("Request failed with status code 400");
  expect(window.location.replace).toHaveBeenCalledWith("/");
});

test("navigate back when button is clicked", async () => {
  jest.resetModules();
  require("./singleRecipe");
  window.dispatchEvent(new Event("load"));
  mockFetchRequestSuccessFullResponse();
  expect(
    await screen.findByRole("heading", { name: recipeInformation.title })
  ).toBeInTheDocument();
  // click history back
  const backButton = screen.getByRole("button", { name: "back" });
  fireEvent.click(backButton);
  expect(historySpy).toHaveBeenCalled();
});

test("throw error when recipe length is equal 0", async () => {
  jest.resetModules();
  require("./singleRecipe");
  window.dispatchEvent(new Event("load"));
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/${recipeInformation.id}/information`)
    .query({ includeNutrition: false, apiKey: /[A-Za-z0-9]*$/gi })
    .reply(200, {});

  await waitFor(() => {
    expect(nock.isDone()).toBe(true);
  });
  expect(alertSpy).toHaveBeenCalled();
});
