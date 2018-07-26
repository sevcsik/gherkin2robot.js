*** Settings ***

Library  OperatingSystem
Library  String

*** Keywords ***

Given a feature file with content
	[Arguments]  ${content}
	Create file  the given feature file  ${content}

Given a feature file "${file}"
	${content}=  Get file  ${file}
	Create file  the given feature file  ${content}

When I convert the given feature file to a Robot Framework test suite
	Run  node ../cli.js -o "the given robot file" "the given feature file"

When I convert the given feature file to a Robot Framework test suite with the "${setup}" setup
	Run  node ../cli.js -s "${setup}" -o "the given robot file" "the given feature file"

When I convert the given feature file to a Robot Framework test suite with the "${teardown}" teardown
	Run  node ../cli.js -t "${teardown}" -o "the given robot file" "the given feature file"

When I convert the given feature file to a Robot Framework test suite with the "${setup}" setup and "${teardown}" teardown
	Run  node ../cli.js -s "${setup}" -t "${teardown}" -o "the given robot file" "the given feature file"

Then the given robot file has a GeneratedBy metadata field with the value "${value}"
	The given robot file should match "Metadata${SPACE}${SPACE}GeneratedBy${SPACE}${SPACE}${value}" exactly once

Then the given robot file has a Feature metadata field with the value ${value}
	The given robot file should match "Metadata${SPACE}${SPACE}Feature${SPACE}${SPACE}${value}" exactly once

The given robot file should match "${regexp}" exactly once
	${matches string}=  Grep file  the given robot file  ${regexp}
	${length}=  Get Length  ${matches string}
	Should not be equal as integers  ${length}  0
	...  msg=The given robot file has no matches for "${regexp}"  values=False
	@{matches}=  Split string  ${matches string}  \n
	${number of matches}=  Get length  ${matches}
	Should be equal as integers  ${number of matches}  1
	...  msg=The given robot file has too many matches for ${regexp}  values=True

The given robot file has the same content as "${file}"
	${rc}  ${output}  Run and return rc and output  diff "the given robot file" "${file}"
	Should be equal as integers  ${rc}  0

