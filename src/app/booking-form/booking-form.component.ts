import { Component, OnInit, ViewChild, DoCheck, NgZone, ElementRef, ChangeDetectorRef, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { BookingFormService } from './booking-form.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
// import { ViewEncapsulation } from '../../../node_modules/@angular/compiler/src/core';
import { NgbModal, ModalDismissReasons, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '../../../node_modules/@angular/router';
import { DashboardService } from '../dashboard/dashboard.service';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { CommonService } from '../common.service';
import { catchError, flatMap } from '../../../node_modules/rxjs/operators';
import { HttpErrorResponse } from '../../../node_modules/@angular/common/http';
import { throwError, Subscription, of } from '../../../node_modules/rxjs';
import { couponCodeContext } from '../app.config';


@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class BookingFormComponent implements OnInit, DoCheck, AfterViewInit, OnDestroy {
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
  public responseHeader: string = 'Success';
  public paymentResponse: object = {};
  public isPaymentSuccess: boolean = false;
  public razorPayInputObj: Object = {};
  public subscriptions: Subscription[] = [];
  public haveCouponCode: boolean = false;
  public couponCodeText: string = '';
  public applyCouponBtnText: string = 'Apply coupon';
  public paymentAmount: number = 100;
  public uploadFile: Object;
  public couponCodeMsg: string = '';

  @Input('selectedgridData') public selectedgridData;
  @Input('isNewEvent') public isNewEvent;
  @Output() closeEventForm = new EventEmitter<object>();
  @ViewChild('fromDateInput', {static: false}) public fromDateInput;
  @ViewChild('isRentalKitAvail', {static: false}) public isRentalKitAvail;
  @ViewChild('isTournamentSelected', {static: false}) public isTournamentSelected;
  @ViewChild('isApproved', {static: false}) public isApproved;
  @ViewChild('couponCodeBtn') public couponCodeBtn: NgbPopover;

  constructor(public fb: FormBuilder,
    public bookingFormService: BookingFormService,
    public modalService: NgbModal,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public dashboardService: DashboardService,
    public spinner: NgxSpinnerService,
    public ngZone: NgZone,
    public commonService: CommonService,
    public el: ElementRef,
    public changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
      this.eventCategoryDetailsArray = this.bookingFormService.eventCategoryDetails;
      let createdFormData = Object.keys(this.selectedgridData).length > 0 ? this.selectedgridData : '';
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
      this.resetForm(this.selectedgridData);
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
  ngOnChanges() {
    this.resetForm(this.selectedgridData);
  }

  ngDoCheck() {
    this.razorPayInputObj['eventCreationFee'] = true;
      this.razorPayInputObj['registrationFee'] = false;
      this.razorPayInputObj['eventId'] = '';
      this.razorPayInputObj['email'] = this.commonService.loggedInUser['email'];
      this.razorPayInputObj['name'] = this.commonService.loggedInUser['name'];
      this.razorPayInputObj['paymentAmount'] = this.paymentAmount;
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();

  }

  resetForm(createdFormData?) {
    if (createdFormData && Object.keys(createdFormData).length > 0 && !this.isNewEvent) {
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
        // tournamentFormat: [createdFormData.tournamentFormat, createdFormData.tournament && Validators.required],
        tournamentFormatDetails: this.fb.array([ this.createItem('tournamentFormatDetails', null, 0)]),
        adminComment:[createdFormData.adminComment],
        // tnc: [createdFormData.tnc, Validators.required],
        tncDetails: this.fb.array([this.createItem('tncDetails', null, 0)]),
        // rules: [createdFormData.rules, Validators.required],
        rulesList: this.fb.array([this.createItem('rulesList', null, 0)]),
        startTime: [createdFormData.startTime],
        endTime: [createdFormData.endTime],
        // new Date(createdFormData.fromDate).toLocaleDateString()
        fromDate: [new Date(createdFormData.fromDate), Validators.required],
        toDate: [new Date(createdFormData.toDate), Validators.required],
        rentalKitAvlbl: [createdFormData.rentalKitAvlbl ? createdFormData.rentalKitAvlbl : false],
        // rentalKitDetails: [createdFormData.rentalKitDetails, createdFormData.rentalKitAvlbl && Validators.required],
        rentalKitDetailsList: this.fb.array([ this.createItem('rentalKitDetailsList', null, 0)]),
        charges: [createdFormData.charges, Validators.required],
        ageLimit: [createdFormData.ageLimit, Validators.required],
        facilities: [this.facilitiesDetails, Validators.required],
        eventCategoryDetails: this.fb.group({
          category: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.category, Validators.required],
          activityType: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.activityType],
          activityName: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.activityName, Validators.required]
        }),
        serviceProvider:{
          "serviceProviderId": createdFormData['serviceProvider']['serviceProviderId']
          // "email": "ramlal@gmail.com",
          // "password": "12345",
          // "role": "Organizer",
          // "orgName": "Service Provider Demo 001",
          // "spoc": "Ram Lal",
          // "contact": null,
          // "address": null
        },
        textScore: [0],
        approved: [createdFormData.approved ? createdFormData.approved : false],
        tournament: [createdFormData.tournament ? createdFormData.tournament : false],
        active: [createdFormData.active ? createdFormData.active : false],
        gender: [createdFormData.gender, Validators.required]
      });
      setTimeout(() => {
        this.isRentalKitAvail.nativeElement.checked = createdFormData.rentalKitAvlbl ? createdFormData.rentalKitAvlbl : false;
        this.isTournamentSelected.nativeElement.checked = createdFormData.tournament ? createdFormData.tournament : false;
        const tncDetailsArr = createdFormData.tncDetails &&
            createdFormData.tncDetails.map((tncDetail, index) => {
              const tncIndex = (index === (createdFormData.tncDetails.length-1)) ? index : null;
              return this.createItem('tncDetails', tncDetail.tncDetail, tncIndex);
            });
        const ruleDetailsArr = createdFormData.rulesList &&
              createdFormData.rulesList.map((rule, index) => {
                const ruleIndex = (index === (createdFormData.rulesList.length-1)) ? index : null;
                return this.createItem('rulesList', rule.rule, ruleIndex);
              });
        const tornamentDetailsArr = createdFormData.tournamentFormatDetails &&
              createdFormData.tournamentFormatDetails.map((tournament, index) => {
                const tournamentIndex = (index === (createdFormData.tournamentFormatDetails.length-1)) ? index : null;
                return this.createItem('tournamentFormatDetails', tournament.tournamentDetail, tournamentIndex);
              });
        const rentalKitArr = createdFormData.rentalKitDetailsList &&
              createdFormData.rentalKitDetailsList.map((rentalKit, index) => {
                const rentalKitIndex = (index === (createdFormData.rentalKitDetailsList.length-1)) ? index : null;
                return this.createItem('rentalKitDetailsList', rentalKit.rentalKitDetail, rentalKitIndex);
              });

        tncDetailsArr && this.bookingForm.setControl('tncDetails', this.fb.array(tncDetailsArr));
        ruleDetailsArr && this.bookingForm.setControl('rulesList', this.fb.array(ruleDetailsArr));
        tornamentDetailsArr && this.bookingForm.setControl('tournamentFormatDetails', this.fb.array(tornamentDetailsArr));
        rentalKitArr && this.bookingForm.setControl('rentalKitDetailsList', this.fb.array(rentalKitArr));
        if (this.bookingFormService.isAdminUser) {
          this.bookingForm.get('toDate').disable();
          this.bookingForm.get('fromDate').disable();
          this.isApproved.nativeElement.checked = createdFormData.approved ? createdFormData.approved : false;
        } else {
          this.bookingForm.disable();
          this.bookingForm.get('eventName').enable();
          this.bookingForm.get('eventDesc').enable();
          this.bookingForm.get('facilities').enable();
          this.bookingForm.get('rentalKitAvlbl').enable();
          this.bookingForm.get('rentalKitDetailsList').enable();
          this.bookingForm.get('serviceProvider').enable();
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
        // tournamentFormat: [null, this.isTournamentSelected && this.isTournamentSelected.checked && Validators.required],
        tournamentFormatDetails: this.fb.array([ this.createItem('tournamentFormatDetails', null, 0)]),
        adminComment:['Not approved as event does not comply to platform usage policies. Please contact Help Desk'],
        tncDetails: this.fb.array([this.createItem('tncDetails', null, 0)]),
        rulesList: this.fb.array([ this.createItem('rulesList', null, 0)]),
        // tnc: [null, Validators.required],
        // rules: [null, Validators.required],
        startTime: [null],
        endTime: [null],
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
        rentalKitAvlbl: [false],
        rentalKitDetailsList: this.fb.array([ this.createItem('rentalKitDetailsList', null, 0)]),
        // rentalKitDetails: [null, this.isRentalKitAvail && this.isRentalKitAvail.checked && Validators.required],
        charges: [null, Validators.required],
        ageLimit: ['Select', Validators.required],
        facilities: [this.facilitiesDetails, Validators.required],
        eventCategoryDetails: this.fb.group({
          category: ['Select Category', Validators.required],
          activityType: [null],
          activityName: ['Select Activity', Validators.required]
        }),
        serviceProvider:{
          "serviceProviderId": this.commonService.loggedInUser.userId
          // "email": "ramlal@gmail.com",
          // "password": "12345",
          // "role": "Organizer",
          // "orgName": "Service Provider Demo 001",
          // "spoc": "Ram Lal",
          // "contact": null,
          // "address": null
        },
        textScore: [0],
        approved: [false],
        tournament: [false],
        active: [false],
        gender: ['Select', Validators.required]
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
    this.spinner.show();
    this.bookingForm['value']['tournamentFormatDetails'] = !this.bookingForm.get('tournament').value ? [] : this.bookingForm['value']['tournamentFormatDetails'];
    this.bookingForm['value']['rentalKitDetailsList'] = !this.bookingForm.get('rentalKitAvlbl').value ? [] : this.bookingForm['value']['rentalKitDetailsList'];
    let subscriber;
    if (this.updateForm) {
      this.bookingForm.value.eventId = this.selectedgridData.eventId;
      this.bookingForm.get('eventCategoryDetails').value = this.eventCatDetailsObj;
      this.bookingForm.value.eventCategoryDetails = this.eventCatDetailsObj;
      subscriber = this.bookingFormService.updateFormRequest(this.bookingForm.value);

    } else {
      subscriber = this.bookingFormService.submitBookingRequest(this.bookingForm.value);
    }
    this.subscriptions.push(subscriber.subscribe((data) => {
      this.createEventResp = data.responseHeader && data.responseHeader.decription;
      if (this.uploadFile && data.eventDetailsReq) {
        this.spinner.show();
        this.bookingFormService.uploadImage(this.uploadFile, data.eventDetailsReq.eventId)
        .subscribe((uploadFileResponse) => {
            this.responseHeader = 'Success';
            const uploadedImageResp = uploadFileResponse;
            this.spinner.hide();
            this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
          },
          error => {
            this.spinner.hide();
            this.responseHeader = 'Error';
            this.createEventResp = 'Upload Request is failed but ' + this.createEventResp;
            this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
          });
      } else {
        this.spinner.hide();
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }

    },
    error => {
      this.spinner.hide();
      this.responseHeader = 'Error';
      this.createEventResp = 'Request failed. Please contact your admin for more information.';
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    }));
  }

  public changeCategory(value, savedActivityType?, savedActivityName?): any {
      this.rentalKitActivityName = [];
      this.rentalKitActivityType = [];
      this.eventCatDetailsObj.activityName = null;
      this.eventCatDetailsObj.activityType = null;
      this.eventCatDetailsObj.category = value;
      const rentalKitCat = this.eventCategoryDetailsArray.find(rentalKitCat => rentalKitCat.name === value);
    if (value === 'Select Category') {
      return;
    } else if (rentalKitCat && rentalKitCat.value[0].name) {
      this.rentalKitActivityType = rentalKitCat.value;
      this.eventCatDetailsObj.activityType = savedActivityType || rentalKitCat.value[0].name;
      this.rentalKitActivityName = savedActivityType ? this.rentalKitActivityType.find(rentalActivityType => rentalActivityType.name === savedActivityType).value:
                                    this.rentalKitActivityType[0].value;
      this.eventCatDetailsObj.activityName = savedActivityName || (this.rentalKitActivityName && this.rentalKitActivityName[0]);
    } else {
      this.rentalKitActivityName = rentalKitCat && rentalKitCat.value;
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
    this.subscriptions.push(this.bookingFormService.fetchAddress(this.bookingForm.value.address.pinCode).subscribe((resp) => {
      this.spinner.hide();
      if (resp && resp[0].Status === 'Error') {
        this.isInvalidPincode = true;
        this.address.city = '';
        this.address.country = '';
        this.address.state = '';
        this.createEventResp = 'Pincode is invalid. Please enter valid Pincode';
      }else if (resp && resp[0].Status === 'Success') {
        this.isInvalidPincode = false;
        this.address.city = resp[0].PostOffice && resp[0].PostOffice[0].District;
        this.address.country = resp[0].PostOffice && resp[0].PostOffice[0].Country;
        this.address.state = resp[0].PostOffice && resp[0].PostOffice[0].State;
      }

    }, error => {
      this.spinner.hide();
    }));
  }

  routeToMainPage() {
    // this.router.navigate(['/dashboard']);
    this.closeEventForm.emit({'name': 'eventForm', 'isClosed': true});
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
      this.bookingForm.get('tournamentFormatDetails').value.splice(0, this.bookingForm.get('tournamentFormatDetails').value.length-1);
      this.bookingForm.get('tournamentFormatDetails').controls.splice(0, this.bookingForm.get('tournamentFormatDetails').controls.length-1);
      this.bookingForm.get('tournamentFormatDetails').controls = [];
      this.bookingForm.get('tournamentFormatDetails').push(this.createItem('tournamentFormatDetails', null, 0));
      // this.bookingForm.get('tournamentFormatDetails').at(0).controls.tournamentDetail.clearValidators();
      // this.bookingForm.controls.tournamentFormatDetails.status = 'INVALID';
    } else if (radioBtnName === 'tournament' && !isChecked) {
      this.bookingForm.get('tournamentFormatDetails').controls = [];
      // this.bookingForm.get('tournamentFormatDetails').controls.push(this.createItem('tournamentFormatDetails', null, 0));
      // this.bookingForm.get('tournamentFormatDetails').at(0).controls.tournamentDetail.clearValidators();
      this.bookingForm.controls.tournamentFormatDetails.status = 'VALID';
    } else if(radioBtnName === 'rentalKitAvlbl' && isChecked) {
      // this.bookingForm.get('rentalKitDetailsList').setValidators(Validators.required);
      this.bookingForm.get('rentalKitDetailsList').value.splice(0, this.bookingForm.get('rentalKitDetailsList').value.length-1);
      this.bookingForm.get('rentalKitDetailsList').controls.splice(0, this.bookingForm.get('rentalKitDetailsList').controls.length-1);
      this.bookingForm.get('rentalKitDetailsList').controls = [];
      this.bookingForm.get('rentalKitDetailsList').push(this.createItem('rentalKitDetailsList', null, 0));
    } else if(radioBtnName === 'rentalKitAvlbl' && !isChecked) {
      // this.bookingForm.get('rentalKitDetailsList').value = '';
      // this.bookingForm.get('rentalKitDetailsList').clearValidators();
      this.bookingForm.get('rentalKitDetailsList').controls = [];
      // this.bookingForm.get('rentalKitDetailsList').push(this.createItem('tournamentFormatDetails', null, 0));
      // this.bookingForm.get('rentalKitDetailsList').at(0).controls.tournamentDetail.clearValidators();
      this.bookingForm.controls.rentalKitDetailsList.status = 'VALID';
    } else if(radioBtnName === 'approved' && isChecked) {
      this.bookingForm.get('adminComment').value = 'approved';
    } else if(radioBtnName === 'approved' && !isChecked) {
      this.bookingForm.get('adminComment').value = 'Not approved as event does not comply to platform usage policies. Please contact Help Desk';
    }
  }

  public setUploadFile(fileEvent): any {
    if (fileEvent) {
      this.uploadFile = fileEvent;
    }
  }

  createItem(itemName, value?, index?) {
    if (itemName === 'rulesList') {
      return this.fb.group({
        rule: [value || null, Validators.required]
        ,
        btnName: (index || index == 0) ? 'Add' : 'Remove'
      });
    } else if (itemName === 'tncDetails') {
      return this.fb.group({
        tncDetail: [value, Validators.required]
        ,
        btnName: (index || index == 0) ? 'Add' : 'Remove'
      });
    } else if (itemName === 'rentalKitDetailsList' && this.isRentalKitAvail && this.isRentalKitAvail.nativeElement.checked) {
      return this.fb.group({
        rentalKitDetail: [value, this.isRentalKitAvail && this.isRentalKitAvail.nativeElement.checked && Validators.required]
        ,
        btnName: (index || index == 0) ? 'Add' : 'Remove'
      });
    } else if (itemName === 'tournamentFormatDetails' && this.isTournamentSelected && this.isTournamentSelected.nativeElement.checked) {
      return this.fb.group({
        tournamentDetail: [value, this.isTournamentSelected && this.isTournamentSelected.nativeElement.checked && Validators.required]
        ,
        btnName: (index || index == 0) ? 'Add' : 'Remove'
      })
    }
  }

  addMoreItem(event, index, eventName): any {
    if (event.currentTarget.innerText.includes('Remove')) {
      this.bookingForm.get(eventName).value.splice(index, 1);
      this.bookingForm.get(eventName).controls.splice(index,1);
    } else {
      this.bookingForm.get(eventName).push(this.createItem(eventName, null, 0));
    }
    this.bookingForm.get(eventName)['value'].forEach((element, index) => {
      if (index < (this.bookingForm.get(eventName).value.length-1)) {
        element.btnName = 'Remove';
        return element;
      } else {
        element.btnName = 'Add';
        return element;
      }
    });
  }

  inputEvent(index, eventName){
    if (index < (this.bookingForm.get(eventName).value.length-1)) {
      this.bookingForm.get(eventName).value[index].btnName = 'Remove';
    } else {
      this.bookingForm.get(eventName).value[index].btnName = 'Add';
      this.bookingForm.get(eventName).status = 'VALID';
    }
  }

  get tncItem(): FormArray {
    return this.bookingForm.get('tncDetails') as FormArray;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }

  public getPaymentResponse(response: any, content: any): void {
    this.responseHeader = response.headerMsg;
    this.paymentResponse['data'] = response.data;
    this.paymentResponse['responseMsg'] = response.respMsg;
    this.isPaymentSuccess = response.isPaymentSuccess;
    if (this.isPaymentSuccess) {
      this.onSubmit(content);
    } else {
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'})
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
    this.applyCouponBtnText = 'Apply Coupon';
    const reqObj = {
      "couponCode": this.couponCodeText,
      "couponCodeContext": couponCodeContext['event']
    }
    this.spinner.show();
     this.subscriptions.push(this.commonService.getCouponCode(reqObj).subscribe((appliedCouponResp) => {
      this.spinner.hide();
      if (appliedCouponResp['promoCodeResp']) {
        this.couponCodeBtn.close();
        this.paymentAmount = appliedCouponResp['promoCodeResp']['discountAmount'];
        this.applyCouponBtnText = 'Applied';
        this.paymentAmount = appliedCouponResp['promoCodeResp']['discountAmount']*100;
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
