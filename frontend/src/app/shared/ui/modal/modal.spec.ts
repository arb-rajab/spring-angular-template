import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';

@Component({
  imports: [Modal],
  template: `
    <app-modal title="Delete user?" [(open)]="open" [closeOnBackdrop]="closeOnBackdrop" (closed)="closedCount = closedCount + 1">
      <p>This cannot be undone.</p>
      <button modal-actions id="confirm">Delete</button>
    </app-modal>
  `,
})
class Host {
  open = false;
  closeOnBackdrop = true;
  closedCount = 0;
}

describe('Modal', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const dialog = () => el().querySelector('[role="dialog"]') as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders nothing while closed', () => {
    expect(dialog()).toBeNull();
  });

  it('renders an accessible dialog with projected body and actions when open', () => {
    fixture.componentInstance.open = true;
    fixture.detectChanges();

    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    const titleId = dialog()?.getAttribute('aria-labelledby') as string;
    expect(el().querySelector(`#${titleId}`)?.textContent).toBe('Delete user?');
    expect(dialog()?.textContent).toContain('This cannot be undone.');
    expect(el().querySelector('#confirm')).toBeTruthy();
  });

  it('closes via the close button and reports it', () => {
    fixture.componentInstance.open = true;
    fixture.detectChanges();

    (el().querySelector('.modal-close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open).toBeFalse();
    expect(fixture.componentInstance.closedCount).toBe(1);
    expect(dialog()).toBeNull();
  });

  it('closes on Escape', () => {
    fixture.componentInstance.open = true;
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.open).toBeFalse();
  });

  it('closes on a backdrop click but not on a click inside the dialog', () => {
    fixture.componentInstance.open = true;
    fixture.detectChanges();

    dialog()?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open).toBeTrue();

    (el().querySelector('.modal-backdrop') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open).toBeFalse();
  });

  it('ignores backdrop clicks when closeOnBackdrop is false', () => {
    fixture.componentInstance.closeOnBackdrop = false;
    fixture.componentInstance.open = true;
    fixture.detectChanges();

    (el().querySelector('.modal-backdrop') as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open).toBeTrue();
  });
});
