/*globals PushStateTree, it, expect */
describe('ObjectEvent should', function() {
  'use strict';

  it('be available on global scope', function() {
    expect(PushStateTree).toBeDefined();
  });

  it('throw an error if not using "new" operator', function() {
    expect(PushStateTree).toThrow();
  });

});
