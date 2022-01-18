import React, {Dispatch, FC, SetStateAction, useState} from 'react';
import {Box, Text} from 'ink';
import Spinner from 'ink-spinner';
import {ChildProcess, exec} from "child_process";
import {dirname, resolve, sep} from "path";
import {createWriteStream, existsSync, mkdirSync} from "fs";

export interface RunningProcess {
  command: string;
  process: ChildProcess;
  loading: boolean;
}

// @ts-ignore
if (typeof global.processes === 'undefined') {
  // @ts-ignore
  global.processes = {};
}

const startProcess = (
  serviceName: string,
  serverName: string,
  command: string,
  postExit: string | undefined,
  workingDir: string,
  isLoadedMatcher: RegExp,
  setStatus: Dispatch<SetStateAction<StatusString>>,
): RunningProcess | undefined => {
  // @ts-ignore
  const alreadyRunning = global.processes[`${serviceName}-${serverName}`];

  if (!alreadyRunning) {
    const logPath = resolve(process.cwd(), 'logs', serviceName, `${serverName}.log`);

    if (!existsSync(logPath)) mkdirSync(dirname(logPath), {recursive: true});

    const logFile = createWriteStream(logPath);
    const running = exec(command, {
      cwd: resolve(process.cwd(), workingDir.split('/').join(sep))
    });

    running.stdout?.pipe(logFile);
    running.stdout?.on('data', data => {
      if (data.match(isLoadedMatcher)) setStatus('running');
    });

    running.stderr?.pipe(logFile);
    running.stderr?.on('data', data => {
      if (data.match(isLoadedMatcher)) setStatus('running');
    });

    running.on('exit', () => {
      setStatus('exited');
      if (postExit) {
        // @ts-ignore
        global.processes[`${serviceName}-${serverName}-post-exit`] = {
          process: exec(postExit),
        };
      }
    });

    // @ts-ignore
    global.processes[`${serviceName}-${serverName}`] = {
      command,
      process: running,
    };
  }

  // @ts-ignore
  return global.processes[`${serviceName}-${serverName}`];
};

type StatusString = 'loading' | 'running' | 'exited' | 'waiting';

const Status: FC<{
  status: StatusString;
  statusCharacters?: {
    loading?: JSX.Element;
    running?: JSX.Element;
    exited?: JSX.Element;
  };
}> = ({status, statusCharacters}) => {
  switch (status) {
    case 'loading':
      return statusCharacters?.loading !== undefined ?
        statusCharacters?.loading : (
          <Text color="yellow">
            <Spinner type="dots"/>
          </Text>
        );
    case 'running':
      return statusCharacters?.running !== undefined ?
        statusCharacters?.running : (<Text color='green'>✔</Text>);
    case 'exited':
      return statusCharacters?.exited !== undefined ?
        statusCharacters?.exited : (<Text color='red'>☠</Text>);
    default:
      return (<Text color='blue'>?</Text>);
  }
}

const RunProcess: FC<{
  serviceName: string;
  serverName: string;
  command: string;
  postExit?: string;
  connectionString?: string;
  isRunningMatcher: RegExp;
  workingDir: string;
  onRunning?: Array<string>;
  statusCharacters?: {
    loading?: JSX.Element;
    running?: JSX.Element;
    exited?: JSX.Element;
  };
}> = ({
        serviceName,
        serverName,
        command,
        postExit,
        connectionString,
        isRunningMatcher,
        workingDir,
        onRunning,
        statusCharacters
      }) => {
  const [status, setStatus] = useState<StatusString>('loading');

  startProcess(
    serviceName,
    serverName,
    command,
    postExit,
    workingDir,
    isRunningMatcher,
    setStatus,
  );

  return (
    <>
      <Box width='100%' flexDirection='row'>
        <Box width="65%">
          <Text color='blue'>
            <Status status={status} statusCharacters={statusCharacters}/> {serverName}
          </Text>
        </Box>
        <Box width="35%" marginRight={1} alignItems='flex-end'>
          <Text>
            {(connectionString && status === 'running') ? `${connectionString}` : ''}
          </Text>
        </Box>
      </Box>
      {status === 'running' && onRunning && onRunning.map((onRunningCommand: string, index) => (
        <Box marginLeft={3}>
          <RunProcess
            serviceName={serviceName}
            serverName={`${serverName}-${onRunningCommand.replace(/[\/\s:]/g, '-')} (${index + 1})`}
            command={onRunningCommand}
            isRunningMatcher={/ON RUNNING FINISHED/}
            statusCharacters={{
              exited: (<Text color='green'>✔</Text>),
            }}
            workingDir={workingDir}
          />
        </Box>
      ))}
    </>
  )
};

module.exports = RunProcess;
export default RunProcess;
