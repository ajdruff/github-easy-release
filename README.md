#Readme


#Overview

Github Easy Release (GER) is a simple gulp script to release your git package to GitHub.

It will:

* create a changelog
* bump your version number using semver versioning
* create a github page and pushes it to your gh-pages branch.


#Install

##Local Install (Default/preferred)
By default, GER expects to be installed in the directory of your local github repo where it can easily find your project's files. 

    cd /path/to/git/repo
    npm install github-easy-release
    cat "node-modules" >> .gitignore  //ignore node-modules

##Global Install

If you want to install GER globally, you can do it but you'll need to specify the location of your github local repository path each time you run it.

    npm install -g github-easy-release


#Configuration
ref:https://docs.npmjs.com/getting-started/using-a-package.json

Before using, you must configure the script:




#Usage



1. If you don't already have node.js, install it on your system now.
2. download the project and add its folder in the root of your project's folder.
3. add a .gitignore entry for its contents.
4. run the following commands

    cd /path/to/your/project
    npm init. Accept defaults.
    cd /path/to/github-ez-release 
    npm install



