import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Label + projected input + validation messages. Shows two kinds of message together:
 *
 * - client-side: derived from the bound `control`'s validators, once it is touched or dirty;
 * - server-side: the `errors` array, typically `parseApiError(e).fieldErrors['fieldName']`.
 *
 * Set `inputId` to the `id` of the projected control so the label is associated with it. Give the
 * control `[attr.aria-describedby]="inputId + '-errors'"` to have screen readers read the
 * messages, which are rendered in an element with that id.
 *
 * ```html
 * <app-form-field label="Email" inputId="email" [control]="form.controls.email"
 *                 [errors]="fieldErrors()['email']">
 *   <input id="email" type="email" formControlName="email" />
 * </app-form-field>
 * ```
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly control = input<AbstractControl | null>(null);
  readonly errors = input<string[] | undefined>([]);
  readonly hint = input('');

  /** All messages to show: validator messages (when the control was interacted with) first. */
  messages(): string[] {
    const control = this.control();
    const client =
      control && control.invalid && (control.touched || control.dirty)
        ? describeValidationErrors(control.errors)
        : [];
    return [...client, ...(this.errors() ?? [])];
  }
}

function describeValidationErrors(errors: ValidationErrors | null): string[] {
  if (!errors) {
    return [];
  }
  return Object.entries(errors).map(([key, detail]) => {
    switch (key) {
      case 'required':
        return 'This field is required.';
      case 'email':
        return 'Enter a valid email address.';
      case 'minlength':
        return `Must be at least ${detail.requiredLength} characters.`;
      case 'maxlength':
        return `Must be at most ${detail.requiredLength} characters.`;
      case 'min':
        return `Must be at least ${detail.min}.`;
      case 'max':
        return `Must be at most ${detail.max}.`;
      case 'pattern':
        return 'Invalid format.';
      default:
        return 'Invalid value.';
    }
  });
}
