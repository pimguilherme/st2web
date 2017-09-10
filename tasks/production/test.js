'use strict';

var gulp = require('gulp')
  , settings = require('../../settings.json')
  , plugins = require('gulp-load-plugins')(settings.plugins)

  , argv = require('yargs').argv
  ;

gulp.task('test-production', gulp.series(['production'], function productionTesting(done) {
  var server = gulp.src('.')
    .pipe(plugins.webserver({
      host: '0.0.0.0',
      port: 3002
    }));

  plugins.env({
    vars: {
      PORT: 3002
    }
  });

  return gulp.src(argv['test-files'] || settings.production.tests, { read: false })
    .pipe(plugins.plumber())
    .pipe(plugins.mocha({
      reporter: 'dot',
      compilers: {
        js: require('babel-core/register')
      }
    }))
    .on('end', function () {
      server.emit('kill');
      return done();
    })
    .on('error', function (err) {
      return done(err);
    });
}));
