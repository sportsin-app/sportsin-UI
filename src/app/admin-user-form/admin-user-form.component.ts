import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { CreateAdminService } from './create-admin.service';

@Component({
  selector: 'app-admin-user-form',
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.scss']
})
export class AdminUserFormComponent implements OnInit {
  public createAdminForm;
  public pincodeAddress = {pinCode: null, city: null, state: null, country: null};
  public responseMessage: String;
  public isInvalidPincode: Boolean = false;
  public invalidEmailId: string = '';
  public isInvalidEmailId: Boolean = false;
  public isInvalidSecondaryMobile: Boolean = false;
  public isInvalidPrimaryMobile: Boolean = false;

  constructor(public fb: FormBuilder,
    public router: Router,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public createAdminService: CreateAdminService) { }

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.createAdminForm && this.createAdminForm.reset();
    this.createAdminForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      spoc: [null, Validators.required],
      role: [null, Validators.required],
      contact: this.fb.group({
        mobilePrimary: [null, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
        mobileSecondary: [null, [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'), Validators.required]],
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

  onSubmit(content): any {
    this.createAdminService.createAdminUser(this.createAdminForm.value).subscribe((resp) => {
      this.responseMessage = resp.responseHeader.decription;
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      // console.log(JSON.stringify(resp));
    });

  }

}
