/* writing integration tests for index.js   */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import fs from "fs";
import nock from "nock";

const renderHtml = fs.readFileSync("./src/index.html", "utf-8");

const alertSpy = jest.spyOn(global, "alert").mockImplementation();
const basePath = "https://api.spoonacular.com";

const successFullRandomRequestMock = () => {
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/random`)
    .query({ number: 20, apiKey: /[A-Za-z0-9]*$/gi })
    .reply(200, {
      recipes: [
        { title: "Chocoholic's Deep Dark Dream Chiffon Cake", id: "638797" },
      ],
    });
};

//mocking window.location
Object.defineProperty(window, "location", {
  writable: true,
  value: {
    replace: jest.fn(),
  },
});

beforeAll(() => {
  window.scrollTo = jest.fn();
});

afterAll(() => {
  jest.resetAllMocks();
});

beforeEach(async () => {
  window.document.body.innerHTML = renderHtml;
  require("./index");
  window.dispatchEvent(new Event("load")); // dispatch event to make sure JSDOM load everything
  jest.clearAllMocks(); // clean mock calls before each  test to avoid interference
});
afterEach(() => {
  jest.resetModules(); // make sure jest cached is clean after test
  if (!nock.isDone()) {
    console.log(nock.activeMocks());
    nock.cleanAll();
    throw Error("some endpoints were not reached");
  }
});

afterAll(() => {
  window.location = location;
});

test("can fetch random recipe on load and display it without error", async () => {
  successFullRandomRequestMock();
  // loader is displayed
  const loader = document.querySelector(".loading");
  expect(loader).toBeInTheDocument();

  await waitFor(() => {
    expect(
      screen.getByText("Chocoholic's Deep Dark Dream Chiffon Cake")
    ).toBeInTheDocument();
  });
  expect(
    screen.getByRole("img", {
      name: /Chocoholic's/i,
    })
  ).toBeInTheDocument();

  // loader should not be visible;
  expect(loader).not.toBeVisible();
  expect(nock.isDone()).toBe(true);
});

test("can display error when fetching on document load", async () => {
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/random`)
    .query({ number: 20, apiKey: /^[A-Za-z0-9]*$/gi })
    .reply(401);

  const loading = document.querySelector(".loading");
  expect(loading).toBeInTheDocument();
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith(
      "Request failed with status code 401"
    );
  });
});

test("can generate joke on button click and update dom", async () => {
  //mocking random recipe
  successFullRandomRequestMock();
  //mocking joke request
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/food/jokes/random`)
    .query({ apiKey: /^[A-Za-z0-9]*$/gi })
    .reply(200, { text: "tomato is a fruit not a vegetable" });
  const inititalJoke = "Any salad can be a ceasar salad if you stab it enough";
  expect(screen.getByText(inititalJoke)).toBeInTheDocument();
  const jokeButton = screen.getByRole("button", { name: /more jokes/i });
  expect(jokeButton).toBeInTheDocument();
  fireEvent.click(jokeButton);
  expect(
    await screen.findByText("tomato is a fruit not a vegetable")
  ).toBeInTheDocument();
  expect(
    screen.queryByText("Any salad can be a ceasar salad if you stab it enough")
  );
});

test("can display error when generating joke", async () => {
  successFullRandomRequestMock();
  //mocking joke request
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/food/jokes/random`)
    .query({ apiKey: /^[A-Za-z0-9]*$/gi })
    .reply(403);

  const jokeButton = screen.getByRole("button", { name: /more jokes/i });
  fireEvent.click(jokeButton);
  await waitFor(() => {
    expect(alertSpy).toHaveBeenCalledWith(
      "Request failed with status code 403"
    );
  });
});

test("redirect when a nav link is clicked", async () => {
  successFullRandomRequestMock();
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();
  const europeanLink = screen.getByText(/european/i);
  expect(europeanLink).toBeInTheDocument();
  fireEvent.click(europeanLink);
  expect(window.location.replace.mock.calls).toHaveLength(1);
  expect(window.location.replace).toHaveBeenCalledWith(
    `/searchResult.html?id=${europeanLink.getAttribute("id")}`
  );
});

test("can handle searchForm", async () => {
  successFullRandomRequestMock();
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();
  const form = screen.getByTitle("searchForm"); // only one form on page so no need to add any attribute
  const input = screen.getByRole("textbox", { name: /find a recipe/i });
  expect(input).toBeInTheDocument();
  fireEvent.change(input, { bubbles: true, target: { value: "burger" } });
  expect(input.value).toBe("burger");
  fireEvent.submit(form);
  expect(window.location.replace.mock.calls).toHaveLength(1);
  expect(window.location.replace).toHaveBeenCalledWith(
    `/searchResult.html?id=${input.value.trim()}`
  );
});

test("can navigate to article one on click", async () => {
  //mock random recipe fetch on load
  successFullRandomRequestMock();
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();
  const articleOneContainer = document.querySelector(".one");
  fireEvent.click(articleOneContainer);
  expect(window.location.replace).toHaveBeenCalled();
  expect(window.location.replace).toHaveBeenCalledWith(
    `/article.html?name=avocado`
  );
});

test("can navigate to article two on container click", async () => {
  //mock random recipe fetch on load
  successFullRandomRequestMock();
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();
  const articleTwoContainer = document.querySelector(".two");
  fireEvent.click(articleTwoContainer);
  expect(window.location.replace).toHaveBeenCalled();
  expect(window.location.replace).toHaveBeenCalledWith(
    `/article.html?name=stockEmergency`
  );
});

test("do nothing when parent Element has no id and element is clicked", async () => {
  //mock random recipe fetch on load
  successFullRandomRequestMock();
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();
  const recipeContainer = document.querySelector(
    ".randomRecipe__section__container"
  );
  fireEvent.click(recipeContainer);
  expect(window.location.replace).not.toHaveBeenCalled();
});

test("redirect to single product when fetched recipe has id and is clicked", async () => {
  //mock random recipe fetch on load
  successFullRandomRequestMock();
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();

  const recipeContainerSpan = document.querySelector(".single__recipe span");
  fireEvent.click(recipeContainerSpan);
  expect(window.location.replace).toHaveBeenCalledWith(
    "./singleRecipe.html?id=638797"
  );
});
