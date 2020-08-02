import { Injectable } from '@angular/core';
import { pinUrl, createSPOfServiceConsumer, isValidUserNameUrl, isValidEmailUrl, merchantKey, createServiceRequest, createServiceRequestUrlOfSP, updateServiceRequestUrl } from './app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from '../../node_modules/rxjs';

// const checksum_lib = require('../../checksum/checksum.js');
// import * as checksum_lib from '../../checksum/checksum.js';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public loggedInUser = {userRole: '', userId: '', email: '', name: ''};
  public isAdminUserClicked: Boolean = false;
  public isServiceNowClicked: boolean = false;
  public paymentObject: object = {};
  public eventCatDetailsObj = {
    category: 'Select Category',
    activityType: ' Select Activity Type',
    activityName:'Select Activity Name'
  }

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

  public validatePassword(passwordValue) {
    let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
      let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        if(!strongRegex.test(passwordValue)) {
          // this.modalService.open(this.msgContent, {ariaLabelledBy: 'modal-basic-title'});
          // this.popUpMsgHeader = 'Error'
          // this.createEventResp = "Your password must be have at least";
          // this.isInvalidPassword = true;
          return false;
        } else {
          return true;
        }
  }

  createServiceRequest(reqParams): Observable<any> {
    return this.http.post(createServiceRequest, reqParams);
  }

  findAllServiceRequestOfSP(reqParams): Observable<any> {
    const param = {
      requestorId: reqParams
    }
    return this.http.post(createServiceRequestUrlOfSP, param);
  }

  updateServiceRequest(reqParams): Observable<any> {
    return this.http.post(updateServiceRequestUrl, reqParams);
  }

  paymentGateway(reqObj): Observable<any> {
    // reqObj['MERCHANT_KEY'] = 'W2!4PpWoB#PyOMeR';
    return this.http.post('http://localhost:5000/payment', {'params': reqObj});
  };

}
