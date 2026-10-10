import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<app-button [variant]="variant" [loading]="loading" [disabled]="disabled" type="submit">Save</app-button>`,
})
class Host {
  variant: 'primary' | 'secondary' | 'danger' = 'primary';
  loading = false;
  disabled = false;
}

describe('Button', () => {
  let fixture: ComponentFixture<Host>;
  const button = () => (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders projected content with the submit type', () => {
    expect(button().textContent).toContain('Save');
    expect(button().type).toBe('submit');
    expect(button().disabled).toBeFalse();
  });

  it('applies the variant class', () => {
    fixture.componentInstance.variant = 'danger';
    fixture.detectChanges();
    expect(button().classList).toContain('btn-danger');
  });

  it('is disabled and shows a spinner while loading', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    expect(button().disabled).toBeTrue();
    expect(button().getAttribute('aria-busy')).toBe('true');
    expect(button().querySelector('app-spinner')).toBeTruthy();
  });

  it('is disabled when disabled is set', () => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(button().disabled).toBeTrue();
  });
});
