// JSHint stuffs:
/* global process: false, require: false */
/* jshint strict: false */

var gulp              = require('gulp'),
    gutil             = require('gulp-util'),
    path              = require('path'),
    del               = require('del'),
    concat            = require('gulp-concat'),
    seq               = require('run-sequence'),
    streamqueue       = require('streamqueue');

/*==================================================
=                    Config                        =
===================================================*/
var configFn = require('./config');
var config = configFn();


/*====================================================================
=            Compile and minify js generating source maps            =
====================================================================*/

gulp.task('js', function(done) {
  streamqueue(
    { objectMode: true },
    gulp.src(config.vendor.js),
    gulp.src(['./google-map-manager.js'])
  )
  .pipe(concat('google-map-manager.js'))
  .pipe(gulp.dest(path.join(config.dist)))
  .on('end', function() {
    done();
  });
});

/*=================================
=       Clean dist folder         =
==================================*/

gulp.task('clean', function () {
  del(config.dist);
});


/*========================================================================
=                            Build Sequence                              =
=========================================================================*/

gulp.task('build', function(done) {
  gutil.log(gutil.colors.yellow('Running build...'));
  seq('clean', 'js', done);
});