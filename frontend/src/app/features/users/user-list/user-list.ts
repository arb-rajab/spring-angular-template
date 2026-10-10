import { Component, OnInit, inject, signal } from '@angular/core';
import { parseApiError } from '../../../core/http/api-error';
import { PageResponse } from '../../../core/models/page.model';
import { UserSummary } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user';
import { Alert } from '../../../shared/ui/alert/alert';
import { Button } from '../../../shared/ui/button/button';
import { DataTable, TableColumn } from '../../../shared/ui/data-table/data-table';
import { Modal } from '../../../shared/ui/modal/modal';
import { Pagination } from '../../../shared/ui/pagination/pagination';

const PAGE_SIZE = 10;

/**
 * Reference page for server-side paging and sorting: DataTable + Pagination bound to the
 * backend's `PageResponse`, with a Modal for row details. Copy this shape for new list pages.
 */
@Component({
  selector: 'app-user-list',
  imports: [Alert, Button, DataTable, Modal, Pagination],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private readonly users = inject(UserService);

  readonly columns: TableColumn<UserSummary>[] = [
    { key: 'email', header: 'Email', cell: (u) => u.email, sortable: true },
    { key: 'firstName', header: 'First name', cell: (u) => u.firstName, sortable: true },
    { key: 'lastName', header: 'Last name', cell: (u) => u.lastName, sortable: true },
    { key: 'roles', header: 'Roles', cell: (u) => u.roles.map((r) => r.replace('ROLE_', '')).join(', ') },
    { key: 'active', header: 'Status', cell: (u) => (u.active ? 'Active' : 'Deactivated') },
  ];

  readonly data = signal<PageResponse<UserSummary> | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sort = signal('');
  readonly selected = signal<UserSummary | null>(null);
  detailsOpen = false;

  ngOnInit(): void {
    this.load(0);
  }

  load(page: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.users.list({ page, size: PAGE_SIZE, sort: this.sort() || undefined }).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(parseApiError(error, 'Could not load users.').message);
        this.loading.set(false);
      },
    });
  }

  changeSort(sort: string): void {
    this.sort.set(sort);
    this.load(0);
  }

  showDetails(user: UserSummary): void {
    this.selected.set(user);
    this.detailsOpen = true;
  }
}
