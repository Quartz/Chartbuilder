// Node modules
var browserSync = require("browser-sync");
var buffer = require("vinyl-buffer");
var del = require("del");
var nib = require("nib");
var reload = browserSync.reload;
var source = require("vinyl-source-stream");

// browserify
var browserify = require("browserify");
var envify = require("envify/custom");
var source = require("vinyl-source-stream");
var reactify = require("reactify");

// Gulp plugins
var base64 = require("gulp-css-base64");
var changed = require("gulp-changed");
var gulp = require("gulp");
var stylus = require("gulp-stylus");
var uglify = require("gulp-uglify");

// local modules
var config = require("./gulp/config");
var gutil = require("gulp-util")

gulp.task("stylus", function () {
	return gulp.src(config.paths.src.styl + "/main.styl")
		.pipe(stylus({
			use: [nib()],
			import: ["nib"],
			"include css": true,
			errors: true
		}))
		.pipe(base64({
			baseDir: "./src",
			maxWeightResource: 1000000
		}))
		.pipe(gulp.dest(config.paths.build.css))
		.pipe(reload({stream:true}));
});

gulp.task("stylus:core", ["clean-dist"], function () {
	return gulp.src(config.paths.src.styl + "/core.styl")
		.pipe(stylus({
			use: [nib()],
			"include css": true,
			errors: true
		}))
		.pipe(base64({
			baseDir: "./src",
			maxWeightResource: 1000000
		}))
		.pipe(gulp.dest(config.paths.dist.css));
});

gulp.task("browserify:dev", function () {
	var bundler = browserify(config.paths.src.js + "/index.js", {
		debug: true
	})
	.transform(envify({ NODE_ENV: "dev" }));

	return bundler.bundle()
		.pipe(source("main.js"))
		.pipe(gulp.dest(config.paths.build.js))
		.pipe(reload({ stream:true }));
});

gulp.task("browserify:test", function () {
	var bundler = browserify("./test/test-page/main.js", {
				debug: true
			})
			.transform(envify({ NODE_ENV: "dev" }));

	return bundler.bundle()
		.pipe(source("main.js"))
		.pipe(gulp.dest(config.paths.build.js))
		.pipe(reload({ stream: true }));
});

gulp.task("browserify:prod", function () {
	var bundler = browserify(config.paths.src.js + "/index.js")
			.transform(envify({ NODE_ENV: "prod" }));

	return bundler.bundle()
		.pipe(source("main.js"))
		.pipe(buffer())
		.pipe(uglify().on("error", gutil.log))
		.pipe(gulp.dest(config.paths.build.js));
});


gulp.task("clean", function (done) {
	del([
		config.dirs.tmp + "/**",
		config.dirs.build + "/**"
	]).then(function(paths) {
		done();
	});
});

gulp.task("clean-dist", function (done) {
	del([ config.dirs.dist + "/**" ]).then(function(paths) {
		done()
	});
});

gulp.task("copy-htdocs", function () {
	return gulp.src(config.paths.src.htdocs + "/**")
		.pipe(changed(config.dirs.build))
		.pipe(gulp.dest(config.dirs.build))
		.pipe(reload({ stream: true }));
});

gulp.task("copy-test-htdocs", function () {
	return gulp.src("test/test-page/index.html")
		.pipe(changed(config.dirs.build))
		.pipe(gulp.dest(config.dirs.build))
		.pipe(reload({ stream: true }));
});

gulp.task("copy-fonts", function () {
	return gulp.src(config.paths.src.fonts + "/**")
		.pipe(changed(config.paths.build.fonts))
		.pipe(gulp.dest(config.paths.build.fonts))
		.pipe(reload({ stream: true }));
});

gulp.task("copy-assets", function () {
	return gulp.src(config.paths.src.assets + "/**")
		.pipe(changed(config.paths.build.assets))
		.pipe(gulp.dest(config.paths.build.assets))
		.pipe(reload({ stream: true }));
});

gulp.task("browser-sync", ["watch"], function () {
	browserSync({
		server: { baseDir: "build" },
		open: false
	});
});

gulp.task("browser-sync-test", ["test-page-setup"], function () {
	browserSync({
		server: { baseDir: "build" },
		open: false
	});
});

// Serve files, watch for changes and update
gulp.task("watch", [
	"browserify:dev",
	"stylus",
	"copy-htdocs",
	"copy-fonts",
	"copy-assets"
], function (done) {
	gulp.watch(config.paths.src.js + "/**", ["browserify:dev"]);
	gulp.watch(config.paths.src.styl + "/**", ["stylus"]);
	gulp.watch(config.paths.src.htdocs + "/**", ["copy-htdocs"]);
	gulp.watch("./node_modules/d4/d4.js", ["browserify:dev"]);
	gulp.watch("./node_modules/d3/d3.js", ["browserify:dev"]);
	done();
});

// build for production
gulp.task("_build", [
	"browserify:prod",
	"stylus",
	"stylus:core",
	"copy-htdocs",
	"copy-fonts",
	"copy-assets"
]);

gulp.task("test-page-setup", [
	"browserify:test",
	"stylus",
	"copy-test-htdocs",
	"copy-fonts",
	"copy-assets"
], function(done) {
	gulp.watch("test/**", ["browserify:test"]);
	gulp.watch(config.paths.src.js + "/**", ["browserify:test"]);
	gulp.watch("test/test-page/index.html", ["copy-test-htdocs"]);
	gulp.watch(config.paths.src.styl + "/**", ["stylus"]);
	gulp.watch("./node_modules/d4/d4.js", ["browserify:dev"]);
	gulp.watch("./node_modules/d3/d3.js", ["browserify:dev"]);
	done();
});

gulp.task("default", ["clean"], function () {
	gulp.start("browser-sync");
});

gulp.task("test-page", ["clean"], function() {
	gulp.start("browser-sync-test");
});

gulp.task("build", ["clean"], function() {
	gulp.start("_build");
});

gulp.task("gh-pages", function() {
	return gulp.src("./build/**/*")
		.pipe(require("gulp-gh-pages")());
});
