Feature: Setup and teardown
	As a developer
	I want to specify setup and teardown keywords
	So that I can run something before/after test cases without cluttering my feature file

	Scenario Outline: Setup or teardown
		Given a feature file with content
		"""
		Feature: test
			As a user
			I want something
			So that I can sleep at night

		Scenario: Dummy Scenario
			Given a dummy prerequisite
		"""
		When I convert the given feature file to a Robot Framework test suite with the "<keyword>" <setupOrTeardown>
		Then the given robot file has the same content as "examples/Setup and Teardown: <setupOrTeardown>, output"

		Examples:
			| setupOrTeardown | keyword              |
			| Setup           | Open browser  chrome |
			| Teardown        | Close browser        |

	Scenario: Both setup and teardown
		Given a feature file with content
		"""
		Feature: test
			As a user
			I want something
			So that I can sleep at night

		Scenario: Dummy Scenario
			Given a dummy prerequisite
		"""
		When I convert the given feature file to a Robot Framework test suite with the "Open Browser" setup and the "Close Browser" teardown
		Then the given robot file has the same content as "examples/Setup and Teardown: Both, output"
