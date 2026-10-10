import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'sso/callback',
    loadComponent: () =>
      import('./features/auth/sso-callback/sso-callback').then((m) => m.SsoCallback),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./features/users/user-list/user-list').then((m) => m.UserList),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
