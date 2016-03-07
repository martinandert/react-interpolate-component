'use strict';

var React     = require('react');
var invariant = require('fbjs/lib/invariant');
var except    = require('except');

function isString(object) {
  return Object.prototype.toString.call(object) === '[object String]';
}

var REGEXP = /\%\((.+?)\)s/;
var OMITTED_PROPS = ['children', 'format', 'component', 'unsafe'];

var Interpolate = React.createClass({
  displayName: 'Interpolate',

  getDefaultProps: function() {
    return { component: 'span' };
  },

  render: function() {
    var format = this.props.children;
    var parent = this.props.component;
    var unsafe = this.props.unsafe === true;
    var props  = except(this.props, OMITTED_PROPS);

    var matches = [];
    var children = [];

    if (!isString(format)) {
      format = this.props.format;
    }

    invariant(isString(format), 'Interpolate expects either a format string as only child or a `format` prop with a string value');

    if (unsafe) {
      var content = format.split(REGEXP).reduce(function(memo, match, index) {
        var html;

        if (index % 2 === 0) {
          html = match;
        } else {
          html = props[match];
          matches.push(match);
        }

        if (React.isValidElement(html)) {
          throw new Error('cannot interpolate a React component into unsafe text');
        }

        memo += html;

        return memo;
      }, '');

      props.dangerouslySetInnerHTML = { __html: content };
    } else {
      format.split(REGEXP).reduce(function(memo, match, index) {
        var child;

        if (index % 2 === 0) {
          if (match.length === 0) {
            return memo;
          }

          child = match;
        } else {
          child = props[match];
          matches.push(match);
        }

        memo.push(child);

        return memo;
      }, children);
    }

    props = except(props, matches);

    return React.createElement.apply(this, [parent, props].concat(children));
  }
});

module.exports = Interpolate;
