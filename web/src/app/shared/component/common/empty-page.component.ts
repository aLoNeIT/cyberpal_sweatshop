import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-shared-empty-page',
  standalone: false,
  templateUrl: './empty-page.component.html',
  styleUrls: ['./empty-page.component.less']
})
export class SharedEmptyPageComponent implements OnInit {
  title = '';
  routePath = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.title = String(this.route.snapshot.data['title'] || '');
    this.routePath = this.router.url.split('?')[0];
  }
}
