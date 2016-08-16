var gulp = require('gulp');
var runSequence = require('run-sequence');
var conventionalChangelog = require('gulp-conventional-changelog');//update changelog
var conventionalGithubReleaser = require('conventional-github-releaser');
var bump = require('gulp-bump');//increase version number
var gutil = require('gulp-util');
var git = require('gulp-git');
var fs = require('fs');
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist
var marked = require('marked');
var fs = require("fs");
var liquid = require("gulp-liquid");
var rename = require("gulp-rename");
var packagejson;
var config;//




//Set Configuration Variables

 setConfig();
 
 setPackageJson();

gulp.task('check_options', function () {


//check version type
    var allowed_types = ["major", "minor", "patch"];
    var type = allowed_types.indexOf(argv.t);
    if (type == -1) {
        throw new Error("Invalid version type. Please use the -t option and specify 'major','minor', or 'patch'");
    }




});
gulp.task('config-package', function () {
    var this_packagejson;
    var tokenjson={};
    this_packagejson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    var config = argv.c;
    var key_value = config.split("=", 2);
    if (key_value[0]==="token") {
            tokenjson[key_value[0]] = key_value[1];
    fs.writeFileSync('token.json', JSON.stringify(tokenjson, null, 2));
    }else {
         this_packagejson['config'][key_value[0]] = key_value[1];
    fs.writeFileSync('package.json', JSON.stringify(this_packagejson, null, 2));   
    }




});



gulp.task('changelog', function () {
    
        if (fs.existsSync('./package.json')) {
        config = JSON.parse(fs.readFileSync('./package.json')).config;
    }
    
    return gulp.src(config.changelog, {
        buffer: false
    })
            .pipe(conventionalChangelog({
                preset: 'angular',
                releaseCount: 0 // Or to any other commit message convention you use.
            }))
            .pipe(gulp.dest('./'));
});






gulp.task('update-gh-pages', function () {

    var fileContent = fs.readFileSync("../" + config.readme, "utf8");
    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });


    fileContent = marked(fileContent);

    gulp.src('./gh-pages/_layouts/index.html')
            .pipe(liquid({
                locals: {CONTENT: fileContent.toString()}
            }))
            .pipe(rename('index.html'))
            .pipe(gulp.dest('./gh-pages/'));
});


/**
 * Set Configuration
 *
 *Updates the global config variable
 *
 * @param void
 * @return void
 */

function setConfig() {
    
   
    if (fs.existsSync('./package.json')) {
        config = JSON.parse(fs.readFileSync('./package.json')).config;
    } else {

        config = {};
    }
}

/**
 * Set the Package Configuration
 *
 * Updates the packagejson global variable
 * @param void
 * @return void
 */

function setPackageJson() {
    if (fs.existsSync('../package.json')) {
        packagejson = JSON.parse(fs.readFileSync('../package.json', 'utf8'));
    } else {

        packagejson = {};
    }
}
/**
 * Get Package Json Version
 *
 * @param void
 * @return string The version in the package file
 */
function getPackageJsonVersion() {
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('../package.json', 'utf8')).version;
}
/**
 * Get GitHub Token
 *
 * @param void
 * @return string The github token
 */
function getGitHubToken() {
        if (!fs.existsSync('./token.json')) {
        throw new Error ("GitHub API Token not set.  Run gulp config -c token=GITHUB_TOKEN to set API token.");
        return;
    }
    
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./token.json', 'utf8')).token;
}

gulp.task('github-release', function (done) {

    conventionalGithubReleaser({
        type: "oauth",
        token: getGitHubToken()// To set token, do this : gulp config -c token=YOUR_TOKEN
    }, {
        preset: 'angular' // Or to any other commit message convention you use.
    }, done);
});

gulp.task('bump-version', function (cb) {
    // argv.t will supply what kind of version change type  we are releasing 'patch' 'major' or 'minor'

    return  gulp.src(['../bower.json', '../package.json'])
            .pipe(bump({type: argv.t}).on('error', gutil.log))
            .pipe(gulp.dest('../', function () {
                setPackageJson(function () {
                    cb()
                }); //update package variables

            }));



});


