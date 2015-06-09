# pushStateTree 
[![Analytics](https://ga-beacon.appspot.com/UA-24619548-7/pushStateTree/readme)](https://github.com/igrigorik/ga-beacon)
[![NPM version](https://badge.fury.io/js/push-state-tree.png)](http://badge.fury.io/js/push-state-tree)
[![Build Status](https://travis-ci.org/gartz/pushStateTree.svg?branch=master)](https://travis-ci.org/gartz/pushStateTree)
[![Dependency Status](https://gemnasium.com/gartz/pushStateTree.svg)](https://gemnasium.com/gartz/pushStateTree)
[![Coverage Status](https://coveralls.io/repos/gartz/pushStateTree/badge.svg)](https://coveralls.io/r/gartz/pushStateTree)
[![Code Climate](https://codeclimate.com/github/gartz/pushStateTree/badges/gpa.svg)](https://codeclimate.com/github/gartz/pushStateTree)

> A standalone powerful library to manage browser routing with nested level support, complex match expressions and on-fly rules change (convenient to lazy module loading).

## Motivation

The open-source router system solutions available when I started designing this library were all working with a callback
"match" and they are very hard to work with nested levels, and/or not support on-fly changes.

The main goal to have a robust router system is to build Single Page Application, and the in the state of the art is be
able to never needs to be reload the page, and be able to add new modules and update the existing ones. To archive it
a robust router system is required.

PushStateTree is based in another implementation for a IPTV system for a company called Cianet in Brazil made in 2011,
at that time the project was based on Backbone library, and further I decided to create a standalone version compatible
with IE8, and what mimic Web Components, to allow (as optional) to expose in the DOM and make easier to debug it.

### [Demo page](http://gartz.github.io/pushStateTree/)

## Quick start

The following quick start options are available:

* Install with [Bower](http://bower.io): `bower install pushStateTree`.
* Install with [NPM](https://www.npmjs.com/): `npm install push-state-tree`.
* Clone the repo: `git clone https://github.com/gartz/pushStateTree.git`.
* [Download the latest release](https://github.com/gartz/pushStateTree/archive/master.zip).


## Getting Started

Create an `PushStateTree` router instance, create the as many instance of rules you need, append to the router, add
listeners and dispatch the router, or do in the order you prefer (always dispatch if you want to events being triggered
in the end of your routine).

This means you can use in the same app rules to navigate using pushState and not using it.

If you chose to don't use the pushState `usePushState` option, it will add a hash `#` in your pushState urls.

Older browsers will disable it and run as fallback.

### Creating Rules

Rules are HTML Elements with two special properties `rule` and `parentGroup`, when you create this HTML elements, you can add it to a PushStateTree instance. When some URL has change it will validate your options and dispatch the right events.

It's possible to create tree of rules, you can bind the result from a parent rule using the `parentGroup` option, what will use the match group in the regular expression `rule` parent result.

The options passed to rule will be used as element properties, so if you setup `id` or `className` your element will have this properties.

To create a Rule use the method `createRule` from `PushStateTree`, then you can appendChild to the instance, example:

```js
var pushStateTree = new PushStateTree();

// Create a Rule element
var myRuleELement = pushStateTree.createRule({
  id: 'myFirstRule',
  rule: /.+/
});

// Append to pushStateTree to enable
pushStateTree.appendChild(myRuleElement);
```

If you remove a rule from pushStateTree, it will be disabled and no events will be triggered to it until you append it back.

```js
// Remove from pushStateTree to disable
pushStateTree.removeChild(myRuleElement);
```

And you can create nested child rules:

```js
// Create a Rule element
var myChildRuleELement = pushStateTree.createRule({
  rule: /child/i
  parentGroup: 0
});

// Append to myRuleElement to enable
myRuleElement.appendChild(myChildRuleELement);
```

This child rule depends the `myRuleElement` so if the parent dispatch a `leave` the child will do it too, even if the rule is matching.

The `parentGroup` is the match position from the other rule, example:

```js
var matchExample = 'foo/bar/zaz'.match(/foo\/(.+)\/(.+)/i);

// ---------\/----- this number indicate the parentGroup
matchExample[0]; // foo/bar/zaz
matchExample[1]; // bar
matchExample[2]; // zaz
```

There is a shortcut to `createRule` and `appendChild` tha is called `add`:

```js
// Create a Rule element
pushStateTree.add({
  rule: /foo\/(.+)\/(.+)/i
});
```

### Finding your rules

This is the easiest part at all. Rules are *HTMLElements* so you just need to find then like you do in the DOM.

Using `querySelector`:

```js
  pushStateTree.querySelector('#id'); // find by id
  pushStateTree.querySelector('.class'); // find by class
  pushStateTree.querySelector('pushstatetree-rule > pushstatetree-rule'); // find by tag
```

You also can use `querySelectorAll` or any of that stuff. If you are programming with jQuery, you can use it to find, example:

    $(pushStateTree).find('myQuery').get(0); // you are accessing the first matched element

### Rules events

You also can add and remove events from this element, the events list are:

 - **enter** dispatched when rule match from a url that doesn't match that rule.
 - **leave** dispatched when the rule was matching and the new url doesn't match anymore. (it will dispatch for every children)
 - **change** dispatched when a change occurs, that's means the URI isn't the same, but still matching with this rule.
 - **update** dispatched when any event is dispatched, will expose the type of the event dispatched in `event.detail.type`.
 - **match** dispatched every time the events `popstate` or `hashchange` are triggered and match with the rule, doesn't matters if is the same url as before.

Importante note: *match* will not dispatch when *leave*, because it doesn't match.

## PushStateTree

### Constructor options

Options you can pass in the constructor params.

 - *usePushState*: Boolean, default is true, if you disable it will use a hash `#` in your pushState/replaceState urls.
 - *beautifyLocation*: Boolean, default is true, this will replace URL with hash to the pushState corresponding url.

If you chose to support old browsers, make sur your backend detect the browser support to pushState, if it doesn't the feature is auto-disabled, so a good aproach is to redirect the request in the backend to a URL with hash, example: `www.exemple.com/my/route/to/app` if browser don't support pushState redirect to `www.exemple.com/#my/route/to/app`.

By not doing a redirect in the backend and support non-modern browsers, when the user start navigating using the PushStateTree methods, it will end in adress that looks like this: `www.exemple.com/my/route/to/app#my/route/to/anotherApp`

You can disable the pushState and use only hash navigation, like we do in our [demo](http://gartz.github.io/pushStateTree/), what if you execute by `npm start` in your local environment will support pushState support as default, because we use a node server that support it.

### Navigating

Any of the available navigation methods are also available in the all rules, but they will return always the router in the chain.

 - **pushState**: same as official `(state, title, url)`
 - **replaceState**: same as official `(state, title, url)`
 - **dispatch**: will dispatch the `popstate` or `hashchange` event
 - **assign**: shortcut to `pushState(null, null, url).dispatch()`
 - **replace**: shortcut to `replaceState(null, null, url).dispatch()`
 - **navigate**: alias to assign (Backbone developers, this is for you)

Example:

```js
pushStateTree.pushState({foo: 'bar'}, 'no title', 'foo/bar/zaz');
// it changed the url, added to history, but doesn't trigger any event.

pushStateTree.dispatch();
// Now it triggered, and it will check every rule element that match and delegate it events.

pushStateTree.replaceState({foo: 'bar'}, 'no title', 'only/zaz').dispatch();
// The foo/bar/zaz doesn't exists in the browser history anymore, and only/zaz is in it places.
// However it dispatched it popstate event by the way
```

You can create URL with hash `#` it will also work and it will dispatch the event soon it's clicked.

Or you can just change the browser URL, it will dispatch the events.

## Examples

You can look the [**demo page**](http://gartz.github.io/pushStateTree/).

## Development

 - Clone the project `git clone https://github.com/cloudhead/node-static.git`
 - Use npm to install dev dependencies `npm install --dev`
 - Use npm to start a dev server `npm start`
 - Open you browser in the URL: [http://localhost:3000/](http://localhost:3000/)

## Features

 - Use event listeners for a total control of each rule in the router
 - Allow any regular expression in the rules
 - Allow on-fly rule add or remove
 - It's very convenient to create lazy module loading
 - Work with all modern browsers and some old ones (IE7 or older aren't supported)
 - Use DOM methods to find and change Rules elements (compatible with jQuery)
 - Allow use pushState and/or location.history hash navigation

## Goals

 - Add preventDefault in match and update, to don't dispatch enter, change and leave events.
 - Add stopPropagation to don't dispatch children events
 - Decouple browsers shim
 - Add common used regular expression shortcuts generator, like `static/:dynamic/:*nested-group`

## Todo

 - Wrap location methods (like replace and assign)
 - Add option to remove first slash when using hash navigation
 - Optimize code, by removing repeated code and using wrapping techniques

## Helper Tools

 - **[Regex101](https://regex101.com/#javascript)** helps create, test and explain how to read the regular expression
 - **[RegExr](http://regexr.com/)** like Regex101 but only focus on testing
 - **[RegExper](http://www.regexper.com/)** create graphical flow of the regular expression explain

## License
Copyright (c) 2014 Gabriel Reitz Giannattasio
Licensed under the [MIT license](LICENSE-MIT).


***

Project created by [Gabriel Reitz Giannattasio](https://gartz.com.br).

_This file was generated on Sun Mar 23 2014 00:32:28._
