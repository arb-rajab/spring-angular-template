import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTable, TableColumn } from './data-table';

interface Row {
  id: number;
  name: string;
}

@Component({
  imports: [DataTable],
  template: `
    <ng-template #actions let-row><button class="row-action">Edit {{ row.name }}</button></ng-template>
    <app-data-table
      caption="People"
      [columns]="columns"
      [rows]="rows"
      [loading]="loading"
      [sort]="sort"
      emptyTitle="No people"
      emptyDescription="Add one."
      [rowActions]="withActions ? actions : null"
      (sortChange)="sorts.push($event)"
    />
  `,
})
class Host {
  columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Name', cell: (r) => r.name, sortable: true },
    { key: 'id', header: 'ID', cell: (r) => String(r.id) },
  ];
  rows: Row[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' },
  ];
  loading = false;
  sort = '';
  withActions = false;
  sorts: string[] = [];
}

describe('DataTable', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders headers and escaped cell text for each row', () => {
    const headers = Array.from(el().querySelectorAll('th')).map((h) => h.textContent?.trim());
    expect(headers).toEqual(['Name', 'ID']);
    const cells = Array.from(el().querySelectorAll('tbody td')).map((c) => c.textContent?.trim());
    expect(cells).toEqual(['Ada', '1', 'Grace', '2']);
    expect(el().querySelector('caption')?.textContent?.trim()).toBe('People');
  });

  it('shows a spinner while loading instead of the table', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    expect(el().querySelector('app-spinner')).toBeTruthy();
    expect(el().querySelector('table')).toBeNull();
  });

  it('shows the empty state when there are no rows', () => {
    fixture.componentInstance.rows = [];
    fixture.detectChanges();

    expect(el().querySelector('table')).toBeNull();
    expect(el().textContent).toContain('No people');
    expect(el().textContent).toContain('Add one.');
  });

  it('does not render text as HTML', () => {
    fixture.componentInstance.rows = [{ id: 3, name: '<img src=x onerror=alert(1)>' }];
    fixture.detectChanges();

    expect(el().querySelector('tbody img')).toBeNull();
    expect(el().querySelector('tbody td')?.textContent).toContain('<img');
  });

  it('only makes sortable columns clickable and reports aria-sort', () => {
    const headers = Array.from(el().querySelectorAll('th'));
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
    expect(headers[0].querySelector('button')).toBeTruthy();
    expect(headers[1].hasAttribute('aria-sort')).toBeFalse();
    expect(headers[1].querySelector('button')).toBeNull();

    fixture.componentInstance.sort = 'name,desc';
    fixture.detectChanges();
    expect(el().querySelectorAll('th')[0].getAttribute('aria-sort')).toBe('descending');
  });

  it('cycles ascending then descending through sortChange', () => {
    const click = () => (el().querySelector('th button') as HTMLButtonElement).click();

    click();
    fixture.componentInstance.sort = 'name';
    fixture.detectChanges();
    click();

    expect(fixture.componentInstance.sorts).toEqual(['name', 'name,desc']);
  });

  it('renders a row action template with the row as context', () => {
    fixture.componentInstance.withActions = true;
    fixture.detectChanges();

    const actions = Array.from(el().querySelectorAll('.row-action')).map((b) => b.textContent?.trim());
    expect(actions).toEqual(['Edit Ada', 'Edit Grace']);
  });
});
