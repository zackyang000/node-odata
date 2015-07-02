REPORTER = dot

run: compile jshint tests
.PHONY: run

compile: 
	babel -d lib/ src/

tests:
	@node_modules/mocha/bin/mocha\
		--reporter $(REPORTER) \
		--require coffee-script/register \
		test/*.coffee

test-cov:
	@node node_modules/istanbul/lib/cli.js cover -x '**/examples/**' \
		./node_modules/mocha/bin/_mocha test/*.coffee -- \
		--reporter $(REPORTER) \
		--require coffee-script/register \
		test/*.coffee \

jshint:
	@node_modules/jshint/bin/jshint .
