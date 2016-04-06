# How to contribute

We love pull requests from everyone.

PushStateTree make life easier in the frontend, however internally it's complex,
when you contribute by patching something, please provide the tests for your feature.

## How to run tests

Fork, then clone the repo:

    git clone git@github.com:your-username/pushStateTree.git

Install the dependencies:

    npm install

To start a demo server and test server you need to execute:

    npm start

* Demo server: [http://localhost:8080/](http://localhost:8080/)
* Test server: [http://localhost:9876/](http://localhost:9876/)

This tests will watch for changes in the `src` and `test` folders, changes will trigger a new test
run and might refresh your demo in the browser.

The source-map for test server are in the `webpack://./test/`, and for demo server are in
`webpack://pushStateTree.source/./`.

After you do your changes and create the test script, create a PR to the `dev` branch.

Please explain in the pull request the goal of your changes.

And thanks for contributing.
