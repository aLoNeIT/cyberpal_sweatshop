import { Component, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ControlWidget, DelonFormModule } from '@delon/form';
import { Observable, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TinymceComponent } from 'ngx-tinymce';

import { SFTinymceWidgetSchema } from './schema';

/**
 * tinymce 上传后数据回调节点
 */
export interface ITinymceData {
  id?: string; // 资源id
  url: string; // 地址
  alt?: string; // 资源的描述
  title?: string; // 对话框标题
  text?: string; // 对话框要显示的文本
  source2?: string; // 媒体资源替代来源
  poster?: string; // 媒体资源封面图
}
/**
 * 文件上传观察者类型
 */
export type UploadObservable = Observable<ITinymceData>;

@Component({
  selector: 'sf-tinymce',
  imports: [DelonFormModule, FormsModule, TinymceComponent],
  template: `
    <sf-item-wrap [id]="id" [schema]="schema" [ui]="ui" [showError]="showError" [error]="error" [showTitle]="schema.title">
      <tinymce [ngModel]="value" (ngModelChange)="change($event)" [config]="config" [loading]="loading" [disabled]="disabled"> </tinymce>
    </sf-item-wrap>
  `
})
export class TinymceWidget extends ControlWidget implements OnInit {
  static readonly KEY = 'tinymce';

  override ui!: SFTinymceWidgetSchema;

  /**
   * tinymce 原生配置项
   */
  config!: Record<string, unknown>;
  /**
   * 加载提示内容
   */
  loading: string = '加载中……';
  /**
   * 默认配置项
   */
  defaultConfig = {
    min_height: 500,
    language: 'zh-Hans',
    language_url: './assets/tinymce/langs/zh-Hans.js',
    branding: false,
    paste_data_images: true,
    automatic_uploads: true,
    menubar: false,
    toolbar_mode: 'sliding',
    file_picker_types: 'image,media,file', // 'file image media'
    plugins:
      'preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template code codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount image help emoticons autosave',
    toolbar:
      // 'code undo redo restoredraft | cut copy | forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat |  table image media charmap emoticons pagebreak insertdatetime preview | fullscreen |  indent2em'
      'code undo redo restoredraft | forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat |  table image media charmap emoticons pagebreak insertdatetime preview | fullscreen |  indent2em',
    // 文件选择回调函数
    file_picker_callback: (callback: any, value: any, meta: any) => {
      let accept = '',
        type = 1;
      switch (meta.filetype) {
        case 'media': // 媒体，当前仅视频
          accept = 'video/*';
          type = 2;
          break;
        case 'file': // 文件
          accept = '.doc, .docx, .xls, .xlsx, .txt, .ppt';
          type = 3;
          break;
        default: // 默认图片
          accept = 'image/*';
          type = 1;
          break;
      }
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', accept);
      input.addEventListener('change', e => {
        // 获取选择的稳健
        const file = (e.target as any).files[0];
        this.ui.upload(file, type).subscribe(result => {
          // 订阅成功后执行回调
          result.url = `${result.url}?id=${result.id}`;
          let params = {};
          switch (meta.filetype) {
            case 'media': // 媒体，当前仅视频
              params = {
                source2: result.source2 || '',
                poster: result.poster || ''
              };
              break;
            case 'file': // 文件
              params = {
                text: result.text || file.name,
                title: result.title || ''
              };
              break;
            default: // 默认图片
              params = {
                title: result.title || '',
                alt: result.alt || ''
              };
              break;
          }
          callback(result.url, params);
        });
      });
      input.click();
    }
  };
  ngOnInit(): void {
    this.loading = this.ui['loading'] || '加载中……';
    // 合并配置项
    this.config = {
      ...this.defaultConfig,
      ...(this.ui['config'] || {})
    };
    // 配置默认的上传方法
    this.ui.upload =
      this.ui.upload ||
      ((file): UploadObservable => {
        return new Observable<ITinymceData>(oberver => {
          // 创建读取文件对象
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            // 读取到的是b64数据，进行切割
            const base64 = (reader.result as string).split(',')[1],
              tinymce = (window as any).tinymce,
              id = `blobid${new Date().getTime().toString()}`,
              blobCache = tinymce.activeEditor.editorUpload.blobCache,
              blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);
            oberver.next({
              url: blobInfo.blobUri(),
              alt: blobInfo.name()
            });
          });
          // 读取文件内容
          reader.readAsDataURL(file);
        });
      });
  }

  change(value: any): void {
    if (this.ui['change']) this.ui['change'](value);
    this.setValue(value);
  }
}
