const gulp = require('gulp');
const del = require('del');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const tailwindcss = require('tailwindcss');
const gulpPug = require('gulp-pug');

function tailwindCss() {
  return gulp.src('src/styles/style.css')
    .pipe(postcss([tailwindcss(), autoprefixer(), cssnano()]))
    .pipe(gulp.dest('dist/styles'));
}

function fonts() {
  return gulp.src('src/fonts/**/*', { encoding: false })
    .pipe(gulp.dest('dist/fonts'));
}

function images() {
  return gulp.src('src/images/**/*', { encoding: false })
    .pipe(gulp.dest('dist/images'));
}

function clean() {
  return del('dist');
}

function js() {
  return gulp.src('src/js/**/*.js')
    .pipe(gulp.dest('dist/js'));
}

function pug() {
  return gulp.src('src/pages/**/*.pug')
    .pipe(gulpPug())
    .pipe(gulp.dest('dist/'));
}

function watchFiles() {
  gulp.watch(['src/**/*.pug'], pug);
  gulp.watch(['src/styles/**/*.css'], tailwindCss);
  gulp.watch(['src/images/**/*'], images);
  gulp.watch(['src/fonts/**/*'], fonts);
  gulp.watch(['tailwind.config.js'], tailwindCss);
  gulp.watch(['src/js/**/*.js'], js);
}

const build = gulp.series(clean, gulp.parallel(pug, tailwindCss, images, fonts, js));
const watch = gulp.parallel(build, watchFiles);

exports.build = build;
exports.watch = watch;
exports.default = watch;