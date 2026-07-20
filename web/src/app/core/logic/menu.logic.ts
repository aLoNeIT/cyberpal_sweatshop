import { Menu } from '@delon/theme';

import { BaseLogic } from './base.logic';
import { IMenuData, IMenuSet } from '@shared/model';

export function getAdminMenuLink(uri?: string): string | undefined {
  switch (uri) {
    case '/admin/code/category':
      return '/admin/setting/dict';
    case '/admin/setting/dict':
      return '/admin/code/category';
    default:
      return uri;
  }
}

export function normalizeMenuIcon(icon?: string): string | undefined {
  if (!icon) return icon;
  switch (icon) {
    case 'hospital-o':
      return 'medicine-box';
    default:
      return icon;
  }
}

export class MenuLogic extends BaseLogic {
  load(menuSet: IMenuSet | null | undefined): Menu[] {
    return [
      {
        text: '',
        group: true,
        hideInBreadcrumb: true,
        children: this.parseMenu(menuSet)
      }
    ];
  }
  /**
   * 将接口返回的菜单数据转换为框架所需要的结构
   *
   * @author 王阮强(wangruanqiang@youzhibo.cn)
   * @date 2021-02-22
   * @param {IMenuSet} menuSet 接口返回的菜单集合
   * @returns {*}  {Menu[]}
   */
  parseMenu(menuSet: IMenuSet | null | undefined): Menu[] {
    const menu: Menu[] = [];
    if (!menuSet) return menu;
    Object.keys(menuSet).forEach(key => {
      const data: IMenuData = menuSet[key],
        item: Menu = {
          text: data.title,
          icon: normalizeMenuIcon(data.icon),
          link: getAdminMenuLink(data.uri),
          acl: {
            ability: [`${data.code!.replace('MN', 'FN')}00`]
          },
          key,
          open: false
        };
      // 菜单关闭或显示样式不是左侧菜单，则跳过
      if (0 == data.state || 1 != data.style) return;
      if (data.parented && data.children && Object.keys(data.children).length > 0) {
        // 有子级菜单，则递归处理
        item.children = this.parseMenu(data.children);
      }
      menu.push(item);
    });
    return menu;
  }
}
