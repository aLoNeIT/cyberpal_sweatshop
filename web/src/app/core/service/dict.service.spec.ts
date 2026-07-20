import { of } from 'rxjs';

import { DictService } from './dict.service';

describe('DictService', () => {
  const cacheOptions = {
    mode: 'promise',
    type: 'm',
    expire: 86400
  };

  function createService(appType: number | null = 5) {
    const cacheSrv = jasmine.createSpyObj('CacheService', ['get']);
    const appTypeNameGetter = jasmine.createSpy('appTypeNameGetter').and.returnValue('distributor');
    const privilegeSrv = {
      appType
    };

    Object.defineProperty(privilegeSrv, 'appTypeName', {
      get: appTypeNameGetter
    });

    cacheSrv.get.and.returnValue(
      of({
        state: 0,
        msg: '',
        data: {}
      })
    );

    return {
      service: new DictService({} as any, cacheSrv as any, privilegeSrv as any),
      cacheSrv,
      appTypeNameGetter
    };
  }

  it('gets dictionary metadata from the home dictionary endpoint', () => {
    const { service, cacheSrv, appTypeNameGetter } = createService(5);

    service.get(1004, 5).subscribe();

    expect(cacheSrv.get).toHaveBeenCalledWith('home/v1/dict/1004?app_type=5', cacheOptions);
    expect(appTypeNameGetter).not.toHaveBeenCalled();
  });

  it('does not append a trailing slash when app type is omitted', () => {
    const { service, cacheSrv } = createService(null);

    service.get(1000).subscribe();

    expect(cacheSrv.get).toHaveBeenCalledWith('home/v1/dict/1000', cacheOptions);
  });

  it('gets dictionary code items from the home code endpoint', () => {
    const { service, cacheSrv, appTypeNameGetter } = createService(5);

    service.getCode(103).subscribe();

    expect(cacheSrv.get).toHaveBeenCalledWith('home/v1/code?dict=103', cacheOptions);
    expect(appTypeNameGetter).not.toHaveBeenCalled();
  });
});
