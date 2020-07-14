import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CreateAdminService {

  constructor(public http: HttpClient) { }

  createAdminUser(req): any {
    return this.http.post('https://sportsin-test-a.appspot.com/adminUser/createAdminUser', req);
  }
}
