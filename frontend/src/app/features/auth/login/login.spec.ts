import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks the form invalid when fields are empty and shows required messages after submit', () => {
    expect(component.form.invalid).toBeTrue();

    component.submit();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('This field is required.');
    httpMock.expectNone('/api/v1/auth/login');
  });

  it('shows an error alert on a failed login', () => {
    component.form.setValue({ email: 'wrong@example.test', password: 'bad' });
    component.submit();

    httpMock.expectOne('/api/v1/auth/login').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Invalid email or password.');
    expect(component.submitting()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-alert [role="alert"]')).toBeTruthy();
  });

  it('navigates to the dashboard after a successful login', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    component.form.setValue({ email: 'user@example.test', password: 'Password123!' });
    component.submit();
    httpMock.expectOne('/api/v1/auth/login').flush({
      accessToken: 'a',
      tokenType: 'Bearer',
      expiresInSeconds: 1800,
      refreshToken: 'r',
      user: { id: 1, email: 'user@example.test', firstName: 'U', lastName: 'S', active: true, roles: ['ROLE_USER'] },
    });

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('starts the SSO handshake through the Auth service', () => {
    const auth = TestBed.inject(Auth);
    const start = spyOn(auth, 'startSsoLogin');

    component.signInWithSso();

    expect(start).toHaveBeenCalled();
  });
});
