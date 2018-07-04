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

The package exports the `gherkin2robot` synchronous function, which takes a Gherkin file's content as string as it's
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

# Gherkin features

## Feature definitions

The name of the feature is mapped to the "Feature" metadata tag for the test suite, for easy filtering. The name of the
feature and the text is contatenated as the documentation of the suite.

```gherkin
Feature: test
	As a user
	I want something
	So that I can sleep at night
```

```robot
Metadata  Feature  test

Documentation  test
...            	As a user
...            	I want something
...            	So that I can sleep at night
```

## Scenarios

Each scenario is mapped to a Robot Framework keyword and a test case with the same name.

```gherkin
Scenario: Dummy Scenario
	Given a dummy prerequisite
```
```robot
*** Keywords ***

Dummy Scenario
	[Arguments]  
	Given a dummy prerequisite

*** Test Cases ***

Dummy Scenario
	Dummy Scenario
```

## Scenario outlines

Each scenario outline is mapped to a Robot Framework keyword accepting an argument for every `<variable>`. For each
example, a test case is generated.

```gherkin
Scenario Outline: dummy outline
	Given a dummy prerequisite with arg <arg1>
	When I do dummy action <arg2>
	Then a dummy assertion is met

	Examples:
		| arg1 | arg2 |
		| val1 | val2 |
		| val3 | val4 |
```
```robot
*** Keywords ***

dummy outline
	[Arguments]  ${arg1}  ${arg2}
	Given a dummy prerequisite with arg ${arg1}
	When I do dummy action ${arg2}
	Then a dummy assertion is met

*** Test Cases ***

dummy outline (arg1=val1; arg2=val2)
	dummy outline
	...  arg1=val1
	...  arg2=val2

dummy outline (arg1=val3; arg2=val4)
	dummy outline
	...  arg1=val3
	...  arg2=val4
```

## Table arguments

Currently, only two-dimensional tables are supported, where the first row must be a header containing the name of the
arguments. Similar to the scenario outlines, each row of the label will result in multiple calls to the robot keyword.

```gherkin
Scenario: dummy scenario
	Given a dummy prerequisite
		| arg1 | arg2 |
		| val1 | val2 |
		| val3 | val4 |
	When I do dummy action
	Then a dummy assertion is met
```
```robot
*** Keywords ***

dummy scenario
	[Arguments]  
	Given a dummy prerequisite
	...  arg1=val1
	...  arg2=val2
	Given a dummy prerequisite
	...  arg1=val3
	...  arg2=val4
	When I do dummy action
	Then a dummy assertion is met

*** Test Cases ***

dummy scenario
	dummy scenario
```

## Docstring arguments

Docstring arguments are passed as an argument to the keyword, using a temporary variable. Spaces need to be substituted
with the `${SPACE}` built-in variable, so the output won't be human-readable.

```gherkin
Scenario: dummy scenario
	Given a dummy prerequisite
	"""
	Multi line
	Docstring argument
	For your pleasure
	"""
	When I do dummy action
	Then a dummy assertion is met
```
```robot
*** Keywords ***

dummy scenario
	[Arguments]  
	${__ARG__}=  Catenate  SEPARATOR=\n
	...  Multi${SPACE}line
	...  Docstring${SPACE}argument
	...  For${SPACE}your${SPACE}pleasure
	Given a dummy prerequisite  ${__ARG__}
	When I do dummy action
	Then a dummy assertion is met

*** Test Cases ***

dummy scenario
	dummy scenario
```

# Running the test suite

To run the tests, robot framework and `diff` needs to be available on `$PATH`. The test suite can be run with `npm test`.

[behaviour driven development]: https://en.wikipedia.org/wiki/Behavior-driven_development
[Cucumber]: https://cucumber.io
[test pyramid]: https://martinfowler.com/bliki/TestPyramid.html
