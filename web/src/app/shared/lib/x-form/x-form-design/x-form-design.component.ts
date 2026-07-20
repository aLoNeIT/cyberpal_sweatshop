import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  NgZone,
  OnChanges
} from '@angular/core';
import { startOfDay, endOfDay } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { componentsGroup, deaultFormConfig } from '../config';
import { XFormService } from '../x-form.service';
import { XFormComponentsGroup, XFormNodeData } from './../config';

@Component({
  selector: 'x-form-design',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styleUrls: ['./x-form-design.component.scss', './icon/iconfont.css', '../ng-zorro/nz-form-fix.scss']
})
export class XFormDesignComponent implements OnChanges, OnInit {
  componentsGroup: XFormComponentsGroup[] = componentsGroup;
  introMap: { [key: string]: any } = {};
  propertyTabSelectedIndex = 0;
  errorSet = new Set();

  @Input() config: any = null;
  @Input() baseUrl = '';
  @Input() showSaveButton: any = false;
  @Input() SaveButtonLoading = false;
  @Output() readonly close = new EventEmitter<any>();

  // 当前激活的节点
  _activeNode: any = null;
  set activeNode(activeNode) {
    this._activeNode = activeNode;
    this.propertyTabSelectedIndex = 0;
  }
  get activeNode() {
    return this._activeNode;
  }

  // 当前拖动的节点
  dragNode: any = null;
  // 当前拖动的DOM元素
  dragElement: any = null;
  // 当前拖动节点的父节点
  dragParentNode: any = null;

  // 占位符DOM元素
  placeholderElement: any = null;
  // 占位符的父节点
  placeholderParentNode: any = null;
  // dom 和 节点数据 的映射
  domData = new Map();

  // 当前hover的节点
  hoverNode: any = null;

  // 标识是否从组件库拖动
  isFromComponents = false;

  // JSON编辑 对话框
  jsonEditDialog = {
    display: false,
    value: ''
  };

  // HTML生成 对话框
  htmlDialog = {
    display: false,
    tabSelectedIndex: 0,
    html: '',
    ts: ''
  };

  // 预览 对话框
  previewDialog = {
    display: false,
    config: <any>{},
    formValue: null,
    setValueDialog: {
      display: false,
      value: ''
    }
  };

