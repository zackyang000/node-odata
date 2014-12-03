REPORTER = dot

check: test test-cov

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--require coffee-script/register \
		--compilers coffee:coffee-script/register \
		test/*.coffee

test-cov:
	@NODE_ENV=test node node_modules/istanbul/lib/cli.js \
	cover ./node_modules/mocha/bin/_mocha test/*.coffee -- \
	--reporter $(REPORTER) \
	--require coffee-script/register \
	--compilers coffee:coffee-script/register \
	--recursive test \
	--bail

.PHONY: test-cov
