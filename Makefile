check: lint test

lint:
	./node_modules/.bin/jshint *.js lib test

test:
	./node_modules/.bin/mocha --recursive --require should --require isomorphic-fetch

.PHONY: check lint test
