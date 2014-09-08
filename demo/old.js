pushStateTree.add({
// any change
id: 'any',
rule: /.*/
});
pushStateTree.add({
id: 'one',
rule: /.+1.+/
});
pushStateTree.appendChild(pushStateTree.createRule({
// any change
id: 'child',
rule: /child\/(.+)/
}));
pushStateTree.querySelector('#child').appendChild(pushStateTree.createRule({
id: 'nestedChild',
rule: /.+/,
parentGroup: 1
}));

function log(msg) {
var element = document.createElement('p');
element.innerHTML = msg;
document.querySelector('#log').appendChild(element);
}


pushStateTree.querySelector('#any').addEventListener('enter', function (event) {
log('any:enter > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#any').addEventListener('change', function (event) {
log('any:change > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#any').addEventListener('leave', function (event) {
log('any:leave > ' + pushStateTree.uri);
});

pushStateTree.querySelector('#one').addEventListener('enter', function (event) {
log('one:enter > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#one').addEventListener('change', function (event) {
log('one:change > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#one').addEventListener('leave', function (event) {
log('one:leave > ' + pushStateTree.uri);
});

pushStateTree.querySelector('#child').addEventListener('enter', function (event) {
log('child:enter > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#child').addEventListener('change', function (event) {
log('child:change > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#child').addEventListener('leave', function (event) {
log('child:leave > ' + pushStateTree.uri);
});

pushStateTree.querySelector('#nestedChild').addEventListener('enter', function (event) {
log('nestedChild:enter > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#nestedChild').addEventListener('change', function (event) {
log('nestedChild:change > ' + pushStateTree.uri);
});
pushStateTree.querySelector('#nestedChild').addEventListener('leave', function (event) {
log('nestedChild:leave > ' + pushStateTree.uri);
});