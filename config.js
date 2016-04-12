/* jshint strict: false */
/* global module: true, __dirname: false, require: false */
var path = require('path');
module.exports = function() {
  var dist = 'dist';
  var bowerDir = 'bower_components/';

  return {
    dist:  dist,
    vendor: {
      js: [
        bowerDir + 'google-maps-utility-library-v3/markerclusterer/src/markerclusterer.js',
        bowerDir + 'easy-markerwithlabel/src/markerwithlabel.js'
      ]
    }
  };
};
