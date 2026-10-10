import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { EmptyState } from '../empty-state/empty-state';
import { Spinner } from '../spinner/spinner';

export interface TableColumn<T> {
  /** Stable key; also the sort property sent to the backend when `sortable`. */
  key: string;
  header: string;
  /** Plain-text cell value. Rendered with interpolation, so it is always escaped. */
  cell: (row: T) => string;
  sortable?: boolean;
}

/**
 * Generic table with loading, empty and sortable-header states.
 *
 * Sorting is controlled: bind `sort` (`key` or `key,desc`) and handle `sortChange` by reloading
 * from the server. Pair with `<app-pagination>` for paged data. Provide a per-row actions cell with
 * a template: `<ng-template #actions let-row>...</ng-template>` and `[rowActions]="actions"`.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, Spinner, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T> {
  readonly caption = input.required<string>();
  readonly columns = input.required<TableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input(false);
  readonly emptyTitle = input('Nothing here yet');
  readonly emptyDescription = input('');
  readonly sort = input('');
  readonly rowActions = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly sortChange = output<string>();

  ariaSort(column: TableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) {
      return null;
    }
    const [key, direction] = this.sort().split(',');
    if (key !== column.key) {
      return 'none';
    }
    return direction?.toLowerCase() === 'desc' ? 'descending' : 'ascending';
  }

  toggleSort(column: TableColumn<T>): void {
    if (!column.sortable) {
      return;
    }
    this.sortChange.emit(this.ariaSort(column) === 'ascending' ? `${column.key},desc` : column.key);
  }
}
