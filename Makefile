REPORTER = dot

.PHONY: run compile test test-cov jshint

run:  jshint compile test

jshint:
	@node_modules/jshint/bin/jshint .

compile: 
	babel -d lib/ src/

test:
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

