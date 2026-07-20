import { formatDate } from '@angular/common';
import { ComponentRef, Injector, Type, ViewContainerRef } from '@angular/core';
import { STColumnYn } from '@delon/abc/st';
import { SFSchemaEnum } from '@delon/form';
import { getTimeDistance } from '@delon/util';
import { toByteArray } from 'base64-js';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { Base64 } from 'js-base64';
import { parseISO, differenceInYears, differenceInMonths, differenceInDays, addMonths, subYears } from 'date-fns';
import { IYzbButton } from '../component/common/yzb-button-group.component';
import { SEX } from '../consts/user.consts';
import { IArrayPaire, IConditionSet, IJsonTable } from '../model/public-api';

const toNumber = (value: unknown): number => Number(value);

// 共享函数
// 需要注意部分变量不同项目内单独维护

/**
 * 文件格式
 *
 * @export
 * @param file 文件
 * @param max 需要判断的文件后缀，不用点
 * @returns {*}
 */
export function checkFileType(file: any, allowedFormats: string | any[]) {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  return allowedFormats.includes(fileExtension);
}
export function formatMsTime(msecond: number, format: string = 'yyyy-MM-dd HH:mm:ss', locale: string = 'zh'): string {
  return formatDate(msecond, format, locale);
}

export function formatSecTime(second: number, format: string = 'yyyy-MM-dd HH:mm:ss', locale: string = 'zh'): string {
  let time = '';
  second ? (time = formatMsTime(second * 1000, format, locale)) : (time = '-');
  return time;
}
/**
 * 根据小时数获取今日时间
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-04-13
 * @export
 * @param {number} [hour=0] 小时
 * @returns {*}  {number} 返回当天时间毫秒值
 */
export function dayTimeByHour(hour: number = 0): number {
  hour = hour < 0 ? 0 : hour > 23 ? 23 : hour;
  return getTimeDistance('today')[0].setHours(hour);
}

/**
 * 生成指定范围的随机数
 *
 * @param min 最小值
 * @param max 最大值
 * @returns 返回生成的随机数
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
/**
 * 从select内容获取yes、no的展示数据
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2020-12-28
 * @export
 * @param {string} select 字典配置的select数据
 * @returns {*}  {{ yes: string; no: string }}
 */
export function ynFromSelect(select: string, mode: 'text' | 'full' | 'icon' = 'text', truth: any = 1): STColumnYn {
  let result = {
    yes: '是',
    no: '否'
  };
  if (select) {
    select.split(';').forEach(item => {
      let arr = item.split('-');
      if ('1' == arr[0]) {
        result['yes'] = arr[1];
      } else {
        result['no'] = arr[1];
      }
    });
  }
  return { ...result, truth: truth, mode: mode };
}
/**
 * select转换为enum对象数组
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-22
 * @export
 * @param {string} select 字典项select字符串
 * @param {string} [sp='-'] 分隔符
 * @param {boolean} [numbered=true] value是否是数值
 * @returns {*}  {SFSchemaEnum[]}
 */
export function enumFromSelect(select: string, sp: string = '-', numbered: boolean = true): SFSchemaEnum[] {
  let result: SFSchemaEnum[] = [
    {
      label: '请选择',
      value: null
    }
  ];
  select.split(';').forEach(item => {
    const arr = item.split(sp);
    result.push({
      label: arr[1],
      value: numbered ? toNumber(arr[0]) : arr[0] // value必须为数值型
    });
  });
  return result;
}
/**
 * 从select字符串中获取指定值的内容
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-22
 * @export
 * @param {*} value 需要比较的值
 * @param {string} select 字段select字符串
 * @param {string} [sp='-'] 分隔符
 * @returns {*} string 返回获取到的内容
 */
export function showFromSelect(value: any, select: string): string {
  let result: string = '';
  // 分割每个选项
  select.split(';').every(item => {
    const arr = item.split('-');
    // 判断比较的value是否和分隔符前半部分一致
    if (arr.length > 0 && value == arr[0]) {
      // 配置返回值
      result = arr.length > 1 ? arr[1] : value;
      // 终止循环
      return false;
    }
    return true;
  });
  return result;
}

