import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { InputNumber } from 'ng-zorro-antd/core/util';
import { ReplaySubject } from 'rxjs';
import { str2VS, zeroOfDayByMsTime } from '../../../utils/function';

import { YzbBaseComponent } from '../yzb-base.component';
import { CommonService, DictService } from '@core';
import { IKVPaire, IConditionSet, Dict } from '../../../model/public-api';
import { SHARED_IMPORTS } from 'src/app/shared/shared-imports';

@Component({
  template: '',
  imports: SHARED_IMPORTS
})
/**
 * 组件基类
 *
 * @export
 * @class BaseComponent
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 */
export class YzbCurdComponent extends YzbBaseComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /**
   * 字典服务
   */
  protected dictSvr!: DictService;
  /**
   * 通用服务
   */
  protected commonSvr!: CommonService;

  /**
   * 加载提示语
   */
  @Input() loadingTip = '加载中...';
  /**
   * 当前窗体对应的字典
   */
  @Input() dict!: Dict;

  /**
   * 当前curd类型
   */
  @Input() @InputNumber() curd: number = 15;

  /**
   * 字典项属性
   */
  dictId: number = 0;

  /**
   * 是否初始化组件中
   */
  initControl: boolean = true;
  /**
   * ng数据变更可观察对象，支持数据重放
   */
  protected rsNgOnChanges!: ReplaySubject<SimpleChanges>;
  /**
   * 字典服务
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-04-02
   * @readonly
   * @protected
   * @type {DictService}
   */
  protected get dictSrv(): DictService {
    return this.injector.get(DictService);
  }
  /**
   * 通用服务
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-04-02
   * @readonly
   * @protected
   * @type {CommonService}
   */
  protected get commonSrv(): CommonService {
    return this.injector.get(CommonService);
  }

  protected override initialize() {
    super.initialize();
    // 创建数据变更可观察对象
    this.rsNgOnChanges = new ReplaySubject<SimpleChanges>();
  }

  ngOnInit() {
    // 执行操作
    let i = 0;
    i++;
  }

  ngOnDestroy() {
    this.rsNgOnChanges.unsubscribe();
  }

  ngAfterViewInit() {
    // 界面组件渲染完毕后，再订阅执行
    this.rsNgOnChanges.subscribe(changes => {
      // 该执行可以获取所有已发布的数据
      this.onChanges(changes);
    });
  }
  /**
   * ng绑定数据被父组件变更事件
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-22
   * @param {SimpleChanges} changes 简易数据变化对象
   */
  ngOnChanges(changes: SimpleChanges) {
    this.rsNgOnChanges.next(changes);
  }
  /**
   * 自定义数据变更事件，因为使用了观察者模式，
   * 所以实际的数据变更执行方法都在这里
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-22
   * @param {SimpleChanges} changes 简易数据变化对象
   */
  protected onChanges(changes: SimpleChanges) {
    if (changes['dict'] && changes['dict'].currentValue) {
      const dict = changes['dict'].currentValue as Dict;
      this.dictId = dict.id;
      this.onInitDict(dict);
    }
  }

  protected onInitDict(dict: Dict) {}

  /**
   * 处理条件表达式
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-12
   * @protected
   * @param {IKVPaire} data 待处理的数据
   * @returns {*}  {IKVPaire}
   */
  protected procCondition(data: IKVPaire): IConditionSet {
    const result: IConditionSet = {};
    Object.keys(data).forEach((key, idx, arr) => {
      const value = data[key],
        dictItem = this.dict.getItem(key);
      if (dictItem && dictItem.filtered) {
        // 查询到了字典项
        switch (dictItem.type) {
          case 3: // 时间字段
          case 4:
          case 5:
            // 目前只有时间字段会有区间
            // 判断是否存在带有end后缀的key
            if (data[`${key}_end`]) {
              // 存在，则拼接区间条件
              result[key] = {
                field: key,
                operator: '>=',
                value: parseInt(String(zeroOfDayByMsTime(value)))
              };
              result[`${key}_end`] = {
                field: key,
                operator: '<',
                value: parseInt(String(zeroOfDayByMsTime(data[`${key}_end`] + 86400000)))
              };
            } else {
              // 不存在，则拼接相等条件
              result[key] = {
                field: key,
                operator: '=',
                value: parseInt(String(value / 1000))
              };
            }
            break;
          default:
            let operator = '=',
              val = dictItem.key_dict > 0 || dictItem.link_dict > 0 || dictItem.show_dict > 0 ? str2VS(value).value : value;
            if ('' !== val && null !== val && undefined !== val) {
              switch (dictItem.fuzzy) {
                case 2: // 右匹配
                  operator = 'like';
                  val = `${val}%`;
                  break;
                case 3: //左匹配
                  operator = 'like';
                  val = `%${val}`;
                  break;
                case 4: //左右匹配
                  operator = 'like';
                  val = `%${val}%`;
                  break;
                default:
                  //全等
                  operator = '=';
                  break;
              }
            }
            result[key] = {
              field: key,
              operator: operator,
              value: val
            };
            break;
        }
      }
    });
    return result;
  }
}
