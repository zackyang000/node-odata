REPORTER = dot

check: test test-cov

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--require coffee-script/register \
		--compilers coffee:coffee-script/register \
		test/*.coffee

test-cov:
	@NODE_ENV=test COV_TEST=true ./node_modules/.bin/mocha \
    --compilers coffee:coffee-script/register \
    --require test/coverage/env \
    --reporter html-cov -- test > test/coverage/coverage-reporter.html \
		test/*.coffee

.PHONY: test test-cov
