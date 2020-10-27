import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { CreateAdminService } from './create-admin.service';
import { Subscription } from '../../../node_modules/rxjs';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../common.service';
import { BookingFormService } from '../booking-form/booking-form.service';

@Component({
  selector: 'app-admin-user-form',
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.scss']
})
export class AdminUserFormComponent implements OnInit, OnChanges, OnDestroy {
  public createAdminForm;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public responseMessage: String;
  public isInvalidPincode: Boolean = false;
  public invalidEmailId: string = '';
  public isInvalidEmailId: Boolean = false;
  public isInvalidSecondaryMobile: Boolean = false;
  public isInvalidPrimaryMobile: Boolean = false;
  private subscriptions: Subscription[] = [];
  public isValidPassword: boolean = false;
  public uploadFile: Object;
  public headerMsg: string = '';

  @Input('selectedgridData') public selectedgridData;
  @Input('isNewAdminUser') public isNewAdminUser;
  @Output('closeAdminForm') public closeAdminForm = new EventEmitter<object>();

  constructor(public fb: FormBuilder,
    public router: Router,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public createAdminService: CreateAdminService,
    public commonService: CommonService,
    public bookingFormService: BookingFormService) { }

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
  }

  resetForm() {
    if (!this.isNewAdminUser && this.selectedgridData) {
      this.createAdminForm && this.createAdminForm.reset();
        this.pincodeAddress.city = this.selectedgridData.address && this.selectedgridData.address.city;
        this.pincodeAddress.country = this.selectedgridData.address && this.selectedgridData.address.country;
        this.pincodeAddress.state = this.selectedgridData.address && this.selectedgridData.address.state;
        this.pincodeAddress.pinCode = this.selectedgridData.address && this.selectedgridData.address.pinCode;
        this.createAdminForm = this.fb.group({
        adminId: [this.selectedgridData.adminId],
        email: [this.selectedgridData.email, [Validators.required, Validators.email]],
        password: [this.selectedgridData.password, Validators.required],
        spoc: [this.selectedgridData.spoc, Validators.required],
        role: [this.selectedgridData.role, Validators.required],
        contact: this.fb.group({
          mobilePrimary: [this.selectedgridData.contact && this.selectedgridData.contact.mobilePrimary, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
          mobileSecondary: [this.selectedgridData.contact && this.selectedgridData.contact.mobileSecondary, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
        }),
        address: this.fb.group({
          addressLine1: [this.selectedgridData.address && this.selectedgridData.address.addressLine1, Validators.required],
          addressLine2: [this.selectedgridData.address && this.selectedgridData.address.addressLine2, Validators.required],
          country: [this.selectedgridData.address && this.selectedgridData.address.country, Validators.required],
          state: [this.selectedgridData.address && this.selectedgridData.address.state, Validators.required],
          city: [this.selectedgridData.address && this.selectedgridData.address.city, Validators.required],
          pinCode: [this.selectedgridData.address && this.selectedgridData.address.pinCode, Validators.required]
        })
      });
    } else {
      this.createAdminForm && this.createAdminForm.reset();
      this.createAdminForm = this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        password: [null, Validators.required],
        spoc: [null, Validators.required],
        role: [null, Validators.required],
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

  onSubmit(content): any {
    let subscriber;
    let reqObj = {
      email: this.createAdminForm.value.email,
      spoc: this.createAdminForm.value.spoc,
      role: this.createAdminForm.value.role,
      contact: this.createAdminForm.value.contact,
      address: this.createAdminForm.value.address
    }
    this.spinner.show();
    if (this.isNewAdminUser) {
      subscriber = this.createAdminService.createAdminUser(this.createAdminForm.value);
    } else {
      if (this.selectedgridData['password'] !== this.createAdminForm.value.password) {
        reqObj['password'] = this.createAdminForm.value.password;
      }
      subscriber = this.createAdminService.updateAdminUser(reqObj)
    }
    this.subscriptions.push(subscriber.subscribe((data) => {
      this.responseMessage = data.responseHeader && data.responseHeader.decription;
      if (this.uploadFile && data.adminUserReq) {
        this.spinner.show();
        this.bookingFormService.uploadImage(this.uploadFile, data.adminUserReq.adminId)
          .subscribe((uploadFileResponse) => {
            this.headerMsg = 'Success';
            this.spinner.hide();
            this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
          },
            error => {
              this.spinner.hide();
              this.headerMsg = 'Error';
              this.responseMessage = 'Upload Request is failed but ' + this.responseMessage;
              this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
            });
      } else {
        this.spinner.hide();
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
      }
    }));
  }

  checkPassword(passwordPopover: NgbPopover): void {
    this.isValidPassword = this.commonService.validatePassword(this.createAdminForm.get('password').value);
    if (!this.isValidPassword) {
      if (passwordPopover['_elementRef'] && passwordPopover['_elementRef']['nativeElement'] && passwordPopover['_elementRef']['nativeElement']['value'] ==='') {
        passwordPopover.close();
      } else {
        passwordPopover.open()
      }
    } else {
      passwordPopover.close();
    }
  }

  public routeToDashboard(): void {
    this.closeAdminForm.emit({'name': 'eventAdminForm', 'isClosed': true})
  }

  public setUploadFile(fileEvent): any {
    if (fileEvent) {
      this.uploadFile = fileEvent;
    }
  }

  getAddressFromPinCode() {
    this.spinner.show();
    this.subscriptions.push(this.bookingFormService.fetchAddress(this.createAdminForm.value.address.pinCode).subscribe((resp) => {
      this.spinner.hide();
      if (resp && resp[0].Status === 'Error') {
        this.isInvalidPincode = true;
        this.pincodeAddress.city = '';
        this.pincodeAddress.country = '';
        this.pincodeAddress.state = '';
        this.responseMessage = 'Pincode is invalid. Please enter valid Pincode';
      }else if (resp && resp[0].Status === 'Success') {
        this.isInvalidPincode = false;
        this.pincodeAddress.city = resp[0].PostOffice && resp[0].PostOffice[0].District;
        this.pincodeAddress.country = resp[0].PostOffice && resp[0].PostOffice[0].Country;
        this.pincodeAddress.state = resp[0].PostOffice && resp[0].PostOffice[0].State;
      }

    }, error => {
      this.spinner.hide();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
