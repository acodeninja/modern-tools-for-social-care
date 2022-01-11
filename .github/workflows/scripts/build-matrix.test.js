const buildMatrix = require('./build-matrix');
const {describe, test, expect, beforeAll} = require("@jest/globals");
const path = require("path");

describe('a pull request', () => {
  describe('when at least one application has updates to deploy', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {payload: {pull_request: {base: {ref: 'main'}}}},
        changes: ["src/services/search/somefile.js"]
      });
    });

    test('returns the application in the list of runs', async () => {
      expect(output).toHaveProperty('runs', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasNodeJS: true,
        needsDeployment: false,
        target: 'main',
        type: 'Plan',
        environments: ['Staging', 'Production'],
      }]);
    });

    test('returns true for hasRuns', async () => {
      expect(output).toHaveProperty('hasRuns', true);
    });
  });

  describe('when no apps have changes', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {payload: {pull_request: {base: {ref: 'main'}}}},
        changes: []
      });
    });

    test('returns false for hasRuns', async () => {
      expect(output).toHaveProperty('hasRuns', false);
    });

    test('returns no runs', async () => {
      expect(output).toHaveProperty('runs', []);
    });
  });
});

describe('a push', () => {
  describe('when at least one application has updates to deploy', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {payload: {push: {ref: 'refs/head/main'}}},
        changes: ["src/services/search/somefile.js"]
      });
    });

    test('returns true for hasRuns', async () => {
      expect(output).toHaveProperty('hasRuns', true);
    });

    test('returns an app run as part of apps', async () => {
      expect(output).toHaveProperty('runs', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasNodeJS: true,
        needsDeployment: true,
        target: 'main',
        type: 'Deploy',
        environments: ['Staging', 'Production'],
      }]);
    });
  });

  describe('when no apps have changes', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {payload: {push: {ref: 'refs/head/main'}}},
        changes: []
      });
    });

    test('returns false for hasRuns', async () => {
      expect(output).toHaveProperty('hasRuns', false);
    });

    test('returns no runs', async () => {
      expect(output).toHaveProperty('runs', []);
    });
  });
});
