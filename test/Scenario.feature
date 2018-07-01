Feature: Scenario
	As a developer
	I want the scenarios in my feature files to be translated to test cases
	So that I run them in Robot Framework

Scenario: Single scenario without arguments
		Given a feature file with content
		"""
		Feature: test

		Scenario: dummy scenario
			Given a dummy prerequisite
			When I do dummy action
			Then a dummy assertion is met
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has the same content as "examples/Scenario: Single scenario without arguments, output"

Scenario: Single scenario with table arguments
		Given a feature file with content
		"""
		Feature: test2

		Scenario: dummy scenario
			Given a dummy prerequisite
				| arg1 | arg2 |
				| val1 | val2 |
				| val3 | val4 |
			When I do dummy action
			Then a dummy assertion is met
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has the same content as "examples/Scenario: Single scenario with table arguments, output"

Scenario: Single scenario with docstring argument
		Given a feature file with content
		"""
		Feature: test2

		Scenario: dummy scenario
			Given a dummy prerequisite
			\"\"\"
			Multi line
			Docstring argument
			For your pleasure
			\"\"\"
			When I do dummy action
			Then a dummy assertion is met
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has the same content as "examples/Scenario: Single scenario with docstring argument, output"

Scenario: Multiple scenarios
		Given a feature file with content
		"""
		Feature: test

		Scenario: dummy scenario
			Given a dummy prerequisite
			When I do dummy action
			Then a dummy assertion is met

		Scenario: dummy scenario with arguments
			Given a dummy prerequisite with arguments
				| arg1 | arg2 |
				| val1 | val2 |
				| val3 | val4 |
			When I do dummy action
			Then a dummy assertion is met
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has the same content as "examples/Scenario: Multiple scenarios, output"

