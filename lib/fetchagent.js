/* global Headers */

module.exports = fetchagent;

['get', 'put', 'post', 'delete'].forEach(function(method) {
  fetchagent[method] = function(url) {
    return fetchagent(method.toUpperCase(), url);
  };
});

fetchagent.del = fetchagent.delete;

function setAll(destination, source) {
  Object.keys(source).forEach(function(p) {
    destination.set(p, source[p]);
  });
}

function formatUrl(prefix, query) {
  function encode(v) {
    return Array.isArray(v)
      ? v.map(encodeURIComponent).join(',')
      : encodeURIComponent(v);
  }

  if (!query) {
    return prefix;
  }
  var qs = Object
    .keys(query)
    .map(function(name) { return name + '=' + encode(query[name]); })
    .join('&');
  return prefix + '?' + qs;
}

function fetchagent(method, url) {
  var req = {
    url: url,
    query: undefined
  };
  var init = {
    method: method,
    redirect: 'manual',
    credentials: 'same-origin'
  };
  var self = {
    end: end,
    json: json,
    query: query,
    redirect: redirect,
    send: send,
    set: set,
    text: text
  };
  var error;

  function end(fn) {
    var fetched = fetch(formatUrl(req.url, req.query), init);

    if (!fn) {
      return fetched;
    }

    fetched
      .then(function(res) {
        var contentType = res.headers.get('Content-Type');
        if (!res.ok) {
          error = {
            status: res.status,
            response: res
          };
        }
        return contentType && contentType.indexOf('json') !== -1
          ? res.json()
          : res.text();
      })
      .then(function(body) { return fn(error, body); })
      .catch(function(err) { return fn(err); } );
  }

  function json() {
    return end().then(function(res) { return res.json(); });
  }

  function text() {
    return end().then(function(res) { return res.text(); });
  }

  function send(body) {
    if (typeof body === 'object') {
      set('Content-Type', 'application/json');
      init.body = JSON.stringify(body);
    } else {
      init.body = body;
    }
    return self;
  }

  function query(q) {
    req.query = q;
    return self;
  }

  function set(header, value) {
    if (!init.headers) {
      init.headers = new Headers();
    }
    if (typeof value === 'string') {
      init.headers.set(header, value);
    }
    else  {
      setAll(init.headers, header);
    }
    return self;
  }

  function redirect(follow) {
    init.redirect = follow ? 'follow' : 'manual';
    return self;
  }

  return self;
}
