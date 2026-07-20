import { Injectable } from '@angular/core';

import { BaseService } from './base.service';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { IKVPaire, IAppXForm } from '@shared/model';
import { arrayToObject } from '@shared';
/**
 * 应用内表单服务
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2024-03-28
 * @export
 * @class AppXFormService
 * @extends {BaseService}
 */
@Injectable({
  providedIn: 'root'
})
export class AppXFormService extends BaseService {
  /**
   * 转换成xform表单配置
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2024-03-27
   * @param {IAppXForm} config 应用表单配置
   * @returns {*}  {NzSafeAny}
   */
  public toXForm(config: IAppXForm): NzSafeAny {
    const { form, item } = config;
    const formConfig = {
      containerWidth: form['show_width'] || 600,
      labelNzSpan: form['label_width'] || 400,
      controlNzSpan: form['control_width'] || 18,
      nzSize: (() => {
        switch (form['control_high']) {
          case 10:
            return 'small';
          case 20:
            return 'large';
          default:
            return 'default';
        }
      }).call(this),
      layout: (() => {
        switch (form['layout']) {
          case 1:
            return 'horizontal';
          case 2:
            return 'inline';
          default:
            return 'vertical';
        }
      }).call(this),
      inlineVertical: 1 == form['inline_vertical'] ? false : true
    } as IKVPaire;
    //根据后端sort排序
    if (Array.isArray(item)) {
      item.sort((a, b) => {
        // 如果 sort 属性都存在，比较它们的值；否则，视为相等
        return a['sort'] !== undefined && b['sort'] !== undefined ? a['sort'] - b['sort'] : 0;
      });
    }
    formConfig['children'] = item.map(iterator => {
      const component: IKVPaire = {
        id: iterator['id'] || null,
        model: iterator['css_extend']?.model || `${iterator['type']}-${iterator['id']}`,
        type: (() => {
          switch (iterator['type']) {
            case 1:
              return 'radio';
            case 2:
              return 'checkbox';
            default: // 默认处理为单行输入
              return 3 == iterator['sub_type'] ? 'textarea' : 'input';
          }
        }).call(this),
        label: iterator['title'],
        inputType: (() => {
          switch (iterator['sub_type']) {
            case 1:
              return 'number';
            case 2:
              return 'password';
            default:
              return 'text';
          }
        }).call(this),
        defaultValue: iterator['answer'] || '',
        required: !!iterator['css_extend']?.required,
        placeholder: iterator['placeholder'] || null,

        // labelWidth: iterator['label_width'] || 400, //表单label因为历史原因，暂时隐藏
        nzAutosize:
          iterator['css_extend']?.nzAutosize ||
          (() => {
            // 做下兼容处理
            if (4 == iterator['type'] && 3 == iterator['sub_type']) {
              return { minRows: 2, maxRows: 20 };
            }
            return null;
          }).call(this),
        options: (() => {
          return iterator['item'] && Object.keys(iterator['item']).length > 0
            ? Object.values(iterator['item']).map((v: NzSafeAny) => {
                return {
                  label: v.title,
                  value: v.tag,
                  checked: !!(iterator['answer'] && iterator['answer'].includes(v.tag)) //多选框是多个结果
                };
              })
            : null;
        }).call(this),
        visibleIf: iterator['css_extend']?.visibleIf
          ? {
              id: iterator['css_extend'].visibleIf.id,
              value: iterator['css_extend'].visibleIf.value
            }
          : {
              id: null,
              value: null
            }
      };
      return component;
    });
    return formConfig;
  }
  /**
   * 转换成应用表单配置
   *
   * @author 王阮强(wangruanqiang@hongshanhis.com)
   * @date 2024-03-27
   * @returns {*}  {IAppXForm}
   */
  public toApp(config: NzSafeAny): IAppXForm {
    const form: IKVPaire = {
        show_width: config.containerWidth || 600,
        label_width: config.labelNzSpan || 400,
        control_width: config.controlNzSpan || 18,
        control_high: (() => {
          switch (config.nzSize) {
            case 'small':
              return 10;
            case 'large':
              return 20;
            default:
              return 15;
          }
        }).call(this),
        layout: (() => {
          switch (config.layout) {
            case 'inline':
              return 2;
            case 'horizontal':
              return 1;
            default:
              return 0;
          }
        }).call(this),
        inline_vertical: config.inlineVertical ? 0 : 1
      },
      item: IKVPaire[] = config.children.map((iterator: NzSafeAny, index: number) => {
        return {
          id: iterator.id,
          sort: index + 1,
          type: (() => {
            switch (iterator.type) {
              case 'radio':
                return 1;
              case 'checkbox':
                return 2;
              default: // 默认处理为单行输入
                return 4;
            }
          }).call(this),
          title: iterator.label,
          sub_type: (() => {
            switch (iterator.inputType) {
              case 'password':
                return 2;
              case 'number':
                return 1;
              default: // 默认处理为单行输入
                return 'textarea' == iterator.type ? 3 : 0;
            }
          }).call(this),
          answer: (() => {
            return ['radio', 'checkbox'].includes(iterator.type)
              ? iterator.options
                  .filter((option: NzSafeAny) => option.checked)
                  .map((item: NzSafeAny) => item.value)
                  .toString()
              : iterator.defaultValue || '';
          }).call(this),
          required: iterator.required ? 1 : 0,
          placeholder: iterator.placeholder || '',
          label_width: iterator.labelWidth || 400,
          item: (() => {
            return iterator.options
              ? arrayToObject(
                  iterator.options.map((v: NzSafeAny) => {
                    return {
                      title: v.label,
                      tag: v.value
                    };
                  })
                )
              : {};
          }).call(this),
          css_extend: {
            ...iterator
          }
        };
      });
    return {
      form,
      item
    };
  }
}
