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
		Then the file has a GeneratedBy metadata field with the value "gherkin2robot"

	Scenario Outline: GeneratedBy metadata field
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
		Then the file has a Feature metadata field with the value "Metadata Example"

		Examples:
			| feature name       |
			| Dummy feature      |
			| Some other feature |
