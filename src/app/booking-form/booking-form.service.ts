import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingFormService {
  public bookingUrl:any = 'https://vigilant-cider-261407.appspot.com/eventDetails/createEvent';
  public pinUrl: any = 'https://api.postalpincode.in/pincode/'
  public updateBookingUrl = 'https://vigilant-cider-261407.appspot.com/eventDetails/updateEvent';
  public createSPUrl = 'https://vigilant-cider-261407.appspot.com/serviceProvider/createServiceProvider';
  public updateServiceProviderUrl = 'https://vigilant-cider-261407.appspot.com/serviceProvider/updateServiceProvider';
  public updateInvitationUrl = 'https://vigilant-cider-261407.appspot.com/invite/updateInvitation';
  public createInvitationUrl = 'https://vigilant-cider-261407.appspot.com/invite/createInvitation';
  public isAllEventBtnClicked: Boolean = true;
  public isServiceProviderClicked = false;
  public isServiceConsumerClicked = false;
  public isInvitationClicked = false;
  public isAdminUser: Boolean = false;
  public eventCategoryDetailsArray = [];
  public eventCategoryDetails: any;

  // ***********create service provider**********//
//    https://vigilant-cider-261407.appspot.com/serviceProvider/createServiceProvider
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
    return this.http.post(this.bookingUrl, reqObj);
  }
  fetchAddress(reqObj): any {
    return this.http.get(this.pinUrl+reqObj);
  }

  updateFormRequest(reqObj): any {
    return this.http.post(this.updateBookingUrl, reqObj);
  }

  getEventCategoryDetailsJson(): any {
    return this.http.get('./assets/eventCategoryDetails.json');
  }

  createServiceProviderEvent(reqObj): any {
    return this.http.post(this.createSPUrl, reqObj);
  }

  updateServiceProvider(reqObj): any {
    return this.http.post(this.updateServiceProviderUrl, reqObj);
  }

  updateInvitation(reqObj): any {
    return this.http.post(this.updateInvitationUrl, reqObj);
  }

  createInvitation(reqObj): any {
    return this.http.post(this.createInvitationUrl, reqObj);
  }


}
