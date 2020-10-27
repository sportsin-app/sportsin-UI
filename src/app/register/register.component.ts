import { Component, OnInit, ViewChild, NgZone, OnDestroy, DoCheck } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType} from '../user-type';
import { FormBuilder, Validators } from '@angular/forms';
import { RegisterService } from './register.service';
import {NgbModal, ModalDismissReasons, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { CommonService } from '../common.service';
import { Subscription, Observable } from '../../../node_modules/rxjs';
import { couponCodeContext } from '../app.config';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, DoCheck, OnDestroy {

  private title = 'app';
  public registerationForm;
  public registerationResp: String;
  public isInvalidPincode: boolean = false;
  public responseMessage: string;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public headerMsg = '';
  public isValidPassword: boolean = false;
  public paymentResponse: object = {};
  public isPaymentSuccess: boolean = false;
  public razorPayInputObj: Object = {};
  private subscriptions: Subscription[] = [];
  public haveCouponCode: boolean = false;
  public couponCodeText: string = '';
  public applyCouponBtnText: string = 'Apply coupon';
  public paymentAmount: number = 100;
  public couponCodeMsg: string = '';

  @ViewChild('passwordElement', {static: false}) public passwordElement;
  @ViewChild('paymentMsgContent') public msgContent;
  @ViewChild('popover') public popoverMsg:NgbPopover;
  @ViewChild('couponCodeBtn') public couponCodeBtn: NgbPopover;

  // router: Router;
  // usersInfo : Array<UserType>;
  constructor(private router: Router, public fb: FormBuilder,
    private registerService: RegisterService,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public commonService: CommonService){
    // this.user = new UserType();
    // this.usersInfo = new Array<UserType>();
  }

  ngOnInit() {
    this.resetForm();
  }

  ngDoCheck(): void {
    this.razorPayInputObj['eventCreationFee'] = false;
    this.razorPayInputObj['registrationFee'] = true;
    this.razorPayInputObj['eventId'] = '';
    this.razorPayInputObj['email'] = this.registerationForm.get('email') && this.registerationForm.get('email')['value'];
    this.razorPayInputObj['name'] = this.registerationForm.get('spoc') && this.registerationForm.get('spoc')['value'];
    this.razorPayInputObj['mobile'] = this.registerationForm.get('contact') && this.registerationForm.get('contact').get('mobilePrimary')['value'];
    this.razorPayInputObj['paymentAmount'] = this.paymentAmount;
  }

  resetForm(): any {
    this.registerationForm = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
      spoc: [null, Validators.required],
      orgName: [null, Validators.required],
      contact: this.fb.group({
        mobilePrimary: [null, Validators.required],
        mobileSecondary: [null, Validators.required]
      }),
      address: this.fb.group({
        addressLine1: [null, Validators.required],
        addressLine2: [null, Validators.required],
        country: [null, Validators.required],
        state: [null, Validators.required],
        city: [null, Validators.required],
        pinCode: [null, Validators.required]
      })
    });
  }

  onSubmit(content){
      this.subscriptions.push(this.registerService.postRegisterationForm(this.registerationForm.value).subscribe((resp) => {
        this.registerationResp = resp.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      },
      error => {
        this.spinner.hide();
        this.headerMsg = 'Error';
        this.registerationResp = 'Request failed. Please contact your admin for more information.';
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }));
  }

  validateForm(){
    // if((this.user.email && this.user.password && this.user.confirmPassword) != ''){
    //   return false;
    // }else{
    //   return true;
    // }
  }

  getAddressFromPinCode() {
    this.spinner.show();
    this.subscriptions.push(this.commonService.fetchAddress(this.registerationForm.value.address.pinCode).subscribe((resp) => {
      if (resp && resp[0].Status === 'Error') {
        this.isInvalidPincode = true;
        this.responseMessage = 'Pincode is invalid. Please enter valid Pincode';
        this.spinner.hide();
      }else if (resp && resp[0].Status === 'Success') {
        this.isInvalidPincode = false;
        this.pincodeAddress.city = resp[0].PostOffice && resp[0].PostOffice[0].District;
        this.pincodeAddress.country = resp[0].PostOffice && resp[0].PostOffice[0].Country;
        this.pincodeAddress.state = resp[0].PostOffice && resp[0].PostOffice[0].State;
        this.spinner.hide();
      }
    }, error => {
      this.spinner.hide();
    }));
  }

  checkPassword(passwordPopover: NgbPopover): void {
    this.isValidPassword = this.commonService.validatePassword(this.registerationForm.get('password').value);
    if (!this.isValidPassword) {
      this.headerMsg = 'Error';
      this.registerationResp = "Your password must be have at least";
      if (passwordPopover['_elementRef'] && passwordPopover['_elementRef']['nativeElement'] && passwordPopover['_elementRef']['nativeElement']['value'] ==='') {
        passwordPopover.close();
      } else {
        passwordPopover.open()
      }
    } else {
      passwordPopover.close();
    }
  }

  dismissModal(): void {
    this.modalService.dismissAll();
  }

  public getPaymentResponse(response: any): void {
    this.headerMsg = response.headerMsg;
    this.paymentResponse['data'] = response.data;
    this.paymentResponse['responseMsg'] = response.respMsg;
    this.isPaymentSuccess = response.isPaymentSuccess;
    if (this.isPaymentSuccess) {
      this.onSubmit(this.msgContent);
    } else {
      this.modalService.open(this.msgContent, {ariaLabelledBy: 'modal-basic-title'})
    }
  }

  public getHaveCouponCode(isTrue: boolean): void {
    if (isTrue) {
      this.haveCouponCode = true;
    } else {
      this.haveCouponCode = false;
    }
  }

  public applyCouponCode(couponCodeTextValue): void {
    this.couponCodeText = couponCodeTextValue['value'];
    const reqObj = {
      "couponCode": this.couponCodeText,
      "couponCodeContext": couponCodeContext['serviceProvider']
    }
    this.spinner.show();
     this.subscriptions.push(this.commonService.getCouponCode(reqObj).subscribe((appliedCouponResp) => {
      this.spinner.hide();
       if (appliedCouponResp['promoCodeResp']) {
        this.couponCodeBtn.close();
        this.paymentAmount = appliedCouponResp['promoCodeResp']['discountAmount']*100;
        this.applyCouponBtnText = 'Applied';
       } else if (appliedCouponResp['responseHeader'] &&
          appliedCouponResp['responseHeader']['responseStatus'] === 'FAILURE' &&
          !appliedCouponResp['promoCodeResp']) {
            this.couponCodeMsg = appliedCouponResp['responseHeader']['decription'];
            this.couponCodeBtn.open();
       }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
