# How to contribute

We love pull requests from everyone.

PushStateTree make life easier in the frontend, however internally it's complex,
when you contribute by patching something, please provide the tests for your feature.

## How to run tests

Fork, then clone the repo:

    git clone git@github.com:your-username/pushStateTree.git

Install the dependencies:

    npm install

We use Grunt, if you don't have it installed use:

    npm install -g grunt-cli

If you need a code-coverage report, you can run:

    grunt report

This will run the tests, generate a report and open a HTTP server on the port 3000, to
access the code coverage, you can use the link http://localhost:3000/report/coverage/html/

After you do your changes and create the test script, push to your fork and pull request it back.

Please explain in the pull request the goal of your changes.

And thanks for contributing.
