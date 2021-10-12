import { Directive, NgZone, Input, HostListener, EventEmitter, Output, OnDestroy } from '@angular/core';
import { RazorPayCreateOrderConfig, RazorPayPaymentConfig } from '../user-type';
import { RazorPaymentService } from '../services/razor-payment.service';
import { WindowRefService } from '../window-ref.service';
import { CommonService } from '../common.service';
import { environment } from '../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appRazorpay]'
})
export class RazorpayDirective implements OnDestroy {
  private subscriptions: Subscription[] = [];

  @Input() public appRazorpay;
  @Output() closepaymentRequest = new EventEmitter<object>();

  @HostListener('click') onPayEvent() {
    this.paymentMethod();
  }

  constructor(
    private razorPayment: RazorPaymentService,
    private winref: WindowRefService,
    private ngZone: NgZone,
    public commonService: CommonService,
    public spinner: NgxSpinnerService) { }

  public paymentMethod(): void {
    this.spinner.show();
    const createOrderReq = this.createOrderConfig();
    const paymentConfigReq = this.paymentConfig();
    const orderObservableRes = this.razorPayment.initPay(createOrderReq);
    this.subscriptions.push(orderObservableRes.subscribe((order) => {
      this.spinner.hide();
      paymentConfigReq['order_id'] = order.orderId;
      paymentConfigReq['description'] = order.orderId;
      this.razorPayment.rzp = new this.winref.nativeWindow['Razorpay'](paymentConfigReq);
      this.razorPayment.rzp.open();
      event.preventDefault();
        }, error => {
          this.spinner.hide();
        console.log("TCL: CheckoutComponent -> initiatePaymentModal -> error", error)
    }));
  }

  createOrderConfig(): RazorPayCreateOrderConfig {
    const options: RazorPayCreateOrderConfig = {
      amount: this.appRazorpay['paymentAmount'],  // amount in the smallest currency unit
      currency: "INR",
      userId: this.appRazorpay['email'],
      userRole: "SERVICE_PROVIDER"
    }
    return options;
  }

  public paymentConfig(): RazorPayPaymentConfig {
    const options: RazorPayPaymentConfig = {
      key: environment.payment_key, // add razorpay key here
      name: 'Sports In',
      description: '',
      amount: this.appRazorpay['paymentAmount'],
      currency: "INR",
      order_id: '', // Need to replace order id value with id in the first step
      prefill: {
        name: this.appRazorpay['name'],
        email: this.appRazorpay['email'],
        contact: this.appRazorpay['mobile']
      },
      notes: {},
      theme: {
        color: '#3880FF'
      },
      handler: this.paymentHandler.bind(this),
      modal: {
        ondismiss: (() => {
          this.ngZone.run(() => {
            this.spinner.hide();
            const respObj = {
              headerMsg: 'Payment Failed',
              respMsg:'PAYMENT FAILED RECEIPT',
              isPaymentSuccess: false,
              data: ''
            }
            this.closepaymentRequest.emit(respObj);
          })
        })
      }
    }
    return options;
  }

  public paymentHandler(res: any): any {
    this.spinner.show();
    const orderResponse = res;
    this.ngZone.run(() => {
      this.subscriptions.push(this.commonService.verifyOrder(res).subscribe((resp) => {
        this.spinner.hide();
        const respObj = {
          headerMsg: 'Sucess',
          respMsg:'Payment Reciept',
          isPaymentSuccess: resp['paymentStatus'],
          data: resp
        }
        this.closepaymentRequest.emit(respObj);
      }))
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
