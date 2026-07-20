export interface XFormConfig {
  type: string;
  containerWidth?: number;
  layout?: 'horizontal' | 'vertical' | 'inline';
  inlineVertical?: boolean;
  labelNzSpan?: number;
  controlNzSpan?: number;
  nzSize?: 'small' | 'default' | 'large';
  children?: any[];
}

/**
 * 表单默认配置
 */
export const deaultFormConfig = {
  type: 'form',
  containerWidth: 600,
  layout: 'vertical', //horizontal | vertical | inline
  inlineVertical: false,
  labelNzSpan: 6,
  controlNzSpan: 18,
  nzSize: 'default', // small | default | large
  children: []
};

/**
 * XForm组件组定义
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2022-09-21
 * @export
 * @interface XFormComponentsGroup
 */
export interface XFormComponentsGroup {
  text: string;
  type: string;
  children?: XFormComponent[];
}
/**
 * XForm组件定义
 *
 * @author 王阮强(wangruanqiang@hongshanhis.com)
 * @date 2022-09-21
 * @export
 * @interface XFormComponent
 */
export interface XFormComponent {
  text: string;
  icon?: string;
  intro?: string;
  nodeData?: {
    [key: string]: any;
    type: string;
    children?: any[];
  };
}

export interface XFormNodeData {
  type: string;
  label: string;
}

/**
 * 控件菜单
 */
