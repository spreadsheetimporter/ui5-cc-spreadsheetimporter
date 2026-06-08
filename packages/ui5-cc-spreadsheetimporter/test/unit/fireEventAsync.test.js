/**
 * Regression tests for Util.fireEventAsync (src/controller/Util.ts).
 *
 * The component dispatches all of its custom extension events (checkBeforeRead,
 * changeBeforeCreate, beforeDownloadFileProcessing, beforeDownloadFileExport,
 * requestCompleted, uploadButtonPress) through this method. It previously invoked each
 * handler with `oInfo.fFunction.call(null, event)`, which:
 *   - dropped the listener context consumers register via attach<Event>(fn, oListener), so a
 *     handler that uses `this` (as the README + example apps do) threw, and
 *   - swallowed that throw, so the extension point silently no-opped.
 *
 * These tests pin the fixed behaviour: handlers run with the registered oListener as `this`.
 *
 * Required by full path so the `^../Util$`/`^./Util$` mock mappings don't shadow the real module.
 */
const Util = require('../../src/controller/Util').default;

function componentWith(listeners) {
  // fireEventAsync reads component.mEventRegistry[eventName]; entries mirror the UI5
  // EventProvider shape { fFunction, oListener, oData }.
  return { mEventRegistry: { myEvent: listeners } };
}

describe('Util.fireEventAsync', () => {
  it('invokes the handler with the registered oListener as `this`', async () => {
    let capturedThis = 'UNSET';
    const listener = { tag: 'the-listener' };
    const component = componentWith([
      {
        fFunction: function () {
          capturedThis = this;
        },
        oListener: listener
      }
    ]);

    await Util.fireEventAsync('myEvent', { foo: 1 }, component);

    expect(capturedThis).toBe(listener);
  });

  it('lets a `this`-using handler actually run and mutate consumer state (the footgun)', async () => {
    const consumer = {
      received: null,
      onEvent: function (oEvent) {
        // references `this` exactly like the documented examples do
        this.received = oEvent.getParameter('rawData');
      }
    };
    const component = componentWith([{ fFunction: consumer.onEvent, oListener: consumer }]);

    await Util.fireEventAsync('myEvent', { rawData: [{ a: 1 }] }, component);

    expect(consumer.received).toEqual([{ a: 1 }]);
  });

  it('falls back to the component as `this` when no oListener was registered', async () => {
    let capturedThis = 'UNSET';
    const component = componentWith([
      {
        fFunction: function () {
          capturedThis = this;
        },
        oListener: undefined
      }
    ]);

    await Util.fireEventAsync('myEvent', {}, component);

    expect(capturedThis).toBe(component);
  });

  it('captures preventDefault() from a handler in the return value', async () => {
    const component = componentWith([
      {
        fFunction: function (oEvent) {
          oEvent.preventDefault();
        },
        oListener: null
      }
    ]);

    const ret = await Util.fireEventAsync('myEvent', {}, component);

    expect(ret.bPreventDefault).toBe(true);
  });

  it('isolates a throwing handler so later listeners still run', async () => {
    let secondRan = false;
    const component = componentWith([
      {
        fFunction: function () {
          throw new Error('boom');
        },
        oListener: null
      },
      {
        fFunction: function () {
          secondRan = true;
        },
        oListener: null
      }
    ]);

    await Util.fireEventAsync('myEvent', {}, component);

    expect(secondRan).toBe(true);
  });

  it('awaits async handlers before resolving', async () => {
    let resolvedFlag = false;
    const component = componentWith([
      {
        fFunction: function () {
          return new Promise(resolve => {
            setTimeout(() => {
              resolvedFlag = true;
              resolve();
            }, 5);
          });
        },
        oListener: null
      }
    ]);

    await Util.fireEventAsync('myEvent', {}, component);

    expect(resolvedFlag).toBe(true);
  });

  it('returns gracefully when no listeners are registered for the event', async () => {
    const ret = await Util.fireEventAsync('unregisteredEvent', { x: 1 }, { mEventRegistry: {} });

    expect(ret).toBeDefined();
    expect(ret.bPreventDefault).toBeFalsy();
  });
});
