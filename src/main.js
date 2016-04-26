// If you don't want support IE 7 and IE 8 you can remove the compatibility shim with `PST_NO_OLD_ID: false`
//     new webpack.DefinePlugin({
//       PST_NO_OLD_IE: false
//     })
// https://webpack.github.io/docs/list-of-plugins.html#defineplugin
require('./es3.shim.js');

// TODO: Use a PushStateTree.prototype.createEvent instead of shim native CustomEvents
require('./customEvent.shim');

import PushStateTree from './push-state-tree';

import BrowserHistory from './plugin/history';

PushStateTree.plugins.push(new BrowserHistory());

module.exports = PushStateTree;