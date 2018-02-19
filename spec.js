var assert = require('assert');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Interpolate = React.createFactory(require('./'));
var render = ReactDOM.renderToString;
var createReactClass = require('create-react-class');

// hack: raise React console warnings as failed assertions
console.error = function(message) {
  assert(false, message);
};

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
    var props  = { className: 'foo', with: { name: 'bar', value: 'baz' }, children: '%(name)s: %(value)s' };
    var markup = render(Interpolate(props));

    assert.deepEqual(props, { className: 'foo', with: { name: 'bar', value: 'baz' }, children: '%(name)s: %(value)s' });

    props.unsafe = true;
    markup = render(Interpolate(props));

    assert.deepEqual(props, { className: 'foo', with: { name: 'bar', value: 'baz' }, children: '%(name)s: %(value)s', unsafe: true });
  });

  it('transfers those props to the container component that are not interpolation arguments', function() {
    var props  = { className: 'foo', with: { name: 'bar', value: 'baz' } };
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
    var markup = render(Interpolate({ component: 'section' }, 'bar'));
    assert.matches(/^<section\s/, markup);
  });

  it('allows a `format` prop instead of children', function() {
    assert.doesNotThrow(function() {
      render(Interpolate({ format: 'foo' }));
    });
  });

  it('handles using the same named interpolation argument more than once correctly', function() {
    var props  = { with: { arg: 'test' } };
    var format = 'foo %(arg)s bar %(arg)s baz';
    var markup = render(Interpolate(props, format));

    assert.matches(/foo.*?test.*?bar.*?test.*?baz/, markup);

    props.unsafe = true;
    markup = render(Interpolate(props, format));

    assert.matches(/foo test bar test baz/, markup);
    assert.doesNotMatch(/undefined/, markup);
  });

  it('has a working example in the README', function() {
    var React       = require('react');
    var Interpolate = React.createFactory(require('./'));

    var MyApp = createReactClass({
      render: function() {
        var props = {
          with: {
            firstName: React.createElement('strong', null, 'Paul'),
            age: 13,
            unit: 'years'
          },
          component: 'p',  // default is a <span>
          className: 'foo'
        };

        var format = '%(firstName)s is %(age)s %(unit)s old.';

        return React.createElement('div', null, Interpolate(props, format));
      }
    });

    var markup = render(React.createFactory(MyApp)());
    assert.matches(
      /<div[^>]+><p.*?class="foo"[^>]*><strong>Paul<\/strong>.*? is .*?13.*? .*?years.*? old\..*?<\/p><\/div>/,
      markup
    );
  });

  it('rejects everything as format that is not a string', function() {
    // How can something like this be properly testet?
    [undefined, null, {}, [], function() {}, new Date, true, 123].forEach(function(object) {
      assert.throws(function() { render(Interpolate(null, object)); }, /invariant/i);
      assert.throws(function() { render(Interpolate({ format: object })); }, /invariant/i);
    });
  });

  describe('with format set as child', function() {
    it('interpolates properly', function() {
      var props = {
        with: { foo: 'bar', number: 42, comp: React.createElement('i', null, 'baz') }
      };
      var format = 'lala %(foo)s lulu %(comp)s lili %(number)s lele';
      var markup = render(Interpolate(props, format));

      assert.matches(/lala .*?bar.*? lulu .*?baz.*? lili .*?42.*? lele/, markup);
      assert.doesNotMatch(/%\(|\)s|foo|comp|number/, markup);
    });

    it('interpolates properly when child is an empty string', function() {
      var props  = { component: 'div' };
      var markup = render(Interpolate(props, ''));

      assert.matches(/<div[^>]*><\/div>/, markup);
    });
  });

  describe('with format set as prop', function() {
    it('interpolates properly', function() {
      var props = {
        with: { foo: 'bar', number: 42, comp: React.createElement('i', null, 'baz') },
        format: 'lala %(foo)s lulu %(comp)s lili %(number)s lele'
      };
      var markup = render(Interpolate(props));

      assert.matches(/lala .*?bar.*? lulu .*?baz.*? lili .*?42.*? lele/, markup);
      assert.doesNotMatch(/%\(|\)s|foo|comp|number/, markup);
    });

    it('interpolates properly when prop is an empty string', function() {
      var props  = { component: 'div', format: '' };
      var markup = render(Interpolate(props));

      assert.matches(/<div[^>]*><\/div>/, markup);
    });
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
        render(
          Interpolate(
            { unsafe: true, para: React.createElement('span', null, 'baz') },
            format
          )
        );
      }, /cannot interpolate/i);
    });
  });
});
