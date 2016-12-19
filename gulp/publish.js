var gulp = require('gulp'),
	rename = require('gulp-rename'),
	awspublish = require('gulp-awspublish');

const debugMode = false;

gulp.task('publish',['build'], function(done) {

	var aws;
	try {
		aws = require('./aws-config.json').AWS;
	}
	catch (ex) {
		console.log('>>> no config.json found', ex);
		done();
	}

	var publisher = awspublish.create({
		region: aws.Region,
		params: {Bucket: aws.Bucket},
		accessKeyId: aws.Credentials.AccessKeyId,
		secretAccessKey: aws.Credentials.SecretAccessKey
	});

	return gulp.src(['build/**/*.{html,css,js}'])
		.pipe(rename(function (path) {
			if(aws.FolderPath) {
				path.dirname = '/'+ aws.FolderPath +'/'+ path.dirname;
			}
		}))
		.pipe(awspublish.gzip())
		.pipe(publisher.publish({}, {simulate: debugMode, createOnly: false}))
		.pipe(publisher.cache())
		.pipe(awspublish.reporter());
});
