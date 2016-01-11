var util = require('util'),
	aliasify = require('aliasify'),
	stringify = require('stringify'),
	derequire = require('derequire');

module.exports = function(grunt) {
	//grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks("grunt-browserify");
	//grunt.loadNpmTasks('grunt-qunit-blanket-lcov');
	grunt.loadNpmTasks('grunt-umd');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-qunit-istanbul');
	grunt.loadNpmTasks('grunt-node-qunit');

	grunt.initConfig({
		"jshint": {
			"irrelon-sse": {
				"files": {
					"src": [
						"lib/**/*.js",
						'!lib/vendor/*.js'
					]
				}
			},
			options: {
				jshintrc: '.jshintrc'
			}
		},

		jsdoc : {
			all : {
				src: ['./lib/*.js'],
				options: {
					destination: './doc'
				}
			}
		},

		"browserify": {
			"client": {
				src: ["./builds/client.js"],
				dest: "./dist/client.js",
				options: {
					verbose: true,
					debug: true,
					transform: [aliasify, stringify(['.html'])],
					plugin: [
						[ "browserify-derequire" ]
					]
				}
			}
		},

		"uglify": {
			"client": {
				"files": {
					"./dist/client.min.js": ["./dist/client.js"]
				}
			}
		},

		umd: {
			client: {
				options: {
					src: './dist/fdb-all.js',
					globalAlias: 'IrrelonSSE'
				}
			}
		}
	});

	grunt.registerTask('version', 'Increments the current version by a revision', function () {
		var fs = require('fs-extra'),
			packageJson,
			versionString,
			oldVersion,
			versionArr,
			revision,
			fileData;

		fileData = fs.readFileSync('./package.json', {encoding: 'utf8'});
		packageJson = JSON.parse(fileData);

		versionString = packageJson.version;
		oldVersion = versionString;
		versionArr = versionString.split('.');
		revision = parseInt(versionArr[2], 10);

		// Increment revision number
		revision++;

		// Create new string
		versionArr[2] = String(revision);
		versionString = versionArr.join('.');

		// Save JSON
		fileData = fileData.replace(oldVersion, versionString);
		fs.writeFileSync('./package.json', fileData);

		// Search project files for old version and replace
		fileData = fs.readFileSync('./lib/Shared.js', {encoding: 'utf8'});
		fileData = fileData.replace(oldVersion, versionString);
		fs.writeFileSync('./lib/Shared.js', fileData);

		fileData = fs.readFileSync('./readme.md', {encoding: 'utf8'});
		fileData = fileData.replace(oldVersion, versionString);
		fs.writeFileSync('./readme.md', fileData);
	});

	grunt.registerTask('gitCommit', 'Git Commit Updates', function () {
		"use strict";

		var execSync = require('child_process').execSync,
			fs = require('fs-extra'),
			child,
			packageJson,
			versionString,
			fileData;

		fileData = fs.readFileSync('./package.json', {encoding: 'utf8'});
		packageJson = JSON.parse(fileData);

		versionString = packageJson.version;

		child = execSync('git commit -am "New version build ' + versionString + '"');
	});

	grunt.registerTask('gitPushAndTagDev', 'Git Push and Tag Dev Build', function () {
		"use strict";

		var execSync = require('child_process').execSync,
			fs = require('fs-extra'),
			child,
			packageJson,
			versionString,
			fileData;

		fileData = fs.readFileSync('./package.json', {encoding: 'utf8'});
		packageJson = JSON.parse(fileData);

		versionString = packageJson.version;

		child = execSync('git push');
		child = execSync('git tag ' + versionString + '-dev');
		child = execSync('git push --tags');
	});

	grunt.registerTask('gitMergeDevIntoMaster', 'Git Merge Dev Into Master', function () {
		"use strict";
		var execSync = require('child_process').execSync,
			child;

		child = execSync('git checkout master');
		child = execSync('git merge dev');
	});

	grunt.registerTask('gitPushAndTagMaster', 'Git Push and Tag Master Build', function () {
		"use strict";

		var execSync = require('child_process').execSync,
			fs = require('fs-extra'),
			child,
			packageJson,
			versionString,
			fileData;

		fileData = fs.readFileSync('./package.json', {encoding: 'utf8'});
		packageJson = JSON.parse(fileData);

		versionString = packageJson.version;

		child = execSync('git push');
		child = execSync('git tag ' + versionString);
		child = execSync('git push --tags');
	});

	grunt.registerTask('npmPublish', 'NPM Publish New Version', function () {
		"use strict";

		var execSync = require('child_process').execSync;

		execSync('npm publish');
	});

	grunt.registerTask('npmPublishDev', 'NPM Publish New Dev Version', function () {
		"use strict";

		var execSync = require('child_process').execSync;

		execSync('npm publish --tag dev');
	});

	grunt.registerTask('checkoutMaster', 'Git Checkout Master Branch', function () {
		"use strict";

		var execSync = require('child_process').execSync;

		execSync('git checkout master');
	});

	grunt.registerTask('checkoutDev', 'Git Checkout Dev Branch', function () {
		"use strict";

		var execSync = require('child_process').execSync;

		execSync('git checkout dev');
	});

	grunt.registerTask('generateTOC', 'Generate Table of Contents', function () {
		/*"use strict";

		var execSync = require('child_process').execSync;

		execSync('doctoc readme.md');*/
	});

	grunt.registerTask("1: Build Source File", ["browserify"]);
	grunt.registerTask("2: Build and Test", ["version", "generateTOC", "browserify", "uglify"]);
	grunt.registerTask("3: Build, Test, Tag and Push Dev Branch", ["checkoutDev", "version", "generateTOC", "jshint", "browserify", "uglify", "jsdoc", "gitCommit", "gitPushAndTagDev", "npmPublishDev"]);
	grunt.registerTask("4: Release and Publish Master Build From Dev", ["checkoutDev", "version", "generateTOC", "jshint", "browserify", "uglify", "jsdoc", "gitCommit", "gitPushAndTagDev", "gitMergeDevIntoMaster", "gitPushAndTagMaster", "npmPublish", "checkoutDev"]);
};