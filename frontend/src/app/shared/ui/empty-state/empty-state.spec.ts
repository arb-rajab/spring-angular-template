import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `<app-empty-state title="No users" [description]="description"><button>Invite</button></app-empty-state>`,
})
class Host {
  description = 'Invite someone to get started.';
}

describe('EmptyState', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('shows the title, description and projected action', () => {
    expect(el().querySelector('h3')?.textContent).toBe('No users');
    expect(el().textContent).toContain('Invite someone to get started.');
    expect(el().querySelector('button')?.textContent).toBe('Invite');
  });

  it('omits the description paragraph when none is given', () => {
    fixture.componentInstance.description = '';
    fixture.detectChanges();
    expect(el().querySelector('p')).toBeNull();
  });
});
