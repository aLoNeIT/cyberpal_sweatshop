import { STColumnTag } from '@delon/abc/st';

export const SEX_TAG: STColumnTag = {
  '0': { text: '未知', color: 'red' },
  '1': { text: '男', color: 'blue' },
  '2': { text: '女', color: 'purple' }
} as { [key: string]: { text: string; color: string } };

export const SEX = {
  '0': '未知',
  '1': '男',
  '2': '女'
} as { [key: string]: string };