/**
 * 转换性别为动态表单枚举对象
 */
export function sex2SFSchemaEnum(): SFSchemaEnum {
  return Object.keys(SEX).map(item => {
    return { lable: Number.parseInt(SEX[item]), value: item };
  });
}
/**
 * 获取所需类型的按钮
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2020-12-30
 * @export
 * @param {IYzbButton[]} buttons
 * @param {number} [style=1]
 * @returns {*}  {IYzbButton[]}
 */
export function filterButtons(buttons: IYzbButton[], style: number = 1): IYzbButton[] {
  let result: IYzbButton[] = [],
    buttonDefault: IYzbButton = {
      title: '',
      code: '',
      type: 'default',
      style: 1,
      class: '',
      enable: true
    };
  buttons.forEach(button => {
    // 检查按钮类型是否是顶部按钮
    button = Object.assign(buttonDefault, button);
    if (button.style == (button.style || 0 & style)) {
      result.push(button);
    }
  });
  return result;
}

export function arr2tree(): any[] {
  //  {name:'',children:[{name:'',children:[{name:''}]}]}
  const src: any = {},
    top: any[] = [];
  const data = ['a/b/c', 'a/b/d', 'a/e/f', 'x/y/z'];
  data.forEach(item => {
    let arrPath: any[] = [];
    item.split('/').forEach(($item, $idx) => {
      const parentPath = arrPath.join('/');
      let parentObj: any = null;
      // 寻找上级节点
      if ('' != parentPath && src[parentPath]) {
        parentObj = src[parentPath];
      }
      // 路径添加本次节点
      arrPath.push($item);
      const currPath = arrPath.join('/');
      let currObj: NzSafeAny = null;
      // 处理本次节点对象，若无则创建
      if (!src[currPath]) {
        currObj = { name: $item, path: currPath };
        src[currPath] = currObj;
      }
      currObj = src[currPath];
      // 存在上级节点，则将本节点添加至上级节点的children内
      if (null != parentObj) {
        parentObj.children = parentObj.children || [];
        if (!parentObj.children.find((currValue: NzSafeAny) => currValue == currObj)) {
          parentObj.children.push(currObj);
        }
      }
      // 判断当前节点是否是顶级节点，且数组内未存在当前节点
      if (0 == $idx && !top.find(currValue => currValue == currObj)) {
        top.push(currObj);
      }
    });
  });
  return top;
}

/**
 * 通过身份证号 获取年龄 生日 性别
 *
 * @author 苏小风(sujiachen@youzhibo.cn)
 * @date 2021-01-18
 * @export
 * @param {idCard} string // 身份证号
 * @returns
 */
export function calculateAgeAndUnit(idNumber: string): { age: number; ageUnit: '1' | '2' | '3'; birthTimestamp: Date } {
  // 提取出生日期
  const birthDateStr = `${idNumber.slice(6, 10)}-${idNumber.slice(10, 12)}-${idNumber.slice(12, 14)}`;
  const birthDate = parseISO(birthDateStr);

  // 获取当前日期
  const currentDate = new Date();

  // 计算年龄
  let age = differenceInYears(currentDate, birthDate);

  let ageUnit: any = '1'; // 默认单位为岁

  // 检查是否未满1岁
  if (age < 1) {
    // 计算月数
    const months = differenceInMonths(currentDate, birthDate);
    if (months < 1) {
      // 计算天数
      const days = Math.floor(differenceInDays(currentDate, birthDate));
      if (days > 0) {
        age = days;
        ageUnit = '3'; // 单位为天
      } else {
        age = 0; // 如果还没过生日，年龄为0
      }
    } else {
      age = months;
      ageUnit = '2'; // 单位为月
    }
  }

  return { age, ageUnit, birthTimestamp: birthDate };
}

/**
 * @param {dDate} Date // 时间格式
 * @returns { data: { age: number, age_unit: string } } // 年龄, 年龄单位 1:岁, 2:月, 3:天
 */
