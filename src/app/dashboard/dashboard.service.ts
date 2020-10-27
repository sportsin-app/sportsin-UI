import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../common.service';
import { findAllSrvcConsumerOfSrvcProvider, allServiceReqUrl } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  public bookingCreatedObj: any;
  public allEventListUrl = 'https://sportsin-test-a.appspot.com/eventDetails/findAllEvents';
  public allEventsSpURL = 'https://sportsin-test-a.appspot.com/eventDetails/findAllEventsOfServiceProvider';
  public serviceProviderEventListUrl:any = 'https://sportsin-test-a.appspot.com/eventDetails/findAllEventsOfServiceProvider';
  public serviceConsumerEventListUrl = 'https://sportsin-test-a.appspot.com/serviceConsumer/findAllServiceConsumers';
  public findAllSPUrl = 'https://sportsin-test-a.appspot.com/serviceProvider/findAllServiceProviders';
  public getInvitationUrl = 'https://sportsin-test-a.appspot.com/invite/findAllInvitations';
  public adminListUrl = 'https://sportsin-test-a.appspot.com/adminUser/findAllAdminUsers'
  public updateAdminUrl = 'https://sportsin-test-a.appspot.com/adminUser/updateAdminUser';
  constructor(public http: HttpClient,
              public commonService: CommonService) { }

  getServiceProviderEventList(reqObj): any {
    return this.http.post(this.serviceProviderEventListUrl, reqObj);
  }

  getAllEventList(req): any {
    if (req.userRole === 'SERVICE_PROVIDER') {
      const serviceProvider = {
        serviceProviderId : req.userId
      }
      return this.http.post(this.allEventsSpURL, {serviceProvider})
    } else {
      return this.http.get(this.allEventListUrl);
    }
  }

  getServiceConsumerEventList(): any {
    if (this.commonService.loggedInUser.userRole === 'SERVICE_PROVIDER') {
      const serviceProvider = {
        serviceProviderId: this.commonService.loggedInUser.userId
      }
      return this.http.post(findAllSrvcConsumerOfSrvcProvider, serviceProvider);
    } else {
      return this.http.get(this.serviceConsumerEventListUrl);
    }

  }

  fetchServiceProviders(): any {
    return this.http.get(this.findAllSPUrl);
  }

  getInvitationList(): any {
    return this.http.get(this.getInvitationUrl);
  }

  getAdminList(): any {
    return this.http.get(this.adminListUrl);
  }

  updateAdminData(req): any {
    return this.http.post(this.adminListUrl, req);
  }

  getServiceReqList(): any {
    if (this.commonService.loggedInUser.userRole === 'ADMIN' || this.commonService.loggedInUser.userRole === 'SUPER_USER') {
      return this.http.get(allServiceReqUrl);
    } else {
      // This needs to change to SP specific.
      return this.http.get(allServiceReqUrl);
    }
  }
}
