import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { DashboardService } from '../dashboard/dashboard.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { BookingFormService } from '../booking-form/booking-form.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],

})
export class InvitationComponent implements OnInit, OnChanges, OnDestroy {
  public invitationForm;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public updateForm: Boolean = false;
  public responseMessage: String;
  public isInvalidPincode: Boolean = false;
  public invalidEmailId: string = '';
  public isInvalidEmailId: Boolean = false;
  public isInvalidSecondaryMobile: Boolean = false;
  public isInvalidPrimaryMobile: Boolean = false;
  private subscriptions: Subscription[] = [];

  @Input('selectedgridData') public selectedgridData;
  @Input('isNewInvitation') public isNewInvitation;
  @Output('closeInvitationForm') public closeInvitationForm = new EventEmitter<Object>();
  constructor(public dashboardService: DashboardService,
    public invitationFormService: BookingFormService,
    public fb: FormBuilder,
    public router: Router,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService) { }

  ngOnInit() {

    this.resetForm(this.selectedgridData);
  }

  ngOnChanges(): void {
    this.resetForm(this.selectedgridData);

  }


  resetForm(createdFormData?) {
    if (!this.isNewInvitation && createdFormData) {
      this.updateForm = true;
      this.pincodeAddress.city = createdFormData.address && createdFormData.address.city;
      this.pincodeAddress.country = createdFormData.address && createdFormData.address.country;
      this.pincodeAddress.state = createdFormData.address && createdFormData.address.state;
      this.pincodeAddress.pinCode = createdFormData.address && createdFormData.address.pinCode;
      this.invitationForm = this.fb.group({
        // id: [null, Validators.required],
        orgName: [createdFormData.orgName, Validators.required],
        spoc: [createdFormData.spoc, Validators.required],
        emailId: [createdFormData.emailId, [Validators.required, Validators.email]],
        contact: this.fb.group({
          mobilePrimary: [createdFormData.contact && createdFormData.contact.mobilePrimary, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
          mobileSecondary: [createdFormData.contact && createdFormData.contact.mobileSecondary, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]]
        }),
        // role: [createdFormData.role],
        address: this.fb.group({
          addressLine1: [createdFormData.address && createdFormData.address.addressLine1, Validators.required],
          addressLine2: [createdFormData.address && createdFormData.address.addressLine2, Validators.required],
          country: [createdFormData.address && createdFormData.address.country, Validators.required],
          state: [createdFormData.address && createdFormData.address.state, Validators.required],
          city: [createdFormData.address && createdFormData.address.city, Validators.required],
          pinCode: [createdFormData.address && createdFormData.address.pinCode, Validators.required]
        })
      });
    } else {
      this.updateForm = false;
      // this.bookingForm && this.bookingForm.reset();
      // this.bookingForm && this.bookingForm.enable();
      this.invitationForm && this.invitationForm.reset();
      this.invitationForm = this.fb.group({
        orgName: [null, Validators.required],
        spoc: [null, Validators.required],
        emailId: [null, [Validators.required, Validators.email]],
        contact: this.fb.group({
          mobilePrimary: [null, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
          mobileSecondary: [null, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
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

  }

  getAddressFromPinCode() {
    this.spinner.show();
    this.subscriptions.push(this.invitationFormService.fetchAddress(this.invitationForm.value.address.pinCode).subscribe((resp) => {
      if (resp && resp[0].Status === 'Error') {
        this.isInvalidPincode = true;
        this.responseMessage = 'Pincode is invalid. Please enter valid Pincode';
        this.pincodeAddress.city = '';
        this.pincodeAddress.state = '';
        this.pincodeAddress.country = '';
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

  onSubmit(content): any {
    if (this.updateForm) {
      this.invitationForm.value.invitationId = this.selectedgridData.invitationId;
      this.subscriptions.push(this.invitationFormService.updateInvitation(this.invitationForm.value).subscribe((data) => {
        this.responseMessage = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }));
    } else {
      this.subscriptions.push(this.invitationFormService.createInvitation(this.invitationForm.value).subscribe((data) => {
        this.responseMessage = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }));
    }
  }

  routeToMainPage() {
    this.closeInvitationForm.emit({'name': 'eventInvitationForm', 'isClosed': true})
  }

  createAnotherForm() {
    this.resetForm();
  }
  checkValidEmail(emailInput: NgbPopover) {
    const emailValue: string = emailInput['_elementRef'] && emailInput['_elementRef']['nativeElement'] && emailInput['_elementRef']['nativeElement']['value'];
    if (emailValue && emailValue.length > 0 && this.invitationForm.controls['emailId'].invalid) {
      this.isInvalidEmailId = true;
      this.invalidEmailId = 'Please enter the valid email id.';
      emailInput.open();
    } else {
      this.isInvalidEmailId = false;
      this.invalidEmailId = '';
      emailInput.close();
    }
  }

  checkValidContactNmbr(input) {
    this.isInvalidPrimaryMobile = false;
    this.isInvalidSecondaryMobile = false;
    if(input === 'primaryMobile' && this.invitationForm.controls['contact'].controls['mobilePrimary'].invalid) {
      this.isInvalidPrimaryMobile = true;
    } else if(input=== 'secondaryMobile' && this.invitationForm.controls['contact'].controls['mobileSecondary'].invalid) {
      this.isInvalidSecondaryMobile = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
