import { SFUISchemaItem } from '@delon/form';

import { UploadObservable } from './tinymce.widget';

/**
 * 带有按钮的输入框组件
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-21
 * @export
 * @interface SFInputButtonWidgetSchema
 * @extends {SFUISchemaItem}
 */
export interface SFTinymceWidgetSchema extends SFUISchemaItem {
  /**
   * 文件上传所调用的函数，传入文件base64编码字符串和文件对象，要求返回一个observable用于订阅最终数据，
   */
  upload: (file: File, type: number) => UploadObservable;
}
