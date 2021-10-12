import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewEncapsulation, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild, DoCheck } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { CommonService } from '../common.service';
import { BookingFormService } from '../booking-form/booking-form.service';
import { EventCategory, PaymentDetails } from '../user-type';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Observable, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { startWith, map } from 'rxjs/operators';
import { couponCodeContext } from '../app.config';

@Component({
  selector: 'app-membership-form',
  templateUrl: './membership-form.component.html',
  styleUrls: ['./membership-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MembershipFormComponent implements OnInit, OnChanges, DoCheck, AfterViewInit, OnDestroy {
  public membershipForm;
  public eventCategoryDetails: EventCategory[] = [];
  public selectedActivityList: EventCategory[];
  public activityNameList = [];
  public facilitiesDetails = ['Water', 'Food Stall', 'Washroom', 'First Aid'];
  public workingDaysDetails = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public weeklyOffDetails = ['None', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  public selectedFacilityDetails = [];
  public selectedWorkingDaysDetails = [];
  public selectedWeeklyOffDetails = [];
  public responseHeader: string = 'Success';
  public createEventResp: string = '';
  public eventPhotoList = [];
  public subscriptions: Subscription[] = [];
  public addImageIcon = faImage;
  public selectedPhotoError: string = '';
  public fileDesc: any;
  public activitiesList: any;
  public isActivityAvailable: boolean = true;
  public filteredActivities: Observable<string[]>[] = [];
  public memberShipActivityFormArray: FormArray;
  public applyCouponBtnText: string = 'Apply coupon';
  public couponCodeText: string = '';
  public haveCouponCode: boolean = false;
  public chargesList: any = [{
    name: 'Yes', value: 'Yes', checked: false
  }, {
    name: 'No', value: 'No', checked: true
  }]
  public paymentAmount: number;
  public paymentDetails: PaymentDetails;
  public couponCodeMsg: string = '';
  public iscommanPlan: boolean = false;
  public isSelectedMembership: boolean = false;
  public razorPayInputObj: Object = {};
  public paymentResponse: object = {};
  public isPaymentSuccess: boolean = false;
  public tncAccpted: boolean = false;
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
  @Input('isNewMembershipEvent') public isNewMembershipEvent;
  @Output() closeMembershipForm = new EventEmitter<object>();
  @ViewChild('couponCodeBtn') public couponCodeBtn: NgbPopover;

  constructor(public fb: FormBuilder,
    public commonService: CommonService,
    private bookingService: BookingFormService,
    private spinner: NgxSpinnerService,
    public modalService: NgbModal,
    public bookingFormService: BookingFormService,
    public dialog: MatDialog,
    public photoErrorDialog: MatDialog,
    public changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    // this.spinner.show();
    this.iscommanPlan = false;
    this.activitiesList = [].concat(...Object.values(this.bookingService.eventCategoryDetails));
    // this.eventCategoryDetails.push({
    //   category: this.bookingService.eventCategoryDetails,
    //   activityName: this.bookingService.eventCategoryDetails[0].value,
    //   measurement: null
    // });
    // this.activityNameList = this.bookingService.eventCategoryDetails[0].value;
    this.resetForm();
    if (this.selectedgridData && Object.keys(this.selectedgridData).length > 0 && !this.isNewMembershipEvent && this.membershipForm) {
      this.setFormValues();
    } else {
      this.isSelectedMembership = false;
    }
    this.memberShipActivityFormArray = this.membershipForm.get('activitiesAvailable')['controls'];
  }

  ngDoCheck() {
    this.razorPayInputObj['eventCreationFee'] = true;
      this.razorPayInputObj['registrationFee'] = false;
      this.razorPayInputObj['eventId'] = '';
      this.razorPayInputObj['email'] = this.commonService.loggedInUser['email'];
      this.razorPayInputObj['name'] = this.commonService.loggedInUser['name'];
      this.razorPayInputObj['paymentAmount'] = this.paymentAmount;
  }

  manageActivityControl(index: number) {
    var arrayControl = this.membershipForm.get('activitiesAvailable') as FormArray;
    this.filteredActivities[index] = arrayControl.at(index).get('activityName').valueChanges
      .pipe(
      startWith<string>(''),
      map(value => typeof value === 'string' ? value : value),
      map(name => name ? this._filterActivity(name) : this.activitiesList.slice())
      );
  }

  public ngOnChanges(): void {
    if (this.selectedgridData && Object.keys(this.selectedgridData).length > 0 && !this.isNewMembershipEvent && this.membershipForm) {
      this.setFormValues();
    } else {
      this.resetForm();
    }
  }

  public ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  public setFormValues(): void {
    this.iscommanPlan = (this.selectedgridData.charges && this.selectedgridData.charges.length > 0) ? true :  false;
    this.selectedFacilityDetails = this.selectedgridData.facilities;
    this.selectedWeeklyOffDetails = this.selectedgridData.weeklyOff;
    this.selectedWorkingDaysDetails = this.selectedgridData.workingDays
    this.membershipForm.patchValue({
      memberShipId: this.selectedgridData.memberShipId,
      memberShipName: this.selectedgridData.memberShipName,
      memberShipDesc: this.selectedgridData.memberShipDesc,
      areaIndoor: this.selectedgridData.areaIndoor,
      areaOutdoor: this.selectedgridData.areaOutdoor,
      adminComment: this.selectedgridData.adminComment,
      startTime: this.selectedgridData.startTime,
      endTime: this.selectedgridData.endTime,
      ageLimit: this.selectedgridData.ageLimit,
      facilities: this.selectedFacilityDetails,
      workingDays: this.selectedWorkingDaysDetails,
      weeklyOff: this.selectedWeeklyOffDetails,
      // charges: this.selectedgridData.charges,
      membersOnlyEvent: false,
      tncaccepted: this.selectedgridData.tncaccepted,
      paymentId: this.selectedgridData.paymentId,
      orderId: this.selectedgridData.orderId,
      sportsInPaymentId: this.selectedgridData.sportsInPaymentId,
      sportsInOrderId: this.selectedgridData.sportsInOrderId,
      promoCodeUsed: this.selectedgridData.promoCodeUsed,
      promoCode: this.selectedgridData.promoCode,
      guideLines: this.selectedgridData.guideLines,
      gender: this.selectedgridData.gender
    });
    if (this.selectedgridData.charges && this.selectedgridData.charges.length > 0) {
      this.selectedgridData.charges.forEach((charges, chargesIndex) => {
        if (chargesIndex === 0) {
          this.membershipForm.get('charges').at(chargesIndex).patchValue({
            planId: charges.planId,
            planName: charges.planName,
            planDesc: charges.planDesc,
            planCurrency: charges.planCurrency,
            memberShip: charges.memberShip,
            pass: charges.pass,
            session: charges.session,
            others: charges.others,
            baseCharge: charges.baseCharge,
            othersDesc: charges.othersDesc,
            memShipAnnumCharge: charges.memShipAnnumCharge,
            memShipQtrlyCharge: charges.memShipQtrlyCharge,
            memShipHaflYearlyCharge: charges.memShipHaflYearlyCharge,
            memShipMonthlyCharge: charges.memShipMonthlyCharge,
            sessionPerWeekCharge: charges.sessionPerWeekCharge,
            sessionPerDayCharge: charges.sessionPerDayCharge,
            sessionDurationInDays: charges.sessionDurationInDays,
            sessionDurationInWeeks: charges.sessionDurationInWeeks,
            passPerWeekCharge: charges.passPerWeekCharge,
            passPerDayCharge: charges.passPerDayCharge,
            passDurationInWeeks: charges.passDurationInWeeks,
            passDurationInDays: charges.passDurationInDays,
            commanPlan: charges.commanPlan,
            btnName: (chargesIndex === (this.selectedgridData.charges.length-1)) ? 'Add' : 'Remove'       
          })
        } else if (chargesIndex > 0) {
          this.membershipForm.get('charges').push(this.fb.group({
            planId: charges.planId,
            planName: charges.planName,
            planDesc: charges.planDesc,
            planCurrency: charges.planCurrency,
            memberShip: charges.memberShip,
            pass: charges.pass,
            session: charges.session,
            others: charges.others,
            baseCharge: charges.baseCharge,
            othersDesc: charges.othersDesc,
            memShipAnnumCharge: charges.memShipAnnumCharge,
            memShipQtrlyCharge: charges.memShipQtrlyCharge,
            memShipHaflYearlyCharge: charges.memShipHaflYearlyCharge,
            memShipMonthlyCharge: charges.memShipMonthlyCharge,
            sessionPerWeekCharge: charges.sessionPerWeekCharge,
            sessionPerDayCharge: charges.sessionPerDayCharge,
            sessionDurationInDays: charges.sessionDurationInDays,
            sessionDurationInWeeks: charges.sessionDurationInWeeks,
            passPerWeekCharge: charges.passPerWeekCharge,
            passPerDayCharge: charges.passPerDayCharge,
            passDurationInWeeks: charges.passDurationInWeeks,
            passDurationInDays: charges.passDurationInDays,
            commanPlan: charges.commanPlan,
            btnName: (chargesIndex === (this.selectedgridData.charges.length-1)) ? 'Add' : 'Remove'    
          }));
        }
      });
    }
    this.membershipForm.get('serviceProvider').patchValue({
      serviceProviderId: this.selectedgridData['serviceProvider']['serviceProviderId'],
      email: this.selectedgridData['serviceProvider']['email'],
      orgName: this.selectedgridData['serviceProvider']['orgName'],
      spoc: this.selectedgridData['serviceProvider']['spoc']
    })
    // this.selectedgridData.tncDetails.forEach((tnc, index) => {
    //     this.membershipForm.get('tncDetails').at(index).patchValue({
    //     tncDetail: tnc.tncDetail,
    //     btnName: (index || index == 0) ? 'Add' : 'Remove'
    //   });
    // });
    // this.selectedgridData.rulesList.forEach((rule, index) => {
    //     this.membershipForm.get('rulesList').at(index).patchValue({
    //     rule: rule.rule,
    //     btnName: (index || index == 0) ? 'Add' : 'Remove'
    //   });
    // });
    this.eventCategoryDetails = [];
    this.selectedgridData.activitiesAvailable.forEach((activity, index) => {
      let eventMeasureName: string = '';
      let chargesFormArray: FormArray = this.fb.array([]);
      const activitiesLength = this.selectedgridData.activitiesAvailable.length;
      if (activity.charges && activity.charges.length > 0) {
        activity.charges.forEach((charge, chargeIndex) => {
          chargesFormArray.push(this.createChargesArray(charge, chargeIndex, activity.charges.length));
        });
      }
      if (index === 0) {
        this.membershipForm.get('activitiesAvailable').at(index).patchValue({
          category: activity.category,
          activityName: activity.activityName,
          mesurementUnit: activity.mesurementUnit && activity.mesurementUnit,
          distance: activity.distance && activity.distance,
          height: activity.height && activity.height,
          // charges: chargesFormArray.controls,
          btnName: (index === (activitiesLength-1)) ? 'Add' : 'Remove'
        });
        // this.membershipForm.get('activitiesAvailable').at(index).patchValue({
        //   charges: chargesFormArray.controls
        // });
      } else if (index > 0) {
        this.membershipForm.get('activitiesAvailable').push(this.fb.group({
          category: activity.category,
          activityName: activity.activityName,
          mesurementUnit: activity.mesurementUnit && activity.mesurementUnit,
          distance: activity.distance && activity.distance,
          height: activity.height && activity.height,
          charges: this.fb.array([this.createChargesArray(null, 0)]),
          btnName: (index === (activitiesLength-1)) ? 'Add' : 'Remove'
        }));
      }
      if (this.membershipForm.get('activitiesAvailable').at(index).controls.charges) {
        this.membershipForm.get('activitiesAvailable').at(index).controls.charges.controls = chargesFormArray.controls;
      } else {
        this.membershipForm.get('activitiesAvailable').at(index).patchValue({
          charges: this.fb.array([this.createChargesArray(null, 0)])
          });
      }
      this.manageActivityControl(index);
    });
  }

  private addEventCatFormGroup(value?: EventCategory, index?) {
    let catValue: EventCategory;
    if (value) {
      catValue = value;
    } else {
      catValue = {
        category: '',
        activityName: '',
        measurement: '',
        distance: '',
        height: '',
        charges: '',
      }
    }
    return this.fb.group({
      category: [catValue.category],
      activityName: [catValue.activityName, Validators.required],
      mesurementUnit: [catValue.measurement],
      height: [catValue.height],
      distance: [catValue.distance],
      charges: this.fb.array(catValue.charges ? catValue.charges : [this.createChargesArray(catValue.charges, index)]),
      // commanPlan: [catValue.commanPlan],
      btnName: (index || index == 0) ? 'Add' : 'Remove'
    });
  }

  private createChargesArray(charges, index, length?) {
    let chargesList: any;
    if (charges) {
      chargesList = charges;
    } else {
      chargesList = {
        planId: null,
        planName: null,
        planDesc: null,
        planCurrency: null,
        memberShip: null,
        session: null,
        pass: null,
        others: null,
        othersDesc: null,
        baseCharge: null,
        commanPlan: false,
        memShipAnnumCharge: null,
        memShipQtrlyCharge: null,
        memShipHaflYearlyCharge: null,
        memShipMonthlyCharge: null,
        sessionPerWeekCharge: null,
        sessionPerDayCharge: null,
        sessionDurationInDays: null,
        sessionDurationInWeeks: null,
        passPerWeekCharge: null,
        passPerDayCharge: null,
        passDurationInWeeks: null,
        passDurationInDays: null
      }
    }
    let btnName = 'Add';
    if (length) {
      btnName = (index === (length-1)) ? 'Add' : 'Remove';
    } else {
      btnName = (index || index === 0) ? 'Add' : 'Remove';
    }
    // if (index === length - 1) {
    //   btnName = 'Add';
    // }
    // if (index > 0 && !length) {
    //   btnName = 'Remove';
    // }
    // if (index > 0  && index !== (length-1)) {
    //   btnName = 'Remove';
    // }
    return this.fb.group({
      planId: [chargesList.planId],
      planName: [chargesList.planName],
      planDesc: [chargesList.planDesc],
      planCurrency: [chargesList.planCurrency],
      memberShip: [chargesList.memberShip],
      session: [chargesList.session],
      pass: [chargesList.pass],
      others: [chargesList.others],
      othersDesc: [chargesList.othersDesc],
      baseCharge: [chargesList.baseCharge],
      commanPlan: [chargesList.commanPlan],
      memShipAnnumCharge: [chargesList.memShipAnnumCharge],
      memShipQtrlyCharge: [chargesList.memShipQtrlyCharge],
      memShipHaflYearlyCharge: [chargesList.memShipHaflYearlyCharge],
      memShipMonthlyCharge: [chargesList.memShipMonthlyCharge],
      sessionPerWeekCharge: [chargesList.sessionPerWeekCharge],
      sessionPerDayCharge: [chargesList.sessionPerDayCharge],
      sessionDurationInDays: [chargesList.sessionDurationInDays],
      sessionDurationInWeeks: [chargesList.sessionDurationInWeeks],
      passPerWeekCharge: [chargesList.passPerWeekCharge],
      passPerDayCharge: [chargesList.passPerDayCharge],
      passDurationInWeeks: [chargesList.passDurationInWeeks],
      passDurationInDays: [chargesList.passDurationInDays],
      btnName: btnName
    })

  }

  private addEventActivityFormGroup(value?) {
    const activityValue = value ? value : 'Select Activity';
    return this.fb.group({
      activityName: [activityValue || null, Validators.required]
    });
  }

  private addEventMeasurementFormGroup(value?) {
    const measurementValue = value ? value : 'Select Measurement';
    return this.fb.group({
      mesurementUnit: [measurementValue || null]
    });
  }

  private addEventHeightFormGroup(value?) {
    const heightValue = value ? value : '';
    return this.fb.group({
      height: [heightValue || null]
    });
  }

  private addEventDistanceFormGroup(value?) {
    const distanceValue = value ? value : '';
    return this.fb.group({
      height: [distanceValue || null]
    });
  }

  public changeEventCategory(event, index): void {
    if (event && event.value !== 'Select Category') {
      const selectedCategory = this.bookingService.eventCategoryDetails.find(activity => activity.name === event.value);
      this.eventCategoryDetails[index].activityName = selectedCategory && selectedCategory.value;
      this.addEventActivityFormGroup();
    }
    if (event && event.value === 'TRACK AND FIELD') {
      const selectedCategory = this.bookingService.eventCategoryDetails.find(activity => activity.name === event.value);
      this.eventCategoryDetails[index].measurement = selectedCategory && selectedCategory.mesurementUnit;
      this.addEventMeasurementFormGroup();
    }
  }

  public addTncItem(event, index): void {
    if (event.currentTarget.innerText.includes('Remove')) {
      this.membershipForm.get('tncDetails').value.splice(index, 1);
      this.membershipForm.get('tncDetails').controls.splice(index,1);
    } else {
      this.membershipForm.get('tncDetails').push(this.createItem('tncDetails', null, 0));
    }
    this.membershipForm.get('tncDetails')['value'].forEach((element, index) => {
      if (index < (this.membershipForm.get('tncDetails').value.length-1)) {
        element.btnName = 'Remove';
        return element;
      } else {
        element.btnName = 'Add';
        return element;
      }
    });
  }

  public addRulesItem(event, index): void {
    if (event.currentTarget.innerText.includes('Remove')) {
      this.membershipForm.get('rulesList').value.splice(index, 1);
      this.membershipForm.get('rulesList').controls.splice(index,1);
    } else {
      this.membershipForm.get('rulesList').push(this.createItem('rulesList', null, 0));
    }
    this.membershipForm.get('rulesList')['value'].forEach((element, index) => {
      if (index < (this.membershipForm.get('rulesList').value.length-1)) {
        element.btnName = 'Remove';
        return element;
      } else {
        element.btnName = 'Add';
        return element;
      }
    });
  }

  public addActivitiesItem(event, index): void {
    if (event.currentTarget.innerText.includes('Remove')) {
      const controls = <FormArray>this.membershipForm.controls['activitiesAvailable'];
      controls.removeAt(index);
      // remove from filteredOptions too.
      this.filteredActivities.splice(index, 1);
    } else {
      const controls = <FormArray>this.membershipForm.controls['activitiesAvailable'];
      // let formGroup = this.fb.group({
      //   name: ['', [Validators.required]],
      //   age: ['', [Validators.required]],
      // });
      let formGroup = this.createItem('availableActivities', null, 0);
      controls.push(formGroup);
      // Build the account Auto Complete values
      this.manageActivityControl(controls.length - 1);
    }
    // if (event.currentTarget.innerText.includes('Remove')) {
    //   this.membershipForm.get('activitiesAvailable').value.splice(index, 1);
    //   this.membershipForm.get('activitiesAvailable').controls.splice(index,1);
    //   this.eventCategoryDetails.splice(index, 1);
    // } else {
    //   this.eventCategoryDetails.push({
    //     category: this.bookingService.eventCategoryDetails,
    //     activityName: this.bookingService.eventCategoryDetails[0].value,
    //     measurement: null
    //   });
    //   this.membershipForm.get('activitiesAvailable').push(this.createItem('availableActivities', null, 0));
    // }
    this.membershipForm.get('activitiesAvailable')['controls'].forEach((element, index) => {
      if (index < (this.membershipForm.get('activitiesAvailable').value.length-1)) {
        element.patchValue({
          btnName: 'Remove'
        });
        return element;
      } else {
        element.patchValue({
          btnName: 'Add'
        });
        return element;
      }
    });
  }

  public addChargesItem(chargesList, event, chargesIndex): void {
    // this.membershipForm.get('tncDetails').value.splice(index, 1);
    //   this.membershipForm.get('tncDetails').controls.splice(index,1);
    // let chargesList = this.memberShipActivityFormArray[activityIndex].controls['charges'];
    if (event.currentTarget.innerText.includes('Remove')) {
      chargesList.value.splice(chargesIndex, 1);
      chargesList.controls.splice(chargesIndex,1);
    } else {
      chargesList.push(this.createChargesArray(null, 0));
    }
    chargesList['controls'].forEach((element, index) => {
      if (index < (chargesList['controls'].length-1)) {
        // element.btnName.value = 'Remove';
        element.patchValue({
          btnName: 'Remove'
        })
        return element;
      } else {
        // element.btnName.value = 'Add';
        element.patchValue({
          btnName: 'Add'
        })
        return element;
      }
    });
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
    } else if (itemName === 'availableActivities') {
      return this.addEventCatFormGroup(value, index);
    } else if (itemName === 'charges') {
      return this.createChargesArray(value, index);
    }
  }

  public resetForm(): void {
    this.membershipForm = this.fb.group({
      memberShipId: [null],
      memberShipName: [null, Validators.required],
      guideLines: [this.commonService.defaultGuideLines, Validators.required],
      memberShipDesc: [null, Validators.required],
      activitiesAvailable: this.fb.array([this.addEventCatFormGroup(null, 0)]),
      areaIndoor: [null, Validators.required],
      areaOutdoor: [null, Validators.required],
      adminComment: [null],
      gender: ['Select', Validators.required],
      // tncDetails: this.fb.array([this.createItem('tncDetails', null, 0)]),
      // rulesList: this.fb.array([this.createItem('rulesList', null, 0)]),
      tncaccepted: false,
      paymentId: [null],
      orderId: [null],
      sportsInPaymentId: [null],
      sportsInOrderId: [null],
      promoCodeUsed: [null],
      promoCode: [null],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      ageLimit: [null, Validators.required],
      facilities: [this.facilitiesDetails, Validators.required],
      workingDays: [this.workingDaysDetails, Validators.required],
      weeklyOff: [this.weeklyOffDetails, Validators.required],
      memberShipAdvCode: [null],
      memberShipAdvDesc: [null],
      charges: this.fb.array([this.createChargesArray(null, 0)]),
      serviceProvider: this.fb.group({
        serviceProviderId: this.commonService.loggedInUser.userId,
        email: this.commonService.loggedInUser.email,
        orgName: '',
        spoc: ''
      }),
      membersOnlyEvent: false
      });
    this.manageActivityControl(0);
  }

  public selectMeasurementUnit(value, index): void {
    if (value === 'Select Measurement') {
      this.eventCategoryDetails[index].eventMeasureName = '';
    } else if (value === 'FEETS') {
      this.eventCategoryDetails[index].eventMeasureName = 'HEIGHT';
    } else {
      this.eventCategoryDetails[index].eventMeasureName = 'DISTANCE';
    }
  }

  public onSubmit(content): void {
    this.spinner.show();
    let saveMembershipObservable: Observable<any>;
    if (this.isNewMembershipEvent) {
      if (this.paymentResponse && this.paymentResponse['data']) {
        this.membershipForm.patchValue({
          paymentId: this.paymentResponse['data']['paymentId'],
          orderId: this.paymentResponse['data']['orderId']
        });
      }
      this.membershipForm.patchValue({
        promoCodeUsed: this.haveCouponCode,
        promoCode: this.couponCodeText,
        tncaccepted: this.tncAccpted
      });
      saveMembershipObservable = this.commonService.addMembership(this.membershipForm.value);
    } else {
      saveMembershipObservable = this.commonService.updateMembership(this.membershipForm.value);
    }
    this.membershipForm.patchValue({
      promoCodeUsed: this.haveCouponCode,
      promoCode: this.couponCodeText,
    });
    saveMembershipObservable.subscribe((data) => {
      // this.createEventResp = response.responseHeader && response.responseHeader.decription;
      // this.responseHeader = 'Success';
      // this.spinner.hide();
      // this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      if (this.eventPhotoList && this.eventPhotoList.length > 0 && data.membershipDetails) {
        this.spinner.show();
        // this.bookingFormService.uploadImage(this.uploadFile, data.eventDetailsReq.eventId)
        this.bookingFormService.uploadImage(this.eventPhotoList, data.membershipDetails.memberShipId)
        .subscribe((uploadFileResponse) => {
            this.createEventResp = data.responseHeader && data.responseHeader.decription;
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
        this.responseHeader = 'Success';
        this.createEventResp = data.responseHeader && data.responseHeader.decription;
        this.spinner.hide();
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }
    },
    error => {
      this.responseHeader = 'Error';
      this.spinner.hide();
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    });
  }

  public updateEvents() {
    // this.router.navigate(['/dashboard']);
    this.closeMembershipForm.emit({'name': 'membershipForm', 'isClosed': true});
  }

  public selectPhotos(multiplePhotoSelectBox): void {
    this.eventPhotoList = [];
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '900px';
    dialogConfig.minHeight = '500px';
    dialogConfig.maxHeight = '500px';
    this.dialog.open(multiplePhotoSelectBox, dialogConfig);
    if (!this.isNewMembershipEvent) {
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

  displayFn(activity): string {
    return activity ? activity : '';
  }

  public setCategory(activity, index) {
    const eventCategory = this.bookingFormService.eventCategoryDetails;
    const categoryValue = Object.keys(eventCategory).find((key) => { return (eventCategory[key].find(k=> k === activity))});
    this.membershipForm.controls['activitiesAvailable'].at(index).patchValue({
      category: categoryValue
    });
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

  public checkCommonCoupon(chargesFormArray): void {
    let isCommonCharge = chargesFormArray['controls'].find((chargeFormGroup) => {
      if(chargeFormGroup.value.commanPlan == true) {
        return chargeFormGroup.value.commanPlan;
      }
    });
    this.iscommanPlan = isCommonCharge ? (isCommonCharge.value && isCommonCharge.value.commanPlan) : false; 

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
        this.membershipForm.patchValue({
          memberShipAdvCode: selectedValue,
          memberShipAdvDesc: data.paymentAmountReq.paymentDescription,
        });
        // eventAdvCode
        // eventAdvDesc
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

  public setCommonPlan(): void {
    this.iscommanPlan=true;
    this.membershipForm.patchValue({
      charges: this.fb.array([this.createChargesArray(null, 0)])
    });
  }

  ngOnDestroy(): void {
    // this.spinner.hide();
  }

}
