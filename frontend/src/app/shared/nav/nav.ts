import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
