const PushStateTree = require('../src/pushStateTree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree Router basePath', function () {

  cleanHistoryAPI();

  it('should allow to set the base path', function () {
    var pst = new PushStateTree({
      basePath: '/test/'
    });
    expect(pst.basePath).to.equal('/test/');
  });

  it('should normalize basePath folder', function () {
    expect((new PushStateTree({
      basePath: 'folder/'
    })).basePath).to.equal('/folder/');
    expect((new PushStateTree({
      basePath: 'folder/sub-folder/'
    })).basePath).to.equal('/folder/sub-folder/');
  });

  it('should normalize basePath file', function () {
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

  it('should use the non relative root as basePath if not specified', function () {
    history.pushState(null, null, '/abc/123/');
    var pst = new PushStateTree();
    expect(pst.basePath).to.equal('/');
  });

  it('should not share the basePath between route instances', function () {
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