export const componentsGroup: XFormComponentsGroup[] = [
  {
    text: '表单组件',
    type: 'component',
    children: [
      {
        text: '单行输入',
        icon: 'icon-danhangwenben',
        intro: '',
        nodeData: {
          type: 'input',
          label: '',
          model: '',
          placeholder: '',
          defaultValue: null,
          required: false,
          inputType: 'text', // text | number | password
          nzAddOnBefore: null,
          nzAddOnAfter: null,
          labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
          controlWidth: 120, // 控件宽度 (内联表单)
          visibleIf: {
            // 控制显示条件
            id: '',
            value: null
          }
        }
      },
      {
        text: '多行输入',
        icon: 'icon-duohangshurukuang1',
        intro: '',
        nodeData: {
          type: 'textarea',
          label: '',
          model: '',
          placeholder: '',
          defaultValue: null,
          required: false,
          nzAutosize: { minRows: 2 }, // { minRows: 20, maxRows: 20 }
          labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
          controlWidth: 120, // 控件宽度 (内联表单)
          visibleIf: {
            // 控制显示条件
            id: '',
            value: null
          }
        }
      },
      {
        text: '单选框',
        icon: 'icon-danxuan',
        intro: '',
        nodeData: {
          type: 'radio',
          label: '',
          model: '',
          defaultValue: null,
          required: false,
          layout: 'horizontal', // horizontal | vertical
          buttonStyle: false,
          options: [
            { label: '选项1', value: 'option1' },
            { label: '选项2', value: 'option2' }
          ],
          labelField: 'label',
          valueField: 'value',
          checkedField: 'checked',
          optionSourceType: 'manual', // manual | native | server
          nativeSourceField: '',
          url: '',
          method: 'get', // get | post_json | post_form
          serverSourceField: 'data', //字段路径 或 匿名函数
          labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
          controlWidth: null, // 控件宽度 (内联表单)
          visibleIf: {
            // 控制显示条件
            id: '',
            value: null
          }
        }
      },
      {
        text: '多选框',
        icon: 'icon-fangxingxuanzhong',
        intro: '',
        nodeData: {
          type: 'checkbox',
          label: '',
          model: '',
          required: false,
          layout: 'horizontal', // horizontal | vertical
          options: [
            { label: '选项1', value: 'option1', checked: false },
            { label: '选项2', value: 'option2', checked: false }
          ],
          labelField: 'label',
          valueField: 'value',
          checkedField: 'checked',
          optionSourceType: 'manual', // manual | native | server
          nativeSourceField: '',
          url: '',
          method: 'get', // get | post_json | post_form
          serverSourceField: 'data', //字段路径 或 匿名函数
          labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
          controlWidth: null, // 控件宽度 (内联表单)
          visibleIf: {
            // 控制显示条件
            id: '',
            value: null
          }
        }
      }
      // {
      //   text: '切换开关',
      //   icon: 'icon-kaiguanguan',
      //   intro: '',
      //   nodeData: {
      //     type: 'switch',
      //     label: '',
      //     model: '',
      //     defaultValue: false,
      //     nzCheckedChildren: '√',
      //     nzUnCheckedChildren: '',
      //     labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
      //     controlWidth: null // 控件宽度 (内联表单)
      //   }
      // },
      // {
      //   text: '下拉选择',
      //   icon: 'icon-select',
      //   intro: '',
      //   nodeData: {
      //     type: 'select',
      //     label: '',
      //     model: '',
      //     placeholder: '',
      //     defaultValue: null,
      //     nzMode: 'default', // default | multiple | tags
      //     required: false,
      //     options: [
      //       { label: '选项1', value: 'option1' },
      //       { label: '选项2', value: 'option2' }
      //     ],
      //     labelField: 'label',
      //     valueField: 'value',
      //     checkedField: 'checked',
      //     optionSourceType: 'manual', // manual | native | server
      //     nativeSourceField: '',
      //     url: '',
      //     method: 'get', // get | post_json | post_form
      //     serverSourceField: 'data', //字段路径 或 匿名函数
      //     labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
      //     controlWidth: 120 // 控件宽度 (内联表单)
      //   }
      // },
      // {
      //   text: '日期选择',
      //   icon: 'icon-rili',
      //   intro: '',
      //   nodeData: {
      //     type: 'datePicker',
      //     label: '',
      //     model: '',
      //     startModel: '',
      //     endModel: '',
      //     placeholder: '',
      //     defaultValue: null, // string | [string, string]
      //     pickerType: 'date', // year | month | date | range | week
      //     valueType: 'ISO8601', // timestamp | ISO8601T | ISO8601 (date | range 的取值类型)
      //     required: false,
      //     nzShowTime: false,
      //     now: false,
      //     labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
      //     controlWidth: {
      //       // 控件宽度 (内联表单)
      //       year: 100,
      //       month: 100,
      //       week: 100,
      //       date: 120,
      //       dateTime: 175, // 日期+时间
      //       range: 220,
      //       rangeTime: 335 // 日期范围+时间
      //     }
      //   }
      // },
      // {
      //   text: '时间选择',
      //   icon: 'icon-shizhong',
      //   intro: '',
      //   nodeData: {
      //     type: 'timePicker',
      //     label: '',
      //     model: '',
      //     placeholder: '',
      //     defaultValue: null,
      //     required: false,
      //     nzFormat: 'HH:mm:ss', // HH:mm:ss | HH:mm
      //     now: false,
      //     labelWidth: null, // 标签宽度 (水平表单 | 内联表单)
      //     controlWidth: 120 // 控件宽度 (内联表单)
      //   }
      // }
    ]
  }
  // {
  //   text: '布局组件',
  //   type: 'layout',
  //   children: [
  //     {
  //       text: '栅格布局',
  //       icon: 'icon-buju',
  //       intro: '',
  //       nodeData: {
  //         type: 'row',
  //         nzGutter: 16,
  //         children: [
  //           { type: 'col', nzSpan: 12, labelNzSpan: 10, controlNzSpan: 14, children: [] },
  //           { type: 'col', nzSpan: 12, labelNzSpan: 10, controlNzSpan: 14, children: [] }
  //         ]
  //       }
  //     },
  //     {
  //       text: '分割线',
  //       icon: 'icon-fengexian',
  //       intro: '',
  //       nodeData: {
  //         type: 'hr',
  //         margin: 16,
  //         hidden: false
  //       }
  //     }
  //   ]
  // },
  // {
  //   text: '其他',
  //   type: 'ext',
  //   children: [
  //     {
  //       text: '模板占位符',
  //       icon: 'icon-zujian',
  //       intro: '使用时将自定义的内容插入到表单中的特定位置<br />由开发人员配置',
  //       nodeData: {
  //         type: 'template',
  //         key: ''
  //       }
  //     }
  //   ]
  // }
];
