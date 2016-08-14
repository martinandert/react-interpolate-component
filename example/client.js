'use strict';

var React       = require('react');
var ReactDOM    = require('react-dom');
var Interpolate = require('../');

var PersonName = React.createClass({
  handleClick: function(e) {
    alert('You clicked on: ' + this.props.name);
  },

  render: function() {
    return <strong onClick={this.handleClick}>{this.props.name}</strong>;
  }
});

var PeopleList = React.createClass({
  render: function() {
    var items = this.props.people.map(function(person, i) {
      var name = <PersonName name={person.name} />;

      return <Interpolate key={i} className="foo" with={{ firstName: name, age: person.age }} component="li">{this.props.format}</Interpolate>;
    }.bind(this));

    return (
      <section>
        <h1>List of People</h1>
        <ul>{items}</ul>
      </section>
    );
  }
});

var App = React.createClass({
  render: function() {
    var people = [
      { name: 'Peter', age: 21 },
      { name: 'Paula', age: 47 },
      { name: 'Frank', age: 33 }
    ];

    var personFormat = '%(firstName)s is %(age)s years old.';
    var unsafeFormat = 'In this interpolated sentence, some <i>%(what)s has been used</i> as format.';

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>React Interpolate Component</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <script src="/bundle.js"></script>
        </head>

        <body>
          <PeopleList people={people} format={personFormat} />
          <Interpolate with={{ what: "HTML markup" }} component="p" format={unsafeFormat} unsafe />
        </body>
      </html>
    );
  }
});

if (typeof window !== 'undefined') {
  window.onload = function() {
    ReactDOM.render(<App />, document);
  };
}

module.exports = App;
