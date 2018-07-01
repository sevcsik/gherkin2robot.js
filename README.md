Converts a Gherkin feature file to a Robot Framework test suite.

# Motivation

In [behaviour driven development], the functional specification of every feature is a feature file, which can be turned
into an automated test suite using [Cucumber].

According to the [test pyramid], you should cover your product with tests on multiple levels (unit tests, IT, E2E test)
to test every piece of your functionality with the most efficient testing method.

However, maintaining full test suites is expensive to maintain and specifications can diverge over time. Every
implementation of Cucumber knows the same Gherkin format, which makes it possible to drive all your test suites using
the same feature files, solving this problem.

If the E2E testing tool of your choice is Robot Framework however, you have to manually translate your Gherkin files
into Robot files. Since Robot Framework supports the core BDD semantics (matching Given/When/Then/And/But), it's a
fairly trivial to translate Gherkin feature files to Robot test suites. This tool aims to automate this task.

# Installation

```
npm i gherkin2robot
```

# Usage

## Commandline interface

```
  Usage: gherkin2robot [options] <FILE>

  Convert the Gherkin feature file FILE into a Robot Framework test suite

  Options:

    -V, --version               output the version number
    -o, --output <FILE>         write the Robot Framework version to the given file. Default is the
                                standard output
    -s, --stepdefs-path <FILE>  the path to the step definitions, which will be imported. Default
                                is "./stepdefs.robot"
    -h, --help                  output usage information
```

## From Javascript

```typescript
gherkin2robot: (featureFileContent: String, options?: Object) => String robotFileContent
```

The package exports the `gherkin2robot` synchronous function, which takes a Gherkin files's content as string as it's
first parameter.

Currently there is one available option:
 - `stepdefsPath: String` - the path to the Robot file containing the step definitions which will be imported in the
 generated test suite.

```js
const { writeFile, readFile } = require('fs')
const { promisify } = require('util')
const gherkin2robot = require('gherkin2robot')

const robotFile = promisify(readFile)('myFeature.feature')
	.then(featureFileContent => {
		const robotFileContent = gherkin2robot(featureFileContent, {
			stepdefsPath: './myFeatureStepdefs.robot'
		})

		return promisify(writeFile)('./myFeature.robot', robotFileContent, { encoding: 'utf-8' })
	})
```

## From Gulp

```typescript
gherkin2robot.stream: (options?: Object) => Transform<Vinyl, Vinyl>
```

The package exports a getter NodeJS Transform stream which applies gherkin2robot to the incoming sources (vinyls).
The getter takes the `options` object as its single parameter.

Here's a full example which takes the feature files and executes them in Robot Framework:

```js
const { stream: gherkin2robot } = require('gherkin2robot')

const { exec } = require('child_process')
const gulp = require('gulp')
const log = require('fancy-log')

gulp.task('gherkin2robot', () =>
	gulp.src('test/*.feature')
		.pipe(gherkin2robot({ stepdefsPath: '../test/stepdefs.robot' }))
		.pipe(gulp.dest('temp'))
)

gulp.task('execute robot', [ 'gherkin2robot' ], done => {
	exec('robot -N gherkin2robot *.robot', { cwd: 'temp' }, (err, stdout, stderr) => {
		if (err) {
			console.log(stdout)
			done('Some tests have failed.')
		} else {
			done()
		}

		log('Test execution completed. See temp/report.html')
	})
})

gulp.task('default', [ 'execute robot' ])
```

[behaviour driven development]: https://en.wikipedia.org/wiki/Behavior-driven_development
[Cucumber]: https://cucumber.io
[test pyramid]: https://martinfowler.com/bliki/TestPyramid.html
