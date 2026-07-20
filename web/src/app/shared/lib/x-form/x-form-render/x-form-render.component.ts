import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getISOWeek, setISOWeek, startOfDay, endOfDay, parse, format } from 'date-fns';
import { InputBoolean } from 'ng-zorro-antd/core/util';
import { firstValueFrom } from 'rxjs';

import { XFormService } from '../x-form.service';
import { IArrayPaire } from '../../../model/public-api';

@Component({
  selector: 'x-form-render',
  standalone: false,
  templateUrl: './x-form-render.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./x-form-render.component.scss', '../ng-zorro/nz-form-fix.scss']
})
export class XFormRenderComponent implements OnChanges {
  @Input() config: any = {};
  @Input() baseUrl = '';
  @Input() @InputBoolean() loading = false;
  @Input() formValue: any = {};
  @Input() templateMap: { [key: string]: TemplateRef<any> } = {};
  @Input() optionSourceMap: { [key: string]: any[] } = {};
  @Output() readonly inited = new EventEmitter<FormGroup>();

  formGroup: FormGroup | null = null;
  formConfigNodeList: any[] = [];

  constructor(
    private fb: FormBuilder,
    public xFormService: XFormService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.initFormGroup();
    } else {
      if (changes['optionSourceMap']) {
        this.getNativeOptions();
      }

      if (changes['baseUrl']) {
        this.getServerOptions();
      }

      if (changes['formValue']) {
        this.setValue();
      }
    }
  }

  /**
   * 初始化表单
   */
  initFormGroup() {
    this.config = this.xFormService.assembleConfig(this.config || {});
    let controlsConfig: { [key: string]: any } = {};
    this.formConfigNodeList = this.xFormService.tree2Array(this.config.children || []);
    this.formConfigNodeList
      .filter(node => !['row', 'col', 'hr', 'template'].includes(node.type))
      .forEach(node => {
        if (node.model || (node.startModel && node.endModel)) {
          let defaultValue = null;
          let valid = node.required ? [Validators.required] : [];

          if (node.type == 'checkbox' && node.optionSourceType == 'manual') {
            defaultValue = this.xFormService.clone(node.options || []);
          }

          if (node.type == 'datePicker' && node.pickerType == 'range') {
            node.model = `${node.startModel}_${node.endModel}`;
          }

          controlsConfig[node.model] = [defaultValue, valid];
        }
      });
    this.formGroup = this.fb.group(controlsConfig);

    this.initManualOptions();
    this.getNativeOptions();
    this.getServerOptions();
    this.setValue();

    this.inited.emit(this.formGroup);
  }

  /**
   * 获取单个的 option
   *
   * @param item
   * @param node
   */
  getOption(item: any, node: any) {
    return {
      label: item[node.labelField],
      value: item[node.valueField],
      checked: item[node.checkedField]
    };
  }

  /**
   * 设置 checkbox 选项
   *
   * @param node
   */
  setCheckOptions(node: any) {
    let checkOptions = this.xFormService.clone(node.options || []);
    let value = (this.formValue || {})[node.model];
    if (Array.isArray(value)) {
      checkOptions.forEach((option: any) => (option.checked = value.some((v: any) => String(v) == option.value)));
    }
    this.formGroup?.patchValue({ [node.model]: checkOptions });
  }

  /**
   * 设置 manual options
   */
  initManualOptions() {
    this.formConfigNodeList
      .filter(node => ['radio', 'checkbox', 'select'].includes(node.type) && node.optionSourceType == 'manual')
      .forEach(node => {
        node.options = node.options.filter((item: any) => item.value).map((item: any) => ({ ...item, value: String(item.value) }));
      });
  }

  /**
   * 获取本地 options
   */
  getNativeOptions() {
    this.formConfigNodeList
      .filter(node => ['radio', 'checkbox', 'select'].includes(node.type) && node.optionSourceType == 'native')
      .forEach(node => {
        node.options = ((this.optionSourceMap || {})[node.nativeSourceField] || []).map(item => this.getOption(item, node));
        node.options = node.options.filter((item: any) => item.value).map((item: any) => ({ ...item, value: String(item.value) }));
        if (node.type == 'checkbox') {
          this.setCheckOptions(node);
        }
      });
  }

  /**
   * 获取服务器 options
   */
  getServerOptions() {
    let promiseList: any[] = [];

    this.formConfigNodeList
      .filter(node => ['radio', 'checkbox', 'select'].includes(node.type) && node.optionSourceType == 'server')
      .forEach(node => {
        let request: any = null;
        switch (node.method) {
          case 'get': {
            request = firstValueFrom(this.http.get<any>(this.getUrl(node.url)));
            break;
          }
          case 'post_json': {
            request = firstValueFrom(this.http.post<any>(this.getUrl(node.url), null));
            break;
          }
          case 'post_form': {
            request = firstValueFrom(
              this.http.post<any>(this.getUrl(node.url), null, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
              })
            );
            break;
          }
        }

        request.then((res: any) => {
          res = res || {};
          let list = [];
          let serverSourceField = node.serverSourceField;
          if (serverSourceField.startsWith('function') || serverSourceField.includes('=>')) {
            // serverSourceField = eval(`(${serverSourceField})`);    //ng-alain升级17的时候报错 You can read more about direct eval and bundling here: https://esbuild.github.io/link/direct-eval
            serverSourceField = new Function(`return ${serverSourceField}`)();
          }

          if (typeof serverSourceField == 'string') {
            try {
              // list = eval(`res.${serverSourceField}`);
              list = new Function(`return res.${serverSourceField}`)();
            } catch (error) {
              list = [];
            }
          } else if (typeof serverSourceField == 'function') {
            list = serverSourceField(res) || [];
          }

          if (!Array.isArray(list)) {
            list = [];
          }

          node.options = list.map(item => this.getOption(item, node));
          node.options = node.options.filter((item: any) => item.value).map((item: any) => ({ ...item, value: String(item.value) }));

          if (node.type == 'checkbox') {
            this.setCheckOptions(node);
          }
        });

        promiseList.push(request);
      });

    if (promiseList.length) {
      this.loading = true;
      Promise.all(promiseList).then(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * 获取完整的 URL
   *
   * @param action
   */
  getUrl(action: any) {
    if (this.xFormService.isUrl(action) || !this.baseUrl) {
      return action;
    } else {
      return this.xFormService.concatUrl(this.baseUrl, action);
    }
  }

  //------------------------------------

  /**
   * 赋值
   */
  setValue() {
    let formValue = { ...this.formValue };

    Object.entries<any>(formValue).forEach(([key, value]) => {
      let node = this.formConfigNodeList.find(node => node.model == key);
      if (!node || value == null) return;
      switch (true) {
        // 单选
        case node.type == 'radio': {
          formValue[key] = String(value);
          break;
        }
        // 多选
        case node.type == 'checkbox': {
          let checkOptions = this.xFormService.clone(node.options || []);
          if (Array.isArray(value)) {
            checkOptions.forEach((option: any) => (option.checked = value.some(v => String(v) == option.value)));
          } else {
            checkOptions.forEach((option: any) => (option.checked = false));
          }
          formValue[key] = checkOptions;
          break;
        }
        // 下拉
        case node.type == 'select': {
          if (Array.isArray(value)) {
            formValue[key] = value.map(v => String(v));
          } else {
            formValue[key] = String(value);
          }
          break;
        }
        // 日期控件
        case node.type == 'datePicker': {
          switch (true) {
            // 2010
            case node.pickerType == 'year': {
              formValue[key] = parse(value, 'yyyy', new Date());
              break;
            }
            // 2020-01
            case node.pickerType == 'month': {
              formValue[key] = parse(value, 'yyyy-MM', new Date());
              break;
            }
            case node.pickerType == 'date': {
              formValue[key] = this.xFormService.toDate(<any>value);
              break;
            }
            // 2020-01 (2020年第1周)
            case node.pickerType == 'week': {
              let year = value.split('-')[0];
              let week = value.split('-')[1];
              formValue[key] = setISOWeek(parse(year, 'yyyy', new Date()), Number(week));
              break;
            }
          }
          break;
        }
        // 时间控件
        case node.type == 'timePicker': {
          formValue[key] = parse(value, node.nzFormat, new Date());
          break;
        }
      }
    });

    // 日期控件 / 时间范围
    this.formConfigNodeList
      .filter(node => node.type == 'datePicker' && node.pickerType == 'range')
      .forEach(node => {
        if (!(formValue[node.startModel] && formValue[node.endModel])) return;
        formValue[node.model] = [this.xFormService.toDate(formValue[node.startModel]), this.xFormService.toDate(formValue[node.endModel])];
      });

    this.reset();
    this.formGroup?.patchValue(formValue);
  }

  /**
   * 验证
   */
  valid() {
    // 创建一个新的formGroup来进行验证
    // 生成配置信息
    const formConfig: IArrayPaire = {};
    let valid = Object.entries(this.formGroup!.controls).every(([key, control], idx, controls) => {
      // 获取节点信息
      const node = this.formConfigNodeList.find(node => node.model == key);
      if (!node) return;
      if (this.visibleIf(node.visibleIf, node, false)) {
        // 先行验证checkbox
        if (node.type == 'checkbox' && node.required && control.enabled && !(<any[]>control.value).some(option => option.checked)) {
          return false;
        }
        // 只有显示出来的才需要验证
        formConfig[key] = [control.value, control.validator ? [control.validator] : []];
      }
      return true;
    });
    if (!valid) return false;
    // 构造新的表单组进行验证
    const formGroup = this.fb.group(formConfig);
    return formGroup.valid;
  }

  /**
   * 取值
   */
  getValue(isValid: boolean = true) {
    if (isValid) this.valid();
    let formValue = { ...this.formGroup?.value };
    Object.entries<any>(formValue).forEach(([key, value]) => {
      if (value == null) return;
      let node = this.formConfigNodeList.find(node => node.model == key);
      switch (true) {
        // 多选
        case node.type == 'checkbox': {
          formValue[key] = (<any[]>value || []).filter(option => option.checked).map(option => option.value);
          break;
        }
        // 日期控件
        case node.type == 'datePicker': {
          switch (true) {
            // 2010
            case node.pickerType == 'year': {
              formValue[key] = format(value, 'yyyy');
              break;
            }
            // 2020-01
            case node.pickerType == 'month': {
              formValue[key] = format(value, 'yyyy-MM');
              break;
            }
            // 2020-01-01 00:00:00
            case node.pickerType == 'date': {
              // 不显示时间默认为一天的开始
              if (!node.nzShowTime) {
                value = startOfDay(value);
              }
              switch (node.valueType) {
                // 时间戳
                case 'timestamp': {
                  formValue[key] = +value;
                  break;
                }
                // ISO8601 T分隔
                case 'ISO8601T': {
                  formValue[key] = format(value, `yyyy-MM-dd${node.nzShowTime ? ' HH:mm:ss' : ''}`).replace(' ', 'T');
                  break;
                }
                // ISO8601 空格分隔
                case 'ISO8601': {
                  formValue[key] = format(value, `yyyy-MM-dd${node.nzShowTime ? ' HH:mm:ss' : ''}`);
                  break;
                }
              }
              break;
            }
            // 2020-01 (2020年第1周)
            case node.pickerType == 'week': {
              formValue[key] = `${format(value, 'yyyy')}-${getISOWeek(<Date>value)}`;
              break;
            }
          }
          break;
        }
        // 时间控件
        case node.type == 'timePicker': {
          formValue[key] = format(value, node.nzFormat);
          break;
        }
      }
    });

    // 日期控件 / 时间范围
    this.formConfigNodeList
      .filter(node => node.type == 'datePicker' && node.pickerType == 'range')
      .forEach(node => {
        let range = formValue[node.model];
        delete formValue[node.model];
        if (range == null || range.length == 0) {
          formValue[node.startModel] = null;
          formValue[node.endModel] = null;
          return;
        }
        // 不显示时间默认为一天的开始
        if (!node.nzShowTime) {
          range[0] = startOfDay(range[0]);
          range[1] = endOfDay(range[1]);
        }
        switch (node.valueType) {
          // 时间戳
          case 'timestamp': {
            formValue[node.startModel] = +range[0];
            formValue[node.endModel] = +range[1];
            break;
          }
          // ISO8601 T分隔
          case 'ISO8601T': {
            formValue[node.startModel] = format(range[0], `yyyy-MM-dd${node.nzShowTime ? ' HH:mm:ss' : ''}`).replace(' ', 'T');
            formValue[node.endModel] = format(range[1], `yyyy-MM-dd${node.nzShowTime ? ' HH:mm:ss' : ''}`).replace(' ', 'T');
            break;
          }
          // ISO8601 空格分隔
          case 'ISO8601': {
            formValue[node.startModel] = format(range[0], `yyyy-MM-dd${node.nzShowTime ? ' HH:mm:ss' : ''}`);
            formValue[node.endModel] = format(range[1], `yyyy-MM-dd${node.nzShowTime ? ' HH:mm:ss' : ''}`);
            break;
          }
        }
      });

    return formValue;
  }

  /**
   * 重置表单
   *
   * @params useDefaultValue = true 是否使用默认值
   */
  reset(useDefaultValue = true) {
    if (!useDefaultValue) {
      this.formGroup?.reset();
      return;
    }

    let defaultValue: { [key: string]: any } = {};
    this.formConfigNodeList.forEach(node => {
      switch (true) {
        // 多选
        case node.type == 'checkbox': {
          node.defaultValue = this.xFormService.clone(node.options || []);
          break;
        }
        // 日期控件
        case node.type == 'datePicker': {
          if (node.pickerType == 'range') {
            let now = new Date();
            node.defaultValue = node.now ? [startOfDay(now), endOfDay(now)] : [];
          } else {
            node.defaultValue = node.now ? new Date() : null;
          }
          break;
        }
        // 时间控件
        case node.type == 'timePicker': {
          node.defaultValue = node.now ? new Date() : null;
          break;
        }
      }

      defaultValue[node.model] = node.defaultValue || null;
    });
    this.formGroup?.reset(defaultValue);
  }

  /**
   * 禁用
   */
  disable() {
    this.formGroup?.disable();
  }

  /**
   * 启用
   */
  enable() {
    this.formGroup?.enable();
  }
  /**
   * visibleIf所需要的定时器
   */

  // private timerId: NodeJS.Timeout | null = null;
  /**
   * 显示条件判断
   *
   * @param visibleIfConfig 条件配置，id、value
   * @param item 组件完整配置
   * @param boolean clearValue 显示时候是否清理里面已选择的值
   * @returns boolean 显示与否
   */
  visibleIf(visibleIfConfig: any, item: any, clearValue = true): boolean {
    if (!visibleIfConfig || !visibleIfConfig.id || !visibleIfConfig.value) {
      // 未关联，则直接显示
      return true;
    }
    // 检查指定组件当前的值
    const formValue = this.getValue(false);
    let value = formValue[visibleIfConfig.id] || [];
    if (!Array.isArray(value)) {
      value = [value];
    }
    // 当前仅支持radio、checkbox，所以获取到的value是一个字符串数组
    // 这里需要判断下两个数组的交集,不为空则说明匹配到
    const formValueSet = new Set(value),
      result = visibleIfConfig.value.filter((item: any) => formValueSet.has(item)).length > 0;
    // 当不显示时，清理当前组件的值
    if (clearValue && !result) {
      let val = null;
      if ('checkbox' == item.type) {
        val = (this.formGroup?.get(item.model)?.value as any[]).map(v => {
          v.checked = false;
          return v;
        });
      } else {
        val = item.defaultValue || null;
      }
      this.formGroup?.get(item.model)?.setValue(val);
      // 因为ng的脏检查机制，存在组件判定visibleIf的前后顺序问题，所以需要延迟一下
      // 为了防止无限执行，所以需要清理定时器，保证只有一个定时器可以执行
      // if (this.timerId !== null) {
      //   clearTimeout(this.timerId);
      // }
      // this.timerId = setTimeout(() => {
      //   // this.cdr.detectChanges();
      //   this.timerId = null;
      // }, 500);
      // console.log(this.timerId);
    }
    return result;
  }
}
