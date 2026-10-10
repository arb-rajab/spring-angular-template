import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  imports: [EmptyState, RouterLink],
  template: `
    <div class="page">
      <app-empty-state title="Page not found" description="The page you are looking for does not exist.">
        <a routerLink="/dashboard">Back to the dashboard</a>
      </app-empty-state>
    </div>
  `,
})
export class NotFound {}
