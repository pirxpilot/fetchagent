const test = require('node:test');
const fetchagent = require('../');

const Replay = require('@pirxpilot/replay');

Replay.fixtures = `${__dirname}/fixtures`;

test('should get some text', (t, done) => {
  fetchagent.get('http://httpbin.org/xml').end((err, response) => {
    t.assert.ifError(err);
    t.assert.equal(response.slice(0, 5), '<?xml');
    done();
  });
});

test('should post and receive json', async t => {
  const res = await fetchagent.post('http://httpbin.org/post').send({ echo: 42 }).json();
  t.assert.ok('json' in res);
  t.assert.equal(res.json.echo, 42);
});

test('should format query parameters', async t => {
  const res = await fetchagent
    .get('http://httpbin.org/get')
    .query({ echo: 42, ll: [14, 30], name: 'with space?' })
    .json();
  t.assert.deepEqual(res.args, {
    echo: '42',
    ll: '14,30',
    name: 'with space?'
  });
});

test('should ignore empty query', (_, done) => {
  fetchagent.get('http://httpbin.org/bytes/30').query({}).end(done);
});

test('should set request headers', async t => {
  const res = await fetchagent.get('http://httpbin.org/get').set('x-my-header', 'bongo').json();
  t.assert.ok('headers' in res);
  t.assert.equal(res.headers['X-My-Header'], 'bongo');
});

test('should automatically redirect', async t => {
  const res = await fetchagent.get('http://httpbin.org/redirect/2').redirect(true).json();
  t.assert.ok('url' in res);
});

test('should parse body even if status !== 200', (t, done) => {
  return fetchagent.get('http://httpbin.org/status/418').end((err, body) => {
    t.assert.match(body, /teapot/);
    t.assert.equal(err.status, 418);
    t.assert.ok('response' in err);
    done();
  });
});

test('should use custom parsing', (t, done) => {
  fetchagent
    .get('http://httpbin.org/bytes/30')
    .parser(contentType => {
      if (contentType === 'application/octet-stream') {
        // FIXME: we would like to test ArrayBuffer but it's not implemented by node-fetch yet
        // see: https://github.com/bitinn/node-fetch/issues/210
        // return 'arrayBuffer';
        return 'buffer';
      }
    })
    .end((err, body) => {
      t.assert.ifError(err);
      t.assert.ok(body instanceof Buffer);
      t.assert.equal(body.length, 30);
      done();
    });
});
