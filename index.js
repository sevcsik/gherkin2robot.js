const gherkin2robot = require('./gherkin2robot')
const { readFile } = require('fs')
const { promisify } = require('util')

readFileP = promisify(readFile)

readFileP('./example.feature', { encoding: 'utf-8' })
	.then(gherkin => gherkin2robot(gherkin, './stepdefs.robot'))
	.then(console.log)
