import fs from "fs";
import { fireEvent, screen } from "@testing-library/dom";

const articleHtml = fs.readFileSync(`./src/article.html`, "utf-8");

const historyBackSpy = jest.spyOn(history, "back");

beforeAll(() => {
  window.scrollTo = jest.fn();
});

beforeEach(() => {
  window.document.body.innerHTML = articleHtml;
  window.dispatchEvent(new Event("load")); // dispatch event to make sure JSDOM load everything
});

afterEach(() => {
  jest.resetModules(); // make sure to not use cached version of article.js
});

test("can display stock up for emergency article based on url", () => {
  history.pushState(
    {},
    "emergency-article",
    "/article.html?name=stockEmergency"
  );
  require("./article");

  const emergencyArticle = document.querySelector(".emergency__article");
  expect(emergencyArticle).toBeInTheDocument();
  expect(
    screen.getByText(/how to stock up for emergencies/i)
  ).toBeInTheDocument();
  //check image
  expect(
    screen.getByRole("img", { name: /food__picture/i })
  ).toBeInTheDocument();
  const avocadoArticle = document.querySelector(".avocado__guide");
  expect(avocadoArticle).not.toBeVisible();
});

test("can display avocado article based on url", () => {
  history.pushState({}, "emergency-article", "/article.html?name=avocado");
  require("./article");

  const avocadoArticle = document.querySelector(".avocado__guide");
  expect(avocadoArticle).toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: /avocado__picture/i })
  ).toBeInTheDocument();
  const emergencyArticle = document.querySelector(".emergency__article");
  expect(emergencyArticle).not.toBeVisible();
});

test("changing location on back button click", () => {
  history.pushState(
    {},
    "emergency-article",
    "/article.html?name=stockEmergency"
  );
  require("./article");

  const backButton = screen.getByRole("button", { name: "back" });
  fireEvent.click(backButton);
  expect(historyBackSpy).toHaveBeenCalled();
});
