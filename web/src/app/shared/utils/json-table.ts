import { IJsonTable, JsonTableData } from '../model/public-api';

/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *
 *
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *            佛祖保佑       永不宕机     永无BUG
 */

/**
 * @description JsonTable数据格式
 * @author aLoNe.Adams.K
 * @date 2020-02-09
 * @export 导出JsonTable类
 */
export class JsonTable {
  /**
   * 状态码
   */
  protected _state: number = 0;
  /**
   * 消息内容
   */
  protected _msg: string | object = 'success';
  /**
   * 扩展数据
   */
  protected _data: JsonTableData = null;
  /**
   * 判断指定对象是否是实现了IJsonTable接口
   *
   * @param obj 任意实例对象
   */
  public static instanceof(obj: any): obj is IJsonTable {
    return typeof (obj as IJsonTable)?.state !== 'undefined' && typeof (obj as IJsonTable)?.msg !== 'undefined';
  }
  /**
   * @description JsonTable构造函数
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-09
   */
  public constructor() {}

  public get state(): number {
    return this._state;
  }

  public get msg(): string | object {
    return this._msg;
  }

  public get data(): JsonTableData {
    return this._data;
  }
  public setData(jsonTable: IJsonTable): JsonTable;
  /**
   * 设置JsonTable对象内容
   *
   * @param state 状态码
   * @param msg 消息内容
   * @param data 扩展数据
   */
  public setData(state: number, msg: string | object, data?: JsonTableData): JsonTable;
  /**
   * 设置JsonTable数据
   *
   * @param state 状态码
   * @param msg 消息内容
   * @param data 数据体
   * @returns JsonTable
   *
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-09
   */
  public setData(state: number | IJsonTable, msg?: string | object, data?: JsonTableData): JsonTable {
    // 传递进来的是实现了IJsonTable实例对象
    if (JsonTable.instanceof(state)) {
      msg = state.msg;
      data = state.data ? state.data : null;
      state = state.state;
    }
    this._state = state;
    this._msg = msg || '';
    this._data = data ? data : null;
    return this;
  }
  /**
   * @description 设置成功数据
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-16
   * @param msg 消息
   * @param data 数据体
   */
  public success(msg: string = 'success', data?: JsonTableData): JsonTable {
    return this.setData(0, msg, data);
  }
  /**
   * @description 创建新JsonTable对象并返回成功数据
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-09
   * @param msg 消息
   * @param data 数据
   */
  public withSuccess(msg: string = 'success', data?: JsonTableData): JsonTable {
    return new JsonTable().success(msg, data);
  }
  /**
   * @description 设置错误信息
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-16
   * @param state 状态码
   * @param msg 消息
   * @param data 数据体
   */
  public error(state: number = 1, msg: string = 'error', data?: JsonTableData): JsonTable {
    return this.setData(state, msg, data);
  }
  /**
   * @description 创建一个包含错误信息的新对象
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-16
   * @param state 状态码
   * @param msg 消息
   * @param data 数据体
   */
  public withError(state: number = 1, msg: string = 'error', data?: JsonTableData): JsonTable {
    return new JsonTable().setData(state, msg, data);
  }
  /**
   * @description 判断当前对象是否包含成功数据
   * @author aLoNe.Adams.K <alone@alonetech.com>
   * @date 2020-02-16
   */
  public isSuccess(): boolean {
    return this._state === 0;
  }
  /**
   * 单例对象
   */
  protected static _instance: JsonTable | null = null;
  /**
   * 获取单例对象
   */
  public static instance(newInstance = false): JsonTable {
    if (null == JsonTable._instance || newInstance) {
      JsonTable._instance = new JsonTable().success();
    }
    return JsonTable._instance!;
  }
}
