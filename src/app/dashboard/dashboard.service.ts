import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  public bookingCreatedObj: any;
  public allEventListUrl = 'https://vigilant-cider-261407.appspot.com/eventDetails/findAllEvents';
  public serviceProviderEventListUrl:any = 'https://vigilant-cider-261407.appspot.com/eventDetails/findAllEventsOfServiceProvider';
  public serviceConsumerEventListUrl = 'https://vigilant-cider-261407.appspot.com/serviceConsumer/findAllServiceConsumers';
  public findAllSPUrl = 'https://vigilant-cider-261407.appspot.com/serviceProvider/findAllServiceProviders';
  public getInvitationUrl = 'https://vigilant-cider-261407.appspot.com/invite/findAllInvitations';
  constructor(public http: HttpClient) { }

  getServiceProviderEventList(reqObj): any {
    return this.http.post(this.serviceProviderEventListUrl, reqObj);
  }

  getAllEventList(): any {
    return this.http.get(this.allEventListUrl);
  }

  getServiceConsumerEventList(eventListReqObj): any {
    return this.http.get(this.serviceConsumerEventListUrl);
  }

  fetchServiceProviders(): any {
    return this.http.get(this.findAllSPUrl);
  }

  getInvitationList(): any {
    return this.http.get(this.getInvitationUrl);
  }
}
