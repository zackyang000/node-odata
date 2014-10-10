REPORTER = dot

check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--require coffee-script/register \
		--compilers coffee:coffee-script/register \
		test/*.coffee

.PHONY: test
