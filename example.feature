#Auto generated Octane revision tag
@TID3003REV0.9.0
Feature: Test feature for gherkin2robot
  As a developer
  I want to have an artifact which aggreagates blackbox UI modules
  So that it's clear from the dependency tree which module is blackboxed

Scenario: Dummy scenario
  Given the blackbox module
  When I look at it
  Then it is untouched
  
Scenario: Dummy scenario 2 
  Given some other modules
    | module name | jenkins job |
    | asd         | asd job     |
    | bsd         | bsd job     |
  When I look at it
  Then PROFIT

Scenario Outline: Artifact has the correct content
  Given the <module> module 
  When I run "mvn package"
  Then the following JAR artifacts are built
	| artifact name | scope | other var |
	| <module>      | main  | <other>   |
	| <module>      | test  | <other>   |
  And it contains all the extjs, images, js and resources directory currently in the blackbox-admin artifact with the same content
  And it doesn't include anything else, like
#    | bricks | images | dirt |
  And the CI builds it in the <jenkins job> job
  And the old blackbox-admin module stays untouched
  
  Examples:
    | module                 | jenkins job | other |
    | blackbox-admin-ui      | blackbox    | asd   |
    | blackbox-foundation-ui | blackbox    | bsd   |

Scenario Outline: Artifact does something useful
  Given Bla bla bla <module>
  When Bla bla <jenkins job> asd

  Examples:
    | module                 | jenkins job |
    | blackbox-admin-ui      | blackbox    |
    | blackbox-foundation-ui | blackbox    |
