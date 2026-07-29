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
  // 移除旧版 anticon- 前缀，适配 ng-zorro-antd v21 图标系统
  const name = icon.replace(/^anticon-/, '');
  // 图标名映射（旧版 → v21 标准名）
  switch (name) {
    case 'bars':
      return 'menu'; // BarsOutline → MenuOutline
    case 'safety-certificate':
      return 'safety'; // SafetyOutline
    case 'user-add':
      return 'user-add';
    case 'bar-chart':
      return 'bar-chart';
    case 'file-search':
      return 'file-search';
    default:
      return name;
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
      const data: IMenuData = menuSet[key];
      // 菜单关闭或显示样式不是左侧菜单，则跳过（提前过滤避免构建无效 item）
      if (0 == data.state || 1 != data.style) return;

      const hasChildren = data.parented && data.children && Object.keys(data.children).length > 0;
      const item: Menu = {
        text: data.title,
        icon: normalizeMenuIcon(data.icon),
        link: getAdminMenuLink(data.uri),
        // 父级菜单不设置 ACL，其可见性由子菜单的 ACL 结果派生
        // 子级菜单的 ACL: menu_code 中的 MN 替换为 FN 后 + 00 后缀，
        //   与后端返回的功能码格式 (FN010100) 精确匹配
        acl: hasChildren ? undefined : { ability: [`${data.code!.replace('MN', 'FN')}00`] },
        key,
        open: false
      };
      if (hasChildren) {
        // 有子级菜单，则递归处理
        item.children = this.parseMenu(data.children);
      }
      menu.push(item);
    });
    return menu;
  }
}
