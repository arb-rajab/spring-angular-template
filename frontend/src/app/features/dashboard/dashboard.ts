import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly auth = inject(Auth);
}
