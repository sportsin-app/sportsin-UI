import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup } from '../../../node_modules/@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../common.service';
import { BookingFormService } from '../booking-form/booking-form.service';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-service-consumer',
  templateUrl: './service-consumer.component.html',
  styleUrls: ['./service-consumer.component.scss']
})
export class ServiceConsumerComponent implements OnInit, OnChanges, OnDestroy {
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
  public isValidPassword: boolean = false;
  public popUpMsgHeader = '';
  private subscriptions: Subscription[] = [];
  public isAdminUser: boolean = false;
  public uploadFile: object;
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
    this.resetPreferenceList();
  }

  ngOnInit() {
    if (this.commonService.loggedInUser.userRole === 'ADMIN' || this.commonService.loggedInUser.userRole === 'SUPER_USER') {
      this.isAdminUser = true;
    } else {
      this.isAdminUser = false;
    }
    this.resetForm();
  }

  ngOnChanges() {
    this.resetForm();
  }

  resetForm() {
    if (!this.isNewServiceConsumer && this.selectedServiceConsumerData) {
      this.address.city = this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.city;
      this.address.state = this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.state;
      this.address.country = this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.country;
      this.address.pinCode = this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.pinCode;
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
        serviceProviderId: this.selectedServiceConsumerData.servviceProviderId,
        ageGroup: [{value:this.selectedServiceConsumerData.ageGroup, disabled: true}],
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
          addressLine1: [this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.addressLine1, Validators.required],
          addressLine2: [this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.addressLine2, Validators.required],
          country: [this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.country, Validators.required],
          state: [this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.state, Validators.required],
          pinCode: [this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.pinCode, Validators.required],
          city: [this.selectedServiceConsumerData.address && this.selectedServiceConsumerData.address.city, Validators.required]
        }),
        jerseyNr: [this.selectedServiceConsumerData.jerseyNr, Validators.required],
        jerseyName: [this.selectedServiceConsumerData.jerseyName, Validators.required],
        dob: [this.selectedServiceConsumerData.dob, Validators.required]
      })
      this.disabledUpdate = this.isAdminUser ? false : true;
    } else {
      this.resetPreferenceList();
      this.disabledUpdate = false;
      this.serviceConsumerForm = this.fb.group({
        firstName:[null, Validators.required],
        lastName: [null, Validators.required],
        serviceProviderId: this.commonService.loggedInUser.userId,
        ageGroup: [{value:'Age group', disabled: true}],
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
        }),
        jerseyNr: [null, Validators.required],
        jerseyName: [null, Validators.required],
        dob: [null, Validators.required]
      });
    }
  };

  getAddressFromPinCode() {
    this.spinner.show();
    this.subscriptions.push(this.bookingFormService.fetchAddress(this.serviceConsumerForm.value.address.pinCode).subscribe((resp) => {
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

    }));
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
    let subsriber: any;
    if (this.isNewServiceConsumer) {
      subsriber = this.commonService.createServiceConsumer(this.serviceConsumerForm.value);
    } else {
      subsriber = this.commonService.updateServiceConsumer(this.serviceConsumerForm.value);
    }
    const subscriber =
    this.subscriptions.push(subsriber.subscribe((data) => {
      this.createEventResp = data['responseHeader'] && data['responseHeader']['decription']
      if (this.uploadFile && data.serviceConsumer) {
        this.bookingFormService.uploadImage(this.uploadFile, data.serviceConsumer.serviceConsumerId)
        .subscribe((uploadFileResponse) => {
            this.popUpMsgHeader = 'Success';
            this.spinner.hide();
            this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
          },
          error => {
            this.spinner.hide();
            this.popUpMsgHeader = 'Error';
            this.createEventResp = 'Upload Request is failed but ' + this.createEventResp;
            this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
          });
      } else {
        this.spinner.hide();
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }
    }));
  }

  dismissMessage() {
    this.modalService.dismissAll();
    this.createEventResp = '';
    this.closeServiceConsumer.emit({'name': 'serviceConsumer', 'isClosed': true});
  }

  checkAlreadyExist(name) {
    if (!this.serviceConsumerForm.dirty) {
      return;
    }
    this.spinner.show();
    if (name === 'userName') {
      this.subscriptions.push(this.commonService.checkUserName(this.serviceConsumerForm.get('userName')['value']).subscribe((data) => {
        this.spinner.hide();
        this.isAlreadyExistUser = data;
        this.serviceConsumerForm.get('userName').status = this.isAlreadyExistUser ? 'INVALID' : 'VALID';
      }));

    } else if (name === 'email') {
      this.subscriptions.push(this.commonService.checkemail(this.serviceConsumerForm.get('email')['value']).subscribe((data) => {
        this.spinner.hide();
        this.isAlreadyExistEmail = data;
        this.serviceConsumerForm.get('email').status = this.isAlreadyExistEmail ? 'INVALID' : 'VALID';
      }));
    }

  }

  public changeCategory(value, index?, savedActivityName?): any {
    this.catActivityName = [];
    this.catActivityType = [];
    // this.preferencesList[index].eventCatDetailsObj.activityName = null;
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

public validatePassword(passwordPopover: NgbPopover) {
  this.isValidPassword = this.commonService.validatePassword(this.serviceConsumerForm.get('password').value);
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

  public resetPreferenceList(): void {
    this.eventCategoryDetailsArray = this.bookingFormService.eventCategoryDetails;
    this.eventCatDetailsObj = this.commonService.eventCatDetailsObj;
    this.preferencesList = [{
      'eventCatDetailsObj': this.eventCatDetailsObj,
      'eventCatList': this.eventCategoryDetailsArray,
      'catActivityList': this.eventCategoryDetailsArray[0].value
    }, {
      'eventCatDetailsObj': this.eventCatDetailsObj,
      'eventCatList': this.eventCategoryDetailsArray,
      'catActivityList': this.eventCategoryDetailsArray[0].value
    }, {
      'eventCatDetailsObj': this.eventCatDetailsObj,
      'eventCatList': this.eventCategoryDetailsArray,
      'catActivityList': this.eventCategoryDetailsArray[0].value

    }];
  }

  setUploadFile(fileEvent): any {
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
