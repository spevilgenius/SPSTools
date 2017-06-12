"use strict";

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var flexfixer = require('postcss-flexbugs-fixes');
var sass = require('gulp-sass')
var gulp = require('gulp');
var path = require('path2');
var header = require('gulp-header');

var
    packageFile = 'package.json',
    pkg = require('./' + packageFile),
    paths = {
        scripts: ['src/scripts/**/*.js'],
        sass: ['src/styles/**/*.scss'],
        docs: ['src/docs/**/*.md'],
        dist: ['dist/**/*']
    },
    banner = "/*\n" +
        "* <%= pkg.name %> - <%= pkg.description_short %>\n" +
        "* Version <%= pkg.version %>\n" +
        "* @requires <%= pkg.requires %>\n" +
        "*\n" +
        "* Copyright (c) <%= pkg.copyright %>\n" +
        "* <%= pkg.homepage %>\n" +
        "* Licensed under the MIT license:\n" +
        "* http://www.opensource.org/licenses/mit-license.php\n" +
        "*/\n" +
        "/*\n" +
        "* @description <%= pkg.description_long %>\n" +
        "* @name <%= pkg.name %>\n" +
        "* @author <%= pkg.authors %>\n" +
        "*/\n";

gulp.task('default', ['watch']);

gulp.task('config', function () {
    fs = require("fs2");
    pkg = fs.readFileSync(packageFile, "utf8");
    gutil.log(pkg.toString());
});

gulp.task('clean:build', function () {
    // You can use multiple globbing patterns.
    return del(['dist']);
});

// configure the jshint task
gulp.task('jshint', function () {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build-css', function () {
    return gulp.src(paths.sass)
        .pipe(sass())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(postcss([autoprefixer]))
        .pipe(postcss([flexfixer]))
        .pipe(gulp.dest('dist/assets/styles'));
});

gulp.task('build-js', function () {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(concat('jQuery.SPGizmos-' + pkg.version + '.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/assets/javascript'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function () {
    gulp.watch('src/styles/**/*.scss', ['build-css']);
});