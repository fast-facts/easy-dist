#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import ora, { Ora } from 'ora';

import { easyDist } from '../easy-dist';

const cmdOptions = [
  {
    group: 'build',
    name: 'src',
    type: String,
    multiple: true,
    defaultOption: true,
    defaultValue: []
  },

  {
    group: 'build',
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage info.'
  },
  {
    group: 'build',
    name: 'version',
    alias: 'V',
    type: Boolean,
    description: 'Output the version number.'
  },
  {
    group: 'build',
    name: 'verbose',
    alias: 'v',
    type: Boolean,
    description: 'Increase the verbosity of messages.'
  },

  {
    group: 'build',
    name: 'out',
    alias: 'o',
    type: String,
    description:
      'Copy all input files into an output directory.\n[default: {bold dist}]',
    defaultValue: 'dist'
  },
  {
    group: 'build',
    name: 'no-clean',
    type: Boolean,
    description: 'Without cleaning the output directory.'
  },

  {
    group: 'modules',
    name: 'no-files',
    type: Boolean,
    description: 'Run without copying files.'
  },
  {
    group: 'modules',
    name: 'no-modules',
    type: Boolean,
    description: 'Run without copying node_modules.'
  },
  {
    group: 'modules',
    name: 'module-path',
    alias: 'M',
    type: String,
    description: 'Change node_modules path.'
  },
  {
    group: 'modules',
    name: 'dev',
    alias: 'D',
    type: Boolean,
    description: 'Copy modules in devDependencies also.'
  },
  {
    group: 'modules',
    name: 'bin',
    alias: 'B',
    type: Boolean,
    description: 'Copy .bin also.'
  },
];

const args = commandLineArgs(cmdOptions)._all;

if (args.version) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  console.log(`v${require('../../package.json').version}`);
  process.exit(0);
}

if (args.help) {
  const log = args.help ? console.log : console.error;
  log(
    commandLineUsage([
      { content: '{yellow Usage:}', raw: true },
      {
        content: ['$ easy-dist <path ...> [options]']
      },
      { content: '{yellow Synopsis:}', raw: true },
      {
        content: [
          '$ easy-dist [{bold --timeout} {underline ms}] {bold --src} {underline file} ...',
          '$ easy-dist {bold --help}',
        ]
      },
      { content: '{yellow Options:}', raw: true },
      {
        hide: ['src'],
        optionList: cmdOptions,
        group: 'build'
      },
      { content: '{yellow Module Options:}', raw: true },
      {
        optionList: cmdOptions,
        group: 'modules'
      },
    ]).replace(/^\s+/, '')
  );
  process.exit(args.help ? 0 : 1);
}

const cwd = process.cwd();

const app = easyDist({
  src: args['no-files'] ? [] : args.src.length > 0 ? args.src : '.',
  basePath: cwd,
  out: args.out,
  noClean: args['no-clean'],
  modulePath: args['module-path'],
  noModules: args['no-modules'],
  dev: args.dev,
  bin: args.bin
});

let spinner = null as Ora | null;
void app.on('progress', name => {
  switch (name) {
    case 'CLEAN': {
      spinner?.succeed();
      spinner = ora(`Clean old dist files, "${args.out}"`).start();
      break;
    }
    case 'COPY_SOURCE_FILES': {
      spinner?.succeed();
      spinner = ora('Copy source files').start();
      break;
    }
    case 'COPY_NODE_MODULES': {
      spinner?.succeed();
      spinner = ora('Copy node_modules').start();
      break;
    }
  }
});

void app.on('done', () => {
  spinner?.succeed();
});

if (args.verbose) {
  void app.on('copy', (src, dest) => {
    console.log(
      `> Copy file "${src.replace(cwd, '').replace(/^\/+/, '')}" to "${dest
        .replace(cwd, '')
        .replace(/^\/+/, '')}"`
    );
  });
}
