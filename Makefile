check: lint test

lint:
	./node_modules/.bin/biome ci

format:
	./node_modules/.bin/biome check --fix

test:
	node \
		--no-experimental-fetch \
		--require should \
		--require jsdom-global/register \
		--require isomorphic-fetch \
		--test

.PHONY: check format lint test
