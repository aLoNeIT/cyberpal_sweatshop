import { Component, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  protected get router(): Router {
    return this.injector.get(Router);
  }

  constructor(
    private http: _HttpClient,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    // 初始化首页数据
  }
}
