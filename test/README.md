# Test guidelines

To test the PushStateTree is important to follow some guide lines, otherwise
the tests will certainly affect other tests, making then fail or give unwanted
results.

## Never refresh the browser

If you need to move around, changing the URL, use native `pushState` method, never
use `location.href = url`, this will terminate and fail your test.

Using pushState, always use absolute or relative path without a `origin`, because
change the protocol, domain or port will refresh the browser and fail every test.

Hash changes can be tested triggered by native property such as `location.hash = path`.

## Always use basePath

When creating multiple PushStateTree instances, always set the basePath to a unique
value. It will avoid conflicts between multiple router configurations that affect
the global environment such as `beautifyLocation` and hash navigation.

## Create test and destroy

Use the `helper/cleanHistoryAPI.js` to clean your events afterEach test run.

When using this helper, you will need to create the PushStateTree instance `beforeEach`
or inside your unit test.

***Attention:***
*Don't create router instances inside `before` when using the clean history API
helper, it will result on non operational tests after the first unit has been executed.*
