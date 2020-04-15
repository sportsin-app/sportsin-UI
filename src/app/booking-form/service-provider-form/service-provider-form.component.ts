import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BookingFormService } from '../booking-form.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgxSpinnerService } from '../../../../node_modules/ngx-spinner';

@Component({
  selector: 'app-service-provider-form',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.scss']
})
export class ServiceProviderFormComponent implements OnInit {
  public bookingForm;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public updateForm: Boolean = false;
  public responseMessage: String;
  public isInvalidPincode: Boolean = false;
  constructor(public dashboardService: DashboardService,
    public bookingFormService: BookingFormService,
    public fb: FormBuilder,
    public router: Router,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService) { }

  ngOnInit() {

    this.resetForm(this.dashboardService.bookingCreatedObj);
  }


  resetForm(createdFormData?) {
    if (createdFormData) {
      this.updateForm = true;
      this.pincodeAddress.city = createdFormData.address && createdFormData.address.city;
      this.pincodeAddress.country = createdFormData.address && createdFormData.address.country;
      this.pincodeAddress.state = createdFormData.address && createdFormData.address.state;
      this.pincodeAddress.pinCode = createdFormData.address && createdFormData.address.pinCode;
      this.bookingForm = this.fb.group({
        // id: [null, Validators.required],
        orgName: [createdFormData.orgName, Validators.required],
        spoc: [createdFormData.spoc, Validators.required],
        email: [createdFormData.email],
        password: [createdFormData.password],
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
        email: [null],
        password: [null],
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
    this.bookingFormService.fetchAddress(this.bookingForm.value.address.pinCode).subscribe((resp) => {
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
    });
  }

  onSubmit(content): any {
    if (this.updateForm) {
      this.bookingForm.value.serviceProviderId = this.dashboardService.bookingCreatedObj.serviceProviderId;
      this.bookingFormService.updateServiceProvider(this.bookingForm.value).subscribe((data) => {
        this.responseMessage = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      });
    } else {
      this.bookingFormService.createServiceProviderEvent(this.bookingForm.value).subscribe((data) => {
        this.responseMessage = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      });
    }
  }

  routeToMainPage() {
    this.router.navigate(['/dashboard']);
  }

  createAnotherForm() {
    this.resetForm();
  }
}
