var assert      = require('assert');
var React       = require('react');
var Interpolate = require('./');
var render      = React.renderComponentToString;

// hack: suppress React console warnings
console.warn = function() {};

assert.matches = function(regexp, value, message) {
  if (!regexp.test(value)) {
    assert.fail(value, regexp, message, '=~');
  }
};

assert.doesNotMatch = function(regexp, value, message) {
  if (regexp.test(value)) {
    assert.fail(value, regexp, message, '!~');
  }
};

describe('The Interpolate component', function() {
  it('does not mutate props', function() {
    var props  = { className: 'foo', name: 'bar', value: 'baz', children: '%(name)s: %(value)s' };
    var markup = render(Interpolate(props));

    assert.deepEqual(props, { className: 'foo', name: 'bar', value: 'baz', children: '%(name)s: %(value)s' });

    props.unsafe = true;
    markup = render(Interpolate(props));

    assert.deepEqual(props, { className: 'foo', name: 'bar', value: 'baz', children: '%(name)s: %(value)s', unsafe: true });
  });

  it('transfers props to the container component that are not interpolation names', function() {
    var props  = { className: 'foo', name: 'bar', value: 'baz' };
    var format = '%(name)s: %(value)s';
    var markup = render(Interpolate(props, format));

    assert.matches(/^<span [^>]*?class="foo"/, markup);
    assert.doesNotMatch(/\sname="/, markup);
    assert.doesNotMatch(/\svalue="/, markup);

    props.unsafe = true;
    markup = render(Interpolate(props, format));

    assert.matches(/^<span [^>]*?class="foo"/, markup);
    assert.doesNotMatch(/\sname="/, markup);
    assert.doesNotMatch(/\svalue="/, markup);
  });

  it('renders a `span` HTML element as container by default', function() {
    var markup = render(Interpolate(null, 'bar'));
    assert.matches(/^<span\s/, markup);
  });

  it('allows a custom container component to be set as prop', function() {
    var markup = render(Interpolate({ component: React.DOM.section }, 'bar'));
    assert.matches(/^<section\s/, markup);
  });

  it('rejects everything as child that is not a string', function() {
    // How can something like this be properly testet?
    [undefined, null, {}, [], function() {}, new Date, true, 123].forEach(function(object) {
      assert.throws(function() { render(Interpolate(null, object)); }, /invariant/i);
    });
  });

  it('allows an empty string as a child', function() {
    assert.doesNotThrow(function() {
      render(Interpolate(null, ''));
    });
  });

  it('interpolates properly', function() {
    var props  = { foo: 'bar', number: 42, comp: React.DOM.i(null, 'baz'), no: 'NO' };
    var format = 'lala %(foo)s lulu %(comp)s lili %(number)s lele';
    var markup = render(Interpolate(props, format));

    assert.matches(/lala .*?bar.*? lulu .*?baz.*? lili .*?42.*? lele/, markup);
    assert.doesNotMatch(/%\(|\)s|foo|comp|number|no|NO/, markup);
  });

  it('escapes HTML markup in the format string by default', function() {
    var format = 'foo <script>alert("Danger!");</script> bar';
    var markup = render(Interpolate(null, format));

    assert.doesNotMatch(/<\/?script>/, markup);
  });

  describe('when providing an `unsafe` prop set to `true`', function() {
    it('renders HTML markup present in the format string', function() {
      var format = 'foo <script>alert("%(alert)s");</script> bar';
      var markup = render(Interpolate({ unsafe: true, alert: 'Danger!' }, format));

      assert.matches(/<script>alert\("Danger!"\);<\/script>/, markup);
    });

    it('throws an error when interpolating React components', function() {
      var format = 'foo <p>%(para)s</p> bar';

      assert.throws(function() {
        render(Interpolate({ unsafe: true, para: React.DOM.span(null, 'baz') }, format));
      }, /cannot interpolate/i);
    });
  });

  it('is cool', function() {
    assert(true);
  });
});
