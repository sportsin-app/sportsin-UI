import { Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BookingFormService } from '../booking-form.service';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgxSpinnerService } from '../../../../node_modules/ngx-spinner';
import { Subscription } from '../../../../node_modules/rxjs';
import { CommonService } from '../../common.service';

@Component({
  selector: 'app-service-provider-form',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.scss']
})
export class ServiceProviderFormComponent implements OnInit, OnDestroy {
  public bookingForm;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public updateForm: Boolean = false;
  public responseMessage: String;
  public isInvalidPincode: Boolean = false;
  private subscriptions: Subscription[] = [];
  public isValidPassword: boolean = false;
  public uploadFile: Object;
  public headerMsg: string = '';

  @Input('selectedgridData') public selectedgridData;
  @Input('isNewServiceProvider') public isNewServiceProvider;
  @Output() closeSPForm = new EventEmitter<object>();

  constructor(public dashboardService: DashboardService,
    public bookingFormService: BookingFormService,
    public fb: FormBuilder,
    public router: Router,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public commonService: CommonService) { }

  ngOnInit() {
    this.resetForm(this.selectedgridData);
  }

  ngOnChanges(): void {
    this.resetForm(this.selectedgridData);
  }


  resetForm(createdFormData?) {
    if (!this.isNewServiceProvider && createdFormData) {
      this.updateForm = true;
      this.pincodeAddress.city = createdFormData.address && createdFormData.address.city;
      this.pincodeAddress.country = createdFormData.address && createdFormData.address.country;
      this.pincodeAddress.state = createdFormData.address && createdFormData.address.state;
      this.pincodeAddress.pinCode = createdFormData.address && createdFormData.address.pinCode;
      this.bookingForm = this.fb.group({
        // id: [null, Validators.required],
        orgName: [createdFormData.orgName, Validators.required],
        spoc: [createdFormData.spoc, Validators.required],
        email: [createdFormData.email, Validators.required],
        password: [createdFormData.password, Validators.required],
        contact: this.fb.group({
          mobilePrimary: [createdFormData.contact && createdFormData.contact.mobilePrimary, Validators.required],
          mobileSecondary: [createdFormData.contact && createdFormData.contact.mobileSecondary, Validators.required]
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
      this.bookingForm = this.fb.group({
        orgName: [null, Validators.required],
        spoc: [null, Validators.required],
        email: [null, Validators.required],
        password: [null, Validators.required],
        contact: this.fb.group({
          mobilePrimary: [null, Validators.required],
          mobileSecondary: [null, Validators.required]
        }),
        role: ['service_provider'],
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
    this.subscriptions.push(this.bookingFormService.fetchAddress(this.bookingForm.value.address.pinCode).subscribe((resp) => {
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

  onSubmit(content): any {
    let subscriber;
    let reqObj = {
      orgName: this.bookingForm.value.orgName,
      spoc: this.bookingForm.value.spoc,
      email: this.bookingForm.value.email,
      contact: this.bookingForm.value.contact,
      address: this.bookingForm.value.address
    }
    this.spinner.show();
    if (this.updateForm) {
      reqObj['serviceProviderId'] = this.selectedgridData.serviceProviderId;
      if (this.selectedgridData['password'] !== this.bookingForm.value.password) {
        reqObj['password'] = this.bookingForm.value.password;
      }
      subscriber = this.bookingFormService.updateServiceProvider(reqObj);
    } else {
      subscriber = this.bookingFormService.createServiceProviderEvent(this.bookingForm.value);
    }
    this.subscriptions.push(subscriber.subscribe((data) => {
      this.responseMessage = data.responseHeader && data.responseHeader.decription;
      if (this.uploadFile && data.serviceProvider) {
        this.spinner.show();
        this.bookingFormService.uploadImage(this.uploadFile, data.serviceProvider.serviceProviderId)
        .subscribe((uploadFileResponse) => {
            this.headerMsg = 'Success';
            this.spinner.hide();
            this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
          },
          error => {
            this.spinner.hide();
            this.headerMsg = 'Error';
            this.responseMessage = 'Upload Request is failed but ' + this.responseMessage;
            this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
          });
      } else {
        this.spinner.hide();
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }
    }));
  }

  routeToMainPage() {
    this.closeSPForm.emit({'name': 'eventSPForm', 'isClosed': true});
  }

  createAnotherForm() {
    this.resetForm();
  }

  checkPassword(passwordPopover: NgbPopover): void {
    this.isValidPassword = this.commonService.validatePassword(this.bookingForm.get('password').value);
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

  public setUploadFile(fileEvent): any {
    if (fileEvent) {
      this.uploadFile = fileEvent;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
