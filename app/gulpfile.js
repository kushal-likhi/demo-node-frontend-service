'use strict';

/**
 * Gulp File to automate tasks.
 * This is the main file which is loaded by gulp.
 * */

//Load dependencies
var gulp = require('gulp');
require('require-dir')('./gulp');

//Define the default task
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
