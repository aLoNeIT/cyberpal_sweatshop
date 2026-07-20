import { Injectable } from '@angular/core';
import { parse, parseJSON } from 'date-fns';

import { componentsGroup, deaultFormConfig } from './config';

@Injectable({
  providedIn: 'root'
})
export class XFormService {
  /**
   * 原始配置list
   */
  originalConfigList: any[] = [];

  constructor() {
    this.initOriginalConfigList();
  }

  /**
   * 初始化 originalConfigList
   */
  initOriginalConfigList() {
    this.originalConfigList = [deaultFormConfig];
    componentsGroup.forEach(group => {
      group.children!.forEach(item => {
        if (item.nodeData) {
          this.originalConfigList.push(item.nodeData);
          if (item.nodeData['type'].toString() == 'row') {
            this.originalConfigList.push(...(item.nodeData.children || []));
          }
        }
      });
    });
  }

  /*
   * 获取事件点相对于目标的方位
   */
  getRelativePosition(target: any, event: any) {
    let BoundingClientRect = target.getBoundingClientRect();
    let x = BoundingClientRect.left + BoundingClientRect.width / 2;
    let y = BoundingClientRect.top + BoundingClientRect.height / 2;
    return {
      top: event.y < y,
      right: event.x > x,
      bottom: event.y > y,
      left: event.x < x
    };
  }

