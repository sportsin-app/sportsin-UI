import { Component, OnInit, ViewChild, DoCheck, NgZone } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { BookingFormService } from './booking-form.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
// import { ViewEncapsulation } from '../../../node_modules/@angular/compiler/src/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '../../../node_modules/@angular/router';
import { DashboardService } from '../dashboard/dashboard.service';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';


@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class BookingFormComponent implements OnInit, DoCheck {
  public facilitiesDetails = [];
  public selectedFacilityDetails = [];
  public createEventResp: String;
  public updateForm: Boolean = false;
  public today = new Date();
  public eventCatDetailsObj = {
    category: 'Select Category',
    activityType: ' Select Activity Type',
    activityName:'Select Activity Name'
  }
  // public isRentalKitAvail: Boolean =false;
  public closeResult: String;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings;
  public rentalKitArray = [];
  public rentalKitActivityType = [];
  public rentalKitActivityName = [];
  public bookingForm;
  public address = {pinCode: null, city: null, state: null, country: null};
  public eventCategoryDetailsArray = [];
  public isAllEventBtnClicked: Boolean = true;
  public isServiceProviderClicked: Boolean = false;
  public isInvalidPincode: Boolean = false;


  @ViewChild('fromDateInput', {static: false}) public fromDateInput;
  @ViewChild('isRentalKitAvail', {static: false}) public isRentalKitAvail;
  @ViewChild('isTournamentSelected', {static: false}) public isTournamentSelected;
  @ViewChild('isOneDayEvent', {static: false}) public isOneDayEvent;
  @ViewChild('isApproved', {static: false}) public isApproved;

  constructor(public fb: FormBuilder,
    public bookingFormService: BookingFormService,
    public modalService: NgbModal,
    public router: Router,
    public activatedRoute: ActivatedRoute,
  public dashboardService: DashboardService,
  public spinner: NgxSpinnerService,
  public ngZone: NgZone) { }

  ngOnInit() {
      this.eventCategoryDetailsArray = this.bookingFormService.eventCategoryDetails;
      let createdFormData = this.dashboardService.bookingCreatedObj;
      if (createdFormData) {
        let savedCategory = createdFormData.eventCategoryDetails.category;
        this.eventCatDetailsObj.category = savedCategory;
        let savedActivityType = createdFormData.eventCategoryDetails.activityType;
        let savedActivityName = createdFormData.eventCategoryDetails.activityName;
        this.changeCategory(savedCategory, savedActivityType, savedActivityName);

      }

    this.isAllEventBtnClicked = this.bookingFormService.isAllEventBtnClicked;
    this.isServiceProviderClicked = this.bookingFormService.isServiceProviderClicked;
    this.ngZone.run(() => {
      this.resetForm(this.dashboardService.bookingCreatedObj);
    });
    this.facilitiesDetails = ['Water', 'Food Stall', 'Washroom', 'First Aid'];
    this.rentalKitArray = [{
      category: 'Summer Games',
      activities: [{
        activityName: 'summerGames1'
      }, {
        activityName: 'summerGames2'
      }]
    }, {
      category: 'Winter Games',
      activities: [{
        activityName: 'winterGames1'
      }, {
        activityName: 'winterGames2'
      }]

    }, {
      category: 'Outdoor Games',
      activities: [{
        activityName: 'outdoorGames1'
      }, {
        activityName: 'outdoorGames2'
      }]

    }, {
      category: 'Indoor Games',
      activities: [{
        activityName: 'indoorGames1'
      }, {
        activityName: 'indoorGames2'
      }]

    }];

    this.dropdownSettings = {
      singleSelection: false,
      // idField: 'item_id',
      // textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  ngDoCheck() {
  }

  resetForm(createdFormData?) {
    if (createdFormData) {
      this.updateForm = true;
      this.address.city = createdFormData.address && createdFormData.address.city;
      this.address.country = createdFormData.address && createdFormData.address.country;
      this.address.state = createdFormData.address && createdFormData.address.state;
      this.address.pinCode = createdFormData.address && createdFormData.address.pinCode;
      this.bookingForm = this.fb.group({
        // id: [null, Validators.required],
        eventId: [createdFormData.eventId],
        eventName: [createdFormData.eventName, Validators.required],
        eventDesc: [createdFormData.eventDesc, Validators.required],
        address: this.fb.group({
          addressLine1: [createdFormData.address && createdFormData.address.addressLine1, Validators.required],
          addressLine2: [createdFormData.address && createdFormData.address.addressLine2, Validators.required],
          country: [createdFormData.address && createdFormData.address.country, Validators.required],
          state: [createdFormData.address && createdFormData.address.state, Validators.required],
          city: [createdFormData.address && createdFormData.address.city, Validators.required],
          pinCode: [createdFormData.address && createdFormData.address.pinCode, Validators.required]
        }),
        tournamentFormat: [createdFormData.tournamentFormat, createdFormData.tournament && Validators.required],
        adminComment:[createdFormData.adminComment],
        tnc: [createdFormData.tnc, Validators.required],
        rules: [createdFormData.rules, Validators.required],
        startTime: [createdFormData.startTime],
        endTime: [createdFormData.endTime],
        // new Date(createdFormData.fromDate).toLocaleDateString()
        fromDate: [new Date(createdFormData.fromDate), Validators.required],
        toDate: [new Date(createdFormData.toDate), Validators.required],
        oneDayEvent: [createdFormData.oneDayEvent ? createdFormData.oneDayEvent : false],
        rentalKitAvlbl: [createdFormData.rentalKitAvlbl ? createdFormData.rentalKitAvlbl : false],
        rentalKitDetails: [createdFormData.rentalKitDetails, createdFormData.rentalKitAvlbl && Validators.required],
        charges: [createdFormData.charges, Validators.required],
        ageLimit: [createdFormData.ageLimit, Validators.required],
        facilities: [this.facilitiesDetails, Validators.required],
        eventCategoryDetails: this.fb.group({
          category: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.category, Validators.required],
          activityType: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.activityType],
          activityName: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.activityName, Validators.required]
        }),
        serviceProvider:[{
          "id": "SISP001",
          "email": "ramlal@gmail.com",
          "password": "12345",
          "role": "Organizer",
          "orgName": "Service Provider Demo 001",
          "spoc": "Ram Lal",
          "contact": null,
          "address": null
        }],
        textScore: [0],
        approved: [createdFormData.approved ? createdFormData.approved : false],
        tournament: [createdFormData.tournament ? createdFormData.tournament : false],
        active: [createdFormData.active ? createdFormData.active : false],
      });
      setTimeout(() => {
        this.isRentalKitAvail.nativeElement.checked = createdFormData.rentalKitAvlbl ? createdFormData.rentalKitAvlbl : false;
        this.isOneDayEvent.nativeElement.checked = createdFormData.oneDayEvent ? createdFormData.oneDayEvent : false;
        this.isTournamentSelected.nativeElement.checked = createdFormData.tournament ? createdFormData.tournament : false;
        this.isApproved.nativeElement.checked = createdFormData.approved ? createdFormData.approved : false;
        if (this.bookingFormService.isAdminUser) {
          this.bookingForm.get('toDate').disable();
          this.bookingForm.get('fromDate').disable();
        } else {
          this.bookingForm.disable();
          this.bookingForm.get('eventName').enable();
          this.bookingForm.get('eventDesc').enable();
          this.bookingForm.get('facilities').enable();
          this.bookingForm.get('rentalKitAvlbl').enable();
          this.bookingForm.get('rentalKitDetails').enable();
        }
      });
      this.selectedFacilityDetails = createdFormData.facilities;
    } else {
      this.updateForm = false;
      this.bookingForm && this.bookingForm.reset();
      this.bookingForm && this.bookingForm.enable();
      this.bookingForm = this.fb.group({
        // id: [null, Validators.required],
        eventName: [null, Validators.required],
        eventDesc: [null, Validators.required],
        address: this.fb.group({
          addressLine1: [null, Validators.required],
          addressLine2: [null, Validators.required],
          country: [null, Validators.required],
          state: [null, Validators.required],
          city: [null, Validators.required],
          pinCode: [null, Validators.required]
        }),
        tournamentFormat: [null, this.isTournamentSelected && this.isTournamentSelected.checked && Validators.required],
        adminComment:['Not approved as event does not comply to platform usage policies. Please contact Help Desk'],
        tnc: [null, Validators.required],
        rules: [null, Validators.required],
        startTime: [null],
        endTime: [null],
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
        oneDayEvent: [false],
        rentalKitAvlbl: [false],
        rentalKitDetails: [null],
        charges: [null, Validators.required],
        ageLimit: ['Select', Validators.required],
        facilities: [this.facilitiesDetails, Validators.required],
        eventCategoryDetails: this.fb.group({
          category: [null, Validators.required],
          activityType: [null],
          activityName: [null, Validators.required]
        }),
        serviceProvider:[{
          "id": "SISP001",
          "email": "ramlal@gmail.com",
          "password": "12345",
          "role": "Organizer",
          "orgName": "Service Provider Demo 001",
          "spoc": "Ram Lal",
          "contact": null,
          "address": null
        }],
        textScore: [0],
        approved: [false],
        tournament: [false],
        active: [false]
      });
      this.selectedFacilityDetails = [];
    }

  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  onSubmit(content): any {
    if (this.updateForm) {
      this.bookingForm.value.eventId = this.dashboardService.bookingCreatedObj.eventId;
      this.bookingForm.get('eventCategoryDetails').value = this.eventCatDetailsObj;
      this.bookingForm.value.eventCategoryDetails = this.eventCatDetailsObj;
      this.bookingFormService.updateFormRequest(this.bookingForm.value).subscribe((data) => {
        this.createEventResp = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      });
    } else {
      this.bookingFormService.submitBookingRequest(this.bookingForm.value).subscribe((data) => {
        this.createEventResp = data.responseHeader && data.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      });
    }
  }

  public changeCategory(value, savedActivityType?, savedActivityName?): any {
      this.rentalKitActivityName = [];
      this.rentalKitActivityType = [];
      this.eventCatDetailsObj.activityName = null;
      this.eventCatDetailsObj.activityType = null;
    if (value === 'Select Category') {
      return;
    } else if (this.eventCategoryDetailsArray.find(rentalKitCat => rentalKitCat.name === value).value[0].name) {
      this.eventCatDetailsObj.category = value;
      this.rentalKitActivityType = this.eventCategoryDetailsArray.find(rentalKitCat => rentalKitCat.name === value).value;
      this.eventCatDetailsObj.activityType = savedActivityType || this.eventCategoryDetailsArray.find(rentalKitCat => rentalKitCat.name === value).value[0].name;
      this.rentalKitActivityName = savedActivityType ? this.rentalKitActivityType.find(rentalActivityType => rentalActivityType.name === savedActivityType).value:
                                    this.rentalKitActivityType[0].value;
      this.eventCatDetailsObj.activityName = savedActivityName || (this.rentalKitActivityName && this.rentalKitActivityName[0]);
    } else {
      this.eventCatDetailsObj.category = value;
      this.rentalKitActivityName = this.eventCategoryDetailsArray.find(rentalKitCat => rentalKitCat.name === value).value;
      this.eventCatDetailsObj.activityName = savedActivityName || this.rentalKitActivityName[0];
      this.eventCatDetailsObj.activityType = savedActivityType || null;
    }
  };

  public changeActivityType(value): any {
    this.rentalKitActivityName = [];
    this.rentalKitActivityName = this.rentalKitActivityType.find(rentalCat => rentalCat.name === value).value;
    this.eventCatDetailsObj.activityName = this.rentalKitActivityType.find(rentalCat => rentalCat.name === value).value &&
    this.rentalKitActivityType.find(rentalCat => rentalCat.name === value).value[0];
    this.eventCatDetailsObj.activityType = value;
  }

  public changeActivityName(value): any {
    this.eventCatDetailsObj.activityName = value;
  }

  public parseDate(date) {
    date = Date.parse(date);

  }
  getAddressFromPinCode() {
    this.spinner.show();
    this.bookingFormService.fetchAddress(this.bookingForm.value.address.pinCode).subscribe((resp) => {
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

    }, error => {
      this.spinner.hide();
    });
  }

  routeToMainPage() {
    this.router.navigate(['/dashboard']);
  }

  createAnotherForm() {
    this.rentalKitActivityType = [];
    this.rentalKitActivityName = [];
    this.eventCatDetailsObj.category = 'Select Category';
    this.eventCatDetailsObj.activityType = '';
    this.eventCatDetailsObj.activityName = '';
    this.resetForm();
  }

  isRadioBtnChecked(radioBtnName, isChecked): any {
    if (radioBtnName === 'tournament' && isChecked) {
      this.bookingForm.get('tournamentFormat').setValidators(Validators.required);
    } else if (radioBtnName === 'tournament' && !isChecked) {
      this.bookingForm.get('tournamentFormat').value = '';
      this.bookingForm.get('tournamentFormat').clearValidators();
      this.bookingForm.controls.tournamentFormat.status = 'VALID';
    } else if(radioBtnName === 'rentalKitAvlbl' && isChecked) {
      this.bookingForm.get('rentalKitDetails').setValidators(Validators.required);
    } else if(radioBtnName === 'rentalKitAvlbl' && !isChecked) {
      this.bookingForm.get('rentalKitDetails').value = '';
      this.bookingForm.get('rentalKitDetails').clearValidators();
      this.bookingForm.controls.rentalKitDetails.status = 'VALID';
    } else if(radioBtnName === 'approved' && isChecked) {
      this.bookingForm.get('adminComment').value = 'approved';
    } else if(radioBtnName === 'approved' && !isChecked) {
      this.bookingForm.get('adminComment').value = 'Not approved as event does not comply to platform usage policies. Please contact Help Desk';
    }
  }

}
