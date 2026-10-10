import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Spinner } from '../spinner/spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

/**
 * Button with a loading state. While `loading` it is disabled and shows a spinner, so a form
 * cannot be submitted twice. Use `type="submit"` inside forms; the click and submit events reach
 * the surrounding form and listeners exactly as they would for a native button.
 */
@Component({
  selector: 'app-button',
  imports: [Spinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="btn"
      [class.btn-secondary]="variant() === 'secondary'"
      [class.btn-danger]="variant() === 'danger'"
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) {
        <app-spinner size="small" label="Working" />
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }
    :host(.block),
    :host(.block) .btn {
      display: flex;
      width: 100%;
      justify-content: center;
    }
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
}
