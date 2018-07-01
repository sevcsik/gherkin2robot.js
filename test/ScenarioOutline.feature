Feature: Scenario outline
	As a developer
	I want the scenario outlines in my feature files to be translated to test cases
	So that I can run them in Robot Framework

Scenario: Single scenario outline without arguments
	Given a feature file "examples/Scenario outline: Single scenario outline without arguments, input"
	When I convert the given feature file to a Robot Framework test suite
	Then the given robot file has the same content as "examples/Scenario outline: Single scenario outline without arguments, output"

Scenario: Single scenario outline with table arguments
	Given a feature file "examples/Scenario outline: Single scenario outline with table arguments, input"
	When I convert the given feature file to a Robot Framework test suite
	Then the given robot file has the same content as "examples/Scenario outline: Single scenario outline with table arguments, output"

Scenario: Single scenario outline with docstring argument
	Given a feature file "examples/Scenario outline: Single scenario outline with docstring argument, input"
	When I convert the given feature file to a Robot Framework test suite
	Then the given robot file has the same content as "examples/Scenario outline: Single scenario outline with docstring argument, output"

Scenario: Scenario outlines with scenarios mixed
	Given a feature file "examples/Scenario outline: Scenario outlines with scenarios mixed, input"
	When I convert the given feature file to a Robot Framework test suite
	Then the given robot file has the same content as "examples/Scenario outline: Scenario outlines with scenarios mixed, output"
