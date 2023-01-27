import { screen, waitFor } from "@testing-library/dom";
import fs from "fs";
import nock from "nock";

const renderHtml = fs.readFileSync("./src/index.html", "utf-8");

const alertSpy = jest.spyOn(global, "alert").mockImplementation();

beforeAll(() => {
  window.scrollTo = jest.fn();
});

afterEach(() => {
  if (!nock.isDone()) {
    console.log(nock.activeMocks());
    nock.cleanAll();
    throw Error("some endpoints were not reached");
  }
});

afterAll(() => {
  jest.resetAllMocks();
});

beforeEach(() => {
  window.document.body.innerHTML = renderHtml;
  jest.resetModules; // avoid running cached index.js
  require("./index");
});

test("can fetch random recipe on load and display it without error", async () => {
  nock(`https://api.spoonacular.com`)
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
  window.dispatchEvent(new Event("load"));
  nock(`https://api.spoonacular.com`)
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
