import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageResponse } from '../../../core/models/page.model';
import { UserSummary } from '../../../core/models/user.model';
import { UserList } from './user-list';

function page(items: UserSummary[], pageIndex = 0, totalPages = 1): PageResponse<UserSummary> {
  return { items, page: pageIndex, size: 10, totalItems: items.length, totalPages };
}

const ada: UserSummary = {
  id: 1,
  email: 'ada@example.test',
  firstName: 'Ada',
  lastName: 'Admin',
  active: true,
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
};

describe('UserList', () => {
  let fixture: ComponentFixture<UserList>;
  let httpMock: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;
  const usersRequest = () => httpMock.expectOne((r) => r.url === '/api/v1/users');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(UserList);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('loads the first page and renders the rows', () => {
    const req = usersRequest();
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(page([ada]));
    fixture.detectChanges();

    expect(el().textContent).toContain('ada@example.test');
    expect(el().textContent).toContain('ADMIN, USER');
    expect(el().textContent).toContain('1 total');
  });

  it('reloads from the first page with the new sort when a header is clicked', () => {
    usersRequest().flush(page([ada]));
    fixture.detectChanges();

    (el().querySelector('th button') as HTMLButtonElement).click();

    const req = usersRequest();
    expect(req.request.params.get('sort')).toBe('email');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(page([ada]));
  });

  it('requests the selected page from the pagination control', () => {
    usersRequest().flush(page([ada], 0, 3));
    fixture.detectChanges();

    const next = Array.from(el().querySelectorAll('app-pagination button')).find((b) => b.textContent?.trim() === 'Next');
    (next as HTMLButtonElement).click();

    expect(usersRequest().request.params.get('page')).toBe('1');
  });

  it('shows an error alert when loading fails', () => {
    usersRequest().flush({ message: 'Boom' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(el().querySelector('app-alert')?.textContent).toContain('Boom');
  });

  it('opens a details dialog for the selected row', () => {
    usersRequest().flush(page([ada]));
    fixture.detectChanges();

    (el().querySelector('tbody app-button button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const dialog = el().querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('Ada Admin');
    expect(dialog?.textContent).toContain('ROLE_ADMIN, ROLE_USER');
  });
});
