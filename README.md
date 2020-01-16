# Readme

## Overview

Github Easy Release (GER) is a simple gulp script to release your git project to GitHub.

It will:

* create a changelog
* bump your version number using semver versioning
* commit to master
* create a git tag with your new version number
* push to GitHub
* create a GitHub release url 
* create a github page and pushes it to your gh-pages branch. (optional with ghpages:true)

## Usage at a glance

Release a patch from code you already committed to master:

    cd /path/to/github-easy-release/
    gulp release -t patch

## Requirements

## Node.js

GER is a Node.js application so requires you to install Node.js before you can use it. 

Get Node.js at [https://nodejs.org/en/download/](https://nodejs.org/en/download/) 

## Package.json

Even if your project is not a Node.js project, GER requires that it have a  `a package.json` file for it to work properly.

To generate a package.json file if you don't already have one, do this :

    cd /path/to/repo/working/directory
    npm init

Follow the prompts. If you don't know any of the answers, simply hit enter and accept the default. You can always re-run `npm init` later or manually edit the `package.json` file to update any of its configuration values.

## Install

GER expects to be installed in the directory of your local github repo where it can easily find your project's files.

Download GER and unzip the `github-easy-release` directory, so that the `github-easy-release` directory is placed at the root of your project directory.

### **download manually**

     1. Go to [https://github.com/ajdruff/github-easy-release](https://github.com/ajdruff/github-easy-release) and click 'Clone or Download' and click the 'Download ZIP' link, or download from [https://github.com/ajdruff/github-easy-release/archive/master.zip](https://github.com/ajdruff/github-easy-release/archive/master.zip)
     
     2.  Extract `github-easy-release-master.zip` to your project repo's working directory.
     3.  Rename the unzipped parent directory from `github-easy-release-master` to `github-easy-release`

### **download using git clone**

            cd /path/to/repo/working/directory/
            git clone https://github.com/ajdruff/github-easy-release.git

### **download using wget**

             cd /path/to/repo/working/directory/
             wget -qO- github-easy-release/archive/master.tar.gz | tar -zx
             mv github-easy-release* github-easy-release

### **download using curl**

            cd /path/to/repo/working/directory/
            curl -L https://github.com/ajdruff/github-easy-release/archive/master.tar.gz | tar -zx
            mv github-easy-release* github-easy-release


## **Install**

        cd /path/to/github-easy-release/
        npm install

## **Configure**

    **Add your Github Personal API Token. **

            cd /path/to/github-easy-release/
            gulp config -c token=YOUR_GITHUB_TOKEN

    If you don't have a GitHub API token, see  [https://github.com/blog/1509-personal-api-tokens](https://github.com/blog/1509-personal-api-tokens)

    **Config Settings**

    Edit `package.json` `config` settings with any desired changes from the default. 

        "config": 
                {
        "changelog": "CHANGELOG.md", 
        "readme": "README.md",
        "release_message": "Release {VERSION_NUMBER}",
        "ghpages": false,
        "release": true        
                }


    - *changelog*
        + File name of the change log.
    - *readme*
        + File name of the readme
    - *release_message*
        +  this is the release message that will be used on the final commmit. {VERSION_NUMBER} will be replaced with the final release number.
    - *ghpages*
        +  set to true if you want your gh-pages branch to be updated with the latest readme.
    -  *release*
        +  set tp true if you want the release version bumped, the changelog updated and a release url created
    *

## Usage

## Release

    gulp release -t TYPE

TYPE determines how the semantic version number will be bumped. Use `major`, `minor` or `patch` .  For more on semver standards, see [semver.org](http://semver.org/)

## Update Configuration 

Manually*
Edit the package.json file directory, changing appropriate values under the `config` section.

### *Command Line*

    gulp config -c KEY=VALUE

where KEY is the name of one of the configuration settings listed under the **Config Settings** section, and VALUE is its desired value.

## Changelog

The changelog is generated using `gulp-conventional-changelog` Node.js package. This package generates detailed commit notes based on parsing your commit messages. For this to work properly, you must adhere to the angular standards for your commits. See [angular's contributing docs for guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit).

For example, for a bug fix note to show up on the changelog, you must make a commit similar to this : 

    git commit -m 'fix:(myfunction) add error handling for divide by zero'

## GitHub Page Updates

GER will update simple GitHub pages that contain a single `index.html`. It does this by converting the project's README.md file into an index.html file, and then committing that file to your gh-pages branch.

To make this work:

* Generate a `gh-pages` branch using the [GitHub Pages Generator](https://help.github.com/articles/creating-pages-with-the-automatic-generator/)
* Instead of adding content to your GitHub page, add the following liquid tag:
    {{ CONTENT }}

## Troubleshooting

### **Changelog not being created or updated**

* Check that a CHANGELOG.md file exists. 
* Check that the name matches the configuration 'changelog' setting in `package.json`, by default `CHANGELOG.MD`

### **ghpages not being updated**

* Check that a CHANGELOG.md file exists. 
* Check that the name matches the configuration 'changelog' setting in `package.json`, by default `CHANGELOG.MD`

## Similar

[gh-release](https://github.com/progrium/gh-release)
