import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { parseApiError } from '../../../core/http/api-error';
import { Auth } from '../../../core/services/auth';
import { Alert } from '../../../shared/ui/alert/alert';
import { Button } from '../../../shared/ui/button/button';
import { FormField } from '../../../shared/ui/form-field/form-field';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, FormField],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  /** Server-side validation messages keyed by request field, from the API's 400 response. */
  readonly fieldErrors = signal<Record<string, string[]>>({});

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.fieldErrors.set({});

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.submitting.set(false);
        const parsed = parseApiError(error, 'Registration failed.');
        this.fieldErrors.set(parsed.fieldErrors);
        this.errorMessage.set(
          parsed.status === 409 ? 'An account with that email already exists.' : parsed.message,
        );
      },
    });
  }
}
