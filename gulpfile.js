var gulp = require('gulp');
var del = require('del');
var cache = require('gulp-cached');
var argv = require('yargs').argv;
var uglify = require('gulp-uglify');
var pump = require('pump');
var merge = require('gulp-merge-json');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var cache = require('gulp-cached');
var replace = require('gulp-replace');
var autoprefixer = require('gulp-autoprefixer');
var platform = argv.platform == "firefox" ? "firefox" : "chrome";
var srcBase = "src/";
var deps = require("./" + srcBase + "deps/" + platform + ".json");
var distBase = "build/" + platform + "/";

var src = {
	css: srcBase + "css/**/*",
	html: srcBase + "html/**/*",
	img: srcBase + "img/**/*",
	js: srcBase + "js/**/*",
	lib: srcBase + "lib/**/*",
	manifest: srcBase + "manifest/**/*"
};

var srcKeys = Object.keys(src);

gulp.task("del", function(cb) {
	del.sync(distBase);
	cb();
});

gulp.task("html", function(cb) {

	pump([
		gulp.src(src.html),
		cache('html'),
		replace('{%CSS%}', function(match) {
			return deps.css ? deps.css.map(function(d) { return `<link href="${d}" rel="stylesheet">`}).join("") : "";
		}),
		replace('{%JS%}', function(match) {
			return deps.js ? deps.js.map(function(d) { return `<script src="${d}"></script>`}).join("") : "";
		}),
		htmlmin({collapseWhitespace: true}),
		gulp.dest(distBase)
	], cb);

});

gulp.task("img", function(cb) {

	pump([
		gulp.src(src.img),
		cache('img'),
		gulp.dest(distBase + "img")
	], cb);
	
});

gulp.task("css", function(cb) {

	pump([
		gulp.src(src.css),
		cache('css'),
		autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }),
		cleanCSS(),
		gulp.dest(distBase + "css")
	], cb);
	
});

gulp.task("js", function(cb) {

	pump([
		gulp.src(src.js),
		cache('js'),
		replace('{%PLATFORM%}', function(match) {
			return platform;
		}),
		replace('{%CLIENT_ID%}', function(match) {
			return argv.production ? deps.prod_client_id : deps.dev_client_id;
		}),
		uglify(),
		gulp.dest(distBase + "js")
	], cb);
	
});

gulp.task("lib", function(cb) {

	pump([
		gulp.src(src.lib),
		cache('lib'),
		gulp.dest(distBase + "lib")
	], cb);
	
});

gulp.task("manifest", function(cb) {

	pump([
		gulp.src([srcBase + "manifest/base.json", srcBase + "manifest/" + platform + ".json"]),
		cache('manifest'),
		merge({
			fileName: "manifest.json",		
		}),
		gulp.dest(distBase)
	], cb);
	
});

gulp.task("default", ["del"].concat(srcKeys), function() {
	
	srcKeys.forEach(function(k) {
		gulp.watch(src[k], [k]);
	});

});