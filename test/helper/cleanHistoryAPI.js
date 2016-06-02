import useBrowser from './useBrowser';

export default function cleanHistoryAPI() {

  useBrowser();

  let originalWindowAddEventListener = window.addEventListener;
  let windowEvents = [];
  let originalDocumentAddEventListener = document.addEventListener;
  let documentEvents = [];

  before(() => {
    window.addEventListener = function () {
      windowEvents.push(arguments);
      originalWindowAddEventListener.apply(this, arguments);
    };
    document.addEventListener = function () {
      documentEvents.push(arguments);
      originalDocumentAddEventListener.apply(this, arguments);
    };
  });

  after(() => {
    window.addEventListener = originalWindowAddEventListener;
  });

  beforeEach(() => {
    history.pushState(null, null, '/');
  });

  afterEach(() => {
    // Reset the URI before begin the tests
    history.pushState(null, null, '/');

    // Reset window events
    windowEvents.forEach(args => {
      window.removeEventListener(...args);
    });

    // Reset document events
    documentEvents.forEach(args => {
      document.removeEventListener(...args);
    });
  });
}