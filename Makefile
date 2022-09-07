check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	./node_modules/.bin/mocha \
		--recursive \
		--node-option no-experimental-fetch \
		--require should \
		--require jsdom-global/register \
		--require isomorphic-fetch

.PHONY: check lint test
