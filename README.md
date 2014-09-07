# pushStateTree [![Analytics](https://ga-beacon.appspot.com/UA-24619548-7/pushStateTree/readme)](https://github.com/igrigorik/ga-beacon) [![NPM version](https://badge.fury.io/js/pushStateTree.png)](http://badge.fury.io/js/pushStateTree)  [![Build Status](true.png)](true)

> A browser history micro-framework that works with events, navigation of single page app easier than ever.

### [Demo page](http://gartz.github.io/pushStateTree/)

## Quick start

The following quick start options are available:

* Install with [Bower](http://bower.io): `bower install pushStateTree`.
* Clone the repo: `git clone https://github.com/gartz/pushStateTree.git`.
* [Download the latest release](https://github.com/gartz/pushStateTree/archive/master.zip).


## Getting Started

Just create a instance of `PushStateTree`, the instances aren't singleton, but the rules are in a singleton.

This means you can use in the same app rules to navigate using pushState and not using it.

If you chose to don't use the pushState `usePushState` option, it will add a hash `#` in your pushState urls.

Older browsers will disable it and run as fallback.

### Creating Rules

Rules are HTML Elements with two special properties `rule` and `parentGroup`, when you create this HTML elements, you can add it to a PushStateTree instance. When some URL has change it will validate your options and dispatch the right events.

It's possible to create tree of rules, you can bind the result from a parent rule using the `parentGroup` option, what will use the match group in the regular expresion `rule` parent result.

The options passed to rule will be used as element properties, so if you setup `id` or `className` your element will have this properties.

To create a Rule use the method `createRule` from `PushStateTree`, then you can appendChild to the instance, example:

```
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

```
// Remove from pushStateTree to disable
pushStateTree.removeChild(myRuleElement);
```

And you can create nested child rules:

```
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

```
var matchExample = 'foo/bar/zaz'.match(/foo\/(.+)\/(.+)/i);

// ---------\/----- this number indicate the parentGroup
matchExample[0]; // foo/bar/zaz
matchExample[1]; // bar
matchExample[2]; // zaz
```

There is a shortcut to `createRule` and `appendChild` tha is called `add`:

```
// Create a Rule element
pushStateTree.add({
  rule: /foo\/(.+)\/(.+)/i
});
```

### Finding your rules

This is the easiest part at all. Rules are *HTMLElements* so you just need to find then like you do in the DOM.

Using `querySelector`:

```
  pushStateTree.querySelector('#id'); // find by id
  pushStateTree.querySelector('.class'); // find by class
  pushStateTree.querySelector('pushstatetree-rule > pushstatetree-rule'); // find by tag
```

You also can use `querySelectorAll` or any of that stuff. If you are programming with jQuery, you can use it to find, example:

    $(pushStateTree).find('myQuery').get(0); // you are accessing the first matched element

### Rules events

You also can add and remove events from this element, the events list are:

 - **enter** dispatched when rule match from a url that doesn't match that rule.
 - **leave** dispatched when the rule was matching and the new url doesn't match anymore. (it will dispatch for every childrens)
 - **change** dispatched when a change ocours, that's means the URI isn't the same, but still matching with this rule.
 - **update** dispatched when any event is dispatched, will expose the type of the event dispatched in `event.detail.type`.
 - **match** dispatched everytime the events `popstate` or `hashchange` are triggered and match with the rule, doesn't matters if is the same url as before.

Importante note: *match* will not dispatch when *leave*, because it doesn't match.

## PushStateTree

### Constructor options

Options you can pass in the constructor params.

 - *usePushState*: Boolean, default is true, if you disable it will use a hash `#` in your pushState/replaceState urls.

### Navigating

There is a lot of ways, but if you use a common `href` this wont preventDefault events.

 - **pushState**: same as oficial `(state, title, url)` but is chainable
 - **replaceState**: same as oficial `(state, title, url)` but is chainable
 - **dispatch**: will dispatch the `popstate` or `hashchange` event

Example:

```
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

 - It's easy to use and very flexible
 - You can extend it and change how it works if you want
 - Work with all modern browsers and some old ones (IE7 or older aren't supported)
 - Use DOM methods to find and change Rules elements
 - It will use native browser features if it can
 - Min file has only 8kb with shim

## Goals

 - Add preventDefault in match and update, to don't dispatch enter, change and leave events.
 - Add stopPropagation to don't dispatch children events
 - Move the browsers shim to another repo
 - Add common used regular expression shortcuts generator, like `something/:option1/:option2`
 - Add full compatibility with Web Components
 - Optimize some tree matching operations

## Todo

 - Create a event execution queue before dispatching events, to create a dispatch order:
  - Dispatch all leaves
  - Dispatch all enters
  - Dispatch all changes
 - update event must dispatch before enter, change or leave

## Helper Tools

 - **[RegExr](http://regexr.com/)** is a tool that help you creating regular expressions and testing it.
 - **[RegExper](http://www.regexper.com/)** is a tool that explain how your regular expression works.

## Contributing

Please read through the [contributing guidelines](CONTRIBUTING.md). In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

Editor preferences are available in the [editor config](.editorconfig) for easy use in common text editors. Read more and download plugins at [http://editorconfig.org](http://editorconfig.org).

## License
Copyright (c) 2014 Gabriel Reitz Giannattasio
Licensed under the [MIT license](LICENSE-MIT).


***

Project created by [Gabriel Reitz Giannattasio](https://gartz.com.br).

_This file was generated on Sun Mar 23 2014 00:32:28._
