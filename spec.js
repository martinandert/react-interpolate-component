var assert      = require('assert');
var React       = require('react');
var Interpolate = require('./');
var render      = React.renderComponentToString;

// hack: suppress React console warnings
console.warn = function() {};

assert.matches = function(actual, expected, message) {
  if (!expected.test(actual)) {
    assert.fail(actual, expected, message, '!~');
  }
};

assert.doesNotMatch = function(actual, expected, message) {
  if (expected.test(actual)) {
    assert.fail(actual, expected, message, '=~');
  }
};

describe('The Interpolate component', function() {
  it('transfers props to the container component', function() {
    var markup = render(Interpolate({ className: 'foo' }, 'bar'));
    assert.matches(markup, /^<span [^>]*?class="foo"/);
  });

  it('allows a custom container component to be set as prop', function() {
    var markup = render(Interpolate({ component: React.DOM.section }, 'bar'));
    assert.matches(markup, /^<section/);
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
    var props  = { foo: "bar", number: 42, comp: React.DOM.i(null, 'baz'), no: 'NO' };
    var format = 'lala %(foo)s lulu %(comp)s lili %(number)s lele';
    var markup = render(Interpolate(props, format));

    assert.matches(markup, /lala .*?bar.*? lulu .*?baz.*? lili .*?42.*? lele/);
    assert.doesNotMatch(markup, /%\(|\)s|foo|comp|number|no|NO/);
  });

  it('escapes HTML markup in the format string by default', function() {
    var format = 'foo <script>alert("Danger!");</script> bar';
    var markup = render(Interpolate(null, format));

    assert.doesNotMatch(markup, /<\/?script>/);
  });

  describe('when providing an `unsafe` prop set to `true`', function() {
    it('renders HTML markup present in the format string', function() {
      var format = 'foo <script>alert("%(alert)s");</script> bar';
      var markup = render(Interpolate({ unsafe: true, alert: 'Danger!' }, format));

      assert.matches(markup, /<script>alert\("Danger!"\);<\/script>/);
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
