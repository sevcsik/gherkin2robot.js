const { Parser } = require('gherkin')
const stream = require('./stream')

const { flow, extendAll, filter, concat, join, toPairs, map, flatMap, tail, replace, zipObject
      , get, cond, T, matches, conforms, size, isEqual, gt, isObject, __, flattenDeep, uniq, isString
      , split, head } = require('lodash/fp')

const step = parse => acc => extendAll([ {}, acc, parse(acc.ast, acc) ])

const initialise = (featureFileContent, stepdefsPath, setup, teardown) =>
	({ ast: (new Parser()).parse(featureFileContent)
	 , keywords: []
	 , testCases: []
	 , feature: {}
	 , scenarios: []
	 , scenarioOutlines: []
	 , settings: ''
	 , stepdefsPath
	 , setup
	 , teardown
	 })

const parseFeature = step(ast => ({ feature: ast.feature.description }))

const parseScenarios = step((ast, acc) =>
	({ scenarios: concat(acc.scenarios, filter({ type: 'Scenario' }, ast.feature.children)) }))

const parametersRegexp = /<([^>]+)>/g

const parseScenarioOutlines = step((ast, acc) => {
	const flattenArgument = cond([ [ flow(get('type'), isEqual('DataTable'))
	                               , flow(get('rows'), flatMap('cells'), map('value'))
	                               ]
	                             , [ T, get('content') ]
	                             ])

	const extractParametersFromStep = step => flow( flattenDeep
	                                              , join(' ')
	                                              , str => str.match(parametersRegexp)
	                                              , map(replace(/[<>]/g, ''))
	                                              )(
		[ step.text, flattenArgument(step.argument) ]
	)

	const extractParameters = scenario =>
		extendAll([ {}, scenario, { parameters: flow( flatMap(extractParametersFromStep)
		                                            , uniq
		                                            , filter(isString)
		                                            )(scenario.steps)
		                          }
		          ])

	const replaceParameters = scenario =>
		extendAll([ {}, scenario, { steps: map(step =>
			extendAll([ {}, step, { text: replace(parametersRegexp, '$${$1}', step.text)} ])
		, scenario.steps) } ])

	return (
		{ scenarioOutlines: flow( filter({ type: 'ScenarioOutline' })
		                        , map(extractParameters)
		                        , map(replaceParameters)
		                        )(ast.feature.children)
		}
	)
})

const tableToArgumentMaps = (tableHeader, tableBody) =>
	map( flow( get('cells')
	         , flatMap('value')
	         , map(replace(parametersRegexp, '$${$1}'))
	         , zipObject(map('value', tableHeader.cells))
	         )
	   , tableBody
	   )

const expandSteps = step((ast, acc) => {
	const expand1DDataTable = step => {
		throw new Error('One-dimensional tables are not supported')
	}

	const expand2DDataTable = step =>
		map( argumentMap => extendAll([ {}, step, { argumentMap } ])
		   , tableToArgumentMaps(step.argument.rows[0], tail(step.argument.rows))
		   )

	const expandScenarios = map(scenario => extendAll([ {}, scenario, { steps: flatMap(cond(
		[ [ flow(get('argument'), conforms({ type: isEqual('DataTable'), rows: flow(size, gt(__, 1)) }))
		  , expand2DDataTable
		  ]
		, [ flow(get('argument'), conforms({ type: isEqual('DataTable') }))
		  , expand1DDataTable
		  ]
		, [ T, step => [ step ] ]
		]
	), scenario.steps) } ]))

	const ret = { scenarios:  expandScenarios(acc.scenarios)
		        , scenarioOutlines: expandScenarios(acc.scenarioOutlines)
	            }

	return ret
})

const expandScenarioOutlines = step((ast, acc) => {

	const exampleToScenario = outline => flow( example => tableToArgumentMaps(example.tableHeader, example.tableBody)
		                                     , map(argumentMap => extendAll([ {}, outline, { argumentMap
		                                                                                   , type: 'ScenarioFromOutline'
		                                                                                   } ]))
		                                     )

	const expandScenarioOutline = outline => flatMap(exampleToScenario(outline), outline.examples)

	return { scenarios: concat(acc.scenarios, flatMap(expandScenarioOutline, acc.scenarioOutlines)) }
})

