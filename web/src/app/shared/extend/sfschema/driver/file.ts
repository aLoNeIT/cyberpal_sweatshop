import { SFSchema } from '@delon/form';

import { IDictItem } from '../../../model/public-api';
import { Driver, SFSchemaUIType } from './../driver';
import { SFUploadWidgetSchema } from '@delon/form/widgets/upload';

/**
 * 文件型
 *
 * @author 王阮强(wangruanqiang@youzhibo.cn)
 * @date 2021-01-06
 * @class NumberSFSchema
 * @extends {Driver}
 */
export class FileSFSchema extends Driver {
  fromDictItem(dictItem: IDictItem, uiType: SFSchemaUIType, curd: number): SFSchema | SFSchema[] {
    let ui = this.getDefaultUI(dictItem, uiType, curd),
      schema = this.getDefaultSchema(dictItem, curd);
    ui = {
      ...ui,
      widget: 'upload',
      resReName: 'resource_id',
      urlReName: 'url',
      listType: 'picture-card',
      limitFileCount: 1
    } as SFUploadWidgetSchema;
    if (8 == curd) {
      schema = { ...schema, readOnly: true };
    }
    return { ...schema, ui: ui };
  }
}