  /*
   * 后置插入
   */
  insertAfter(newElement: any, targetElement: any) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling);
    }
  }

  /*
   * 获取事件冒泡路径，兼容ie11,edge,chrome,firefox,safari
   * @param evt
   * @returns {*}
   */
  eventPath(evt: any) {
    const path = (evt.composedPath && evt.composedPath()) || evt.path,
      target = evt.target;

    if (path != null) {
      return path.indexOf(window) < 0 ? path.concat(window) : path;
    }

    if (target === window) {
      return [window];
    }

    let getParents = function (node: any, memo: any): any {
      memo = memo || [];
      const parentNode = node.parentNode;

      if (!parentNode) {
        return memo;
      } else {
        return getParents(parentNode, memo.concat(parentNode));
      }
    };

    return [target].concat(getParents(target, null), window);
  }

  /**
   * 克隆
   */
  clone(obj: any = null) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 转换为本地日期对象
   * import { parse, parseJSON } from 'date-fns';
   *
   * Date 日期对象
   * timestamp 时间撮
   * 2020-01-01 年月日
   * 2020-01-01 11:22:33 年月日 时分秒
   * 2020-01-01T11:22:33 ISO日期字符串
   * 2000-03-15T05:20:10Z ISO日期字符串(UTC时间)
   */
  toDate(value: number | Date | string | null = null) {
    if (!value) return null;

    // Date | timestamp
    if (!isNaN(<number>value)) return new Date(Number(value));

    value = <string>value;

    // UTC时间
    if (value.includes('Z')) return parseJSON(value);

    value = value.replace('T', ' ');
    if (value.includes(' ')) {
      // 年月日 时分秒 | ISO日期字符串
      return parse(value, 'yyyy-MM-dd HH:mm:ss', new Date());
    } else {
      // 年月日
      return parse(value, 'yyyy-MM-dd', new Date());
    }
  }

  /**
   * 获取特定节点的父节点
   */
  getParentNode(rootNode: any[], node: any) {
    let parentNode: any = null;
    const recursion = (prevNode: any) => {
      for (let item of prevNode.children || []) {
        if (item == node) {
          parentNode = prevNode;
          break;
        }
        recursion(item);
      }
    };
    recursion(rootNode);
    return parentNode;
  }

  /**
   * 树结构转数组
   */
  tree2Array(treeNodes: any[] = []) {
    let arr: any[] = [];
    treeNodes.forEach(node => {
      arr.push(node);
      if (Array.isArray(node.children) && node.children.length) {
        arr.push(...this.tree2Array(node.children));
      }
    });
    return arr;
  }

  /**
   * 是否是一个网址
   *
   * @param url
   */
  isUrl(url: string = '') {
    return !!(url.startsWith('http://') || url.startsWith('https://')) || url.startsWith('//');
  }

  /**
   * 连接url
   * concatUrl('https://www.baidu.com/', '/', '/a/b/', '/c') => https://www.baidu.com/a/b/c
   *
   * @param args
   * @returns
   */
  concatUrl(...args: any) {
    // /、http://abc/、//abc/ => ''、http://abc、//abc
    let origin = (args[0] || '/').replace(/\/$/, '');
    // '/12//3456'.replace(/\/+/g, '/').replace(/^\//, '') => 12/3456
    let pathname = args.slice(1).join('/').replace(/\/+/g, '/').replace(/^\//, '');
    return `${origin}/${pathname}`;
  }

  /**
   * 获取内联布局时的控件宽度
   *
   * @param node
   */
  getComponentWidth(node: any, config: any) {
    if (config.layout == 'inline') {
      if (node.type == 'datePicker') {
        return node.controlWidth[`${node.pickerType}${node.nzShowTime ? 'Time' : ''}`] || null;
      } else {
        return node.controlWidth || null;
      }
    }
    return null;
  }

  /**
   * 生成html
   */
  generateHTML(config: any) {
    let retract = (tier: any) => ' '.repeat((tier - 1) * 4);
    let getClassStr = (obj: any) => {
      let classList = Object.entries(obj)
        .filter(([key, value]) => value)
        .map(([key, value]) => key);
      if (classList.length) {
        return ` class="${classList.join(' ')}"`;
      }
      return '';
    };
    let nzSize = config.nzSize == 'default' ? '' : ` nzSize="${config.nzSize}"`;

    let getFormItem = (item: any, tier: any): string => {
      switch (item.type) {
        case 'input': {
          if (!(item.nzAddOnBefore || item.nzAddOnAfter)) {
            return `
${retract(tier)}<input nz-input type="${item.inputType}" formControlName="${item.model}" placeholder="${item.placeholder}"${nzSize} />`;
          } else {
            return `
${retract(tier)}<nz-input-group${item.nzAddOnBefore ? ` nzAddOnBefore="${item.nzAddOnBefore}"` : ''}${
              item.nzAddOnAfter ? ` nzAddOnAfter="${item.nzAddOnAfter}"` : ''
            }${nzSize}>
${retract(tier)}    <input nz-input type="${item.inputType}" formControlName="${item.model}" placeholder="${item.placeholder}" />
${retract(tier)}</nz-input-group>`;
          }
        }
        case 'textarea': {
          return `
${retract(tier)}<textarea nz-input formControlName="${item.model}" [nzAutosize]="${JSON.stringify(item.nzAutosize).replace(
            /\"/g,
            ''
          )}" placeholder="${item.placeholder}"${nzSize}></textarea>`;
        }
        case 'radio': {
          let clasObj = { 'x-form-option-vertical': item.layout == 'vertical' };
          return `
${retract(tier)}<nz-radio-group nzButtonStyle="solid" formControlName="${item.model}"${getClassStr(clasObj)}${nzSize}>${(item.options || [])
            .map(
              (option: any) => `
${retract(tier)}    <label ${item.buttonStyle ? 'nz-radio-button' : 'nz-radio'} [nzValue]="'${option.value}'">${option.label}</label>`
            )
            .join('')}
${retract(tier)}</nz-radio-group>`;
        }
        case 'checkbox': {
          let clasObj = { 'x-form-option-vertical': item.layout == 'vertical' };
          return `
${retract(tier)}<nz-checkbox-group formControlName="${item.model}"${getClassStr(clasObj)}></nz-checkbox-group>`;
        }
        case 'switch': {
          return `
${retract(tier)}<nz-switch formControlName="${item.model}" nzCheckedChildren="${item.nzCheckedChildren}" nzUnCheckedChildren="${
            item.nzUnCheckedChildren
          }"${nzSize}></nz-switch>`;
        }
        case 'select': {
          return `
${retract(tier)}<nz-select formControlName="${item.model}" [nzMode]="'${item.nzMode}'" nzAllowClear nzShowSearch nzPlaceHolder="${
            item.placeholder
          }" [nzDropdownMatchSelectWidth]="false"${nzSize}>${(item.options || [])
            .map(
              (option: any) => `
${retract(tier)}    <nz-option [nzValue]="'${option.value}'" [nzLabel]="'${option.label}'"></nz-option>`
            )
            .join('')}
${retract(tier)}</nz-select>`;
        }
        case 'datePicker': {
          if (item.pickerType == 'range') {
            return `
${retract(tier)}<nz-range-picker formControlName="${item.model}" [nzPlaceHolder]="${JSON.stringify(item.placeholder).replace(
              /\"/g,
              `'`
            )}" nzAllowClear${item.nzShowTime ? ' nzShowTime' : ''}${nzSize}></nz-range-picker>`;
          } else {
            return `
${retract(tier)}<nz-date-picker nzMode="${item.pickerType}" formControlName="${item.model}" nzPlaceHolder="${
              item.placeholder
            }" nzAllowClear${item.nzShowTime ? ' nzShowTime' : ''}${nzSize}></nz-date-picker>`;
          }
        }
        case 'timePicker': {
          return `
${retract(tier)}<nz-time-picker formControlName="${item.model}" nzPlaceHolder="${item.placeholder}" nzFormat="${
            item.nzFormat
          }" nzAllowClear [nzSize]="'${config.nzSize}'"></nz-time-picker>`;
        }
        default: {
          return '';
        }
      }
    };

    let render = (node: any, tier: any, isLast = true) => {
      let html = '';
      (node.children || []).forEach((item: any, itemIndex: any) => {
        isLast = node.children.length - 1 == itemIndex;
        switch (item.type) {
          case 'hr': {
            html += `
${retract(tier)}<div style="overflow: hidden;">
${retract(tier)}    <hr${item.hidden ? ' class="x-form-item-hidden"' : ''} style="margin: ${item.margin}px 0;" />
${retract(tier)}</div>`;
            break;
          }
          case 'template': {
            html += `
${retract(tier)}<ng-container [ngTemplateOutlet]="${item.key}" [ngTemplateOutletContext]="{ $implicit: formGroup }"></ng-container>`;
            break;
          }
          case 'row': {
            html += `
${retract(tier)}<div nz-row [nzGutter]="${item.nzGutter}">${(item.children || [])
              .map(
                (col: any) => `
${retract(tier)}    <div nz-col [nzSpan]="${col.nzSpan}">${render(col, tier + 2)}
${retract(tier)}    </div>`
              )
              .join('')}
${retract(tier)}</div>`;
            break;
          }
          default: {
            let nzLabelClassObj = { 'x-form-vertical-align-top': item.type == 'textarea' || item.layout == 'vertical' };
            let controlWidth = this.getComponentWidth(item, config);
            html += `
${retract(tier)}<nz-form-item>
${retract(tier)}    <nz-form-label${
              config.layout == 'horizontal' && !item.labelWidth ? ` [nzSpan]="${node.labelNzSpan || config.labelNzSpan}"` : ''
            }${item.required ? ' nzRequired' : ''}${getClassStr(nzLabelClassObj)}${
              item.labelWidth ? ` [style.width.px]="${item.labelWidth}"` : ''
            }>${item.label}</nz-form-label>
${retract(tier)}    <nz-form-control${
              config.layout == 'horizontal' && !item.labelWidth ? ` [nzSpan]="${node.controlNzSpan || config.controlNzSpan}"` : ''
            }${controlWidth ? ` [style.width.px]="${controlWidth}"` : ''}>${getFormItem(item, tier + 2)}
${retract(tier)}    </nz-form-control>
${retract(tier)}</nz-form-item>`;
            break;
          }
        }
        if (!isLast) {
          html += '\n';
        }
      });
      return html;
    };

    let formClassObj = { 'x-form-inline-vertical': config.layout == 'inline' && config.inlineVertical };
    let form = `<form *ngIf="formGroup" [formGroup]="formGroup" nz-form nzLayout="${config.layout}"${getClassStr(formClassObj)}>${render(
      config,
      2
    )}
</form>`;

    return form;
  }

  /**
   * 生成TS
   */
  generateTS(config: any) {
    let controlsConfig = '';
    let formConfigList = this.tree2Array(config.children || []);
    formConfigList
      .filter(node => !['row', 'col', 'hr', 'template'].includes(node.type))
      .forEach(node => {
        switch (node.type) {
          case 'checkbox': {
            let defaultValue = JSON.stringify(node.options || []);
            controlsConfig += `
            ${node.model}: [${defaultValue}${node.required ? ', [Validators.required]' : ''}]`;
            break;
          }
          case 'switch': {
            controlsConfig += `
            ${node.model}: [${node.defaultValue ? 'true' : 'null'}]`;
            break;
          }
          case 'timePicker':
          case 'datePicker': {
            let defaultValue = '';
            if (node.pickerType == 'range') {
              defaultValue = node.now ? '[new Date(), new Date()]' : '[]';
              controlsConfig += `
            ${node.startModel}_${node.endModel}: [${defaultValue}${node.required ? ', [Validators.required]' : ''}]`;
            } else {
              defaultValue = node.now ? 'new Date()' : 'null';
              controlsConfig += `
            ${node.model}: [${defaultValue}${node.required ? ', [Validators.required]' : ''}]`;
            }
            break;
          }
          default: {
            controlsConfig += `
            ${node.model}: [${node.defaultValue ? `'${node.defaultValue}'` : 'null'}${node.required ? ', [Validators.required]' : ''}]`;
            break;
          }
        }
        controlsConfig += ',';
      });

    let ts = `import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'demo',
    templateUrl: './demo.html',
    styleUrls: ['./demo.scss']
})
export class DomeComponent implements OnInit {
    formGroup: FormGroup = null;

    constructor(private fb: FormBuilder) {
        this.formGroup = this.fb.group({${controlsConfig}
        });
    }
}`;

    return ts;
  }

  /**
   * 精简配置字段
   */
  cutConfig(config = {}) {
    const cut = (arr: any) => {
      arr = arr.map((item: any) => {
        let node: any = { type: item.type };

        switch (true) {
          case item.type == 'form': {
            node['containerWidth'] = item.containerWidth;
            break;
          }
          case ['input', 'textarea', 'radio', 'checkbox', 'switch', 'select', 'datePicker', 'timePicker'].includes(item.type): {
            node['label'] = item.label;
            node['model'] = item.model;
            break;
          }
        }

        let originalNode = this.originalConfigList.find(originalItem => originalItem.type == item.type);

        Object.entries(item).forEach(([key, value]) => {
          if (typeof value == 'object') {
            if (JSON.stringify(value) != JSON.stringify(originalNode[key])) {
              node[key] = value;
            }
          } else {
            if (value != originalNode[key]) {
              node[key] = value;
            }
          }
        });

        if (item.children?.length) {
          node.children = cut(item.children);
        }

        return node;
      });
      return arr;
    };

    config = cut([config])[0];
    return config;
  }

  /**
   * 组装字段
   */
  assembleConfig(config = {}) {
    const assemble = (arr: any) => {
      arr = arr.map((item: any) => {
        let originalNode = this.clone(this.originalConfigList.find(originalItem => originalItem.type == item.type));
        let node: any = {
          ...originalNode,
          ...item
        };

        if (node.children) {
          node.children = assemble(node.children);
        }

        return node;
      });
      return arr;
    };

    config = assemble([config])[0];
    return config;
  }
}
