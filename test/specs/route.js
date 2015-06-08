/*globals PushStateTree, it, expect */
describe('PushStateTree should', function() {
  'use strict';

  it('be available on global scope', function() {
    expect(PushStateTree).toBeDefined();
  });

  it('throw an error if not using "new" operator', function() {
    expect(PushStateTree).toThrow();
  });

  it('construct and became a HTMLElement instance', function(){
    expect(new PushStateTree()).toEqual(jasmine.any(HTMLElement));
    expect(new PushStateTree({})).toEqual(jasmine.any(HTMLElement));
  });
});
