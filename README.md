# React Interpolate Component

A component for [React][1] that renders elements into a format string containing replacement fields. It comes in handy when working with dynamic text elements like localized strings of a translation library.


## Installation

Install via npm:

```bash
% npm install react-interpolate-component
```


## Usage

The Interpolate component expects as only child a format string containing the placeholders to be interpolated. Like the format syntax of `sprintf` with named arguments, a placeholder is depicted as `'%(' + placeholder_name + ')s'`.

The actual substitution elements are provided as props. These can be strings, numbers, dates, and even React components.

Here is a small exemplification:

```js
var React       = require('react');
var Interpolate = React.createFactory(require('react-interpolate-component'));

var MyApp = React.createClass({
  render: function() {
    var props = {
      firstName: React.DOM.strong(null, 'Paul'),
      age: 13,
      unit: 'years',
      component: 'p',  // default is a <span>
      className: 'foo'
    };

    var format = '%(firstName)s is %(age)s %(unit)s old.';

    return React.DOM.div(null, Interpolate(props, format));
  }
});
```

The MyApp component shown above renders the following (simplified) HTML:

```html
<div>
  <p class="foo">
    <strong>Paul</strong> is 13 years old.
  </p>
</div>
```

All props that are not interpolation arguments get transferred to Interpolate's container component (which is a `<span>` by default).

Alternatively to providing the format string as child, you can also set the `format` prop to the desired format:

```html
<Interpolate name="Martin" format="Hello, %(name)s!" />
```

For security reasons, all HTML markup present in the format string will be escaped. You can undermine this by providing a prop named "unsafe" which is set to `true`. There's one caveat when allowing unsafe format strings: You cannot use other React components as interpolation values.


## Example

The examples code is located at `example` directory. You can clone this repository and run `make install example` and point your web browser to
`http://localhost:3000`.


## Contributing

Here's a quick guide:

1. Fork the repo and `make install`.

2. Run the tests. We only take pull requests with passing tests, and it's great to know that you have a clean slate: `make test`.

3. Add a test for your change. Only refactoring and documentation changes require no new tests. If you are adding functionality or are fixing a bug, we need a test!

4. Make the test pass.

5. Push to your fork and submit a pull request.


## Licence

Released under The MIT License.



[1]: http://facebook.github.io/react/
