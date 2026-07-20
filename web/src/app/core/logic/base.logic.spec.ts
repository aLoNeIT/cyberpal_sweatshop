import { Injector } from '@angular/core';

import { BaseLogic } from './base.logic';

describe('BaseLogic', () => {
  class TestLogic extends BaseLogic {}

  const injector = {
    get: () => ({})
  } as unknown as Injector;

  afterEach(() => {
    delete (TestLogic as unknown as { _instance?: unknown })._instance;
  });

  it('does not reuse a stale cached instance from a previous logic class version', () => {
    (TestLogic as unknown as { _instance?: unknown })._instance = {};

    const instance = TestLogic.getInstance(injector);

    expect(instance instanceof TestLogic).toBeTrue();
  });
});
