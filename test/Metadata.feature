Feature: Metadata
	As a developer
	I want my feature file's metadata represented in the Robot Framework output
	So that I can identify my feature in the Robot Framework logs

	Scenario: GeneratedBy metadata field
		Given a feature file with content
		"""
		Feature: GeneratedBy feature
			As a user
			I want something
			So that I can sleep at night

		Scenario: Dummy Scenario
			Given a dummy prerequisite
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has a GeneratedBy metadata field with the value "gherkin2robot"

	Scenario Outline: Feature metadata field
		Given a feature file with content
		"""
		Feature: <feature name>
			As a user
			I want something
			So that I can sleep at night

		Scenario: Dummy Scenario
			Given a dummy prerequisite
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has a Feature metadata field with the value <feature name>

		Examples:
			| feature name       |
			| Dummy feature      |
			| Some other feature |

	Scenario: Feature description as documentation
		Given a feature file with content
		"""
		Feature: test
			As a user
			I want something
			So that I can sleep at night

		Scenario: Dummy Scenario
			Given a dummy prerequisite
		"""
		When I convert the given feature file to a Robot Framework test suite
		Then the given robot file has the same content as "examples/Metadata: Feature description as documentation, output"

