'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var ResourceContext = React.createContext(null);

// import createModel from 'model/create'

var index = {
  ResourceProvider: ResourceProvider,
  ResourceContext: ResourceContext
};

module.exports = index;
