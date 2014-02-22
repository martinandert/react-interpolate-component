var assert      = require('assert');
var React       = require('react');
var Interpolate = require('./');
var render      = React.renderComponentToString;

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

  it('allows no child to be provided', function() {
    assert.doesNotThrow(function() {
      render(Interpolate());
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

    assert.matches(markup, /lala/);
    assert.matches(markup, /lulu/);
    assert.matches(markup, /lili/);
    assert.matches(markup, /lele/);

    assert.matches(markup, /bar/);
    assert.matches(markup, /42/);
    assert.matches(markup, /<i [^>]*>baz<\/i>/);

    assert.doesNotMatch(markup, /%\(/);
    assert.doesNotMatch(markup, /\)s/);
    assert.doesNotMatch(markup, /foo/);
    assert.doesNotMatch(markup, /comp/);
    assert.doesNotMatch(markup, /number/);
    assert.doesNotMatch(markup, /no/);
    assert.doesNotMatch(markup, /NO/);
  });

  it('escapes HTML markup in the format string by default', function() {
    var format = 'foo <script>alert("Danger!");</script> bar';
    var markup = render(Interpolate(null, format));

    assert.doesNotMatch(markup, /<\/?script>/);
  });

  describe('when providing an `unsafe` prop which is set to `true`', function() {
    it('renders HTML markup present in the format string', function() {
      var format = 'foo <script>alert("dangerous!");</script> bar';
      var markup = render(Interpolate({ unsafe: true }, format));

      assert.matches(markup, /<script>alert\("dangerous!"\);<\/script>/);
    });
  });

  it('is cool', function() {
    assert(true);
  });
});
