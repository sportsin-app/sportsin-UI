import { Component, OnInit, ViewChild, DoCheck, NgZone, ElementRef, ChangeDetectorRef, OnDestroy, AfterViewInit, Input, Output, EventEmitter, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { BookingFormService } from './booking-form.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
// import { ViewEncapsulation } from '../../../node_modules/@angular/compiler/src/core';
import { NgbModal, ModalDismissReasons, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService } from '../dashboard/dashboard.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../common.service';
import { catchError, flatMap, startWith, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Subscription, of, Observable } from 'rxjs';
import { couponCodeContext } from '../app.config';
import { MapDetails, PaymentDetails } from '../user-type';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { faImage, faPlus } from '@fortawesome/free-solid-svg-icons';
import { DomSanitizer } from '@angular/platform-browser';
import { TomTomMapComponent } from '../tom-tom-map/tom-tom-map.component';


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
  public mesurementUnit = [
    'METER','KM','FEETS','MILES'
  ];
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
  public paymentAmount: number;
  public uploadFile: Object;
  public couponCodeMsg: string = '';
  public eventMeasureName: string = '';
  public tncAccpted: boolean = false;
  public coordinates: MapDetails;
  public paymentDetails: PaymentDetails;
  public isSelectedMembership: boolean = false;
  public isSelfSponsored: boolean = true;
  public addImageIcon = faImage;
  public faPlus = faPlus;
  public selectedPhotoError: string = '';
  public eventPhotoList = [];
  public fileDesc: any;
  public activitiesList: any;
  public isActivityAvailable: boolean = true;
  public filteredActivities: Observable<string[]>;
  public eventPhotosObj = [
    {
      id: 'serviceProviderIcon',
      name: 'Service provider icon',
      src: null
    },
    {
      id: 'serviceProviderPoster',
      name: 'Service provider poster',
      src: null
    },
    {
      id: 'sponserIcon',
      name: 'Sponsor icon',
      src: null
    },
    {
      id: 'sponsorPoster',
      name: 'Sponsor poster',
      src: null
    },
    {
      id: 'poster1',
      name: 'Poster 1',
      src: null
    },
    {
      id: 'poster2',
      name: 'Poster 2',
      src: null
    },
    {
      id: 'poster3',
      name: 'Poster 3',
      src: null
    },
    {
      id: 'poster4',
      name: 'Poster 4',
      src: null
    },
    {
      id: 'poster5',
      name: 'Poster 5',
      src: null
    },
    {
      id: 'poster6',
      name: 'Poster 6',
      src: null
    }
  ];

  @Input('selectedgridData') public selectedgridData;
  @Input('isNewEvent') public isNewEvent;
  @Output() closeEventForm = new EventEmitter<object>();
  @ViewChild('fromDateInput', {static: false}) public fromDateInput;
  @ViewChild('isRentalKitAvail', {static: false}) public isRentalKitAvail;
  @ViewChild('isTournamentSelected', {static: false}) public isTournamentSelected;
  // @ViewChild('isApproved', {static: false}) public isApproved;
  @ViewChild('couponCodeBtn') public couponCodeBtn: NgbPopover;
  @ViewChild(TomTomMapComponent, {static: false}) tomtomComponent: TomTomMapComponent;

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
    public changeDetector: ChangeDetectorRef,
    public dialog: MatDialog,
    public photoErrorDialog: MatDialog,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
      this.eventCategoryDetailsArray = this.bookingFormService.eventCategoryDetails;
      const activityValues = 
      this.activitiesList = [].concat(...Object.values(this.eventCategoryDetailsArray));
      let createdFormData = Object.keys(this.selectedgridData).length > 0 ? this.selectedgridData : '';
      // if (createdFormData) {
      //   let savedCategory = createdFormData.eventCategoryDetails.category;
      //   this.eventCatDetailsObj.category = savedCategory;
      //   let savedActivityType = createdFormData.eventCategoryDetails.activityType;
      //   let savedActivityName = createdFormData.eventCategoryDetails.activityName;
      //   this.changeCategory(savedCategory, savedActivityType, savedActivityName);

      // }

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
    this.filteredActivities = this.bookingForm.get('eventCategoryDetails').controls.activityName.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value)),
      map((name) => (name ? this._filterActivity(name) : this.activitiesList.slice()))
    );
  }
  ngOnChanges() {
    this.eventMeasureName = '';
    this.resetForm(this.selectedgridData);
    if (this.isNewEvent) {
      this.tomtomComponent.ngOnChanges();
      this.filteredActivities = this.bookingForm.get('eventCategoryDetails').controls.activityName.valueChanges.pipe(
        startWith(''),
        map((value) => (typeof value === 'string' ? value : value)),
        map((name) => (name ? this._filterActivity(name) : this.activitiesList.slice()))
      );
    }
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

  private _filterActivity(name: any): any[] {
    const filterValue = name.toLowerCase();
    const filteredValue = this.activitiesList.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
    if (Array.isArray(filteredValue) && filteredValue.length > 0) {
      this.isActivityAvailable = true;
    } else {
      this.isActivityAvailable = false;
    }
    return filteredValue;
  }

  resetForm(createdFormData?) {
    if (createdFormData && Object.keys(createdFormData).length > 0 && !this.isNewEvent) {
      if (createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.mesurementUnit) {
        this.selectMeasurementUnit(createdFormData.eventCategoryDetails.mesurementUnit);
      }
      this.updateForm = true;
      this.address.city = createdFormData.address && createdFormData.address.city;
      this.address.country = createdFormData.address && createdFormData.address.country;
      this.address.state = createdFormData.address && createdFormData.address.state;
      this.address.pinCode = createdFormData.address && createdFormData.address.pinCode;
      this.coordinates = {
        latitude: createdFormData['address']['lattitude'],
        longitude: createdFormData['address']['longitude']
      };
      this.isSelfSponsored = createdFormData.selfSponsored;
      this.bookingForm = this.fb.group({
        // id: [null, Validators.required],
        eventId: [createdFormData.eventId],
        eventName: [createdFormData.eventName, Validators.required],
        eventDesc: [createdFormData.eventDesc],
        address: this.fb.group({
          addressLine1: [createdFormData.address && createdFormData.address.addressLine1, Validators.required],
          addressLine2: [createdFormData.address && createdFormData.address.addressLine2, Validators.required],
          country: [createdFormData.address && createdFormData.address.country, Validators.required],
          state: [createdFormData.address && createdFormData.address.state, Validators.required],
          city: [createdFormData.address && createdFormData.address.city, Validators.required],
          pinCode: [createdFormData.address && createdFormData.address.pinCode, Validators.required],
          lattitude: [createdFormData.address && createdFormData.address.lattitude, Validators.required],
          longitude: [createdFormData.address && createdFormData.address.longitude, Validators.required]
        }),
        tournamentFormatDetails: this.fb.array([this.createItem('tournamentFormatDetails', null, 0)]),
        adminComment: [createdFormData.adminComment],
        guideLines: [createdFormData.guideLines, Validators.required],
        // tncDetails: this.fb.array([this.createItem('tncDetails', null, 0)]),
        // rulesList: this.fb.array([this.createItem('rulesList', null, 0)]),
        startTime: [createdFormData.startTime],
        endTime: [createdFormData.endTime],
        fromDate: [new Date(createdFormData.fromDate), Validators.required],
        toDate: [new Date(createdFormData.toDate), Validators.required],
        rentalKitAvlbl: [createdFormData.rentalKitAvlbl ? createdFormData.rentalKitAvlbl : false],
        rentalKitDetailsList: this.fb.array([this.createItem('rentalKitDetailsList', null, 0)]),
        charges: [createdFormData.charges, Validators.required],
        ageLimit: [createdFormData.ageLimit, Validators.required],
        facilities: [this.facilitiesDetails, Validators.required],
        eventCategoryDetails: this.fb.group({
          category: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.category, Validators.required],
          activityType: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.activityType],
          activityName: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.activityName, Validators.required],
          mesurementUnit: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.mesurementUnit],
          height: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.height],
          distance: [createdFormData.eventCategoryDetails && createdFormData.eventCategoryDetails.distance]
        }),
        eventAdvCode: createdFormData.eventAdvCode,
        eventAdvDesc: createdFormData.eventAdvDesc,
        serviceProvider: this.fb.group({
          serviceProviderId: createdFormData['serviceProvider']['serviceProviderId'],
          email: createdFormData['serviceProvider']['email'],
          // "password": "12345",
          // "role": "Organizer",
          orgName: createdFormData['serviceProvider']['orgName'],
          spoc: createdFormData['serviceProvider']['spoc']
          // "contact": null,
          // "address": null
        }),
        textScore: [0],
        approved: [createdFormData.approved ? createdFormData.approved : false],
        tournament: [createdFormData.tournament ? createdFormData.tournament : false],
        active: [createdFormData.active ? createdFormData.active : false],
        gender: [createdFormData.gender, Validators.required],
        paymentId: createdFormData.paymentId,
        orderId: createdFormData.orderId,
        sportsInPaymentId: createdFormData.sportsInPaymentId,
        sportsInOrderId: createdFormData.sportsInOrderId,
        promoCodeUsed: createdFormData.promoCodeUsed,
        promoCode: createdFormData.promoCode,
        sponsor: createdFormData.sponsor,
        tncaccepted: createdFormData.tncaccepted,
        selfSponsored: [createdFormData.selfSponsored ? createdFormData.selfSponsored: false, Validators.required]
      });
      if (this.isSelfSponsored === false) {
        this.bookingForm.addControl('sponsorAddress', this.fb.control(null, Validators.required));
        this.bookingForm.addControl('sponsorName', this.fb.control(null, Validators.required));
      }
      let savedCategory = createdFormData.eventCategoryDetails.category;
      this.eventCatDetailsObj.category = savedCategory;
      let savedActivityType = createdFormData.eventCategoryDetails.activityType;
      let savedActivityName = createdFormData.eventCategoryDetails.activityName;
      this.changeCategory(savedCategory, savedActivityType, savedActivityName, createdFormData.eventCategoryDetails);
      setTimeout(() => {
        if (this.isRentalKitAvail && this.isRentalKitAvail.nativeElement) {
          this.isRentalKitAvail.nativeElement.checked = createdFormData.rentalKitAvlbl ? createdFormData.rentalKitAvlbl : false;
        }
        if (this.isTournamentSelected && this.isTournamentSelected.nativeElement) {
          this.isTournamentSelected.nativeElement.checked = createdFormData.tournament ? createdFormData.tournament : false;
        }
        const tncDetailsArr = createdFormData.tncDetails &&
          createdFormData.tncDetails.map((tncDetail, index) => {
            const tncIndex = (index === (createdFormData.tncDetails.length - 1)) ? index : null;
            return this.createItem('tncDetails', tncDetail.tncDetail, tncIndex);
          });
        const ruleDetailsArr = createdFormData.rulesList &&
          createdFormData.rulesList.map((rule, index) => {
            const ruleIndex = (index === (createdFormData.rulesList.length - 1)) ? index : null;
            return this.createItem('rulesList', rule.rule, ruleIndex);
          });
        const tornamentDetailsArr = createdFormData.tournament && createdFormData.tournamentFormatDetails &&
          createdFormData.tournamentFormatDetails.map((tournament, index) => {
            const tournamentIndex = (index === (createdFormData.tournamentFormatDetails.length - 1)) ? index : null;
            return this.createItem('tournamentFormatDetails', tournament.tournamentDetail, tournamentIndex);
          });
        const rentalKitArr = createdFormData.rentalKitAvlbl && createdFormData.rentalKitDetailsList &&
          createdFormData.rentalKitDetailsList.map((rentalKit, index) => {
            const rentalKitIndex = (index === (createdFormData.rentalKitDetailsList.length - 1)) ? index : null;
            return this.createItem('rentalKitDetailsList', rentalKit.rentalKitDetail, rentalKitIndex);
          });

        tncDetailsArr && this.bookingForm.setControl('tncDetails', this.fb.array(tncDetailsArr));
        ruleDetailsArr && this.bookingForm.setControl('rulesList', this.fb.array(ruleDetailsArr));
        tornamentDetailsArr && this.bookingForm.setControl('tournamentFormatDetails', this.fb.array(tornamentDetailsArr));
        rentalKitArr && this.bookingForm.setControl('rentalKitDetailsList', this.fb.array(rentalKitArr));
        if (this.bookingFormService.isAdminUser) {
          this.bookingForm.get('toDate').disable();
          this.bookingForm.get('fromDate').disable();
          this.bookingForm.get('eventCategoryDetails').disable();
          // this.isApproved.nativeElement.checked = createdFormData.approved ? createdFormData.approved : false;
        } else {
          this.bookingForm.disable();
          this.bookingForm.get('eventName').enable();
          this.bookingForm.get('eventDesc').enable();
          this.bookingForm.get('facilities').enable();
          this.bookingForm.get('rentalKitAvlbl').enable();
          this.bookingForm.get('rentalKitDetailsList').enable();
        }

      });
      this.selectedFacilityDetails = createdFormData.facilities;
    } else {
      this.updateForm = false;
      this.isSelfSponsored = true;
      this.bookingForm && this.bookingForm.reset();
      this.bookingForm && this.bookingForm.enable();
      this.isSelectedMembership = false;
      this.bookingForm = this.fb.group({
        // id: [null, Validators.required],
        eventName: [null, Validators.required],
        eventDesc: [null],
        guideLines: [this.commonService.defaultGuideLines, Validators.required],
        address: this.fb.group({
          addressLine1: [null, Validators.required],
          addressLine2: [null, Validators.required],
          country: [null, Validators.required],
          state: [null, Validators.required],
          city: [null, Validators.required],
          pinCode: [null, Validators.required],
          lattitude: [null, Validators.required],
          longitude: [null, Validators.required]
        }),
        // tournamentFormat: [null, this.isTournamentSelected && this.isTournamentSelected.checked && Validators.required],
        tournamentFormatDetails: this.fb.array([this.createItem('tournamentFormatDetails', null, 0)]),
        adminComment: ['Not approved as event does not comply to platform usage policies. Please contact Help Desk'],
        // tncDetails: this.fb.array([this.createItem('tncDetails', null, 0)]),
        // rulesList: this.fb.array([this.createItem('rulesList', null, 0)]),
        startTime: [null],
        endTime: [null],
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
        rentalKitAvlbl: [false],
        rentalKitDetailsList: this.fb.array([this.createItem('rentalKitDetailsList', null, 0)]),
        // rentalKitDetails: [null, this.isRentalKitAvail && this.isRentalKitAvail.checked && Validators.required],
        charges: [null, Validators.required],
        ageLimit: ['Select', Validators.required],
        facilities: [this.facilitiesDetails, Validators.required],
        eventCategoryDetails: this.fb.group({
          category: ['', Validators.required],
          activityType: [null],
          activityName: ['', Validators.required],
          mesurementUnit: ['Select Measurement'],
          height: [''],
          distance: ['']
        }),
        eventAdvCode: null,
        eventAdvDesc: null,
        serviceProvider: {
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
        gender: ['Select', Validators.required],
        paymentId: null,
        orderId: null,
        promoCodeUsed: false,
        promoCode: null,
        sponsor: false,
        tncaccepted: false,
        selfSponsored: [true, Validators.required]
      });
      this.selectedFacilityDetails = [];
      // this.getEventAmount();
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
      // if (this.bookingForm.value.eventCategoryDetails) {
      //   this.bookingForm.value.eventCategoryDetails['category'] = this.eventCatDetailsObj['category'];
      //   this.bookingForm.value.eventCategoryDetails['activityType'] = this.eventCatDetailsObj['activityType'];
      //   this.bookingForm.value.eventCategoryDetails['activityName'] = this.eventCatDetailsObj['activityName'];
      // }
      subscriber = this.bookingFormService.updateFormRequest(this.bookingForm.value);

    } else {
      if (this.paymentResponse && this.paymentResponse['data']) {
        this.bookingForm.patchValue({
          paymentId: this.paymentResponse['data']['paymentId'],
          orderId: this.paymentResponse['data']['orderId']
        });
      }
      this.bookingForm.patchValue({
        promoCodeUsed: this.haveCouponCode,
        promoCode: this.couponCodeText,
        tncaccepted: this.tncAccpted
      });
      subscriber = this.bookingFormService.submitBookingRequest(this.bookingForm.value);
    }
    this.subscriptions.push(subscriber.subscribe((data) => {
      this.createEventResp = data.responseHeader && data.responseHeader.decription;
      // if (this.uploadFile && data.eventDetailsReq) {
        this.bookingForm.patchValue({
          eventId: data.eventDetailsReq.eventId
        });
      if (this.eventPhotoList && this.eventPhotoList.length > 0 && data.eventDetailsReq) {
        this.spinner.show();
        // this.bookingFormService.uploadImage(this.uploadFile, data.eventDetailsReq.eventId)
        this.bookingFormService.uploadImage(this.eventPhotoList, data.eventDetailsReq.eventId)
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

  public changeCategory(value, savedActivityType?, savedActivityName?, createdEventCatDetails?): any {
    //   this.rentalKitActivityName = [];
    //   this.rentalKitActivityType = [];
    //   this.eventCatDetailsObj.activityName = null;
    //   this.eventCatDetailsObj.activityType = null;
    //   this.eventCatDetailsObj.category = value;
    //   if (!createdEventCatDetails) {
    //     this.eventMeasureName = '';
    //     this.bookingForm.get('eventCategoryDetails').patchValue({
    //       mesurementUnit: 'Select Measurement',
    //       height: null,
    //       distance: null
    //     });
    //   }
    // // const rentalKitCat = this.eventCategoryDetailsArray.find(rentalKitCat => rentalKitCat.name === value);
    // if (value === 'Select Category') {
    //   return;
    // } else if (rentalKitCat && rentalKitCat.value[0].name) {
    //   this.rentalKitActivityType = rentalKitCat.value;
    //   this.eventCatDetailsObj.activityType = savedActivityType || rentalKitCat.value[0].name;
    //   this.rentalKitActivityName = savedActivityType ? this.rentalKitActivityType.find(rentalActivityType => rentalActivityType.name === savedActivityType).value:
    //                                 this.rentalKitActivityType[0].value;
    //   this.eventCatDetailsObj.activityName = savedActivityName || (this.rentalKitActivityName && this.rentalKitActivityName[0]);
    // } else {
    //   this.rentalKitActivityName = rentalKitCat && rentalKitCat.value;
    //   this.eventCatDetailsObj.activityName = savedActivityName || this.rentalKitActivityName[0];
    //   this.eventCatDetailsObj.activityType = savedActivityType || null;
    // }
    // if (rentalKitCat && rentalKitCat.name === 'TRACK AND FIELD') {
    //   this.mesurementUnit = rentalKitCat.mesurementUnit;
    //   this.bookingForm.get('eventCategoryDetails').patchValue({
    //     mesurementUnit: (createdEventCatDetails && createdEventCatDetails.mesurementUnit) ? createdEventCatDetails.mesurementUnit
    //      : 'Select Measurement',
    //     height: (createdEventCatDetails && createdEventCatDetails.height) ? createdEventCatDetails.height :  null,
    //     distance: (createdEventCatDetails && createdEventCatDetails.distance) ? createdEventCatDetails.distance :  null
    //   });
    // }
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

  updateEvents() {
    // this.router.navigate(['/dashboard']);
    this.closeEventForm.emit({'name': 'eventForm', 'isClosed': true, 'eventId': this.bookingForm.get('eventId') && this.bookingForm.get('eventId').value});
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
    this.dialog.closeAll();
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

  public selectMeasurementUnit(value): void {
    if (value === 'Select Measurement') {
      this.eventMeasureName = '';
    } else if (value === 'FEETS') {
      this.eventMeasureName = 'HEIGHT';
    } else {
      this.eventMeasureName = 'DISTANCE';
    }
  }

  public getLocationDetails(event): void {
    this.bookingForm.controls['address'].patchValue({
      country: event.country || this.bookingForm.value.address.country,
      city: event.municipality || this.bookingForm.value.address.city,
      state: event.countrySubdivision || this.bookingForm.value.address.state,
      lattitude: event.latitude,
      longitude: event.longitude,
      pinCode: event.postalCode
    })
  }

  public selectedMembership(selectedMemberShip): void {
    let selectedValue: string;
    if (selectedMemberShip.currentTarget.value === 'SIEVRGADV') selectedValue = 'Regular';
    else if (selectedMemberShip.currentTarget.value === 'SIEVRGADV') selectedValue = 'Premium';
    else if (selectedMemberShip.currentTarget.value === 'SIEVRGADV') selectedValue = 'Supreme';
    if (selectedMemberShip.currentTarget && selectedMemberShip.currentTarget.value) {
      this.isSelectedMembership = true;
      this.getEventAmount(selectedMemberShip.currentTarget.value, selectedValue);
    }
  }

  public getEventAmount(selectedMemberShip, selectedValue): void {
    const reqObj = {
      paymentContext: selectedMemberShip
    }
    this.spinner.show();
    this.subscriptions.push(this.commonService.getPaymentAmt(reqObj).subscribe((data) => {
      if (data && data.paymentAmountReq) {
        this.paymentDetails = data.paymentAmountReq;
        this.bookingForm.patchValue({
          eventAdvCode: selectedValue,
          eventAdvDesc: data.paymentAmountReq.paymentDescription
        });
        this.paymentAmount = data.paymentAmountReq.calculatedAmount;
      }
      this.spinner.hide();
    }));
  }

  public openOrderSummary(content): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '500px';
    this.dialog.open(content, dialogConfig);
  }

  public changeSelfSponsored(selfSponsoredValue): void {
    if (selfSponsoredValue === true) {
      this.bookingForm.removeControl('sponsorAddress');
      this.bookingForm.removeControl('sponsorName');
      this.isSelfSponsored = true;
    } else if (selfSponsoredValue === false) {
      this.bookingForm.addControl('sponsorAddress', this.fb.control(null, Validators.required));
      this.bookingForm.addControl('sponsorName', this.fb.control(null, Validators.required));
      this.isSelfSponsored = false;
    }
  }

  public selectPhotos(multiplePhotoSelectBox): void {
    this.eventPhotoList = [];
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '900px';
    dialogConfig.minHeight = '500px';
    dialogConfig.maxHeight = '500px';
    this.dialog.open(multiplePhotoSelectBox, dialogConfig);
    if (!this.isNewEvent) {
      this.spinner.show();
      this.subscriptions.push(this.bookingFormService.downloadImage(this.selectedgridData.eventId, this.eventPhotosObj).subscribe((respEventPhotos) => {
        this.spinner.hide();
        if (respEventPhotos && respEventPhotos.length > 0) {
          respEventPhotos.forEach((respPhoto) => {
            this.eventPhotosObj.forEach((eventPhoto) => {
              if (eventPhoto.id === respPhoto.fileId) {
                  eventPhoto.src = respPhoto.imageResp ? ('data:image/png;base64,' + respPhoto.imageResp) : null;
              }
            });
          });
        }
      },
      error => {
        this.spinner.hide();
      }));
    }
  }

  public addEventPhoto(event, index, photoError): void {
    this.fileDesc = null;
    if (event.target.files.length > 0) {
      this.fileDesc = event.target.files[0];
      if (this.fileDesc.size/(1024*1024) > 2) {
        this.eventPhotosObj[index].src = null;
        this.selectedPhotoError = 'Poster or Icon size should not be greater than 2MB.';
        // this.photoErrorDialog.closeAll();
        this.photoErrorDialog.open(photoError);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.eventPhotosObj[index].src = e.target.result;
      }
      reader.readAsDataURL(this.fileDesc);
      // this.profileObj.maleSrc = src;
      // this.fileEvent.emit(file);
    }
  }

  public onImageLoad(evt, index, photoError): void {
    const width = (evt && evt.target) && evt.target.naturalWidth;
    const height = (evt && evt.target) && evt.target.naturalHeight;
    if (this.eventPhotosObj[index].id === 'serviceProviderPoster' && (width > 1920 || height > 1080)) {
      this.eventPhotosObj[index].src = null;
      this.selectedPhotoError = 'Service provider poster resolution should not be greater than 1920*1080.';
      // this.photoErrorDialog.;
      this.photoErrorDialog.open(photoError);
    } else if (this.eventPhotosObj[index].id !== 'serviceProviderPoster' && (width > 1080 || height > 1080)) {
      this.eventPhotosObj[index].src = null;
      this.selectedPhotoError = 'Icon resolution should not be greater than 1080*1080.';
      // this.photoErrorDialog.closeAll();
      this.photoErrorDialog.open(photoError);
    }
    if (this.fileDesc) {
      const fileObj = {
        id: this.eventPhotosObj[index].id,
        file: this.fileDesc
      }
      this.eventPhotoList.push(fileObj);
    }
  }

  displayFn(activity): string {
    return activity ? activity : '';
  }

  public setCategory(activity) {
    const eventCategory = this.bookingFormService.eventCategoryDetails;
    const categoryValue = Object.keys(eventCategory).find((key) => { return (eventCategory[key].find(k=> k === activity))});
    this.bookingForm.get('eventCategoryDetails').patchValue({
      category: categoryValue,
      activityName: activity
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
