var gulp = require('gulp');

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

var config;//
var ghparse = require('parse-github-repo-url')


//Set Configuration Variables

setConfig();



gulp.task('check_options',  (done)=> {

    

//check version type
    var allowed_types = ["major", "minor", "patch"];
    var type = allowed_types.indexOf(argv.t);
    if (type == -1) {
        throw new Error("Invalid version type. Please use the -t option and specify 'major','minor', or 'patch'");
    }

done()

});
gulp.task('config-package', function () {
    var this_packagejson;
    var tokenjson = {};
    this_packagejson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    var config = argv.c;
    var key_value = config.split("=", 2);
    if (key_value[0] === "token") {
        tokenjson[key_value[0]] = key_value[1];
        fs.writeFileSync('token.json', JSON.stringify(tokenjson, null, 2));
    } else {
        this_packagejson['config'][key_value[0]] = key_value[1];
        fs.writeFileSync('package.json', JSON.stringify(this_packagejson, null, 2));
    }




});



gulp.task('changelog', function () {

    if (fs.existsSync('./package.json')) {
        config = JSON.parse(fs.readFileSync('./package.json')).config;
    }

    return gulp.src(config.changelog, {
        buffer: false,
        allowEmpty:true
    })
            .pipe(conventionalChangelog({
                preset: 'angular',
                releaseCount: 0 // Or to any other commit message convention you use.
            }))
            .pipe(gulp.dest('./'));
});






gulp.task('convert-readme-to-html', function () {
    if (fs.existsSync("../" + config.readme)) {
        var fileContent = fs.readFileSync("../" + config.readme, "utf8");
    } else {

        throw new Error('Cannot find the ' + config.readme + ". To fix this, set the package.json `readme` setting to the name of your readme file.")
    }


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

    return gulp.src('./gh-pages/_layouts/index.html')
            .pipe(liquid({
                locals: {
                    CONTENT: fileContent.toString(),
                    GITHUB_REPO: getGitHubRepoName(),
                    GITHUB_USERNAME: getGitHubUserName(),
                    VERSION_NUMBER: getPackageJsonVersion()
                }
            }))


            .pipe(rename('readme.html'))
            .on('end', function () {
                //console.log('replaced liquid tags')
            })
            .pipe(gulp.dest('./gh-pages/cache'));
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
 * Get the Package Configuration
 *
 * Returns the package.json global object
 * @param void
 * @return void
 */

function getPackageJson() {
    if (fs.existsSync('../package.json')) {
        return JSON.parse(fs.readFileSync('../package.json', 'utf8'));
    } else {

        throw new Error("package.json cannot be found");
    }
}



/**
 * Get GitHub Username
 *
 * Parses the project's repository url to get its username
 * ref: https://www.npmjs.com/package/parse-github-repo-url
 *  
 * @param void
 * @return string The GitHub username
 */

function getGitHubUserName() {

    try {
        return ghparse(getPackageJson().repository.url)['0'];
    } catch (e) {
        return "";
    }





}

/**
 * Get GitHub Repo Name
 *
 * Parses the project's repository url to get its repo name
 * ref: https://www.npmjs.com/package/parse-github-repo-url
 * @param void
 * @return string The GitHub repo
 */

function getGitHubRepoName() {

    try {
        return ghparse(getPackageJson().repository.url)['1'];
    } catch (e) {
        return "";
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
        throw new Error("GitHub API Token not set.  Run gulp config -c token=GITHUB_TOKEN to set API token.");
        return;
    }

    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./token.json', 'utf8')).token;
}

gulp.task('github-release', function (done) {

    
    conventionalGithubReleaser({
        type: "oauth",
        token: getGitHubToken // To set token, do this : gulp config -c token=YOUR_TOKEN

    }, {
        preset: 'angular' // Or to any other commit message convention you use.
    }, done);
    
});

gulp.task('bump-version', function (cb) {
    // argv.t will supply what kind of version change type  we are releasing 'patch' 'major' or 'minor'

    return  gulp.src(['../bower.json', '../package.json'],{allowEmpty:true})
            .pipe(bump({type: argv.t}).on('error', gutil.log))
            .pipe(gulp.dest('../'));



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

gulp.task('push-master', function (cb) {
    git.push('origin', 'master', cb);


});


gulp.task('push-gh-pages', function (cb) {
    git.push('origin', 'gh-pages', cb);


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

gulp.task('copy-converted-readme-to-gh-pages-branch', function (cb) {

    //copy index.html to gh-pages
    return gulp.src('./gh-pages/cache/readme.html')
            .pipe(rename("index.html"))
            .pipe(gulp.dest('../'), function (err) {
                if (err)
                    throw err;



            })

            .pipe(git.add(), function (err) {
                if (err)
                    throw err;



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
    }


    );



});

gulp.task('sandbox',
    gulp.series(
            'checkout-master',
            'convert-readme-to-html',
            'fetch',
            'checkout-ghpages',
            'copy-converted-readme-to-gh-pages-branch',
            'commit-gh-pages',
            'push-gh-pages',
            'checkout-master',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                    // console.log('RELEASE ' + getPackageJsonVersion() + ' FINISHED SUCCESSFULLY');
                }
                callback(error);
            })
)



gulp.task('updateGhPages',   gulp.series(
            'checkout-master',
            'convert-readme-to-html',
            'fetch',
            'checkout-ghpages',
            'copy-converted-readme-to-gh-pages-branch',
            'commit-gh-pages',
            'push-gh-pages',
            'checkout-master',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log('GitHub Pages updated successfully.');
                }
                callback(error);
            })
)

gulp.task('_release', 

    gulp.series(
            'checkout-master',
            'check_options',
            'bump-version',
            'changelog',
            'commit-changes',
            'push-master',
            'create-new-tag',
            'github-release',
            function (error,responses) {
                if (error){
                    console.log(error.message)
                    callback(error);
                }
                else{
                    console.log('conventional release completed successfully ' + responses)
                }
                
            })
)

gulp.task('release', 
    gulp.series(
            '_release',
            'updateGhPages',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log('RELEASE ' + getPackageJsonVersion() + ' completed successfully.');
                }
                callback(error);
            })
)


gulp.task('config', 
    gulp.series(
            'config-package',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log('Package configuration updated.' + JSON.stringify(JSON.parse(fs.readFileSync('package.json', 'utf8')).config));
                }
                callback(error);
            })
)

