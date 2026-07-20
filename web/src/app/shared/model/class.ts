import { DictItemSet, IKVPaire } from './core';
import { IDict, IDictItem, IDictItemSet } from './table';

const toNumber = (value: unknown): number => Number(value);

/**
 * 字典类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-13
 * @export
 * @class Dict
 */
export class Dict {
  /**
   * 字典数据
   */
  protected data: IDict | null = null;
  /**
   * 字典项数据
   */
  protected item: DictItemSet = {};
  /**
   * 主键字典项
   */
  protected primaryKey: DictItem | null = null;

  constructor(data: IDict) {
    this.load(data);
  }
  /**
   * 加载数据
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-14
   * @param {IDict} data
   */
  load(data: IDict): void {
    this.clear();
    this.data = data;
    this.loadItem(this.data.dict_item!);
    // delete this.data.dict_item;
  }

  loadItem(dictItems: IDictItem[]): void;
  loadItem(dictItemSet: IDictItemSet): void;
  loadItem(collection: any): void {
    if (Array.isArray(collection)) {
      (collection as IDictItem[]).forEach(dictItem => this.addItem(dictItem));
    } else {
      // 视为对象
      Object.keys(collection).forEach(key => this.addItem(collection[key]));
    }
  }

  addItem(dictItem: IDictItem) {
    this.item[dictItem.fieldname!] = new DictItem(dictItem, this);
  }

  getItem(fieldName: string): DictItem | null {
    return this.item[fieldName] ? this.item[fieldName] : null;
  }

  getItemAll(): DictItemSet {
    return this.item;
  }
  /**
   * 遍历每个字典项，并使用传入的回调执行。若回调返回false，则终止循环
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-14
   * @param {(key: string, item: DictItem) => boolean} callback
   */
  eachItem(callback: (key: string, item: DictItem) => boolean): boolean {
    return false !== Object.keys(this.item).every(key => callback(key, this.item[key]));
  }

  /**
   *判断指定字典项是否存在
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-01-14
   * @param {string} fieldName 字典项对应的字段名称
   * @returns {*}  {boolean}
   */
  exists(fieldName: string): boolean {
    return !!this.item[fieldName];
  }

  clear() {
    this.data = null;
    this.item = {};
  }

  itemCount(): number {
    return Object.keys(this.item).length;
  }

  getFieldValue(field: string): any {
    return (this.data as IKVPaire)[field] || undefined;
  }

  getPrimaryKey(): DictItem | null {
    if (null != this.primaryKey) {
      return this.primaryKey;
    }
    Object.keys(this.item).every(key => {
      if (1 === this.item[key].getFieldValue('pk')) {
        this.primaryKey = this.item[key];
        return false;
      }
      return true;
    });
    return this.primaryKey;
  }

  getData(): IDict {
    // 将DictItemSet转换成IDictItemSet集合
    let dictItem: IDictItem | null = null;
    const dictItemSet: IDictItemSet = {};
    Object.keys(this.item).every(key => {
      dictItem = this.item[key].getData();
      if (null != dictItem) {
        dictItemSet[key] = dictItem;
      }
      return true;
    });
    return { ...this.data, dict_item: dictItemSet };
  }
  get id(): number {
    return this.data!['id'] || 0;
  }
  get name(): string {
    return this.data!['name'] || '';
  }
  get tablename(): string {
    return this.data!['tablename'] || '';
  }
  get sub(): string {
    return this.data!['sub'] || '';
  }
  get prefix(): string {
    return this.data!['prefix'] || '';
  }
}
/**
 * 字典项类
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-13
 * @export
 * @class DictItem
 */
export class DictItem {
  /**
   * 字典项数据
   */
  protected data: IDictItem | null = null;
  /**
   * 字典对象
   */
  protected dictObj: Dict;

  constructor(data: IDictItem, dict: Dict) {
    this.data = data;
    this.dictObj = dict;
  }

  getFieldValue(field: string): any {
    return (this.data as IKVPaire)[field];
  }

