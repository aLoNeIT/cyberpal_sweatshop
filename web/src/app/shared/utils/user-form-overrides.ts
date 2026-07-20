import { SFSchema } from '@delon/form';
import { IEventEmitter } from '@shared/model';

const HIDDEN_USER_FIELDS = ['sex', 'img_head_file', 'img_head_url'];

export function hideUserAvatarAndSex(event: IEventEmitter): void {
  const schema = event.data as SFSchema;
  const properties = schema.properties;
  if (!properties) return;

  HIDDEN_USER_FIELDS.forEach(field => delete properties[field]);
}

export function removeUserAvatarAndSexData(data: Record<string, unknown>): void {
  HIDDEN_USER_FIELDS.forEach(field => delete data[field]);
}
