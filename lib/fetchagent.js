module.exports = fetchagent;

['get', 'put', 'post', 'delete'].forEach(method => {
  fetchagent[method] = url => fetchagent(method.toUpperCase(), url);
});

fetchagent.del = fetchagent.delete;

function setAll(destination, source) {
  Object.keys(source).forEach(p => destination.set(p, source[p]));
}

function formatUrl(prefix, query) {
  function encode(v) {
    return Array.isArray(v) ? v.map(encodeURIComponent).join(',') : encodeURIComponent(v);
  }

  if (!query) {
    return prefix;
  }
  const qs = Object.keys(query)
    .map(name => `${name}=${encode(query[name])}`)
    .join('&');
  if (!qs) {
    return prefix;
  }
  return `${prefix}?${qs}`;
}

function defaultContentParser(contentType) {
  return contentType?.includes('json') ? 'json' : 'text';
}

function fetchagent(method, url) {
  const req = {
    url,
    query: undefined
  };
  const init = {
    method,
    redirect: 'manual',
    credentials: 'same-origin'
  };
  const self = {
    end,
    json,
    parser,
    query,
    redirect,
    signal,
    send,
    set,
    text
  };

  let error;
  let contentParser = defaultContentParser;

  function end(fn) {
    const fetched = fetch(formatUrl(req.url, req.query), init);

    if (!fn) {
      return fetched;
    }

    fetched
      .then(res => {
        if (!res.ok) {
          error = {
            status: res.status,
            response: res
          };
        }
        const parser = contentParser(res.headers.get('Content-Type'));
        if (parser) {
          return res[parser]();
        }
        if (!error) {
          error = {
            status: 'unknown Content-Type',
            response: res
          };
        }
      })
      .then(
        body => fn(error, body),
        e => {
          error ??= {};
          error.error = e;
          return fn(error);
        }
      );
  }

  function json() {
    return end().then(res => res.json());
  }

  function text() {
    return end().then(res => res.text());
  }

  function send(body) {
    if (_instanceof(body, 'Blob') || _instanceof(body, 'FormData') || typeof body !== 'object') {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      set('Content-Type', 'application/json');
    }
    return self;
  }

  function query(q) {
    req.query = q;
    return self;
  }

  function signal(s) {
    init.signal = s;
    return self;
  }

  function set(header, value) {
    if (!init.headers) {
      init.headers = new Headers();
    }
    if (typeof value === 'string') {
      init.headers.set(header, value);
    } else {
      setAll(init.headers, header);
    }
    return self;
  }

  function redirect(follow) {
    init.redirect = follow ? 'follow' : 'manual';
    return self;
  }

  function parser(fn) {
    contentParser = fn;
    return self;
  }

  return self;
}

function _instanceof(object, constructorName) {
  if (typeof globalThis === 'undefined') {
    return false;
  }
  const ctor = globalThis[constructorName];
  return typeof ctor === 'function' && object instanceof ctor;
}
