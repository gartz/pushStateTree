import PushStateTree from '../src/push-state-tree';

describe('PushStateTree Router basePath', () => {

  it('should allow to set the base path', () => {
    var pst = new PushStateTree({
      basePath: '/test/'
    });
    expect(pst.basePath).to.equal('/test/');
  });

  it('should normalize basePath folder', () => {
    expect((new PushStateTree({
      basePath: 'folder/'
    })).basePath).to.equal('/folder/');
    expect((new PushStateTree({
      basePath: 'folder/sub-folder/'
    })).basePath).to.equal('/folder/sub-folder/');
  });

  it('should normalize basePath file', () => {
    expect((new PushStateTree({
      basePath: 'file'
    })).basePath).to.equal('/file');
    expect((new PushStateTree({
      basePath: '/file'
    })).basePath).to.equal('/file');
    expect((new PushStateTree({
      basePath: 'folder/file'
    })).basePath).to.equal('/folder/file');
    expect((new PushStateTree({
      basePath: '/folder/file'
    })).basePath).to.equal('/folder/file');
    expect((new PushStateTree({
      basePath: 'folder/file.ext'
    })).basePath).to.equal('/folder/file.ext');
    expect((new PushStateTree({
      basePath: '/folder/file.ext'
    })).basePath).to.equal('/folder/file.ext');
    expect((new PushStateTree({
      basePath: 'folder/file.ext?param=value'
    })).basePath).to.equal('/folder/file.ext?param=value');
    expect((new PushStateTree({
      basePath: '/folder/file.ext?param=value'
    })).basePath).to.equal('/folder/file.ext?param=value');
  });

  it('should convert empty to slash', () => {
    var pst = new PushStateTree();
    expect(pst.basePath).to.equal('/');
  });

  it('should detect when ends without slash', () => {
    var pst = new PushStateTree({
      basePath: 'file.html'
    });

    pst.path = '/file.html/test';
    pst.dispatch();

    expect(pst.uri).to.equal('test');
  });

  it('should not share the property between route instances', () => {
    var pst1 = new PushStateTree({
      basePath: '1/'
    });
    var pst2 = new PushStateTree({
      basePath: '2/'
    });
    expect(pst1.basePath).to.equal('/1/');
    expect(pst2.basePath).to.equal('/2/');
  });
});
