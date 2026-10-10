import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests a page with the paging and sort parameters', () => {
    service.list({ page: 2, size: 10, sort: 'email,desc' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.get('sort')).toBe('email,desc');
    req.flush({ items: [], page: 2, size: 10, totalItems: 0, totalPages: 0 });
  });

  it('sends no parameters when none are given', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('/api/v1/users');
    expect(req.request.params.keys()).toEqual([]);
    req.flush({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });
  });
});
