import { Injectable, OnInit, NgZone } from '@angular/core';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class RazorPaymentService implements OnInit {
  public rzp: any;
  public paymentConfigOptions: object = {};
  public paymentResponse: any;

  constructor(
    private ngZone: NgZone,
    public commmonService: CommonService
  ) {
  }

  ngOnInit(): void {
  }

  public initPay(createOrderReq): any {
    return this.commmonService.razorPayOrder(createOrderReq);
  }

  // public paymentHandler(res: any): any {
  //   const orderResponse = res;
  //   this.ngZone.run(() => {
  //     this.commmonService.verifyOrder(res).subscribe((resp) => {
  //       // if (resp.paymentSta) {
  //       //   this.commmonService.fetchOrderDetails(orderResponse).subscribe((data) => {
  //       //     console.log(data)
  //       //   });
  //       // }
  //       this.paymentResponse = resp;
  //       return resp;
  //     })
  //   });
  // }

}
