import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonService } from '../common.service';
import { FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { BookingFormService } from '../booking-form/booking-form.service';
import { CreateAdminService } from '../admin-user-form/create-admin.service';
import { MapDetails } from '../user-type';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit, OnDestroy {

  @Input('profilePhoto') public profilePhoto: string;
  public profileDetailForm;
  public subscriptions: Subscription[] = [];
  public popUpMsgHeader: string = '';
  public createEventResp: string = '';
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public isInvalidPincode: boolean = false;
  private profileDetail: object;
  public promoter = {
    promoterYes: true,
    promoterNo: false
  }
  public coordinates: MapDetails;
  public changePasswordObj = {
    emailId: '',
    password: ''
  }
  public isValidPassword: boolean = false;
  public headerMsg = '';
  public registerationResp = '';
  public resetPasswordResponseMsg: string = '';
  public faPasswordVisible = faEye;

  constructor(private commonService: CommonService,
    public fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public modalService: NgbModal,
    public bookingService: BookingFormService,
    public createAdminService: CreateAdminService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.setProfileForm(null);
    this.getFormDetails();
  }

  public getFormDetails(): void {
    this.spinner.show();
    this.commonService.getProfileDetails().subscribe((profile) => {
      this.spinner.hide();
        if (profile['serviceProvider']) {
          this.profileDetail = profile['serviceProvider'];
          this.setProfileForm(profile['serviceProvider']);
        } else if (profile['adminUserReq']){
          this.profileDetail = profile['adminUserReq'];
          this.setProfileForm(profile['adminUserReq']);
        }
    });
  }

  public setProfileForm(profile): void {
    if (profile) {
      this.pincodeAddress.city = profile.address && profile.address.city;
      this.pincodeAddress.country = profile.address && profile.address.country;
      this.pincodeAddress.state = profile.address && profile.address.state;
      this.pincodeAddress.pinCode = profile.address && profile.address.pinCode;
      this.coordinates = {
        latitude: profile['address']['lattitude'],
        longitude: profile['address']['longitude']
      };
      this.changePasswordObj.emailId = profile.email;
      this.profileDetailForm = this.fb.group({
        profileId: [this.commonService.loggedInUser.userId],
        spoc: [profile['spoc'], Validators.required],
        email: [profile['email'], Validators.required],
        password: [profile['password'], Validators.required],
        userRole: [profile['role'], Validators.required],
        orgName: [profile['orgName'], Validators.required],
        contact: this.fb.group({
          mobilePrimary: [profile['contact']['mobilePrimary'], Validators.required],
          mobileSecondary: [profile['contact']['mobileSecondary']]
        }),
        spocDesignation: [profile['spocDesignation'], Validators.required],
        address: this.fb.group({
          addressLine1: [profile['address']['addressLine1'], Validators.required],
          addressLine2: [profile['address']['addressLine2'], Validators.required],
          country: [profile['address']['country'], Validators.required],
          state: [profile['address']['state'], Validators.required],
          city: [profile['address']['city'], Validators.required],
          pinCode: [profile['address']['pinCode'], Validators.required],
          lattitude: [profile['address']['lattitude'], Validators.required],
          longitude: [profile['address']['longitude'], Validators.required]
        }),
        promoter: [profile['promoter'], Validators.required]

      });
    } else {
      this.profileDetailForm = this.fb.group({
        profileId: [''],
        spoc: ['', Validators.required],
        email: ['', Validators.required],
        password: ['', Validators.required],
        userRole: ['', Validators.required],
        orgName: ['', Validators.required],
        contact: this.fb.group({
          mobilePrimary: ['', Validators.required],
          mobileSecondary: ['']
        }),
        spocDesignation: ['Select', Validators.required],
        address: this.fb.group({
          addressLine1: ['', Validators.required],
          addressLine2: ['', Validators.required],
          country: ['', Validators.required],
          state: ['', Validators.required],
          city: ['', Validators.required],
          pinCode: ['', Validators.required],
          lattitude: [null, Validators.required],
          longitude: [null, Validators.required]
        }),
        promoter: [null, Validators.required]
      });
    }
  }

  onSubmit(content): void {
    let subscriber: any;
    let reqObj: any = {
      email: this.profileDetailForm.value.email,
      orgName: this.profileDetailForm.value.orgName,
      spoc: this.profileDetailForm.value.spoc,
      contact: this.profileDetailForm.value.contact,
      address: this.profileDetailForm.value.address,
      spocDesignation: this.profileDetailForm.value.spocDesignation,
      promoter: this.profileDetailForm.value.promoter
    }
    if (this.profileDetail['password'] !== this.profileDetailForm.value.password) {
      reqObj['password'] = this.profileDetailForm.value.password;
    }
    if (this.commonService.loggedInUser.userRole === 'ADMIN') {
      reqObj['adminId'] = this.profileDetailForm.value.profileId;
      subscriber = this.createAdminService.updateAdminUser(reqObj);
    } else if (this.commonService.loggedInUser.userRole === 'SERVICE_PROVIDER') {
      reqObj['serviceProviderId'] = this.profileDetailForm.value.profileId;
      subscriber = this.bookingService.updateServiceProvider(reqObj)
    }
    this.spinner.show();
    this.subscriptions.push(subscriber.subscribe((response) => {
      if (response && response['responseHeader']) {
        this.popUpMsgHeader = response['responseHeader']['responseStatus'];
        this.createEventResp = response['responseHeader']['decription'];
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }
      this.spinner.hide();
    }));
  }

  public dismissMessage(): void {
    this.modalService.dismissAll();
    this.createEventResp = '';
    // this.closeServiceConsumer.emit({'name': 'serviceConsumer', 'isClosed': true});
  }

  getAddressFromPinCode() {
    this.spinner.show();
    this.subscriptions.push(this.bookingService.fetchAddress(this.profileDetailForm.value.address.pinCode).subscribe((resp) => {
      this.spinner.hide();
      if (resp && resp[0].Status === 'Error') {
        this.isInvalidPincode = true;
        this.pincodeAddress.city = '';
        this.pincodeAddress.country = '';
        this.pincodeAddress.state = '';
        this.createEventResp = 'Pincode is invalid. Please enter valid Pincode';
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

  public getLocationDetails(event): void {
    this.profileDetailForm.controls['address'].patchValue({
      country: event.country || this.profileDetailForm.value.address.country,
      city: event.municipality || this.profileDetailForm.value.address.city,
      state: event.countrySubdivision || this.profileDetailForm.value.address.state,
      lattitude: event.latitude,
      longitude: event.longitude,
      pinCode: event.postalCode
    })
  }

  public openChangePasswordForm(templateElement): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '400px';
    dialogConfig.maxHeight = '400px';
    this.dialog.open(templateElement, dialogConfig);
  }

  public changeProfilePassword(passwordSuccessMsgTmpl): void {
    const reqObj = {
      email: this.changePasswordObj.emailId,
      password: this.changePasswordObj.password
    }
    this.spinner.show();
    this.subscriptions.push(this.commonService.resetPassword(reqObj).subscribe((response) => {
      this.resetPasswordResponseMsg = response && response.responseHeader && response.responseHeader.decription;
      this.dialog.closeAll();
      this.dialog.open(passwordSuccessMsgTmpl);
      this.spinner.hide();
    },
    error => {
      this.spinner.hide();
    }));

  }

  checkPassword(passwordPopover: NgbPopover): void {
    this.isValidPassword = this.commonService.validatePassword(this.changePasswordObj.password);
    if (!this.isValidPassword) {
      this.headerMsg = 'Error';
      this.registerationResp = "Your password must be have at least";
      if (this.changePasswordObj.password.length <= 0) {
        passwordPopover.close();
      } else {
        passwordPopover.open()
      }
    } else {
      passwordPopover.close();
    }
  }

  public seePasswordContent(passwordElement): void {
    if (this.faPasswordVisible === faEye) {
      this.faPasswordVisible = faEyeSlash;
      passwordElement._elementRef.nativeElement.type = 'text';
    } else if (this.faPasswordVisible === faEyeSlash) {
      this.faPasswordVisible = faEye;
      passwordElement._elementRef.nativeElement.type = 'password';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
