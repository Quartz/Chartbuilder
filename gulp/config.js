var path = require('path');

var dirs = {
	build: './build',
	tmp: './.tmp',
	src: './src',
	dist: './dist'
};

var paths = {
	src: {
		img: dirs.src + '/img',
		htdocs: dirs.src + '/htdocs',
		js: dirs.src + '/js',
		styl: dirs.src + '/styl',
		fonts: dirs.src + '/fonts',
		assets: dirs.src + '/assets'
	},
	tmp: {
		css: dirs.tmp + '/css',
		img: dirs.tmp + '/img',
		js: dirs.tmp + '/js',
		fonts: dirs.tmp + '/fonts',
		assets: dirs.tmp + '/assets'
	},
	build: {
		css: dirs.build + '/css',
		img: dirs.build + '/img',
		js: dirs.build + '/js',
		fonts: dirs.build + '/fonts',
		assets: dirs.build + '/assets'
	},
	dist: {
		css: dirs.dist + '/css'
	}
};

var server = {
	port: '8080',
	root: path.resolve('./'),
};

module.exports = {
	dirs: dirs,
	paths: paths,
	server: server
};
