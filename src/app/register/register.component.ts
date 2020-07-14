import { Component, OnInit } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType } from '../user-type';
import { FormBuilder, Validators } from '@angular/forms';
import { RegisterService } from './register.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  private title = 'app';
  public registerationForm;
  public registerationResp: String;
  public isInvalidPincode: boolean = false;
  public responseMessage: string;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};

  // router: Router;
  // usersInfo : Array<UserType>;
  constructor(private router: Router, public fb: FormBuilder,
    private registerService: RegisterService,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public commonService: CommonService){
    // this.user = new UserType();
    // this.usersInfo = new Array<UserType>();
  }

  ngOnInit() {
    this.resetForm();
  }

  resetForm(): any {
    this.registerationForm = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
      spoc: [null, Validators.required],
      orgName: [null, Validators.required],
      contact: this.fb.group({
        mobilePrimary: [null, Validators.required],
        mobileSecondary: [null, Validators.required]
      }),
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

  onSubmit(content){
    // if(this.user.password !== this.user.confirmPassword){
    //   alert("Confirm Password doesn't match");
    //   this.user = new UserType();
    // }else{
    //   // this.usersInfo.push(this.user);
    //   localStorage.setItem('userInfo', JSON.stringify(this.user));
    //   this.router.navigate(['/app-home']);
    // }
    this.registerService.postRegisterationForm(this.registerationForm.value).subscribe((resp) => {
      this.registerationResp = resp.responseHeader.decription;
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      // console.log(JSON.stringify(resp));
    });

  }

  validateForm(){
    // if((this.user.email && this.user.password && this.user.confirmPassword) != ''){
    //   return false;
    // }else{
    //   return true;
    // }
  }

  getAddressFromPinCode() {
    this.spinner.show();
    this.commonService.fetchAddress(this.registerationForm.value.address.pinCode).subscribe((resp) => {
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
}
