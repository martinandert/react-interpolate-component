'use strict';

var React           = require('react');
var invariant       = require('react/lib/invariant');
var cloneWithProps  = require('react/lib/cloneWithProps');

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
    var format = this.props.children || '';
    var parent = this.props.component;
    var unsafe = this.props.unsafe === true;

    invariant(
      isString(format) || isArray(format) && format.length === 1 && isString(format = format[0]),
      'Interpolate expects a format string as only child'
    );

    var children = format.split(REGEXP).map(function(match, index) {
      var child = (index % 2 === 0) ? match : this.props[match];

      if (React.isValidComponent(child)) {
        child = cloneWithProps(child, { key: index });
      } else {
        if (unsafe) {
          child = React.DOM.span({ key: index, dangerouslySetInnerHTML: { __html: child } });
        } else {
          child = React.DOM.span({ key: index }, child);
        }
      }

      return child;
    }, this);

    return this.transferPropsTo(parent(null, children));
  }
});

module.exports = Interpolate;
