import { EllipsisModule } from '@delon/abc/ellipsis';
import { ExceptionModule } from '@delon/abc/exception';
import { GlobalFooterModule } from '@delon/abc/global-footer';
import { LoadingModule } from '@delon/abc/loading';
import { MediaModule } from '@delon/abc/media';
import { PageHeaderModule } from '@delon/abc/page-header';
import { SEModule } from '@delon/abc/se';
import { SGModule } from '@delon/abc/sg';
import { STModule } from '@delon/abc/st';
import { SVModule } from '@delon/abc/sv';
import { XlsxModule } from '@delon/abc/xlsx';
import { ACLDirective, ACLIfDirective } from '@delon/acl';
import { ChartEChartsModule } from '@delon/chart/chart-echarts';
// import { AlainThemeModule } from '@delon/theme';
import { G2PieModule } from '@delon/chart/pie';
import { DelonFormModule } from '@delon/form';
import { CurrencyPricePipe } from '@delon/util';
export const SHARED_DELON_MODULES = [
  DelonFormModule,
  PageHeaderModule,
  STModule,
  SEModule,
  SVModule,
  GlobalFooterModule,
  LoadingModule,
  EllipsisModule,
  MediaModule,
  SGModule,
  ChartEChartsModule,
  XlsxModule,
  ExceptionModule,
  G2PieModule,
  DelonFormModule,
  STModule,
  SVModule,
  SEModule,
  PageHeaderModule,
  ACLDirective,
  ACLIfDirective,
  CurrencyPricePipe
  // AlainThemeModule.forChild()
];
