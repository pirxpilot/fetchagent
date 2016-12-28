var should = require('should');
var fetchagent = require('../');

var Replay = require('replay');

Replay.fixtures = __dirname + '/fixtures';

describe('fetchagent', function () {

  it('should get some text', function(done) {
    fetchagent
      .get('http://httpbin.org/xml')
      .end(function(err, response) {
        should.not.exist(err);
        response.should.startWith('<?xml');
        done();
      });
  });

  it('should post and receive json', function() {
    return fetchagent
      .post('http://httpbin.org/post')
      .send({ echo: 42 })
      .json()
      .should.finally.have
        .property('json')
        .property('echo', 42);
  });

  it('should format query parameters', function() {
    return fetchagent
      .get('http://httpbin.org/get')
      .query({ echo: 42, ll: [14, 30], name: 'with space?' })
      .json()
      .should.finally.have
        .property('args', {
          echo: '42',
          ll: '14,30',
          name: 'with space?'
        });
  });

  it('should set request headers', function() {
    return fetchagent
      .get('http://httpbin.org/get')
      .set('x-my-header', 'bongo')
      .json()
      .should.finally.have
        .property('headers')
        .property('X-My-Header', 'bongo');
  });

  it('should automatically redirect', function () {
    return fetchagent
      .get('http://httpbin.org/redirect/2')
      .redirect(true)
      .json()
      .should.finally.have
        .property('url');
  });
});
