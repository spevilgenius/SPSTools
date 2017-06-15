"use strict";

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var flexfixer = require('postcss-flexbugs-fixes');
var sass = require('gulp-sass')
var gulp = require('gulp');
var path = require('path2');
var header = require('gulp-header');
var del = require('del');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var metalsmith = require('metalsmith');
var msMarkdown = require('metalsmith-markdown');
var msReplace = require('metalsmith-text-replace');
var msRegisterHelpers = require('metalsmith-register-helpers');
var msLayouts = require('metalsmith-layouts');
var msCollections = require('metalsmith-collections');
var msCollectionMetadata = require('metalsmith-collection-metadata');
var msNavigation = require('metalsmith-navigation');
var msWatch = require('metalsmith-watch');
var msIgnore = require('metalsmith-ignore');
var msAssets = require('metalsmith-assets');

var
    packageFile = 'package.json',
    pkg = require('./' + packageFile),
    paths = {
        scripts: ['src/scripts/**/*.js'],
        sass: ['src/styles/**/*.scss'],
        bootsass: ['node_modules/bootstrap-v4-dev/scss/bootstrap.scss'],
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

//gulp.task('default', ['watch']);

gulp.task('styles', function () {
    return gulp.src(paths.bootsass)
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([autoprefixer]))
        .pipe(postcss([flexfixer]))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('config', function () {
    fs = require("fs2");
    pkg = fs.readFileSync(packageFile, "utf8");
    gutil.log(pkg.toString());
});

gulp.task('clean:build', function () {
    // You can use multiple globbing patterns.
    return del(['dist']);
});

gulp.task('clean:examples', function () {
    // You can use multiple globbing patterns.
    return del(['dist/examples/**/*']);
});

gulp.task('clean:docs', function () {
    return del(['dist/docs/**/*']);
});

gulp.task('docs', ['clean:docs'], function () {

    return metalsmith(__dirname)
        .metadata({
            site: {
                title: pkg.name,
                description: pkg.description_long
            },
            version: pkg.version,
            copyright: pkg.copyright,
            repository: pkg.repository.url,
            license: pkg.license
        })
        .source('./docs')
        .clean(false) // Don't delete files while Gulp tasks are running
        .destination('./dist/docs')
        .use(msWatch({
            paths: {
                '${source}/**/*': true, // Rebuild an individual file when it is changed
                "docs/**/*.md": "**/*.md", // Rebuild all .md files when a .md file is changed
                "docs/layouts/**/*.*": "**/*.md" // Rebuild all .md files when a template file is changed
            }
        }))
        .use(msIgnore('layouts/**/*')) // Don't output template files in dist/docs
        .use(msMarkdown())
        .use(msReplace({
            '**/*.html': [
                {
                    find: /.md"/gi,
                    replace: '.html"'
                },
                {
                    find: /.md#/gi,
                    replace: '.html#'
                },
                {
                    find: /<table>/gi,
                    replace: '<table class="table">' // Bootstrap table class
                },
                {
                    find: /<code class="lang-/gi,
                    replace: '<code class="language-' // Prism.js classes are prefixed with language- instead of -lang
                }
            ]
        }))
        .use(msCollections({
            'All': {
                pattern: '**/*' // Used by msCollectionMetadata
            }
        }))
        .use(msCollectionMetadata({
            'collections.All': {
                nav_group_global: 'global' // Add all pages to 'global' nav; this ensure that every page has a 'nav_path' property
            }
        }))
        .use(msNavigation({
            global: {
                filterProperty: 'nav_group_global',
                sortBy: 'nav_sort',
                breadcrumbProperty: 'breadcrumb_path'
            },
            primary: {
                filterProperty: 'nav_group',
                sortBy: 'nav_sort'
            },
            featured: {
                filterProperty: 'nav_group',
                sortBy: 'nav_sort'
            }
        }))
        .use(msRegisterHelpers({
            directory: 'docs/layouts/helpers'
        }))
        .use(msLayouts({
            engine: 'handlebars',
            directory: 'docs/layouts',
            partials: 'docs/layouts/partials',
            default: 'main.hbs'
        }))
        .use(msAssets({
            'source': './docs/assets',
            'destination': 'assets'
        }))
        .build(function (err) {
            if (err) {
                throw err;
            }
        });
});

gulp.task('examples', ['clean:examples'], function () {
    return metalsmith(__dirname)
        .metadata({
            site: {
                title: pkg.name,
                description: pkg.description_long
            },
            version: pkg.version,
            copyright: pkg.copyright,
            repository: pkg.repository.url,
            license: pkg.license
        })
        .source('./examples')
        .clean(false) // Don't delete files while Gulp tasks are running
        .destination('./dist/examples')
        .use(msIgnore('layouts/**/*')) // Don't output template files in dist/docs
        //.use(msIgnore('assets/**/*.js')) // Don't muck with the javascript files
        .use(msMarkdown())
        .use(msReplace({
            '**/*.html': [
                {
                    find: /.md"/gi,
                    replace: '.html"'
                },
                {
                    find: /.md#/gi,
                    replace: '.html#'
                },
                {
                    find: /<table>/gi,
                    replace: '<table class="table">' // Bootstrap table class
                },
                {
                    find: /<code class="lang-/gi,
                    replace: '<code class="language-' // Prism.js classes are prefixed with language- instead of -lang
                }
            ]
        }))
        .use(msCollections({
            'All': {
                pattern: '**/*' // Used by msCollectionMetadata
            }
        }))
        .use(msCollectionMetadata({
            'collections.All': {
                nav_group_global: 'global' // Add all pages to 'global' nav; this ensure that every page has a 'nav_path' property
            }
        }))
        .use(msNavigation({
            global: {
                filterProperty: 'nav_group_global',
                sortBy: 'nav_sort',
                breadcrumbProperty: 'breadcrumb_path'
            },
            primary: {
                filterProperty: 'nav_group',
                sortBy: 'nav_sort'
            },
            featured: {
                filterProperty: 'nav_group',
                sortBy: 'nav_sort'
            }
        }))
        .use(msRegisterHelpers({
            directory: 'examples/layouts/helpers'
        }))
        .use(msLayouts({
            engine: 'handlebars',
            directory: 'examples/layouts',
            partials: 'examples/layouts/partials',
            default: 'examples.hbs'
        }))
        .use(msAssets({
            'source': './examples/assets',
            'destination': 'assets'
        }))
        .build(function (err) {
            if (err) {
                throw err;
            }
        });
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
        .pipe(concat('jQuery.SPSTools-' + pkg.version + '.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/assets/javascript'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function () {
    gulp.watch('src/styles/**/*.scss', ['build-css']);
    //gulp.watch('node_modules/bootstrap-v4-dev/scss/bootstrap.scss', ['styles']);
});