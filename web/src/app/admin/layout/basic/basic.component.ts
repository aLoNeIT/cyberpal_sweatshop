import { ChangeDetectorRef, Component, OnChanges } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { PrivilegeService } from '@core';
import { SettingsService, User, MenuService, Menu } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { getAdminMenuLink, normalizeMenuIcon } from 'src/app/core/logic/menu.logic';
import { IMenuData, IMenuSet } from 'src/app/shared/model/http';

interface PageHeaderPath {
  title?: string;
  link?: string[];
}
@Component({
  selector: 'app-admin-layout-basic',
  standalone: false,
  styles: [
    `
      .alain-default__nav-item {
        color: #000;
        padding: 8px 10px;
      }
      .alain-default__nav-item:hover {
        color: #1890ff;
      }
      .app-layout-logo {
        display: flex;
        align-items: center;
        height: 64px;
        padding-left: 24px;
        color: #111;
        overflow: hidden;
        text-decoration: none;
      }
      .app-layout-logo__icon {
        flex: 0 0 32px;
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
      .app-layout-logo__text {
        margin-left: 10px;
        color: #111;
        font-size: 22px;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
      }
      .app-layout-logo--collapsed {
        justify-content: center;
        padding-left: 0;
      }
      .app-layout-logo--collapsed .app-layout-logo__text {
        display: none;
      }
    `
  ],
  template: `
    <ng-template #logoTpl>
      <a class="app-layout-logo" [class.app-layout-logo--collapsed]="collapsed" [routerLink]="options.logoLink">
        <img class="app-layout-logo__icon" src="/assets/img/kd-brand-logo.png" alt="" />
        <span class="app-layout-logo__text">管理后台</span>
      </a>
    </ng-template>
    <layout-default [options]="{ logo: logoTpl, logoLink: options.logoLink }" [asideUser]="asideUserTpl" [content]="contentTpl" [customError]="null">
      @for (item of menuArr; track item; let i = $index) {
        <layout-default-header-item direction="left" hidden="mobile">
          <div layout-default-header-item-trigger (click)="setMenu(item.children, i)" [style]="i === navIndex ? 'color: #1890ff' : ''">
            {{ item.title }}
          </div>
        </layout-default-header-item>
      }
      <layout-default-header-item direction="right">
        <app-admin-header-user></app-admin-header-user>
      </layout-default-header-item>
      <ng-template #asideUserTpl>
        <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item routerLink="/pro/account/center">{{ 'menu.account.center' | i18n }}</li>
            <li nz-menu-item routerLink="/pro/account/settings">{{ 'menu.account.settings' | i18n }}</li>
          </ul>
        </nz-dropdown-menu>
      </ng-template>
      <ng-template #contentTpl>
        <page-header title="" [breadcrumb]="breadcrumb"></page-header>
        <ng-template #breadcrumb>
          @if (paths && paths.length > 0) {
            <nz-breadcrumb>
              @for (i of paths; track i) {
                <nz-breadcrumb-item>
                  @if (i.link) {
                    <a [routerLink]="i.link">{{ i.title }}</a>
                  }
                  @if (!i.link) {
                    {{ i.title }}
                  }
                </nz-breadcrumb-item>
              }
            </nz-breadcrumb>
          }
        </ng-template>
        <router-outlet></router-outlet>
      </ng-template>
    </layout-default>
    @if (showSettingDrawer) {
      <setting-drawer></setting-drawer>
    }
    <!-- <theme-btn></theme-btn> -->
  `
})
export class AdminLayoutBasicComponent implements OnChanges {
  options: LayoutDefaultOptions = {
    logoLink: '/admin/institution/corporation'
  };
  searchToggleStatus = false;
  showSettingDrawer = !environment.production;
  get collapsed(): boolean {
    return this.settings.layout.collapsed;
  }

  private unsubscribe$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  inited = false;
  isFetching = false;
  paths: PageHeaderPath[] = [];
  navIndex: number = -1;

  constructor(
    private settings: SettingsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    msgSrv: NzMessageService,
    private menuSrv: MenuService,
    private privilegeSrv: PrivilegeService
  ) {
    this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(evt => {
      if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
        this.isFetching = true;
      }
      if (evt instanceof NavigationError || evt instanceof NavigationCancel) {
        this.isFetching = false;
        if (evt instanceof NavigationError) {
          msgSrv.error(`无法加载${evt.url}路由`, { nzDuration: 1000 * 3 });
        }
        return;
      }
      if (!(evt instanceof NavigationEnd || evt instanceof RouteConfigLoadEnd)) {
        return;
      }
      if (this.isFetching) {
        setTimeout(() => {
          this.isFetching = false;
        }, 100);
      }
      if (evt instanceof NavigationEnd) {
        //  刷新页面后 根据路由选中左侧菜单
        let url = evt.urlAfterRedirects;
        setTimeout(() => {
          const menus = this.menuSrv.getPathByUrl(url);
          this.menuSrv.open(menus[menus.length - 1]);
        }, 200);
      }
    });
    merge(menuSrv.change.pipe(filter(() => this.inited)), router.events.pipe(filter(ev => ev instanceof NavigationEnd)))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh());

    if (this.privilegeSrv.menu! !== null) {
      this.initMenuTop();
    }
  }

  refresh(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(): void {
    if (this.inited) {
      this.refresh();
    }
  }

  // 顶部导航
  menuArr: IMenuData[] = [];
  initMenuTop() {
    const menu = this.privilegeSrv.menu!;
    Object.keys(menu).forEach(key => {
      // 顶部渲染导航菜单
      // 首页 特殊处理
      if (menu[key].children && menu[key].style === 1) {
        this.menuArr.push(menu[key]);
      }
    });
    setTimeout(() => {
      // 获取当前路由 判断展开对应的菜单
      const menus = this.menuSrv.getPathByUrl(this.router.url); // 当前路由对应的菜单
      for (let i = 0; i < this.menuArr.length; i++) {
        if (menus.length > 1) {
          if (menus[1].key == this.menuArr[i].code) {
            this.setMenu(this.menuArr[i].children, i);
            return;
          }
        } else {
          this.setMenu(this.menuArr[0].children, -1);
        }
      }
    }, 100);
  }
  setMenu(menuSet: any, index: number) {
    this.navIndex = index; // 选中项样式变化
    let menu: Menu[] = [
      {
        text: '',
        group: true,
        hideInBreadcrumb: true,
        children: this.parseMenuC(menuSet)
      }
    ];
    this.menuSrv.add(menu);
    this.menuSrv.openAll(true);
  }
  parseMenuC(menuSet: IMenuSet) {
    const menu: Menu[] = [];
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
        item.children = this.parseMenuC(data.children);
      }
      menu.push(item);
    });
    return menu;
  }
}
