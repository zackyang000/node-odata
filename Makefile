REPORTER = dot

.PHONY: run compile test test-cov lint

run: lint compile test

lint:
	node_modules/.bin/eslint src/

compile:
	node_modules/.bin/babel src --out-dir lib

test:
	@node_modules/.bin/mocha\
		--require @babel/register \
		--reporter $(REPORTER) \
		--exclude test/failing/*.js \
		--exclude test/support/*.js \
		test/**/**/**/*.js \
		test/**/**/*.js \
		test/**/*.js \
		test/*.js

test-cov:
	@node node_modules/istanbul/lib/cli.js cover -x '**/examples/**' -x '**/lib/**' \
		./node_modules/mocha/bin/_mocha test/*.js test/**/*.js test/**/**/*.js -- \
		--require @babel/register \
		--reporter $(REPORTER) \
		--exclude test/failing/*.js \
		test/**/**/*.js \
		test/**/*.js \
		test/*.js \