const renderFeature = step((ast, acc) => {

	const renderDocumentation = (name, description) => {
		description = description ? split('\n', description) : []
		return join('\n', concat( `Documentation  ${name}`
		                        , map(text => `...            ${text}`, description)
		                        ))
	}

	return { feature: { name: ast.feature.name
	                  , documentation: renderDocumentation(ast.feature.name, ast.feature.description)
	                  }
	       }
})

const renderKeywords = step((ast, acc) =>
	({ keywords: map(renderKeyword, concat(filter({ type: 'Scenario' }, acc.scenarios), acc.scenarioOutlines)) }))

const renderTestCases = step((ast, acc) =>
	({ testCases: map(renderTestCase, acc.scenarios) }))

const renderArgumentMap = flow( toPairs
	                          , map(([param, arg]) => `\t...  ${param}=${arg}`)
	                          , join('\n')
	                          )

const renderKeyword = scenario => {
	const renderStepWithoutArguments = step => `\tRun Keyword  ${step.keyword}${step.text}`

	const renderStepWithDocStringArgument = step => {
		const lines = flow( split('\n')
		                  , map(replace(/\t/g, '\\t'))
		                  , map(replace('$', '\\$'))
		                  , map(replace(/ /g, '${SPACE}'))
		                  , map(replace(parametersRegexp, '$${$1}'))
		                  , map(line => `\t...  ${line}`)
		                  , join('\n')
		                  )(step.argument.content)

		return (
`\t\${__ARG__}=  Catenate  SEPARATOR=\\n
${lines}
${renderStepWithoutArguments(step)}  \${__ARG__}`
		)
	}

	const renderStepWithArgumentMap = step => join('\n', [ renderStepWithoutArguments(step)
	                                                     , renderArgumentMap(step.argumentMap)
	                                                     ])

	const renderStep = cond([ [ flow(get('argumentMap'), isObject)               , renderStepWithArgumentMap       ]
	                        , [ flow(get('argument.type'), isEqual('DocString')) , renderStepWithDocStringArgument ]
	                        , [ T                                                , renderStepWithoutArguments      ]
	                        ])

	const steps = flow(map(renderStep), join('\n'))(scenario.steps)
	const parameters = '[Arguments]  ' + flow(map(p => '${' + p + '}'), join('  '))(scenario.parameters)

	return (
`${scenario.name}
	${parameters}
${steps}`
	)
}

const renderTestCase = scenario => {
	const parameterList = renderArgumentMap(scenario.argumentMap)
	const formatArguments = flow( get('argumentMap')
	                            , toPairs
	                            , map(([ key, value ]) => `${key}=${value}`)
	                            , join('; ')
	                            )

	const getName = cond([ [ matches({ type: 'ScenarioFromOutline' }), s => `${s.name} (${formatArguments(s)})` ]
	                     , [ T                                       , get('name')                              ]
	                     ])

	return (
`${getName(scenario)}
	${scenario.name}
${parameterList}`
	)
}

const renderSettings = step((ast, { feature, stepdefsPath, setup, teardown }) => {
	const setupAndTeardown = join('\n', [ ...(setup    ? [ `Test Setup  ${setup}`       ] : [])
	                                    , ...(teardown ? [ `Test Teardown  ${teardown}` ] : [])
	                                    ])
	return {
		settings:
`Resource  ${stepdefsPath}

Metadata  GeneratedBy  gherkin2robot
Metadata  Feature  ${feature.name}

${setupAndTeardown}

${feature.documentation}`
	}
})

const renderSuite = ({ keywords, testCases, settings }) =>
`*** Settings ***

${settings}

*** Keywords ***

${join('\n\n', keywords)}

*** Test Cases ***

${join('\n\n', testCases)}
`

module.exports = flow
	( initialise
	, parseFeature
	, parseScenarios
	, parseScenarioOutlines
	, expandSteps
	, expandScenarioOutlines
	, renderFeature
	, renderKeywords
	, renderTestCases
	, renderSettings
	, renderSuite
	)

module.exports.stream = stream(module.exports)
