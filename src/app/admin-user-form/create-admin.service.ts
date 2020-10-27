import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { createAdminUrl, updateAdminUrl } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class CreateAdminService {

  constructor(public http: HttpClient) { }

  createAdminUser(req): any {
    return this.http.post(createAdminUrl, req);
  }

  updateAdminUser(req): Observable<any> {
    return this.http.post(updateAdminUrl, req);
  }
}
