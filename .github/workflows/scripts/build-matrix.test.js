const buildMatrix = require('./build-matrix');
const {describe, test, expect, beforeAll} = require("@jest/globals");
const path = require("path");

describe('a pull request', () => {
  describe('targeting dev branch', () => {
    describe('when at least one application has updates to deploy', () => {
      let output;

      beforeAll(async () => {
        output = await buildMatrix({
          context: {payload: {pull_request: {base: {ref: 'dev'}}}, eventName: 'pull_request'},
          changes: ["src/services/search/somefile.js"]
        });
      });

      test('returns true for hasRuns', async () => {
        expect(output).toHaveProperty('hasRuns', true);
      });

      test('returns the expected target', () => {
        expect(output).toHaveProperty('target', 'dev');
      });

      test('returns the expected value for needsDeployment', () => {
        expect(output).toHaveProperty('needsDeployment', false);
      });

      test('returns the expected environments', () => {
        expect(output).toHaveProperty('environments', ['Testing']);
      });

      test(`returns the application in the list of tests`, async () => {
        expect(output).toHaveProperty('test', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environments: ['Testing'],
        }]);
      });

      test(`returns the application in the list of lints`, async () => {
        expect(output).toHaveProperty('lint', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environments: ['Testing'],
        }]);
      });

      test(`returns the application in the list of builds`, async () => {
        expect(output).toHaveProperty('build', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environments: ['Testing'],
        }]);
      });

      test(`returns the application in the list of deploys`, async () => {
        expect(output).toHaveProperty('deploy', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environment: 'Testing',
        }]);
      });
    });

    describe('when no apps have changes', () => {
      let output;

      beforeAll(async () => {
        output = await buildMatrix({
          context: {payload: {pull_request: {base: {ref: 'dev'}}}, eventName: 'pull_request'},
          changes: []
        });
      });

      test('returns false for hasRuns', async () => {
        expect(output).toHaveProperty('hasRuns', false);
      });

      test(`returns an empty list of tests`, async () => {
        expect(output).toHaveProperty('test', []);
      });

      test(`returns an empty list of lints`, async () => {
        expect(output).toHaveProperty('lint', []);
      });

      test(`returns an empty list of builds`, async () => {
        expect(output).toHaveProperty('build', []);
      });

      test(`returns an empty list of deploys`, async () => {
        expect(output).toHaveProperty('deploy', []);
      });
    });
  });

  describe('targeting main branch', () => {
    describe('when at least one application has updates to deploy', () => {
      let output;

      beforeAll(async () => {
        output = await buildMatrix({
          context: {payload: {pull_request: {base: {ref: 'main'}}}, eventName: 'pull_request'},
          changes: ["src/services/search/somefile.js"]
        });
      });

      test('returns true for hasRuns', async () => {
        expect(output).toHaveProperty('hasRuns', true);
      });

      test('returns the expected target', () => {
        expect(output).toHaveProperty('target', 'main');
      });

      test('returns the expected value for needsDeployment', () => {
        expect(output).toHaveProperty('needsDeployment', false);
      });

      test('returns the expected environments', () => {
        expect(output).toHaveProperty('environments', ['Staging', 'Production']);
      });

      test(`returns the application in the list of tests`, async () => {
        expect(output).toHaveProperty('test', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environments: ["Staging", "Production"],
        }]);
      });

      test(`returns the application in the list of lints`, async () => {
        expect(output).toHaveProperty('lint', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environments: ["Staging", "Production"],
        }]);
      });

      test(`returns the application in the list of builds`, async () => {
        expect(output).toHaveProperty('build', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environments: ["Staging", "Production"],
        }]);
      });

      test(`returns the application in the list of deploys`, async () => {
        expect(output).toHaveProperty('deploy', [{
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environment: 'Staging',
        }, {
          name: "services-search",
          codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
          commandPrefix: "make",
          hasNodeJS: true,
          type: 'Plan',
          hasInfrastructure: true,
          environment: 'Production',
        }]);
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

      test(`returns an empty list of tests`, async () => {
        expect(output).toHaveProperty('test', []);
      });

      test(`returns an empty list of lints`, async () => {
        expect(output).toHaveProperty('lint', []);
      });

      test(`returns an empty list of builds`, async () => {
        expect(output).toHaveProperty('build', []);
      });

      test(`returns an empty list of deploys`, async () => {
        expect(output).toHaveProperty('deploy', []);
      });
    });
  });
});

describe('a push', () => {
  describe('when at least one application has updates to deploy', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {eventName: 'push', ref: 'refs/head/dev'},
        changes: ["src/services/search/somefile.js"]
      });
    });

    test('returns true for hasRuns', async () => {
      expect(output).toHaveProperty('hasRuns', true);
    });

    test('returns the expected target', () => {
      expect(output).toHaveProperty('target', 'dev');
    });

    test('returns the expected value for needsDeployment', () => {
      expect(output).toHaveProperty('needsDeployment', true);
    });

    test('returns the expected environments', () => {
      expect(output).toHaveProperty('environments', ['Testing']);
    });

    test(`returns the application in the list of tests`, async () => {
      expect(output).toHaveProperty('test', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasNodeJS: true,
        type: 'Deploy',
        hasInfrastructure: true,
        environments: ["Testing"],
      }]);
    });

    test(`returns the application in the list of lints`, async () => {
      expect(output).toHaveProperty('lint', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasNodeJS: true,
        type: 'Deploy',
        hasInfrastructure: true,
        environments: ["Testing"],
      }]);
    });

    test(`returns the application in the list of builds`, async () => {
      expect(output).toHaveProperty('build', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasNodeJS: true,
        type: 'Deploy',
        hasInfrastructure: true,
        environments: ["Testing"],
      }]);
    });

    test(`returns the application in the list of deploys`, async () => {
      expect(output).toHaveProperty('deploy', [{
        name: "services-search",
        codebasePath: expect.stringContaining(`src${path.sep}services${path.sep}search`),
        commandPrefix: "make",
        hasNodeJS: true,
        type: 'Deploy',
        hasInfrastructure: true,
        environment: 'Testing',
      }]);
    });
  });

  describe('when no apps have changes', () => {
    let output;

    beforeAll(async () => {
      output = await buildMatrix({
        context: {eventName: 'push', ref: 'refs/head/dev'},
        changes: [],
      });
    });

    test('returns false for hasRuns', async () => {
      expect(output).toHaveProperty('hasRuns', false);
    });

    test(`returns an empty list of tests`, async () => {
      expect(output).toHaveProperty('test', []);
    });

    test(`returns an empty list of lints`, async () => {
      expect(output).toHaveProperty('lint', []);
    });

    test(`returns an empty list of builds`, async () => {
      expect(output).toHaveProperty('build', []);
    });

    test(`returns an empty list of deploys`, async () => {
      expect(output).toHaveProperty('deploy', []);
    });
  });
});
