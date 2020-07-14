import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {createEventUrl_test, pinUrl, updateBookingUrl_test, createSPUrl_test, updateServiceProviderUrl_test,
        createInvitationUrl_test, updateInvitationUrl_test} from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class BookingFormService {
  // public bookingUrl:any = 'https://sportsin-test-a.appspot.com/eventDetails/createEvent';
  // public pinUrl: any = 'https://api.postalpincode.in/pincode/'
  // public updateBookingUrl = 'https://sportsin-test-a.appspot.com/eventDetails/updateEvent';
  // public createSPUrl = 'https://sportsin-test-a.appspot.com/serviceProvider/createServiceProvider';
  // public updateServiceProviderUrl = 'https://sportsin-test-a.appspot.com/serviceProvider/updateServiceProvider';
  // public updateInvitationUrl = 'https://sportsin-test-a.appspot.com/invite/updateInvitation';
  // public createInvitationUrl = 'https://sportsin-test-a.appspot.com/invite/createInvitation';
  public isAllEventBtnClicked: Boolean = true;
  public isServiceProviderClicked = false;
  public isServiceConsumerClicked = false;
  public isInvitationClicked = false;
  public isAdminUser: Boolean = false;
  public eventCategoryDetailsArray = [];
  public eventCategoryDetails: any;

  // ***********create service provider**********//
//    https://sportsin-test-a.appspot.com/serviceProvider/createServiceProvider
//  POST
//  {
//     "email": "shyamlala@gmail.com",
//     "password": "12345",
//     "orgName": "Service Test 001",
//     "spoc": "Ram Lal",
//     "contact": {
//     	"mobilePrimary": 8888888888,
//     	"mobileSecondary": 8888888888
//     },
//         "address": {
//         "addressLine1": "addressLine1",
//         "addressLine2": "addressLine2",
//         "country": "country",
//         "state": "state",
//         "city": "city",
//         "pinCode": 211001
//     }
// }



  constructor(public http: HttpClient) { }

  submitBookingRequest(reqObj): any {
    return this.http.post(createEventUrl_test, reqObj);
  }
  fetchAddress(reqObj): any {
    return this.http.get(pinUrl+reqObj);
  }

  updateFormRequest(reqObj): any {
    return this.http.post(updateBookingUrl_test, reqObj);
  }

  getEventCategoryDetailsJson(): any {
    return this.http.get('./assets/eventCategoryDetails.json');
  }

  createServiceProviderEvent(reqObj): any {
    return this.http.post(createSPUrl_test, reqObj);
  }

  updateServiceProvider(reqObj): any {
    return this.http.post(updateServiceProviderUrl_test, reqObj);
  }

  updateInvitation(reqObj): any {
    return this.http.post(updateInvitationUrl_test, reqObj);
  }

  createInvitation(reqObj): any {
    return this.http.post(createInvitationUrl_test, reqObj);
  }

  uploadImage(req): any {
    let formData = new FormData();
    formData.append('file', req);
    return this.http.post('https://sportsin-test-a.appspot.com/uploadFile/upload', formData);
  }


}
