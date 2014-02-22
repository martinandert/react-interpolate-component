'use strict';

var React     = require('react');
var invariant = require('react/lib/invariant');

var isArray = function(object) {
  return Object.prototype.toString.call(object) === '[object Array]';
};

var isString = function(object) {
  return Object.prototype.toString.call(object) === '[object String]';
};

var REGEXP = /\%\((.+?)\)s/;

var Interpolate = React.createClass({
  displayName: 'Interpolate',

  propTypes: {
    children: React.PropTypes.string
  },

  getDefaultProps: function() {
    return { component: React.DOM.span };
  },

  render: function() {
    var props  = this.props;
    var format = props.children || '';
    var parent = props.component;
    var unsafe = props.unsafe === true;

    invariant(
      isString(format) || isArray(format) && format.length === 1 && isString(format = format[0]),
      'Interpolate expects a format string as only child'
    );

    var children = format.split(REGEXP).reduce(function(memo, match, index) {
      var child = (index % 2 === 0) ? match : props[match];

      if (!React.isValidComponent(child)) {
        if (unsafe) {
          child = React.DOM.span({ dangerouslySetInnerHTML: { __html: child } });
        } else {
          child = React.DOM.span(null, child);
        }
      }

      memo['_' + index] = child;

      return memo;
    }, {});

    return this.transferPropsTo(parent(null, children));
  }
});

module.exports = Interpolate;
