#!/usr/bin/env node

/**
 * Module dependencies.
 */
const program = require('commander');
const GenerateCommand = require('./commands/generate');
const VersionsCommand = require('./commands/versions');
const LaunchCommand = require('./commands/launch');

program
    .version('0.1.0');

const generateCmd = new GenerateCommand(program);
const versions = new VersionsCommand(program);
const launch = new LaunchCommand(program);



program.parse(process.argv);