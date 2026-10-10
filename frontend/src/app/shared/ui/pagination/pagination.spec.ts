import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

@Component({
  imports: [Pagination],
  template: `<app-pagination [page]="page" [totalPages]="totalPages" (pageChange)="changes.push($event)" />`,
})
class Host {
  page = 0;
  totalPages = 10;
  changes: number[] = [];
}

describe('Pagination', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const labels = () => Array.from(el().querySelectorAll('button')).map((b) => b.textContent?.trim());
  const click = (text: string) =>
    Array.from(el().querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === text)
      ?.click();

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders nothing for a single page', () => {
    fixture.componentInstance.totalPages = 1;
    fixture.detectChanges();
    expect(el().querySelector('nav')).toBeNull();
  });

  it('shows one-based numbers in a window and disables Previous on the first page', () => {
    expect(labels()).toEqual(['Previous', '1', '2', '3', '4', '5', 'Next']);
    const previous = el().querySelector('button') as HTMLButtonElement;
    expect(previous.disabled).toBeTrue();
  });

  it('centres the window on the current page and marks it', () => {
    fixture.componentInstance.page = 5;
    fixture.detectChanges();

    expect(labels()).toEqual(['Previous', '4', '5', '6', '7', '8', 'Next']);
    expect(el().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('6');
  });

  it('keeps the window inside the range at the end', () => {
    fixture.componentInstance.page = 9;
    fixture.detectChanges();

    expect(labels()).toEqual(['Previous', '6', '7', '8', '9', '10', 'Next']);
    const next = Array.from(el().querySelectorAll('button')).pop() as HTMLButtonElement;
    expect(next.disabled).toBeTrue();
  });

  it('emits zero-based page indexes', () => {
    fixture.componentInstance.page = 2;
    fixture.detectChanges();

    click('Next');
    click('Previous');
    click('1');

    expect(fixture.componentInstance.changes).toEqual([3, 1, 0]);
  });

  it('does not emit for the current page', () => {
    click('1');
    expect(fixture.componentInstance.changes).toEqual([]);
  });
});