gulp.task('commit-changes', function (cb) {


    var q = require('bluebird'); //need promises since commit doesnt normally return stream. see https://github.com/stevelacy/gulp-git/issues/49
    return new q(function (resolve, reject) {


        //copy index.html to gh-pages
        gulp.src('../')
                .pipe(git.add())
                .pipe(stream = git.commit(config.release_message.replace('{VERSION_NUMBER}', getPackageJsonVersion()))).on('error', function (e) {
            console.log('No changes to commit');
        })

                .on('error', resolve) //resolve to allow the commit to resume even when there are not changes.
                .on('end', resolve);



        stream.resume(); //needed since commmit doesnt return stream by design.


        ;







    });

});

gulp.task('push-changes', function (cb) {
    git.push('origin', 'master', cb);


});


gulp.task('add-gh-pages-index.html', function (cb) {

    //copy index.html to gh-pages
    return  gulp.src('../index.html')
            .pipe(git.add(), function (err) {
                if (err)
                    throw err;
                cb();


            });

});


gulp.task('commit-gh-pages', function (cb) {


    var q = require('bluebird'); //need promises since commit doesnt normally return stream. see https://github.com/stevelacy/gulp-git/issues/49
    return new q(function (resolve, reject) {


        //copy index.html to gh-pages
        gulp.src('../index.html')
                .pipe(stream = git.commit('updated gh-pages readme ')).on('error', function (e) {
            console.log('No changes to commit');
        })

                .on('error', resolve) //resolve to allow the commit to resume even when there are not changes.
                .on('end', resolve);



        stream.resume(); //needed since commmit doesnt return stream by design.


        ;







    });

});

gulp.task('update-gh-pages', function (cb) {

    //copy index.html to gh-pages
    return gulp.src('./gh-pages/index.html')
            .pipe(gulp.dest('../'), function (err) {
                if (err)
                    throw err;
                cb();


            });

});

gulp.task('checkout-ghpages', function (cb) {


    return git.checkout('gh-pages', function (err) {
        if (err)
            throw err;
        cb();
    });

});

gulp.task('checkout-master', function (cb) {

    return git.checkout('master', function (err) {
        if (err)
            throw err;
        cb();
    });
});

gulp.task('fetch', function (cb) {

    git.fetch('origin', '', {}, function (err) {
        if (err)
            throw err;
        cb();
    });

});

gulp.task('push-gh-pages-changes', function (cb) {
    git.push('origin', 'gh-pages', cb);

});




gulp.task('create-new-tag', function (cb) {
    var version = getPackageJsonVersion();
    git.tag(version, 'Created Tag for version: ' + version, function (error) {
        if (error) {
            return cb(error);
        }
        git.push('origin', 'master', {args: '--tags'}, cb);
    });


    ;
});
gulp.task('updateGhPages', function (callback) {
        if (!config.ghpages) {
                    console.log("Skipping gh-pages update per config.ghpages setting");
                    callback();
        return;
    }
    
    runSequence(
            'fetch',
            'checkout-ghpages',
            'update-gh-pages',
            'add-gh-pages-index.html',
            'commit-gh-pages',
            'checkout-master',
            function (error) {
                callback(error);
            });
});

gulp.task('_release', function (callback) {
    if (!config.release) {
        console.log("Skipping release per config.release setting");
        callback();
        return;
    }
    runSequence(
            'check_options',
            'bump-version',
            'changelog',
            'commit-changes',
            'push-changes',
            'create-new-tag',
            'github-release',
            'updateGhPages',
            function (error) {
                callback(error);
            });
});

gulp.task('release', function (callback) {
    runSequence(
            '_release',
            'updateGhPages',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log('RELEASE ' + getPackageJsonVersion() + ' FINISHED SUCCESSFULLY');
                }
                callback(error);
            });
});


gulp.task('config', function (callback) {
    runSequence(
            'config-package',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                     console.log('Package configuration updated.' + JSON.stringify(JSON.parse(fs.readFileSync('package.json', 'utf8')).config));
                }
                callback(error);
            });
});

