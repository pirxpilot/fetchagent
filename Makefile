check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	node \
		--no-experimental-fetch \
		--require should \
		--require jsdom-global/register \
		--require isomorphic-fetch \
		--test

.PHONY: check lint test
