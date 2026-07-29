import { AfterViewInit, ChangeDetectorRef, Component, OnChanges } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { SettingsService, MenuService } from '@delon/theme';
import { LayoutDefaultOptions } from '@delon/theme/layout-default';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
export class AdminLayoutBasicComponent implements OnChanges, AfterViewInit {
  options: LayoutDefaultOptions = {
    logoLink: '/admin/dashboard'
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

  constructor(
    private settings: SettingsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    msgSrv: NzMessageService,
    private menuSrv: MenuService
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
          if (menus && menus.length > 0) {
            this.menuSrv.open(menus[menus.length - 1]);
          }
        }, 200);
      }
    });

    merge(menuSrv.change, router.events.pipe(filter(ev => ev instanceof NavigationEnd)))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => setTimeout(() => this.cdr.detectChanges()));
  }

  ngAfterViewInit(): void {
    // 菜单渲染统一由 ApplicationLogic.load() 负责（在 setTimeout 中调用 menuSrv.add），
    // 此处不再重复加载，仅标记初始化完成状态。
    this.inited = true;
  }

  refresh(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(): void {
    if (this.inited) {
      this.refresh();
    }
  }
}
