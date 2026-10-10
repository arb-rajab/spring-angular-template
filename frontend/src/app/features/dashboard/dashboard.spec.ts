import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { asAuthInternals } from '../../core/testing/auth-test-utils';
import { Auth } from '../../core/services/auth';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  function signIn(roles: ('ROLE_ADMIN' | 'ROLE_USER')[]): void {
    asAuthInternals(TestBed.inject(Auth)).userSignal.set({
      id: 1,
      email: 'a@example.test',
      firstName: 'Ada',
      lastName: 'Admin',
      active: true,
      roles,
    });
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
  });

  it('greets the signed-in user', () => {
    signIn(['ROLE_USER']);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Welcome, Ada');
  });

  it('links to user management for admins only', () => {
    signIn(['ROLE_USER']);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('a[href="/users"]')).toBeNull();

    signIn(['ROLE_ADMIN']);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('a[href="/users"]')).toBeTruthy();
  });
});
