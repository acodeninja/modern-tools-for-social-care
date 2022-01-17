import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';

import * as dev from './commands/dev';

const parser = yargs(hideBin(process.argv))

parser
  .command(dev)
  .help('help', 'Show usage')
  .showHelpOnFail(true)
  .demandCommand()
  .argv;

