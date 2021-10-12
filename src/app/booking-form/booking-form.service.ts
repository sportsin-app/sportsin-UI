import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {createEventUrl_test, pinUrl, updateBookingUrl_test, createSPUrl_test, updateServiceProviderUrl_test,
        createInvitationUrl_test, updateInvitationUrl_test} from '../app.config';
import { Observable, forkJoin, combineLatest } from 'rxjs';
import { CommonService } from '../common.service';

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



  constructor(public http: HttpClient,
              public commonService: CommonService) { }

  submitBookingRequest(reqObj): any {
    return this.http.post(createEventUrl_test, reqObj);
  }
  fetchAddress(reqObj): any {
    return this.http.get(pinUrl+reqObj);
  }

  updateFormRequest(reqObj): Observable<any> {
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

  uploadImage(req, userId, objectId?): any {
    const formData = new FormData();
    // http://localhost:8080/SportsIn/uploadFile/upload/folderId/objectId
    let observables = []
    if (Array.isArray(req)) {
      req.forEach((reqObj, index) => {
        const url = 'https://sportsin-test-a.appspot.com/uploadFile/upload/' + userId + '/' + reqObj.id;
        formData.append('file', reqObj.file);
        observables.push(this.http.post(url, formData));
      })
    } else {
      const url = 'https://sportsin-test-a.appspot.com/uploadFile/upload/' + userId + '/' + objectId;
      formData.append('file', req);
      observables.push(this.http.post(url, formData));
    }
    return forkJoin(observables);
  }

  downloadImage(userId, reqObj?): Observable<any> {
    let observables: any[] = [];
    if (Array.isArray(reqObj)) {
      reqObj.forEach((req) => {
        const url = 'https://sportsin-test-a.appspot.com/uploadFile/download/' + userId + '/' + req.id;
        // observables.push(this.http.get(url, {responseType: 'blob'}));
        observables.push(this.http.get(url));
      })
    } else {
      const url = 'https://sportsin-test-a.appspot.com/uploadFile/download/' + userId + '/' + reqObj.id;
      observables.push(this.http.get(url));
    }
    return combineLatest(observables);
  }


}
