REPORTER = dot

.PHONY: run compile test test-cov lint

run: lint compile test

lint:
	node_modules/.bin/eslint src/

compile:
	node_modules/.bin/babel src --out-dir lib

test:
	@node_modules/.bin/mocha\
		--compilers js:babel-core/register \
		--require babel-polyfill \
		--reporter $(REPORTER) \
		test/*.js

test-cov:
	@node node_modules/istanbul/lib/cli.js cover -x '**/examples/**' \
		./node_modules/mocha/bin/_mocha test/*.js -- \
		--compilers js:babel-core/register \
		--require babel-polyfill \
		--reporter $(REPORTER) \
		test/*.js \
