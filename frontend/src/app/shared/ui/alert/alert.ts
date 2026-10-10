import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Inline message banner. Errors and warnings use `role="alert"` (announced immediately);
 * info and success use `role="status"`. Set `dismissible` to show a close button.
 */
@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'alert alert-' + variant()" [attr.role]="isUrgent() ? 'alert' : 'status'">
      <div class="alert-body"><ng-content /></div>
      @if (dismissible()) {
        <button type="button" class="alert-close" aria-label="Dismiss" (click)="dismissed.emit()">&times;</button>
      }
    </div>
  `,
  styles: `
    .alert {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.7rem 0.9rem;
      border-radius: var(--radius);
      border: 1px solid var(--color-border);
      font-size: 0.9rem;
      margin-bottom: 0.85rem;
    }
    .alert-info {
      background: #e7edfd;
      border-color: #c3d2fa;
      color: var(--color-primary);
    }
    .alert-success {
      background: #e3f5e9;
      border-color: #b9e3c7;
      color: var(--color-success);
    }
    .alert-warning {
      background: #fff4e0;
      border-color: #f3d9a4;
      color: var(--color-warning);
    }
    .alert-error {
      background: #fbe9e7;
      border-color: #f1c0bb;
      color: var(--color-danger);
    }
    .alert-close {
      border: 0;
      background: transparent;
      color: inherit;
      font-size: 1.2rem;
      line-height: 1;
      cursor: pointer;
    }
  `,
})
export class Alert {
  readonly variant = input<AlertVariant>('info');
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  isUrgent(): boolean {
    return this.variant() === 'error' || this.variant() === 'warning';
  }
}
