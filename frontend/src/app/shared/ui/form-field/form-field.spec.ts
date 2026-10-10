import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField } from './form-field';

@Component({
  imports: [FormField, ReactiveFormsModule],
  template: `
    <app-form-field label="Email" inputId="email" hint="We never share it." [control]="control" [errors]="serverErrors">
      <input id="email" [formControl]="control" />
    </app-form-field>
  `,
})
class Host {
  control = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  serverErrors: string[] | undefined = [];
}

describe('FormField', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const errorTexts = () => Array.from(el().querySelectorAll('.error-text')).map((n) => n.textContent?.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('associates the label with the input and shows the hint while valid or untouched', () => {
    expect(el().querySelector('label')?.getAttribute('for')).toBe('email');
    expect(el().querySelector('small')?.textContent).toBe('We never share it.');
    expect(errorTexts()).toEqual([]);
  });

  it('shows validator messages only after the control is touched', () => {
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();

    expect(errorTexts()).toEqual(['This field is required.']);
    expect(el().querySelector('small')).toBeNull();
  });

  it('describes the failing validator', () => {
    fixture.componentInstance.control.setValue('not-an-email');
    fixture.componentInstance.control.markAsDirty();
    fixture.detectChanges();

    expect(errorTexts()).toEqual(['Enter a valid email address.']);
  });

  it('shows server-side field errors even for an untouched control', () => {
    fixture.componentInstance.serverErrors = ['has already been taken'];
    fixture.detectChanges();

    expect(errorTexts()).toEqual(['has already been taken']);
    expect(el().querySelector('.field-errors')?.id).toBe('email-errors');
  });

  it('tolerates undefined server errors', () => {
    fixture.componentInstance.serverErrors = undefined;
    fixture.detectChanges();

    expect(errorTexts()).toEqual([]);
  });
});
