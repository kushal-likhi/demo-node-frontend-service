'use strict';

var gulp = require('gulp');

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('web-app/public/**/*.scss')
        .pipe(wiredep({
            directory: 'web-app/public/bower_components',
            fileTypes: {
                html: {
                    replace: {
                        js: '<script src="/{{filePath}}"></script>',
                        css: '<link rel="stylesheet" href="/{{filePath}}" />'
                    }
                }
            }
        }))
        .pipe(gulp.dest('web-app/public'));

    gulp.src('web-app/public/**/*.html')
        .pipe(wiredep({
            directory: 'web-app/public/bower_components',
            exclude: [],
            fileTypes: {
                html: {
                    replace: {
                        js: '<script src="/{{filePath}}"></script>',
                        css: '<link rel="stylesheet" href="/{{filePath}}" />'
                    }
                }
            }
        }))
        .pipe(gulp.dest('web-app/public'));
});
