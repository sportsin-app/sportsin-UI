import { Injectable } from '@angular/core';
import { pinUrl, createSPOfServiceConsumer, isValidUserNameUrl, isValidEmailUrl, merchantKey, createServiceRequest, createServiceRequestUrlOfSP, updateServiceRequestUrl, paymentVerifySignatureUrl, createOrderIdUrl, findConsumerUrl, serviceProviderDetailUrl, adminUserDetailUrl, findAllPromoCodeUrl, createCouponCodeUrl, getCouponCodeUrl, updateCouponCodeUrl, updateConsumerUrl, actualPaymentAmtUrl, resetPasswordUrl, searchMapApi, createMembershipApi, updateMembershipApi } from './app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// const checksum_lib = require('../../checksum/checksum.js');
// import * as checksum_lib from '../../checksum/checksum.js';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public loggedInUser = {userRole: '', userId: '', email: '', name: '', photoSrc: ''};
  public isAdminUserClicked: Boolean = false;
  public isServiceNowClicked: boolean = false;
  public isCouponCodeClicked: boolean = false;
  public isMemberShipClicked: boolean = false;
  public paymentObject: object = {};
  private _actualAmountToPay: number = 0;
  public eventCatDetailsObj = {
    category: 'Select Category',
    activityType: ' Select Activity Type',
    activityName:'Select Activity Name'
  };
  public defaultGuideLines: string = `
  Keep Handy Booking reference & Id.
  Reach 10-15 min early before the time/event.
  Must know Basic understanding/rules of the said sports or activity.
  Users should take care of their health first, it's their responsibility and to be on priority.
  Non-tolerance policy for abuse and/or harassment.
  Any mishap should be reported to authority through proper channels.
  Do check booking, cancellation-refund properly.
  `;

  constructor(public http: HttpClient) { }

  fetchAddress(reqObj): Observable<any> {
    return this.http.get(pinUrl+reqObj);
  }

  createServiceConsumer(req): Observable<any> {
    return this.http.post(createSPOfServiceConsumer, req);

  }

  updateServiceConsumer(req): Observable<any> {
    return this.http.post(updateConsumerUrl, req);
  }

  checkUserName(req): Observable<any> {
    return this.http.post(isValidUserNameUrl, {'userName': req});
  }

  checkemail(req): Observable<any> {
    return this.http.post(isValidEmailUrl, {'email': req});
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

  razorPayOrder(reqParams): Observable<any> {
    //  let httpHeaders = new HttpHeaders();
    //  httpHeaders.append('Content-Type', 'application/json; charset=utf-8');
    //  httpHeaders.append('Access-Control-Allow-Origin', '*');
    //  httpHeaders.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //  httpHeaders.append('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type, Accept');
    //  httpHeaders.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent('rzp_test_UbEXmswyXSTxGB' + ':' + 'ReDU41JbmJG2bsh4sDZ7zyln'))));
    return this.http.post(createOrderIdUrl, reqParams);
  }

  verifyOrder(reqParams): Observable<any> {
    const params = {};
    params['paymentId'] = reqParams['razorpay_payment_id'];
    params['orderId'] = reqParams['razorpay_order_id'];
    params['signature'] = reqParams['razorpay_signature'];
    return this.http.post(paymentVerifySignatureUrl, params);
  }

  fetchOrderDetails(req): Observable<any> {
   const headers = {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(unescape(encodeURIComponent(environment.payment_key + ':' + environment.payment_secret)))
          }
    return this.http.get('https://api.razorpay.com/v1/orders/'+req.razorpay_order_id+'/payments', {headers: headers});
  }

  public checkCustomerisPresent(reqParams: any): Observable<any> {
    return this.http.post(findConsumerUrl, reqParams);
  }

  public getProfileDetails(): Observable<any> {
    let reqObj = {
      "adminId": "",
      "serviceProviderId": "",
      "url": ""
    };
    switch(this.loggedInUser.userRole) {
      case 'SERVICE_PROVIDER':
        reqObj['url'] = serviceProviderDetailUrl;
        reqObj['serviceProviderId'] = this.loggedInUser.userId;
        break;
      case 'ADMIN':
        reqObj['url'] = adminUserDetailUrl;
        reqObj['adminId'] = this.loggedInUser.userId;
        break;
    }
    return this.http.post(reqObj['url'], reqObj);

  }

  public getAllCouponCodes(): Observable<any> {
    return this.http.get(findAllPromoCodeUrl);
  }

  public createCouponCode(reqObj): Observable<any> {
    return this.http.post(createCouponCodeUrl, reqObj);
  }

  public getCouponCode(reqObj): Observable<any> {
    return this.http.post(getCouponCodeUrl, reqObj);
  }

  public updateCouponCode(reqObj): Observable<any> {
    return this.http.post(updateCouponCodeUrl, reqObj);
  }

  public getPaymentAmt(req): Observable<any> {
    return this.http.post(actualPaymentAmtUrl, req);
  }

  public set actualAmountToPay(amount: number) {
    if (amount) {
      this._actualAmountToPay = amount;
    }
  }

  public get actualAmountToPay(): number {
    return this._actualAmountToPay;
  }

  public resetPassword(reqObj): Observable<any> {
    return this.http.post(resetPasswordUrl, reqObj);
  }

  public getLocationDetails(reqObj): Observable<any> {
    let reqParam;
    reqParam = {
      key: '77h32Lz4APdVGWZEPJ5VtJOg5GFXpyKV'
    }
    const lngLat: string = encodeURIComponent(reqObj.latitude + ',' + reqObj.longitude)
    return this.http.get(searchMapApi + lngLat + '.json', {params: reqParam});
  }

  public addMembership(reqObj): Observable<any> {
    return this.http.post(createMembershipApi, reqObj);
  }

  public updateMembership(reqObj): Observable<any> {
    return this.http.post(updateMembershipApi, reqObj);
  }
}
