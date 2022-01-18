import React, {FC, Fragment, StrictMode} from 'react';
import {Text, render, useInput} from 'ink';
import RunProcess, {RunningProcess} from "../components/RunProcess";
import YAML from 'yaml';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {Arguments, Argv} from "yargs";

export const command = 'dev [service]';

export const describe = 'Run the local dev environment';

export const builder = (args: Argv) =>
  args.positional('service', {
    description: 'The service you want to run a dev environment for.',
    required: false,
    type: 'string',
  });

// @ts-ignore
const Command: FC<{ args: Arguments<{ service?: string }>, devServices: Array<DevService> }> = ({devServices}) => {
  useInput((input) => {
    if (input === 'q') stopAllProcesses();
  });

  return (
    <>
      {devServices.map(service => (
        <Fragment key={service.name}>
          <Text>Service: {service.name}</Text>
          {service.servers.map(server => (
            <RunProcess
              key={service.name + server.name}
              serviceName={service.name}
              serverName={server.name}
              command={server.command}
              postExit={server.postExit}
              isRunningMatcher={new RegExp(server.isRunningMatcher)}
              connectionString={server.connectionString}
              workingDir={service.dir}
              onRunning={server.onRunning}
            />
          ))}
        </Fragment>
      ))}
    </>
  )
};

export const handler = (args: Arguments<{ service?: string }>) => {
  const services: ServiceFile = YAML.parse(readFileSync(resolve(process.cwd(), 'setup.yml')).toString());

  const devServices: Array<DevService> = Object.entries(services)
    .filter(([name]) => !!args.service ? name === args.service : true)
    .map(([name, service]) => ({
      name,
      dir: service.dir,
      servers: Object.entries(service.dev)
        .map(([devService, devServiceConfig]) => ({
          name: devService,
          ...devServiceConfig,
        })),
    }));

  process.on('exit', () => {
    stopAllProcesses();
  });

  render(
    <StrictMode>
      <Command args={args} devServices={devServices}/>
    </StrictMode>
  );
};

const stopAllProcesses = () => {
  // @ts-ignore
  if (!global.processes) process.exit();

  // @ts-ignore
  Object.values(global.processes)
    .forEach(p => (p as RunningProcess).process.kill('SIGINT'));
  setInterval(() => {
    // @ts-ignore
    const allExited = Object.values(global.processes)
      .every(p => (p as RunningProcess).process.exitCode !== null);

    if (allExited) process.exit(0);
  }, 500);
}

interface DevService {
  name: string;
  dir: string;
  servers: Array<{
    name: string;
    command: string;
    postExit?: string;
    connectionString: string;
    isRunningMatcher: string;
    onRunning?: Array<string>;
  }>;
}

interface ServiceFile {
  [key: string]: {
    dir: string;
    dev: {
      [key: string]: {
        command: string;
        postExit?: string;
        connectionString: string;
        isRunningMatcher: string;
        onRunning?: Array<string>;
      }
    }
  };
}
