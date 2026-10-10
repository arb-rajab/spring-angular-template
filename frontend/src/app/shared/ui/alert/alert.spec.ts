import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertVariant, Alert } from './alert';

@Component({
  imports: [Alert],
  template: `<app-alert [variant]="variant" [dismissible]="dismissible" (dismissed)="dismissedCount = dismissedCount + 1">Hello</app-alert>`,
})
class Host {
  variant: AlertVariant = 'info';
  dismissible = false;
  dismissedCount = 0;
}

describe('Alert', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => (fixture.nativeElement as HTMLElement).querySelector('.alert') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders projected content as a status for info', () => {
    expect(root().textContent).toContain('Hello');
    expect(root().getAttribute('role')).toBe('status');
    expect(root().classList).toContain('alert-info');
  });

  it('uses role=alert for errors and warnings', () => {
    for (const variant of ['error', 'warning'] as AlertVariant[]) {
      fixture.componentInstance.variant = variant;
      fixture.detectChanges();
      expect(root().getAttribute('role')).toBe('alert');
      expect(root().classList).toContain(`alert-${variant}`);
    }
  });

  it('shows a close button only when dismissible and emits dismissed', () => {
    expect(root().querySelector('.alert-close')).toBeNull();

    fixture.componentInstance.dismissible = true;
    fixture.detectChanges();
    (root().querySelector('.alert-close') as HTMLButtonElement).click();

    expect(fixture.componentInstance.dismissedCount).toBe(1);
  });
});