// 根据生日计算年龄
export function birthdayToAge(birthDate: Date) {
  if (!birthDate) return null;

  const today = new Date();
  const ageInYears = differenceInYears(today, birthDate);
  const ageInMonths = differenceInMonths(today, birthDate);
  const ageInDays = differenceInDays(today, birthDate);

  if (ageInYears >= 1) {
    return { age: ageInYears, age_unit: '1' }; // '1'表示岁
  } else if (ageInMonths >= 1) {
    return { age: ageInMonths, age_unit: '2' }; // '2'表示月
  } else {
    return { age: ageInDays, age_unit: '3' }; // '3'表示天
  }
}

/**
 * 时间戳转日期 去掉时分秒
 *
 * @author 苏小风(sujiachen@youzhibo.cn)
 * @date 2021-02-23
 * @export
 * @param {dDate} Date // 时间格式
 * @returns {*} 时间戳 秒
 */
export function dateTimeToUnixDate(dDate: Date): number {
  let unixdate;
  const dateText = `${dDate.getFullYear()}-${dDate.getMonth() + 1}-${dDate.getDate()}`;
  unixdate = new Date(dateText).getTime() / 1000;
  return unixdate;
}
/**
 * 日期区间转换为秒时间戳
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2022-11-30
 * @export
 * @param {(Date | number)} start 起始时间
 * @param {(Date | number)} end 结束时间
 * @returns {*}  {[number, number]} 返回时间范围，第一个是起始时间当天0点，第二个是结束时间第二天0点
 */
export function dayRangeToUnixDate(start: Date | number, end: Date | number): [number, number] {
  const startDate: Date = Number.isInteger(start) ? new Date(start) : (start as Date);
  const endDate: Date = Number.isInteger(end) ? new Date((end as number) + 86400000) : new Date((end as Date).getTime() + 86400000);
  return [dateTimeToUnixDate(startDate), dateTimeToUnixDate(endDate)];
}
/**
 * 获取当天0点
 *
 * @param mstime 毫秒时间戳
 * @param locale 时区
 * @returns 返回秒级时间戳
 */
export function zeroOfDayByMsTime(mstime: number, locale: string = 'zh'): number {
  const date = new Date(formatMsTime(mstime, 'yyyy-MM-dd 00:00:00', locale));
  return date.getTime() / 1000;
}

/**
 * 字符串转VS数据
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2022-09-13
 * @export
 * @param {string} str kv结构字符串
 * @param {string} [sp='-'] 分隔符
 * @returns {*}  {({ value: string | number; show: string | null})}
 */
export function str2VS(str: string, sp: string = '-'): { value: string | number; show: string | null } {
  const arr = String(str).split(sp);
  return {
    value: arr[0] || '',
    show: arr[1] || null
  };
}
/**
 * vs结构数据转换为字符串
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-21
 * @export
 * @param {(string | number)} value vs的值
 * @param {string} show vs的显示内容
 * @param {string} [sp='-'] 分隔符
 * @returns {*}  {string} 返回组装好的字符串
 */
export function vs2Str(value: string | number, show: string, sp: string = '-'): string {
  return `${value}${sp}${show}`;
}

/**
 * 判断给定字符串是否vs结构数据
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2021-06-18
 * @export
 * @param {string} str 待判断的字符串
 * @param {string} [sp='-'] 分隔符
 * @returns {*}  {boolean} 返回判定结果，true是vs字符串，false不是
 */
export function isVSStr(str: string, sp: string = '-'): boolean {
  return str.split(sp).length > 1;
}

/**
 * 动态创建组件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-27
 * @export
 * @param {Type<any>} componentType 组件类类型
 * @param {Injector} injector 依赖注入对象
 * @returns {*}  {ComponentRef<any>} 返回组件引用
 */
