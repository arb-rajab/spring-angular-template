import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFound } from './not-found';

describe('NotFound', () => {
  it('explains the problem and links back to the dashboard', async () => {
    await TestBed.configureTestingModule({ imports: [NotFound], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Page not found');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/dashboard');
  });
});
