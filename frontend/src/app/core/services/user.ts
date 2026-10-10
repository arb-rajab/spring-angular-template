import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageQuery, PageResponse } from '../models/page.model';
import { UserSummary } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  list(query: PageQuery = {}): Observable<PageResponse<UserSummary>> {
    let params = new HttpParams();
    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.size !== undefined) {
      params = params.set('size', query.size);
    }
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return this.http.get<PageResponse<UserSummary>>(`${environment.apiBaseUrl}/users`, { params });
  }
}