export function createComponent(componentType: Type<any>, injector: Injector): ComponentRef<any> {
  const vcr = injector.get(ViewContainerRef),
    componentRef = vcr.createComponent(componentType, { injector }),
    view = componentRef.hostView;
  vcr.insert(view);
  return componentRef;
}
/**
 * 创建IJsonTable数据格式
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-27
 * @export
 * @param {number} state 状态码
 * @param {(string | any)} msg 消息
 * @param {*} [data] 详细数据
 * @returns {*}  {IJsonTable}
 */
export function jtable(state: number, msg: string | any, data?: any): IJsonTable {
  const result: IJsonTable = {
    state: state,
    msg: msg
  };
  if (data) {
    result.data = data;
  }
  return result;
}
/**
 * 获取表示错误信息的IJsonTable数据格式
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-27
 * @export
 * @param {(string | any)} [msg='error'] 错误信息
 * @param {number} [state=1] 状态码
 * @param {*} [data] 附加信息
 * @returns {*}  {IJsonTable}
 */
export function jerror(msg: string | any = 'error', state: number = 1, data?: any): IJsonTable {
  return jtable(state, msg, data);
}
/**
 * 获取表示正确信息的IJsonTable数据
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-27
 * @export
 * @param {(string | any)} [msg='success'] 消息
 * @param {*} [data] 附加信息
 * @returns {*}  {IJsonTable}
 */
export function jsuccess(msg: string | any = 'success', data?: any): IJsonTable {
  return jtable(0, msg, data);
}
/**
 * 命名风格转换
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-02-03
 * @export
 * @param {string} name 待转换的名称
 * @param {number} [type=0] 0：驼峰转下划线；1：下划线转驼峰
 * @param {boolean} [ucfirst=true] 驼峰模式下首字母是否大写
 * @returns {*}  {string}
 */

export function parseName(name: string, type: number = 0, ucfirst: boolean = true): string {
  if (1 == type) {
    const result = name.replace(/_([a-zA-Z])/g, str => {
      return str.toUpperCase();
    });
    return ucfirst
      ? result.substring(0, 1).toUpperCase() + result.substring(1)
      : result.substring(0, 1).toLowerCase() + result.substring(1);
  }
  const result = name.replace(/[A-Z]/g, str => {
    return `_${str.toLowerCase()}`;
  });
  return '_' == result.substring(0, 1) ? result.substring(1) : result;
}
// https://angular.io/guide/styleguide#style-04-12
export function throwIfAlreadyLoaded(parentModule: any, moduleName: string): void {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
}

export function parseConditionSet(condition: IConditionSet): IArrayPaire {
  const result: IArrayPaire = {};
  Object.keys(condition).forEach(key => {
    const item = condition[key];
    // 若为空字符串，或值不存在则跳过
    if ('' === item.value || null == item.value) return;
    item.value = '%xryf_empty_string%' === item.value ? '' : item.value;
    result[key] = [item.field, item.operator, item.value];
  });
  return result;
}
/**
 * 删除对象中指定的属性
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-04-26
 * @export
 * @param {*} obj 待处理的对象
 * @param {(string | string[])} attributes 属性集合
 */
export function delObjAttr(obj: Object, attributes: string | string[]): Object {
  if (!Array.isArray(attributes)) {
    attributes = [attributes];
  }
  (attributes as string[]).forEach(item => {
    delete (obj as { [key: string]: any })[item];
  });
  return obj;
}
// js加减乘除丢失精度 处理
// 加法
export function accAdd(arg1: NzSafeAny, arg2: NzSafeAny) {
  var r1, r2, m, c;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace('.', ''));
      arg2 = Number(arg2.toString().replace('.', '')) * cm;
    } else {
      arg1 = Number(arg1.toString().replace('.', '')) * cm;
      arg2 = Number(arg2.toString().replace('.', ''));
    }
  } else {
    arg1 = Number(arg1.toString().replace('.', ''));
    arg2 = Number(arg2.toString().replace('.', ''));
  }
  return (arg1 + arg2) / m;
}
// 减法
export function accSub(arg1: NzSafeAny, arg2: NzSafeAny) {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
  n = r1 >= r2 ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}