  load(data: IDictItem) {
    this.data = data;
  }

  clear() {
    this.data = null;
  }

  clone(): IDictItem {
    return { ...this.data! };
  }

  getData(): IDictItem | null {
    return this.data;
  }

  get id(): number {
    return this.data!['id'] || 0;
  }
  get dict(): number {
    return this.data!['dict'] || 0;
  }
  get name(): string {
    return this.data!['name'] || '';
  }
  get fieldname(): string {
    return this.data!['fieldname'] || '';
  }
  get type(): number {
    return this.data!['type'] || 0;
  }
  get subtype(): number {
    return this.data!['subtype'] || 0;
  }
  get max(): number {
    return this.data!['max'] || 0;
  }
  get min(): number {
    return this.data!['min'] || 0;
  }
  get pk(): number {
    return this.data!['pk'] || 0;
  }
  get autoed(): number {
    return this.data!['autoed'] || 0;
  }
  get pwded(): number {
    return this.data!['pwded'] || 0;
  }
  get regex(): string {
    return this.data!['regex'] || '';
  }
  get regex_msg(): string {
    return this.data!['regex_msg'] || '';
  }
  get unit(): string {
    return this.data!['unit'] || '';
  }
  get show_width(): number {
    return this.data!['show_width'] || 0;
  }
  get sort(): number {
    return this.data!['sort'] || 0;
  }
  get fuzzy(): number {
    return this.data!['fuzzy'] || 0;
  }
  get key_dict(): number {
    return this.data!['key_dict'] || 0;
  }
  get key_table(): string {
    return this.data!['key_table'] || '';
  }
  get key_field(): string {
    return this.data!['key_field'] || '';
  }
  get key_show(): string {
    return this.data!['key_show'] || '';
  }
  get key_join_name(): string {
    return this.data!['key_join_name'] || '';
  }
  get key_join_type(): string {
    return this.data!['key_join_type'] || '';
  }
  get key_condition(): string {
    return this.data!['key_condition'] || '';
  }
  get key_visibled(): number {
    return this.data!['key_visibled'] || 0;
  }
  get key_width(): number {
    return this.data!['key_width'] || 0;
  }
  get key_height(): number {
    return this.data!['key_height'] || 0;
  }
  get link_dict(): number {
    return this.data!['link_dict'] || 0;
  }
  get link_table(): string {
    return this.data!['link_table'] || '';
  }
  get link_field(): string {
    return this.data!['link_field'] || '';
  }
  get show_dict(): number {
    return this.data!['show_dict'] || 0;
  }
  get show_table(): string {
    return this.data!['show_table'] || '';
  }
  get show_field(): string {
    return this.data!['show_field'] || '';
  }
  get default(): string | number | null {
    // if ('' === this.data!['default']) {
    //   return '';
    // }
    //在alain19版本发现sf表单在设置type =number的情况下，default为空字符串，表单校验不起作用
    //  tonumber 传入空字符串返回0
    switch (this.type) {
      case 1:
      case 2:
      case 7:
        return this.data!['default'] ? toNumber(this.data!['default']) : null;
      case 3:
      case 4:
      case 5:
        if (1 == this.subtype) {
          return this.data!['default'] ? toNumber(this.data!['default']) : null;
        }
        return this.data!['default'] || '';
      default:
        return this.data!['default'] || '';
    }
  }
  get required(): number {
    return this.data!['required'] || 0;
  }
  get inputed(): number {
    return this.data!['inputed'] || 0;
  }
  get input_width(): number {
    return this.data!['input_width'] || 0;
  }
  get show_order(): number {
    return this.data!['show_order'] || 0;
  }
  get curd(): number {
    return this.data!['curd'] || 0;
  }
  get group(): string {
    return this.data!['group'] || '';
  }
  get select(): string {
    return this.data!['select'] || '';
  }
  get filtered(): number {
    return this.data!['filtered'] || 0;
  }
  get readonly(): number {
    return this.data!['readonly'] || 0;
  }
}
