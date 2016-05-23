import PushStateTree from '../src/push-state-tree';

describe('PushStateTree should', function() {
  it('be available as UMD library', function() {
    expect(PushStateTree).to.be.defined;
  });

  it('instances without "new" operator', function() {
    /* jshint newcap: false*/
    expect(PushStateTree()).to.be.instanceof(HTMLElement);
  });

  it('construct and became a HTMLElement instance', function(){
    expect(new PushStateTree()).to.be.instanceof(HTMLElement);
    expect(new PushStateTree({})).to.be.instanceof(HTMLElement);
  });
});
