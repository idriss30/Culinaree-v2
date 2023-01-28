/* writing integration tests for index.js   */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import fs from "fs";
import nock from "nock";

const renderHtml = fs.readFileSync("./src/index.html", "utf-8");

const alertSpy = jest.spyOn(global, "alert").mockImplementation();
const basePath = "https://api.spoonacular.com";
const location = window.location;

//mocking window.location

beforeAll(() => {
  window.scrollTo = jest.fn();
  console.log(window.location);
});

afterAll(() => {
  jest.resetAllMocks();
});

beforeEach(async () => {
  window.document.body.innerHTML = renderHtml;
  require("./index");
  window.dispatchEvent(new Event("load")); // dispatch event to make sure JSDOM load everything
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

test("can generate joke on button click", async () => {
  //mocking random recipe
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/random`)
    .query({ number: 20, apiKey: /^[A-Za-z0-9]*$/gi })
    .reply(200, {
      recipes: [
        { title: "Chocoholic's Deep Dark Dream Chiffon Cake", id: "638797" },
      ],
    });
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

test("redirect when a nav link is clicked", async () => {
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
  expect(
    await screen.findByText("Chocoholic's Deep Dark Dream Chiffon Cake")
  ).toBeInTheDocument();
  const europeanLink = screen.getByText(/european/i);
  expect(europeanLink).toBeInTheDocument();
  fireEvent.click(europeanLink);
});