/**
 ** 乘法函数，用来得到精确的乘法结果
 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 ** 调用：accMul(arg1,arg2)
 ** 返回值：arg1乘以 arg2的精确结果
 **/
export function accMul(arg1: NzSafeAny, arg2: NzSafeAny) {
  var m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += s1.split('.')[1].length;
  } catch (e) {}
  try {
    m += s2.split('.')[1].length;
  } catch (e) {}
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}
/**
 ** 除法函数，用来得到精确的除法结果
 ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
 ** 调用：accDiv(arg1,arg2)
 ** 返回值：arg1除以arg2的精确结果
 **/
export function accDiv(arg1: NzSafeAny, arg2: NzSafeAny) {
  arg1 = Number(arg1);
  arg2 = Number(arg2);
  if (!arg2) {
    return null;
  }
  if (!arg1 && arg1 !== 0) {
    return null;
  } else if (arg1 === 0) {
    return 0;
  }
  var n1, n2;
  var r1, r2; // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  n1 = Number(arg1.toString().replace('.', ''));
  n2 = Number(arg2.toString().replace('.', ''));
  return accMul(n1 / n2, Math.pow(10, r2 - r1));
}
// 分转元 逗号隔开
export function abs(val: NzSafeAny, type = 1) {
  //金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
  var str = `${(val / 100).toFixed(2)}`;
  // type!=1 时 无需逗号分开
  if (type != 1) return Number(str);
  var intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ','); //取到整数部分
  var dot = str.substring(str.length, str.indexOf('.')); //取到小数部分搜索
  var ret = intSum + dot;
  return ret;
}

/**
 * 导出流数据保存为文件
 *
 * @param fileName 文件名
 * @param content 文件流数据
 */
