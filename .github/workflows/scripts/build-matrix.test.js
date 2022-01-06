const buildMatrix = require('./build-matrix');
const {describe, test, expect, beforeAll} = require("@jest/globals");
const path = require("path");

describe('a pull request', () => {
  describe('when only the account level infrastructure has changed', () => {
    beforeAll(async () => {
      output = await buildMatrix({
        context: {pull_request: {base: {ref: 'main'}}},
        changes: ["src/infrastructure/test.tf"]
      });
    });

    test('returns no app runs', async () => {
      expect(output).toHaveProperty('apps', []);
    });

    test('returns the infrastructure run', async () => {
      expect(output).toHaveProperty('infrastructure', {
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: false,
        target: 'main',
      });
    });

    test('returns the infrastructure as part of all apps', async () => {
      expect(output).toHaveProperty('all', [{
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: false,
        target: 'main',
      }]);
    });
  });

  describe('when only the account module in an apps infrastructure has changed', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {pull_request: {base: {ref: 'main'}}},
        changes: ["src/services/app/infrastructure/account/test.tf"]
      });
    });

    test('returns no app runs', async () => {
      expect(output).toHaveProperty('apps', []);
    });

    test('returns the infrastructure run', async () => {
      expect(output).toHaveProperty('infrastructure', {
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: false,
        target: 'main',
      });
    });

    test('returns the infrastructure as part of all apps', async () => {
      expect(output).toHaveProperty('all', [{
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: false,
        target: 'main',
      }]);
    });
  });

  describe('when only a single app has changed', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {pull_request: {base: {ref: 'main'}}},
        changes: ["src/services/search/somefile.js"]
      });
    });

    test('returns no infrastructure runs', async () => {
      expect(output).toHaveProperty('infrastructure', undefined);
    });

    test('returns an app run as part of apps', async () => {
      expect(output).toHaveProperty('apps', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasInfrastructure: true,
        hasNodeJS: true,
        needsDeployment: false,
        target: 'main',
      }]);
    });

    test('returns the app as part of all runs', async () => {
      expect(output).toHaveProperty('all', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasInfrastructure: true,
        hasNodeJS: true,
        needsDeployment: false,
        target: 'main',
      }]);
    });
  });
});

describe('a push', () => {
  describe('when only the account level infrastructure has changed', () => {
    beforeAll(async () => {
      output = await buildMatrix({
        context: {push: {ref: 'refs/head/main'}},
        changes: ["src/infrastructure/test.tf"]
      });
    });

    test('returns no app runs', async () => {
      expect(output).toHaveProperty('apps', []);
    });

    test('returns the infrastructure run', async () => {
      expect(output).toHaveProperty('infrastructure', {
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: true,
        target: 'main',
      });
    });

    test('returns the infrastructure as part of all apps', async () => {
      expect(output).toHaveProperty('all', [{
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: true,
        target: 'main',
      }]);
    });
  });

  describe('when only the account module in an apps infrastructure has changed', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {push: {ref: 'refs/head/main'}},
        changes: ["src/services/app/infrastructure/account/test.tf"]
      });
    });

    test('returns no app runs', async () => {
      expect(output).toHaveProperty('apps', []);
    });

    test('returns the infrastructure run', async () => {
      expect(output).toHaveProperty('infrastructure', {
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: true,
        target: 'main',
      });
    });

    test('returns the infrastructure as part of all apps', async () => {
      expect(output).toHaveProperty('all', [{
        name: "infrastructure",
        codebasePath: expect.stringContaining(`src${path.sep}infrastructure`),
        commandPrefix: "make",
        hasInfrastructure: true,
        needsDeployment: true,
        target: 'main',
      }]);
    });
  });

  describe('when only a single app has changed', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {push: {ref: 'refs/head/main'}},
        changes: ["src/services/search/somefile.js"]
      });
    });

    test('returns no infrastructure runs', async () => {
      expect(output).toHaveProperty('infrastructure', undefined);
    });

    test('returns an app run as part of apps', async () => {
      expect(output).toHaveProperty('apps', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasInfrastructure: true,
        hasNodeJS: true,
        needsDeployment: true,
        target: 'main',
      }]);
    });

    test('returns the app as part of all runs', async () => {
      expect(output).toHaveProperty('all', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasInfrastructure: true,
        hasNodeJS: true,
        needsDeployment: true,
        target: 'main',
      }]);
    });
  });
});
