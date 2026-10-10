import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Spinner } from './spinner';

describe('Spinner', () => {
  let fixture: ComponentFixture<Spinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Spinner] }).compileComponents();
    fixture = TestBed.createComponent(Spinner);
    fixture.detectChanges();
  });

  it('is announced as a status with a default label', () => {
    const el = (fixture.nativeElement as HTMLElement).querySelector('.spinner');
    expect(el?.getAttribute('role')).toBe('status');
    expect(el?.getAttribute('aria-label')).toBe('Loading');
  });

  it('supports a custom label and the small size', () => {
    fixture.componentRef.setInput('label', 'Saving');
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();

    const el = (fixture.nativeElement as HTMLElement).querySelector('.spinner');
    expect(el?.getAttribute('aria-label')).toBe('Saving');
    expect(el?.classList).toContain('spinner-small');
  });
});