export function downloadFile(fileName: string, content: NzSafeAny, options?: { type?: string }) {
  const blob = new Blob([content], {
    type: options?.type || 'application/octet-stream'
  });

  if ((window.navigator as NzSafeAny).msSaveOrOpenBlob) {
    (navigator as NzSafeAny).msSaveBlob(blob, fileName);
  } else {
    const link = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(blob);

    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';

    // 必须先添加元素到DOM
    document.body.appendChild(link); // <-- 关键修复点

    // 优化事件触发方式
    if (typeof MouseEvent === 'function') {
      link.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    } else {
      link.click();
    }

    // 改进的清理逻辑
    setTimeout(() => {
      // 确保先移除元素再释放URL
      if (document.body.contains(link)) {
        // <-- 安全校验
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(objectUrl);
    }, 100);
  }
}
// base64文件转换Blob 用于导出
export function base64ToBlob(code: string) {
  const parts = code.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = toByteArray(parts[1]);
  const uInt8Array = new Uint8Array(raw);
  return new Blob([uInt8Array], { type: contentType });
}
/**
 * 过滤对象中的无效值
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-05-14
 * @export
 * @param {any} obj
 * @returns {any}
 */
export function filterNullProperties(obj: any): any {
  const result: { [key: string]: string } = {};
  Object.keys(obj).forEach(key => {
    if (null !== obj[key] && undefined !== obj[key]) {
      result[key] = obj[key];
    }
  });
  return result;
}
// 获取浏览器信息
export function browserInfo() {
  var res = {
    name: '',
    version: ''
  };
  var reg;
  var userAgent = self.navigator.userAgent;
  if ((reg = /edge\/([\d\.]+)/i.exec(userAgent))) {
    res.name = 'Edge';
    res.version = reg[1];
  } else if (/msie/i.test(userAgent)) {
    res.name = 'Internet Explorer';
    reg = /msie ([\d\.]+)/i.exec(userAgent);
    res.version = reg ? reg[1] : '';
  } else if (/Trident/i.test(userAgent)) {
    res.name = 'Internet Explorer';
    reg = /rv:([\d\.]+)/i.exec(userAgent);
    res.version = reg ? reg[1] : '';
  } else if (/chrome/i.test(userAgent)) {
    res.name = 'Chrome';
    reg = /chrome\/([\d\.]+)/i.exec(userAgent);
    res.version = reg ? reg[1] : '';
  } else if (/safari/i.test(userAgent)) {
    res.name = 'Safari';
    reg = /version\/([\d\.]+)/i.exec(userAgent);
    res.version = reg ? reg[1] : '';
  } else if (/firefox/i.test(userAgent)) {
    res.name = 'Firefox';
    reg = /firefox\/([\d\.]+)/i.exec(userAgent);
    res.version = reg ? reg[1] : '';
  }
  return res;
}

// sm3加密
declare var SM3Digest: any;
declare var Hex: any;
export function sm3HashHexStr(value: string): string {
  //这一步是先将输入数据转成utf-8编码的字节流，然后再转成16进制可见字符
  var dataBy = Hex.utf8StrToBytes(value);
  var sm3 = new SM3Digest();
  sm3.update(dataBy, 0, dataBy.length); //数据很多的话，可以分多次update
  var sm3Hash = sm3.doFinal(); //得到的数据是个byte数组
  var sm3HashHex = Hex.encode(sm3Hash, 0, sm3Hash.length); //编码成16进制可见字符

  return sm3HashHex.toLowerCase();
}
/**
 * 数组转对象，对象key为数组下标
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2024-03-27
 * @export
 * @param {NzSafeAny[]} data 待转换的数组
 * @returns {*}  {object}
 */
export function arrayToObject(data: NzSafeAny[]): object {
  let result: NzSafeAny = {};
  data.forEach((item, idx) => {
    result[idx] = item;
  });
  return result;
}
//时间戳转08:00:00这种格式hh:mm:ss

export function formatTimestampToTime(timestamp: number): string {
  // 确保传入的是有效的毫秒时间戳
  if (timestamp) {
    // 创建Date对象
    const date = new Date(timestamp);
    // 获取小时、分钟和秒，并补零以确保始终为两位数
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 返回格式化后的字符串
    return `${hours}:${minutes}:${seconds}`;
  } else {
    // 处理无效时间戳的情况，可以抛出错误或返回特定值
    throw new Error('Invalid timestamp provided.');
    // 或者返回一个默认值，例如：
    // return "00:00:00";
  }
}
export function timeStringToTimestamp(timeStr: string): number | null {
  // 确保输入的时间字符串格式正确
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!timeRegex.test(timeStr)) {
    return null;
    throw new Error('Invalid time format. Please use "HH:mm:ss".');
  }

  // 获取今天的日期（假设是本地时间）
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 确保是从零点开始计算

  // 分割时间字符串并转换为数字
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);

  // 设置时间
  today.setHours(hours, minutes, seconds);

  // 返回时间戳
  return today.getTime();
}
/**
 * condition 封装
 *
 * @author 郭雅楠
 * @date 2024-04-24
 * @export
 * @returns {*}  {string}
 */
export function getCondition(obj: any): any {
  let condition: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value.type == '4') {
      condition[key] = [key, 'like', `%${value.data}%`];
    } else if (value.type == '5') {
      condition[key] = [key, '>=', value.data[0]];
      condition[`${key}_end`] = [key, '<', value.data[1]];
    } else if (value.ktype == '6') {
      condition[key] = [key, '<>', ''];
    } else {
      condition[key] = [key, '=', value];
    }
  });
  let base64Str = Base64.encode(JSON.stringify(condition));
  return base64Str;
}
/**
 * 是否是企业微信 封装
 *
 * @author 郭雅楠
 * @date 2024-04-24
 * @export
 * @returns {*}  Boolean    false 不是企微        true 是企微
 */
export function isWeChatWorkBrowser() {
  let agent = window.navigator.userAgent.indexOf('wxwork');
  if (agent != -1) {
    return false;
  } else {
    return true;
  }
}
/**
 * 判断是否企业微信浏览器
 *
 * @returns {*} {boolean} 返回是否是企微浏览器
 */
export function isWorkWeixinBrowser(): boolean {
  return /wxwork/i.test(navigator.userAgent);
}
