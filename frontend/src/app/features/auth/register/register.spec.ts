import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let httpMock: HttpTestingController;

  const fill = (email = 'dup@example.test') =>
    component.form.setValue({ firstName: 'Dup', lastName: 'User', email, password: 'Password123!' });

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a password of at least 8 characters', () => {
    component.form.controls.password.setValue('short');
    expect(component.form.controls.password.valid).toBeFalse();
  });

  it('surfaces a friendly message on a duplicate email', () => {
    fill();
    component.submit();

    httpMock.expectOne('/api/v1/auth/register').flush('Conflict', { status: 409, statusText: 'Conflict' });

    expect(component.errorMessage()).toBe('An account with that email already exists.');
  });

  it('renders server-side field errors next to the matching inputs', () => {
    fill('taken@example.test');
    component.submit();

    httpMock.expectOne('/api/v1/auth/register').flush(
      { message: 'Validation failed', fieldErrors: { email: ['must be a well-formed email address'] } },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    const emailError = (fixture.nativeElement as HTMLElement).querySelector('#email-errors');
    expect(emailError?.textContent).toContain('must be a well-formed email address');
    expect(component.errorMessage()).toBe('Validation failed');
  });

  it('clears previous server errors on resubmit', () => {
    fill();
    component.submit();
    httpMock.expectOne('/api/v1/auth/register').flush(
      { message: 'Validation failed', fieldErrors: { email: ['bad'] } },
      { status: 400, statusText: 'Bad Request' },
    );

    component.submit();

    expect(component.fieldErrors()).toEqual({});
    httpMock.expectOne('/api/v1/auth/register');
  });
});
