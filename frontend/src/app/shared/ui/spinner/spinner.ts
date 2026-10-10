import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Indeterminate loading indicator. Exposes `role="status"` with an accessible label. */
@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="spinner" [class.spinner-small]="size() === 'small'" role="status" [attr.aria-label]="label()"></span>`,
  styles: `
    .spinner {
      display: inline-block;
      width: 1.75rem;
      height: 1.75rem;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-small {
      width: 1rem;
      height: 1rem;
      border-width: 2px;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation-duration: 3s;
      }
    }
  `,
})
export class Spinner {
  readonly size = input<'small' | 'medium'>('medium');
  readonly label = input('Loading');
}
