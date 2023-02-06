
module.exports = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,
  // Stop running tests after `n` failures
  // bail: 0,
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: false,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  setupFilesAfterEnv: ["<rootDir>/setupJestDom.js"],
  moduleNameMapper: {
    "\\.css$": "identity-obj-proxy",
    "\\.scss": "identity-obj-proxy",
  },
  setupFiles: ["dotenv/config"], // allow use of environment variables in your test
};
