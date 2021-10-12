import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coupon-code-form',
  templateUrl: './coupon-code-form.component.html',
  styleUrls: ['./coupon-code-form.component.scss']
})
export class CouponCodeFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input('isNewCouponCode') public isNewCouponCode: boolean;
  @Input('selectedgridData') public selectedgridData;
  @Output() closeCouponCodeForm = new EventEmitter<object>();

  public couponCreationForm;
  private subscriptions: Subscription[] = [];
  public popUpMsgHeader: string = '';
  public createEventResp: string = '';
  public couponCodeContextList = ['SISPREGISTER', 'SISCREGISTER', 'SIEVDISCOUNT'];
  public couponCodeContextCodeList = ['SISPREG', 'SISCREG', 'SIEVDISC'];

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    public modalService: NgbModal) { }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
  }

  public resetForm(): void {
    if (!this.isNewCouponCode && this.selectedgridData) {
      this.couponCreationForm = this.fb.group({
        couponCode: [this.selectedgridData['couponCode'], Validators.required],
        couponCodeContext: [this.selectedgridData['couponCodeContext'], Validators.required],
        // actualAmount: [this.selectedgridData['actualAmount'], Validators.required],
        discountPercentage: [this.selectedgridData['discountPercentage'], Validators.required],
        maxAllowedDiscountAmt: [this.selectedgridData['maxAllowedDiscountAmt'], Validators.required],
        active: [this.selectedgridData['active'] === true ? 'Yes' : 'No', Validators.required],
        validFrom: [new Date(this.selectedgridData['validFrom']), Validators.required],
        validTo: [new Date(this.selectedgridData['validTo']), Validators.required],
        promoCodeDescription: [this.selectedgridData['promoCodeDescription'], Validators.required]
      });
    } else {
      this.couponCreationForm = this.fb.group({
        couponCode: ['', Validators.required],
        couponCodeContext: ['', Validators.required],
        // actualAmount: ['', Validators.required],
        discountPercentage: ['', Validators.required],
        maxAllowedDiscountAmt: ['', Validators.required],
        active: ['No', Validators.required],
        validFrom: [null, Validators.required],
        validTo: [null, Validators.required],
        promoCodeDescription: [null, Validators.required]
      });
    }
  }

  public onSubmit(content): any {
    this.spinner.show();
    let subscriber;
    this.couponCreationForm.patchValue({
      active: this.couponCreationForm.value['active'] === 'Yes' ? true : false
    });
    const updateReqObj = {
        "couponCode": this.couponCreationForm.value['couponCode'],
        "active": this.couponCreationForm.value['active'],
        "promoCodeDescription": this.couponCreationForm.value['promoCodeDescription']
    }
    if (this.isNewCouponCode) {
      subscriber = this.commonService.createCouponCode(this.couponCreationForm.value);
    } else {
      subscriber = this.commonService.updateCouponCode(updateReqObj);
    }
    this.subscriptions.push(subscriber.subscribe((data) => {
      this.spinner.hide();
      this.popUpMsgHeader = 'Success';
        this.createEventResp = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    }));
  };

  public selectCouponContext(): void {
    const reqObj = {
      paymentContext: this.couponCreationForm.get('couponCodeContext').value
    }
    this.spinner.show();
    this.subscriptions.push(this.commonService.getPaymentAmt(reqObj).subscribe((data) => {
      if (data && data.paymentAmountReq) {
        this.commonService.actualAmountToPay = data.paymentAmountReq.actualAmount;
        this.couponCreationForm.patchValue({
          actualAmount: this.commonService.actualAmountToPay
        })
      }
      this.spinner.hide();
    }));
  }

  public dismissMessage(): void {
    this.modalService.dismissAll();
    this.createEventResp = '';
    this.closeCouponCodeForm.emit({'name': 'couponCode', 'isClosed': true});
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
