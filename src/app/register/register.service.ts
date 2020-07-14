import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createSPUrl_test } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(public http: HttpClient) { }

  postRegisterationForm(req): any {
    return this.http.post(createSPUrl_test, req);
  }


}
