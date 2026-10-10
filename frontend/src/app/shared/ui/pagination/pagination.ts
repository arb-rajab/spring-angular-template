import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Page navigation for the backend's `PageResponse`. `page` is zero-based (as the API is);
 * labels are one-based. Renders nothing when there is a single page.
 *
 * ```html
 * <app-pagination [page]="data.page" [totalPages]="data.totalPages" (pageChange)="load($event)" />
 * ```
 */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  /** How many numbered buttons to show around the current page. */
  readonly windowSize = input(5);
  readonly pageChange = output<number>();

  readonly hasPrevious = computed(() => this.page() > 0);
  readonly hasNext = computed(() => this.page() < this.totalPages() - 1);

  readonly pages = computed(() => {
    const total = this.totalPages();
    const width = Math.min(this.windowSize(), total);
    const start = Math.max(0, Math.min(this.page() - Math.floor(width / 2), total - width));
    return Array.from({ length: width }, (_, i) => start + i);
  });

  go(target: number): void {
    if (target >= 0 && target < this.totalPages() && target !== this.page()) {
      this.pageChange.emit(target);
    }
  }
}
