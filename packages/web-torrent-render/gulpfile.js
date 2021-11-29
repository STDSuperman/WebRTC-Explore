const gulp = require("gulp");
const browserify = require("browserify");
const tsify = require("tsify");
const source = require("vinyl-source-stream");
const babelify = require("babelify");

gulp.task("default", function () {
  return browserify({
    basedir: ".",
    debug: true,
    entries: ["src/index.ts", "src/worker.ts"],
    cache: {},
    packageCache: {}
  })
    .plugin(tsify, { noImplicitAny: true })
    .transform(babelify.configure({
      presets: ["@babel/preset-env"],
      extensions: [".ts", '.js']
    }))
    .bundle()
    .on("error", e => console.log(e))
    .pipe(source("index.js"))
    .pipe(gulp.dest("dist"));
});