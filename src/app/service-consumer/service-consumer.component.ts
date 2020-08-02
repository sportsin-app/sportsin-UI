import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
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
  public eventCatDetailsObj: any;
  public eventCategoryDetailsArray = [];
  public catDetails = [];
  public catActivityType = [];
  public catActivityName = [];
  public preferencesList = [];
  public isInvalidPassword: boolean = false;
  public popUpMsgHeader = '';
  @Input('selectedServiceConsumerData') public selectedServiceConsumerData = null;
  @Input('isNewServiceConsumer') public isNewServiceConsumer: Boolean = false;
  @Output() closeServiceConsumer = new EventEmitter<object>();

  @ViewChild('content', {static: false}) public msgContent;
  @ViewChild('passwordElement', {static: false}) public passwordElement;

  constructor(public fb: FormBuilder,
  public commonService: CommonService,
  public bookingFormService: BookingFormService,
  public spinner: NgxSpinnerService,
  public modalService: NgbModal) {
    this.eventCategoryDetailsArray = this.bookingFormService.eventCategoryDetails;
    this.eventCatDetailsObj = this.commonService.eventCatDetailsObj;
    this.preferencesList = [{
      'eventCatDetailsObj': this.eventCatDetailsObj,
      'eventCatList': this.eventCategoryDetailsArray,
      'catActivityList': this.eventCategoryDetailsArray[0].value
    },{
      'eventCatDetailsObj': this.eventCatDetailsObj,
      'eventCatList': this.eventCategoryDetailsArray,
      'catActivityList':this.eventCategoryDetailsArray[0].value
    },{
      'eventCatDetailsObj': this.eventCatDetailsObj,
      'eventCatList': this.eventCategoryDetailsArray,
      'catActivityList':this.eventCategoryDetailsArray[0].value

    }];
  }

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
      this.preferencesList = this.preferencesList.map((preference, index) => {
        preference = this.selectedServiceConsumerData.preferences ? { ...preference, eventCatDetailsObj: this.selectedServiceConsumerData.preferences[index] }
                      : {...preference, eventCatDetailsObj: {'category': 'Select Category', 'activityName': 'Select Activity Name'}};
        preference = this.selectedServiceConsumerData.preferences ? { ...preference, catActivityList: this.eventCategoryDetailsArray.find(cat => cat.name === preference.eventCatDetailsObj.category)['value']}
                      : {...preference, catActivityList: this.eventCategoryDetailsArray[0].value};
        return preference;
      })

      this.serviceConsumerForm = this.fb.group({
        firstName:[this.selectedServiceConsumerData.firstName, Validators.required],
        lastName: [this.selectedServiceConsumerData.lastName, Validators.required],
        userName: [this.selectedServiceConsumerData.userName, Validators.required],
        serviceProviderId: this.selectedServiceConsumerData.servviceProviderId,
        ageGroup: [this.selectedServiceConsumerData.ageGroup, Validators.required],
        email: [this.selectedServiceConsumerData.email, Validators.required],
        password: [this.selectedServiceConsumerData.password, Validators.required],
        gender: [this.selectedServiceConsumerData.gender, Validators.required],
        colourClub: [this.selectedServiceConsumerData.colourClub, Validators.required],
        mobile: [this.selectedServiceConsumerData.mobile, Validators.required],
        preferences: [this.preferencesList],
        eventCategory1: [this.preferencesList[0].eventCatDetailsObj.category, Validators.required],
        eventCategory2: [this.preferencesList[1].eventCatDetailsObj.category, Validators.required],
        eventCategory3: [this.preferencesList[2].eventCatDetailsObj.category, Validators.required],
        eventActivityName1: [this.preferencesList[0].eventCatDetailsObj.activityName, Validators.required],
        eventActivityName2: [this.preferencesList[1].eventCatDetailsObj.activityName, Validators.required],
        eventActivityName3: [this.preferencesList[2].eventCatDetailsObj.activityName, Validators.required],
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
        colourClub: ['Color Club', Validators.required],
        preferences: [this.preferencesList],
        eventCategory1: [this.preferencesList[0].eventCatDetailsObj.category, Validators.required],
        eventCategory2: [this.preferencesList[1].eventCatDetailsObj.category, Validators.required],
        eventCategory3: [this.preferencesList[2].eventCatDetailsObj.category, Validators.required],
        eventActivityName1: [this.preferencesList[0].eventCatDetailsObj.activityName, Validators.required],
        eventActivityName2: [this.preferencesList[1].eventCatDetailsObj.activityName, Validators.required],
        eventActivityName3: [this.preferencesList[2].eventCatDetailsObj.activityName, Validators.required],
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
    let preferenceList = [];
    let eventCatObj1 = {category: this.serviceConsumerForm.get('eventCategory1').value,
        activityName: this.serviceConsumerForm.get('eventActivityName1').value};
    let eventCatObj2 = {category: this.serviceConsumerForm.get('eventCategory2').value,
        activityName: this.serviceConsumerForm.get('eventActivityName2').value};
    let eventCatObj3 = {category: this.serviceConsumerForm.get('eventCategory3').value,
        activityName: this.serviceConsumerForm.get('eventActivityName3').value};
    preferenceList.push(eventCatObj1);
    preferenceList.push(eventCatObj2);
    preferenceList.push(eventCatObj3);

    this.serviceConsumerForm.get('preferences').value = preferenceList;
    this.serviceConsumerForm['value']['preferences'] = preferenceList;
    this.commonService.createServiceConsumer(this.serviceConsumerForm.value).subscribe((data) => {
      this.spinner.hide();
      this.popUpMsgHeader = 'Success';
        this.createEventResp = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    });
  }

  dismissMessage() {
    this.modalService.dismissAll();
    this.createEventResp = '';
    if (this.isInvalidPassword) {
      this.passwordElement.nativeElement.focus();
    } else {
      this.closeServiceConsumer.emit({'name': 'serviceConsumer', 'isClosed': true});
    }
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

  public changeCategory(value, index?, savedActivityName?): any {
    this.catActivityName = [];
    this.catActivityType = [];
    this.preferencesList[index].eventCatDetailsObj.activityName = null;
    this.preferencesList[index].catActivityList = [];
  if (value === 'Select Category') {
    return;
  } else {
    // this.preferencesList[index].category = value;
    this.preferencesList[index].catActivityList = this.eventCategoryDetailsArray.find(cat => cat.name === value).value;
    // this.catActivityName = savedActivityType ? this.catActivityType.find(rentalActivityType => rentalActivityType.name === savedActivityType).value:
    //                               this.catActivityType[0].value;
    // this.preferencesList[index].activityName = savedActivityName || (this.catActivityName && this.catActivityName[0]);

  }
};

// public changeActivityType(value): any {
//   this.catActivityName = [];
//   // this.catActivityName = this.catActivityType.find(rentalCat => rentalCat.name === value).value;
//   this.eventCatDetailsObj.activityName = this.catActivityType.find(rentalCat => rentalCat.name === value).value &&
//   this.catActivityType.find(rentalCat => rentalCat.name === value).value[0];
//   this.eventCatDetailsObj.activityType = value;
// }

public changeActivityName(value, index): any {
  // this.preferencesList[index].activityName = value;
}

public validatePassword() {
  let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
      if(!strongRegex.test(this.serviceConsumerForm.get('password').value)) {
        this.modalService.open(this.msgContent, {ariaLabelledBy: 'modal-basic-title'});
        this.popUpMsgHeader = 'Error'
        this.createEventResp = "Your password must be have at least";
        this.isInvalidPassword = true;
      } else {
        this.isInvalidPassword = false;
      }
}

}
