import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonService } from '../common.service';
import { FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookingFormService } from '../booking-form/booking-form.service';
import { CreateAdminService } from '../admin-user-form/create-admin.service';

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

  constructor(private commonService: CommonService,
    public fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public modalService: NgbModal,
    public bookingService: BookingFormService,
    public createAdminService: CreateAdminService) { }

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
        address: this.fb.group({
          addressLine1: [profile['address']['addressLine1'], Validators.required],
          addressLine2: [profile['address']['addressLine2'], Validators.required],
          country: [profile['address']['country'], Validators.required],
          state: [profile['address']['state'], Validators.required],
          city: [profile['address']['city'], Validators.required],
          pinCode: [profile['address']['pinCode'], Validators.required]
        })

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
        address: this.fb.group({
          addressLine1: ['', Validators.required],
          addressLine2: ['', Validators.required],
          country: ['', Validators.required],
          state: ['', Validators.required],
          city: ['', Validators.required],
          pinCode: ['', Validators.required]
        })
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
      address: this.profileDetailForm.value.address
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
