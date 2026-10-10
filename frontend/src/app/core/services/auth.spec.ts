import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AuthResponse } from '../models/user.model';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  const sampleResponse: AuthResponse = {
    accessToken: 'a-token',
    tokenType: 'Bearer',
    expiresInSeconds: 1800,
    refreshToken: 'a-refresh-token',
    user: {
      id: 1,
      email: 'employee@project-name.test',
      firstName: 'Una',
      lastName: 'User',
      active: true,
      roles: ['ROLE_USER'],
    },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts unauthenticated with no stored session', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('stores the token and user after a successful login', () => {
    service.login({ email: sampleResponse.user.email, password: 'Password123!' }).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush(sampleResponse);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('employee@project-name.test');
    expect(localStorage.getItem('project-name.accessToken')).toBe('a-token');
  });

  it('clears the session on logout and asks the server to revoke the refresh token', () => {
    service.login({ email: sampleResponse.user.email, password: 'Password123!' }).subscribe();
    httpMock.expectOne('/api/v1/auth/login').flush(sampleResponse);

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('project-name.accessToken')).toBeNull();
    expect(localStorage.getItem('project-name.refreshToken')).toBeNull();

    const revokeReq = httpMock.expectOne('/api/v1/auth/logout');
    expect(revokeReq.request.body).toEqual({ refreshToken: 'a-refresh-token' });
    revokeReq.flush(null);
  });

  it('hasAnyRole checks the current user roles', () => {
    service.login({ email: sampleResponse.user.email, password: 'Password123!' }).subscribe();
    httpMock.expectOne('/api/v1/auth/login').flush(sampleResponse);

    expect(service.hasAnyRole('ROLE_USER', 'ROLE_ADMIN')).toBeTrue();
    expect(service.hasAnyRole('ROLE_ADMIN')).toBeFalse();
  });

  it('completeSsoLogin stores the token pair immediately and the profile once /users/me responds', () => {
    service.completeSsoLogin('an-sso-token', 'an-sso-refresh-token').subscribe();

    // The token pair (and the access token's Authorization header, via authInterceptor) must be
    // usable right away - both are set synchronously, before the /users/me call that fetches the
    // profile even resolves.
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('project-name.accessToken')).toBe('an-sso-token');
    expect(localStorage.getItem('project-name.refreshToken')).toBe('an-sso-refresh-token');

    const req = httpMock.expectOne('/api/v1/users/me');
    req.flush(sampleResponse.user);

    expect(service.currentUser()?.email).toBe('employee@project-name.test');
    expect(JSON.parse(localStorage.getItem('project-name.currentUser')!).email).toBe(
      'employee@project-name.test',
    );
  });
});
