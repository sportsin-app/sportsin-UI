import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '../../../node_modules/@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../common.service';
import { BookingFormService } from '../booking-form/booking-form.service';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-service-consumer',
  templateUrl: './service-consumer.component.html',
  styleUrls: ['./service-consumer.component.scss']
})
export class ServiceConsumerComponent implements OnInit, OnChanges {
  public serviceConsumerForm;
  public address = {pinCode: null, city: null, state: null, country: null};
  public createEventResp: String;
  public isInvalidPincode: Boolean = false;
  public disabledUpdate: Boolean = false;
  public isAlreadyExistUser: boolean = false;
  public isAlreadyExistEmail: boolean = false;
  @Input('selectedServiceConsumerData') public selectedServiceConsumerData = null;
  @Input('isNewServiceConsumer') public isNewServiceConsumer: Boolean = false;
  @Output() closeServiceConsumer = new EventEmitter<boolean>();

  constructor(public fb: FormBuilder,
  public commonService: CommonService,
  public bookingFormService: BookingFormService,
  public spinner: NgxSpinnerService,
  public modalService: NgbModal) { }

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges() {
    this.resetForm();
  }

  resetForm() {
    if (!this.isNewServiceConsumer && this.selectedServiceConsumerData) {
      this.address.city = this.selectedServiceConsumerData.address.city;
      this.address.state = this.selectedServiceConsumerData.address.state;
      this.address.country = this.selectedServiceConsumerData.address.country;
      this.address.pinCode = this.selectedServiceConsumerData.address.pinCode;
      this.serviceConsumerForm = this.fb.group({
        firstName:[this.selectedServiceConsumerData.firstName, Validators.required],
        lastName: [this.selectedServiceConsumerData.lastName, Validators.required],
        userName: [this.selectedServiceConsumerData.userName, Validators.required],
        serviceProviderId: this.selectedServiceConsumerData.servviceProviderId,
        ageGroup: [this.selectedServiceConsumerData.ageGroup, Validators.required],
        email: [this.selectedServiceConsumerData.email, Validators.required],
        password: [this.selectedServiceConsumerData.password, Validators.required],
        gender: [this.selectedServiceConsumerData.gender, Validators.required],
        mobile: [this.selectedServiceConsumerData.mobile, Validators.required],
        serviceConsumerId: [this.selectedServiceConsumerData.serviceConsumerId, Validators.required],
        address: this.fb.group ({
          addressLine1: [this.selectedServiceConsumerData.address.addressLine1, Validators.required],
          addressLine2: [this.selectedServiceConsumerData.address.addressLine2, Validators.required],
          country: [this.selectedServiceConsumerData.address.country, Validators.required],
          state: [this.selectedServiceConsumerData.address.state, Validators.required],
          pinCode: [this.selectedServiceConsumerData.address.pinCode, Validators.required],
          city: [this.selectedServiceConsumerData.address.city, Validators.required]
        })
      })
      this.disabledUpdate = true;
    } else {
      this.disabledUpdate = false;
      this.serviceConsumerForm = this.fb.group({
        firstName:[null, Validators.required],
        lastName: [null, Validators.required],
        userName: [null, Validators.required],
        serviceProviderId: this.commonService.loggedInUser.userId,
        ageGroup: ['Age group', Validators.required],
        email: [null, Validators.required],
        password: [null, Validators.required],
        gender: ['Gender', Validators.required],
        mobile: [null, Validators.required],
        address: this.fb.group ({
          addressLine1: [null, Validators.required],
          addressLine2: [null, Validators.required],
          country: [null, Validators.required],
          state: [null, Validators.required],
          pinCode: [null, Validators.required],
          city: [null, Validators.required]
        })
      });
    }
  };

  getAddressFromPinCode() {
    this.spinner.show();
    this.bookingFormService.fetchAddress(this.serviceConsumerForm.value.address.pinCode).subscribe((resp) => {
      if (resp && resp[0].Status === 'Error') {
        this.isInvalidPincode = true;
        this.address.city = '';
        this.address.country = '';
        this.address.state = '';
        this.createEventResp = 'Pincode is invalid. Please enter valid Pincode';
        this.spinner.hide();
      }else if (resp && resp[0].Status === 'Success') {
        this.isInvalidPincode = false;
        this.address.city = resp[0].PostOffice && resp[0].PostOffice[0].District;
        this.address.country = resp[0].PostOffice && resp[0].PostOffice[0].Country;
        this.address.state = resp[0].PostOffice && resp[0].PostOffice[0].State;
        this.spinner.hide();
      }

    });
  }
  onSubmit(content): any {
    this.spinner.show();
    this.commonService.createServiceConsumer(this.serviceConsumerForm.value).subscribe((data) => {
      this.spinner.hide();
        this.createEventResp = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    });
  }

  dismissMessage() {
    this.modalService.dismissAll();
    this.closeServiceConsumer.emit(true);
  }

  checkAlreadyExist(name) {
    this.spinner.show();
    if (name === 'userName') {
      this.commonService.checkUserName(this.serviceConsumerForm.get('userName')['value']).subscribe((data) => {
        this.spinner.hide();
        this.isAlreadyExistUser = data;
        this.serviceConsumerForm.get('userName').status = this.isAlreadyExistUser ? 'INVALID' : 'VALID';
      });

    } else if (name === 'email') {
      this.commonService.checkemail(this.serviceConsumerForm.get('email')['value']).subscribe((data) => {
        this.spinner.hide();
        this.isAlreadyExistEmail = data;
        this.serviceConsumerForm.get('email').status = this.isAlreadyExistEmail ? 'INVALID' : 'VALID';
      });
    }

  }

}