  constructor(
    public xFormService: XFormService,
    private msg: NzMessageService,
    private elementRef: ElementRef,
    private ngZone: NgZone
  ) {
    this.config = this.xFormService.clone({ ...deaultFormConfig, ...this.config });
    // 获取组件简介
    this.componentsGroup.forEach((group: any) => {
      (group.children || []).forEach((component: any) => {
        this.introMap[component.nodeData.type] = component.intro || '';
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.config = this.xFormService.clone({ ...deaultFormConfig, ...this.config });
      this.config = this.xFormService.assembleConfig(this.config);
      let nodeList = this.xFormService.tree2Array(this.config.children || []);
      this.initNodes(nodeList);
    }
  }

  ngOnInit() {
    this.bindDragover();
  }
  // ngAfterViewChecked() { console.log(1); }

  /**
   * 激活可拖动
   */
  onMousedown(e: Event) {
    e.stopPropagation();
    let dragElement = this.xFormService.eventPath(e).find((element: any) => element.classList.contains('dragItem'));
    dragElement.setAttribute('draggable', 'true');
  }
  onMouseup(e: Event) {
    e.stopPropagation();
    let dragElement = this.xFormService.eventPath(e).find((element: any) => element.classList.contains('dragItem'));
    dragElement.setAttribute('draggable', 'false');
  }
  /**
   * 拖动开始, 记录拖动的节点 和 创建占位符节点
   */
  onDragstart(e: Event, dragNode: any, dragParentNode: any = null) {
    e.stopPropagation();

    this.dragNode = dragNode;
    this.dragParentNode = dragParentNode;
    this.dragElement = e.target;

    this.isFromComponents = !this.dragParentNode;

    if (dragNode.type == 'col') {
      this.placeholderElement = document.createElement('div');
      this.placeholderElement.classList.add(`ant-col-${this.dragNode.nzSpan}`);
      this.placeholderElement.style.paddingLeft = this.dragElement.style.paddingLeft;
      this.placeholderElement.style.paddingRight = this.dragElement.style.paddingRight;
      this.placeholderElement.innerHTML =
        `<div class="dragPlaceholder" style="height: ${this.dragElement.getBoundingClientRect().height - 16}px` + `;"></div>`;
    } else {
      this.placeholderElement = document.createElement('div');
      this.placeholderElement.classList.add('dragPlaceholder');
      this.placeholderElement.style.height = `${this.isFromComponents ? 32 : this.dragElement.getBoundingClientRect().height - 16}px`;
      if (this.config.layout == 'inline') {
        this.placeholderElement.style.width = `${this.dragElement.getBoundingClientRect().width}px`;
        this.placeholderElement.style.display = 'inline-block';
        this.placeholderElement.style.marginRight = '16px';
      }
    }
  }
  /**
   * 在列表内发生的拖动覆盖事件, 用于移动占位符
   */
  onDragover(e: Event, placeholderParentNode: any) {
    let listElement = (e.currentTarget as any).querySelector('.dropList');
    let listType = listElement.dataset.type;
    let path = this.xFormService.eventPath(e);
    let overItem = path[path.indexOf(listElement) - 1]; // .dragItem (.dropList > .dragItem)

    // 放置限制
    switch (listType) {
      // 在表单和列中不允许放置列
      case 'form':
      case 'col': {
        if (this.dragElement.getAttribute('nz-col') != null) {
          return;
        }
        break;
      }
      // 在行中仅能放置列
      case 'row': {
        if (this.dragElement.getAttribute('nz-col') == null) {
          return;
        }
        break;
      }
    }

    e.stopPropagation();
    e.preventDefault();

    // 覆盖到占位符
    if (e.target == this.placeholderElement) {
      return;
    }

    let moveFn = null;

    if (overItem) {
      // 覆盖到一个控件
      let RelativePosition = this.xFormService.getRelativePosition(overItem, e);
      if (listElement.dataset.orientation == 'horizontal' ? RelativePosition.left : RelativePosition.top) {
        moveFn = () => listElement.insertBefore(this.placeholderElement, overItem);
      } else {
        moveFn = () => this.xFormService.insertAfter(this.placeholderElement, overItem);
      }
    } else {
      // 覆盖到列表
      let inListBottom = (e as any).y >= listElement.getBoundingClientRect().bottom;
      // 在列表底部空白区域 || 空列表
      let isEmptyList = (placeholderParentNode.children || []).filter((item: any) => item != this.dragNode).length == 0;
      if (inListBottom || isEmptyList) {
        moveFn = () => listElement.appendChild(this.placeholderElement);
      } else {
        return;
      }
    }

    moveFn();

    this.placeholderParentNode = placeholderParentNode;

    if (!this.isFromComponents) {
      this.dragElement.style.display = 'none';
    }
  }
  /**
   * 绑定拖动覆盖事件
   */
  saveDomData(dom: any, nodeData: any) {
    this.domData.set(dom, nodeData);
  }
  bindDragover() {
    window.requestAnimationFrame(() => {
      this.ngZone.runOutsideAngular(() => {
        let onDragover = (e: Event) => {
          this.onDragover(e, this.domData.get(e.currentTarget));
        };
        Array.from((<HTMLElement>this.elementRef.nativeElement).querySelectorAll<HTMLElement>('.x-form,.form_row,.form_col')).forEach(
          dom => {
            dom.ondragover = onDragover;
          }
        );
        // 非列控件在列之间(栅格间距)拖动时, 阻止行级的拖动事件
        Array.from((<HTMLElement>this.elementRef.nativeElement).querySelectorAll<HTMLElement>('[nz-col]')).forEach(dom => {
          dom.ondragover = e => {
            if (this.dragNode.type != 'col') e.stopPropagation();
          };
        });
      });
    });
  }
  /**
   * 拖动结束, 替换占位符节点
   */
  onDragend(e: Event) {
    e.stopPropagation();

    if (!this.isFromComponents) {
      this.dragElement.setAttribute('draggable', 'false');
      this.dragElement.style.display = null;
    }

    if (this.placeholderElement.parentNode) {
      this.placeholderParentNode.children = this.placeholderParentNode.children || [];

      if (!this.isFromComponents) {
        /**
         * 移动
         */
        this.dragParentNode.children = this.dragParentNode.children || [];

        // 拖动节点的位置
        let dragNodeIndex = this.dragParentNode.children.indexOf(this.dragNode);
        // 在原列表移除
        this.dragParentNode.children.splice(dragNodeIndex, 1);

        // 占位符节点的位置
        let placeholderIndex = Array.from(this.placeholderElement.parentNode.children).indexOf(this.placeholderElement);
        if (this.dragParentNode == this.placeholderParentNode) {
          placeholderIndex > dragNodeIndex && --placeholderIndex;
        }
        // 插入拖动节点
        this.placeholderParentNode.children.splice(placeholderIndex, 0, this.dragNode);

        this.bindDragover();
      } else {
        /**
         * 从组件库添加
         */
        this.dragNode = this.xFormService.clone(this.dragNode);
        let placeholderIndex = Array.from(this.placeholderElement.parentNode.children).indexOf(this.placeholderElement);
        this.placeholderParentNode.children.splice(placeholderIndex, 0, this.dragNode);
        //激活
        this.activeNode = this.dragNode;

        this.initNodes(this.activeNode ? [this.activeNode] : []);
      }

      this.placeholderElement.parentNode.removeChild(this.placeholderElement);
    }
  }

  /**
   * 单击添加组件
   */
  onClickAdd(nodeData: any) {
    nodeData = this.xFormService.clone(nodeData);

    if (this.activeNode) {
      if (this.activeNode.type == 'col') {
        // 在列中添加
        this.activeNode.children = this.activeNode.children || [];
        this.activeNode.children.push(nodeData);
      } else {
        // 在激活的节点后面添加
        let parentNode = this.xFormService.getParentNode(this.config, this.activeNode);
        let activeNodeIndex = parentNode.children.indexOf(this.activeNode);
        parentNode.children.splice(++activeNodeIndex, 0, nodeData);
      }
    } else {
      // 在表单中添加
      this.config.children = this.config.children || [];
      this.config.children.push(nodeData);
    }

    this.activeNode = nodeData;
    this.initNodes([this.activeNode]);
  }

  /**
   * 拷贝节点
   *
   * @param node
   * @param parentNode
   */
  copyNode(node: any, parentNode: any) {
    let newNode = this.xFormService.clone(node);
    let newList = [newNode, ...this.xFormService.tree2Array(newNode.children)];
    newList.forEach(item => {
      delete item.label;
      delete item.model;
      delete item.startModel;
      delete item.endModel;
    });
    parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newNode);
    this.activeNode = newNode;
    this.initNodes(newList);
  }

  /**
   * 移除节点
   */
  removeNode(node: any, parentNode: any) {
    if (this.activeNode == node) {
      this.activeNode = null;
    }
    parentNode.children.splice(parentNode.children.indexOf(node), 1);
  }

  /**
   * 添加组件时初始化
   */
  initNodes(nodeList: any[] = []) {
    // 设置 label | model
    let allNodeList = this.xFormService.tree2Array(this.config.children || []);
    ['input', 'textarea', 'radio', 'checkbox', 'switch', 'select', 'datePicker', 'timePicker'].forEach(type => {
      let typeList = allNodeList.filter(v => v.type == type);
      let list = typeList.filter(v => !v.label || !v.model || (v.pickerType == 'range' && !(v.startModel && v.endModel)));
      if (list.length) {
        // 比较该类型所有组件的model，计算最大的序号
        let no = 0;
        typeList.forEach((node, i, arr) => {
          if (node.model) {
            const v = (node.model as string).replace(node.type, '') as unknown as number;
            no = Math.max(no, v);
          }
        });
        list.forEach((node, i) => {
          let index = no + i + 1;
          switch (node.type) {
            case 'input':
              node.label = `单行输入文本框${index}`;
              break;
            case 'textarea':
              node.label = `文本域${index}`;
              break;
            case 'radio':
              node.label = `单选按钮${index}`;
              break;
            case 'checkbox':
              node.label = `多选框${index}`;
              break;
            case 'switch':
              node.label = `切换开关${index}`;
              break;
            case 'select':
              node.label = `下拉选择${index}`;
              break;
            case 'datePicker':
              node.label = `日期选择器${index}`;
              break;
            case 'timePicker':
              node.label = `时间选择器${index}`;
              break;
            default:
              // console
              break;
          }
          // node.label = `${node.type}${index}`;
          if (node.pickerType == 'range') {
            node.startModel = `${node.type}${index}_start`;
            node.endModel = `${node.type}${index}_end`;
          } else {
            node.model = `${node.type}${index}`;
          }
        });
      }
    });

    nodeList.forEach(node => {
      switch (node.type) {
        case 'datePicker':
        case 'timePicker': {
          // 设置 默认值
          this.setPickerDefaultValue(node);
          // 设置 placeholder
          if (!node.placeholder && node.pickerType == 'range') {
            node.placeholder = ['开始时间', '结束时间'];
          }
          break;
        }
      }
    });

    // 绑定拖动覆盖事件
    this.bindDragover();
  }

  //-------------------------------------------------------

  /**
   * 获取属性对象(用于引用值的OnPush更新)
   *
   * @param node
   * @param propertyField
   */
  getPropertyObj(node: any, propertyField: any) {
    if (Array.isArray(node[propertyField])) {
      return [...node[propertyField]];
    } else {
      return { ...node[propertyField] };
    }
  }

  /**
   * select[多选] option 默认选中事件 => 更新 defaultValue
   */
  selectOptionCheckboxChange(checked: any, option: any) {
    this.activeNode.defaultValue = this.activeNode.defaultValue || [];
    if (checked) {
      this.activeNode.defaultValue.push(option.value);
    } else {
      this.activeNode.defaultValue.splice(this.activeNode.defaultValue.indexOf(option.value), 1);
    }
    this.activeNode.defaultValue = [...this.activeNode.defaultValue];
  }

  /**
   * 自动设置当前时间
   */
  setPickerDefaultValue(node: any) {
    if (node.now) {
      if (node.pickerType == 'range') {
        let now = +new Date();
        node.defaultValue = [startOfDay(now), endOfDay(now)];
      } else {
        node.defaultValue = new Date();
      }
    } else {
      if (node.pickerType == 'range') {
        node.defaultValue = [];
      } else {
        node.defaultValue = null;
      }
    }
  }

  //--------------------------------------------------------

  /**
   * 校验节点配置
   */
  validNodeConfig(node: any) {
    if (['row', 'col', 'hr'].includes(node.type)) return true;

    let valid = true;

    switch (true) {
      case node.type == 'template': {
        valid = node.key;
        break;
      }
      case ['radio', 'checkbox', 'select'].includes(node.type): {
        valid = node.label && node.model;
        switch (node.optionSourceType) {
          case 'manual': {
            valid = valid && node.options.length;
            break;
          }
          case 'native': {
            valid = valid && node.labelField && node.valueField && node.nativeSourceField;
            break;
          }
          case 'server': {
            valid = valid && node.labelField && node.valueField && node.url && node.serverSourceField;
            break;
          }
        }
        break;
      }
      case node.type == 'datePicker' && node.pickerType == 'range': {
        valid = node.label && node.startModel && node.endModel;
        break;
      }
      default: {
        valid = node.label && node.model;
      }
    }

    if (!valid) {
      this.errorSet.add(node);
    } else {
      this.errorSet.delete(node);
    }

    return !!valid;
  }

  /**
   * 获取 config
   */
  getFormConfig(cut = true) {
    let formConfigItemList = this.xFormService.tree2Array(this.config.children);

    if (formConfigItemList.length == 0) {
      this.msg.error('请添加组件!');
      return null;
    }

    let errorCount = 0;
    formConfigItemList.forEach(node => {
      this.validNodeConfig(node);
      this.errorSet.has(node) && ++errorCount;
    });

    if (errorCount > 0) {
      this.msg.error(`有 ${errorCount} 个组件待完善`);
      return null;
    }

    let config = this.xFormService.clone(this.config);
    if (cut) {
      config = this.xFormService.cutConfig(config);
    }

    return config;
  }

  /**
   * 返回 & 保存并返回
   */
  onBack(type: any): null | void {
    let config = null;
    if (type == 'save') {
      config = this.getFormConfig(false);
      if (!config) {
        return null;
      }
    }
    this.close.emit({ type, config });
  }

  /**
   * JSON编辑对话框 - 打开
   */
  openJsonEditDialog() {
    let config = this.xFormService.clone(this.config);
    // config = this.xFormService.cutConfig(config);
    this.jsonEditDialog.value = JSON.stringify(config, null, 4);
    this.jsonEditDialog.display = true;
  }

  /**
   * JSON编辑对话框 - 保存
   */
  jsonEditDialogOk() {
    let config = null;

    try {
      config = JSON.parse(this.jsonEditDialog.value);
    } catch (error) {
      this.msg.error('请输入正确的JSON');
      return;
    }

    this.config = this.xFormService.assembleConfig(config);
    this.activeNode = null;
    this.propertyTabSelectedIndex = 1;
    let nodeList = this.xFormService.tree2Array(this.config.children || []);
    this.initNodes(nodeList);

    this.jsonEditDialog.display = false;
  }

  /**
   * 打开 生成HTML 对话框
   */
  openHtmlDialog() {
    this.htmlDialog.display = true;
    this.htmlDialog.html = this.xFormService.generateHTML(this.config);
    this.htmlDialog.ts = this.xFormService.generateTS(this.config);
  }

  /**
   * 点击复制
   */
  clipboardCopy() {
    let content = this.htmlDialog.tabSelectedIndex == 0 ? this.htmlDialog.html : this.htmlDialog.ts;
    navigator.clipboard.writeText(content).then(
      () => {
        this.msg.success('已复制');
      },
      () => {
        this.msg.success('复制失败');
      }
    );

    // const textarea = document.createElement('textarea');
    // textarea.style.opacity = '0';
    // textarea.style.position = 'fixed';
    // document.body.appendChild(textarea);
    // textarea.value = content || 'undefined';
    // textarea.focus();
    // textarea.select();
    // const result: any = document.execCommand('copy');
    // if (result != 'unsuccessful') {
    //   this.msg.success('已复制');
    // }
    // textarea.parentNode.removeChild(textarea);
  }

  /**
   * 预览对话框 - 打开
   */
  openPreviewDialog() {
    let config = this.getFormConfig(false);
    if (config) {
      this.previewDialog.config = config || {};
      this.previewDialog.formValue = null;
      this.previewDialog.display = true;
    }
  }

  /**
   * 预览对话框 - 赋值
   */
  previewDialogSetValue(XFormRender: any) {
    if (!XFormRender.valid()) {
      this.msg.error('校验不通过!');
      return;
    }

    let formValue = XFormRender.getValue();
    this.previewDialog.setValueDialog.value = JSON.stringify(formValue, null, 4);
    this.previewDialog.setValueDialog.display = true;
  }

  /**
   * 预览对话框 - 赋值 - 保存
   */
  setValueDialogOk() {
    try {
      let formValue = JSON.parse(this.previewDialog.setValueDialog.value);
      this.previewDialog.formValue = formValue;
      this.previewDialog.setValueDialog.display = false;
    } catch (error) {
      this.msg.error('请输入正确的JSON');
    }
  }
  // i索引
  clickOptions(i: number) {
    let arr = [];
    for (const iterator of this.activeNode.options) {
      arr.push(Number(this.extractNumber(iterator.value)));
    }
    //找出最大的数字
    const max = Math.max(...arr);

    this.activeNode.options.splice(i + 1, 0, {
      label: `选项${max + 1}`,
      value: `option${max + 1}`
    });
  }

  extractNumber(str: string) {
    const regex = /option(\d+)/;
    const match = str.match(regex);
    if (match) {
      return match[1];
    }
    return null;
  }
  /**
   * 获取组件选项值，当前仅支持单选、多选
   *
   * @param id 组件id
   * @returns 字符串数组
   */
  getComponentValue(id: string): any[] {
    if (id) {
      // 传递了有效的id，则从config中检索
      const component = this.config.children.find((item: any) => item.model == id);
      if (component && ['radio', 'checkbox'].includes(component.type)) {
        // 找到了有效的组件，且是radio、checkbox类型
        return component.options;
      }
    }
    return [];
  }
}
