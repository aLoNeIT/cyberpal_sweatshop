import { ChangeDetectorRef, Component, Injector, Input } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingService } from '@delon/abc/loading';
import { ACLService } from '@delon/acl';
import { _HttpClient, ModalHelper, DrawerHelper } from '@delon/theme';
import { SHARED_IMPORTS } from '@shared';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
@Component({
  template: '',
  imports: SHARED_IMPORTS
})
export class YzbBaseComponent {
  /**
   * 载入状态
   */
  @Input() @InputBoolean() loading: boolean = false;

  constructor(protected injector: Injector) {
    this.initialize();
  }
  /**
   * 初始化操作，该方法是类创建时候就执行，先于ngOnInit执行
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-04-02
   * @protected
   */
  protected initialize() {}
  /**
   * http客户端
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-03-17
   * @readonly
   * @protected
   * @type {_HttpClient}
   */
  protected get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }
  /**
   * 数据变更检测服务
   */
  protected get cdr(): ChangeDetectorRef {
    return this.injector.get(ChangeDetectorRef);
  }
  /**
   * 窗体助手
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-03-17
   * @readonly
   * @protected
   * @type {ModalHelper}
   */
  protected get modal(): ModalHelper {
    return this.injector.get(ModalHelper);
  }
  protected get modaldraw(): DrawerHelper {
    return this.injector.get(DrawerHelper);
  }
  protected get drawer(): NzDrawerRef {
    return this.injector.get(NzDrawerRef);
  }
  protected get modalRef(): NzModalRef {
    return this.injector.get(NzModalRef);
  }
  /**
   * 消息服务
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-03-17
   * @readonly
   * @protected
   * @type {NzMessageService}
   */
  protected get msgSrv(): NzMessageService {
    return this.injector.get(NzMessageService);
  }

  protected get modalSrv(): NzModalService {
    return this.injector.get(NzModalService);
  }

  protected get sanitizer(): DomSanitizer {
    return this.injector.get(DomSanitizer);
  }
  /**
   * @description: 表单
   * @return {*}
   */
  protected get fb(): UntypedFormBuilder {
    return this.injector.get(UntypedFormBuilder);
  }

  protected get loadingSrv(): LoadingService {
    return this.injector.get(LoadingService);
  }

  protected get aclSrv(): ACLService {
    return this.injector.get(ACLService);
  }
}
