### To Github pages

If your Chartbuilder is on a Github repo, you can deploy it to github pages
using the command:

		npm run gh-pages

The resulting page will also contain the Chartbuilder API docs at `/api-docs`,
with Chartbuilder at the root `index.html`.

### Deploying your Chartbuilder

Once you're done [customizing](02-customizing-chartbuilder.md), you'll want to
build the source files so that you can upload them to your hosted location.

Deployment is easy! Just do:

		npm run build

This will use [gulp](http://gulpjs.com/) to concatenate and minify your
javascript. (The javascript you get from `npm run dev` is not minified, if you
need to check what that looks like.) The build task will also convert all of the
fonts defined in your CSS base64, which makes image export more robust.

Once that completes, the finished product will live in the `build` folder inside
of your project directory. You can just move the contents of `build` to a server
using FTP or however else. Or you might create a simple auto-deploy script like so:

		#!/bin/sh
		echo "BUILDING CHARTBUILDER..."
		npm run build
		echo "SYNCING BUILD WITH REMOTE FILES..."
		rsync -rav --progress build/* <MY_SERVER_LOCATION>

