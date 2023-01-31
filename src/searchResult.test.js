import { fireEvent, screen, waitFor } from "@testing-library/dom";
import fs from "fs";
import nock from "nock";
import { searchResult } from "./testData";

const searchResultHTML = fs.readFileSync("./src/searchResult.html", "utf-8");

const basePath = "https://api.spoonacular.com";

const callSuccessNock = () => {
  nock(`${basePath}`)
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })
    .get(`/recipes/complexSearch`)
    .query({ query: "burger", number: "100", apiKey: /^[A-Za-z0-9]*$/gi })
    .reply(200, searchResult);
};

beforeAll(() => {
  window.scrollTo = jest.fn();
});

describe("assert on item that don't need location or alert mock", () => {
  beforeAll(() => {
    history.pushState({}, "recipeResult", "./searchResult.html?id=burger");
  });
  afterAll(() => {
    localStorage.clear();
  });
  beforeEach(() => {
    window.document.body.innerHTML = searchResultHTML;
    jest.resetModules();
    require("./searchResult");
    window.dispatchEvent(new Event("load"));
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
      console.log(nock.activeMocks());
      throw Error("some endpoints were not reached");
    }
  });

  test("fetching recipes on load and upload dom", async () => {
    callSuccessNock();
    const loader = document.querySelector(".loading");
    expect(loader).toBeInTheDocument();
    // checking only first result no need to check the whole object
    expect(
      await screen.findByText(searchResult.results[0].title)
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "$50,000" })).toBeInTheDocument();
    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();
    const pageOne = screen.getByText("1");
    const pageTwo = screen.getByText("2");
    const pageThree = screen.getByText("3");
    const pageFour = screen.getByText("4");
    expect(pageOne).toBeInTheDocument();
    expect(pageTwo).toBeInTheDocument();
    expect(pageThree).toBeInTheDocument();
    expect(pageFour).toBeInTheDocument();

    const localStorageItem = localStorage.getItem("burger");
    expect(JSON.parse(localStorageItem)).toEqual(searchResult.results);
  });

  test("fetching recipes form localStorage and upload dom", () => {
    const loader = document.querySelector(".loading");
    expect(loader).toBeInTheDocument();
    expect(screen.getByText(searchResult.results[0].title)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "$50,000" })).toBeInTheDocument();
    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });
});

describe("assert on cases that need location or alert mock ", () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation();
  const savedLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = Object.assign(
      new URL("http://localhost:3000/searchResult.html?id=burger"),
      {
        ancestorOrigins: "",
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
      }
    );
  });
  afterEach(() => {
    window.location = savedLocation;
    if (!nock.isDone()) {
      nock.cleanAll();
      console.log(nock.activeMocks());
      throw new Error("some endpoints were not reached");
    }
  });

  beforeEach(() => {
    localStorage.clear();
    window.document.body.innerHTML = searchResultHTML;
    jest.resetModules();
    require("./searchResult");
    window.dispatchEvent(new Event("load"));
    jest.clearAllMocks();
  });

  test("can throw Error and redirect when recipes length is equal to 0", async () => {
    nock(`${basePath}`)
      .defaultReplyHeaders({
        "access-control-allow-origin": "*",
        "access-control-allow-credentials": "true",
      })
      .get(`/recipes/complexSearch`)
      .query({ query: "burger", number: "100", apiKey: /^[A-Za-z0-9]*$/gi })
      .reply(200, {
        results: [],
      });

    expect(document.querySelector(".loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
    expect(window.location.replace).toHaveBeenCalledWith("/");
  });

  test("changing recipes page display on button click", async () => {
    callSuccessNock();
    expect(
      await screen.findByText(searchResult.results[0].title)
    ).toBeInTheDocument();
    const secondButton = screen.getByText("2");
    fireEvent.click(secondButton);
    // assert that items at index 25 and plus have been called
    expect(
      screen.getByText(searchResult.results[26].title)
    ).toBeInTheDocument();
    //expect item from less than 25 not to be in the document
    expect(
      screen.queryByText(searchResult.results[0].title)
    ).not.toBeInTheDocument();

    // clicking page one expecting item from 0-25 to be in the doc
    const pageOneButton = screen.getByText("1");
    fireEvent.click(pageOneButton);
    expect(screen.getByText(searchResult.results[0].title)).toBeInTheDocument();

    //assessing page 3 from 50 to 75;
    const pageThree = screen.getByText("3");
    fireEvent.click(pageThree);
    expect(
      screen.getByText(searchResult.results[51].title)
    ).toBeInTheDocument();
  });

  test("can display alert when page has no content", async () => {
    callSuccessNock();
    expect(
      await screen.findByText(searchResult.results[0].title)
    ).toBeInTheDocument();

    const page4Button = screen.getByText("4");
    fireEvent.click(page4Button);
    expect(alertSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      "no more recipes to display, loading page one"
    );
  });

  test("can redirect to singleRecipe when clicking searchResult", async () => {
    callSuccessNock();
    expect(
      await screen.findByText(searchResult.results[0].title)
    ).toBeInTheDocument();

    // clicking on first recipe
    const firstRecipeTitle = screen.getByText(searchResult.results[0].title);
    fireEvent.click(firstRecipeTitle);
    expect(window.location.replace).toHaveBeenCalled();
    const id = searchResult.results[0].id;
    expect(window.location.replace).toHaveBeenCalledWith(
      `/singleRecipe.html?id=${id}`
    );
  });

  test("do nothing when target has no id", async () => {
    callSuccessNock();
    expect(
      await screen.findByText(searchResult.results[0].title)
    ).toBeInTheDocument();
    const resultContainer = document.querySelector(".container");
    fireEvent.click(resultContainer);
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  test("handle pages rendering with only 25 items", async () => {
    const resultWith25Items = [...searchResult.results.slice(0, 25)];
    nock(`${basePath}`)
      .defaultReplyHeaders({
        "access-control-allow-origin": "*",
        "access-control-allow-credentials": "true",
      })
      .get(`/recipes/complexSearch`)
      .query({ query: "burger", number: "100", apiKey: /^[A-Za-z0-9]*$/gi })
      .reply(200, {
        results: resultWith25Items,
      });
    expect(
      await screen.findByText(searchResult.results[0].title)
    ).toBeInTheDocument();
    //clicking second button
    const secondButton = screen.getByText("2");
    fireEvent.click(secondButton);
    expect(alertSpy).toHaveBeenCalledTimes(1);

    const thirdPage = screen.getByText("3");
    fireEvent.click(thirdPage);
    expect(alertSpy).toHaveBeenCalledTimes(2);

    const fourthPage = screen.getByText("4");
    fireEvent.click(fourthPage);
    expect(alertSpy).toHaveBeenCalledTimes(3);
  });
});
