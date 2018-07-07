#!/usr/bin/env node
const cmd = require('commander')
const gherkin2robot = require('.')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')

const package = require('./package.json')

cmd
	.description('Convert the Gherkin feature file FILE into a Robot Framework test suite')
	.version(package.version)
	.usage('[options] <FILE>')
	.option( '-o, --output <FILE>'
	       , 'write the Robot Framework version to the given file. Default is the standard output')
	.option( '-s, --stepdefs-path <FILE>'
	       , 'the path to the step definitions, which will be imported. Default is "./stepdefs.robot"')
	.parse(process.argv)

const inputFile = cmd.args[0]
const stepdefsPath = cmd.stepdefsPath || './stepdefs.robot'
const outputFile = cmd.output || '-'

if (!inputFile) {
	console.error('No input file given')
	process.exit(1)
}

const readFileP = promisify(readFile)
const writeFileP = promisify(writeFile)

readFileP(inputFile, { encoding: 'utf-8' })
	.then(gherkin => gherkin2robot(gherkin, stepdefsPath))
	.then(output => outputFile === '-' ? console.log(output) : writeFileP( outputFile
	                                                                     , output
	                                                                     , { encoding: 'utf-8' }
	                                                                     )
	     )
	.catch(error => {
		console.error(error.message);
		process.exit(1)
	})
