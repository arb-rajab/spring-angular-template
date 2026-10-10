import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder for a list or page with nothing to show. Project an action button as content. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p class="muted">{{ description() }}</p>
      }
      <div class="empty-state-action"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
    }
    .empty-state-action:not(:empty) {
      margin-top: 1rem;
    }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input('');
}
