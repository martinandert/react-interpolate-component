/** @jsx React.DOM */

var React       = require('react');
var Interpolate = require('../');

var PeopleList = React.createClass({
  render: function() {
    var items = this.props.people.map(function(person, i) {
      var name = <strong>{person.name}</strong>;

      return <Interpolate key={i} className="foo" firstName={name} age={person.age} component={React.DOM.li}>{this.props.format}</Interpolate>;
    }.bind(this));

    return <ul>{items}</ul>;
  }
});

var App = React.createClass({
  render: function() {
    var people = [
      { name: 'Peter', age: 21 },
      { name: 'Paula', age: 47 },
      { name: 'Frank', age: 33 }
    ];

    var format = "%(firstName)s is %(age)s years old.";

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>React Interpolate Component</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <script src="/bundle.js"></script>
        </head>

        <body>
          <h1>List of People</h1>
          <PeopleList people={people} format={format} />
        </body>
      </html>
    );
  }
});

if (typeof window !== 'undefined') {
  window.onload = function() {
    React.renderComponent(<App />, document);
  }
}

module.exports = App;
