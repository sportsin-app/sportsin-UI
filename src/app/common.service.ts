import { Injectable } from '@angular/core';
import { pinUrl, createSPOfServiceConsumer, isValidUserNameUrl, isValidEmailUrl, merchantKey } from './app.config';
import { HttpClient } from '@angular/common/http';

// const checksum_lib = require('../../checksum/checksum.js');
// import * as checksum_lib from '../../checksum/checksum.js';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public loggedInUser = {userRole: '', userId: ''};
  public isAdminUserClicked: Boolean = false;

  constructor(public http: HttpClient) { }

  fetchAddress(reqObj): any {
    return this.http.get(pinUrl+reqObj);
  }

  createServiceConsumer(req): any {
    return this.http.post(createSPOfServiceConsumer, req);

  }

  checkUserName(req): any {
    return this.http.post(isValidUserNameUrl, {'userName': req});
  }

  checkemail(req): any {
    return this.http.post(isValidEmailUrl, {'email': req});
  }

  createChecksum(paytm): any {
    // return checksum_lib.genchecksum(paytm, merchantKey);
  }
}
