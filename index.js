'use strict';

var React     = require('react');
var invariant = require('react/lib/invariant');
var extend    = require('extend');

function isString(object) {
  return Object.prototype.toString.call(object) === '[object String]';
}

var REGEXP = /\%\((.+?)\)s/;

var Interpolate = React.createClass({
  displayName: 'Interpolate',

  propTypes: {
    children: React.PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return { component: React.DOM.span };
  },

  render: function() {
    var format = this.props.children;
    var parent = this.props.component;
    var unsafe = this.props.unsafe === true;
    var props  = extend({}, this.props);

    delete props.children;
    delete props.component;
    delete props.unsafe;

    invariant(isString(format), 'Interpolate expects a format string as only child');

    if (unsafe) {
      var content = format.split(REGEXP).reduce(function(memo, match, index) {
        var html;

        if (index % 2 === 0) {
          html = match;
        } else {
          html = props[match];
          delete props[match];
        }

        if (React.isValidComponent(html)) {
          throw new Error('cannot interpolate a React component into unsafe text');
        }

        memo += html;

        return memo;
      }, '');

      props.dangerouslySetInnerHTML = { __html: content };

      return parent(props);
    } else {
      var args = format.split(REGEXP).reduce(function(memo, match, index) {
        var child;

        if (index % 2 === 0) {
          if (match.length === 0) {
            return memo;
          }

          child = match;
        } else {
          child = props[match];
          delete props[match];
        }

        memo.push(child);

        return memo;
      }, [props]);

      return parent.apply(null, args);
    }
  }
});

module.exports = Interpolate;
