import { Component, OnInit } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType } from '../user-type';
import { DashboardService } from '../dashboard/dashboard.service';
import { BookingFormService } from '../booking-form/booking-form.service';
import { LoginService } from './login.service';
import { CommonService } from '../common.service';
import { first } from '../../../node_modules/rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { error } from '../../../node_modules/@angular/compiler/src/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  registeredUser : UserType;
  public userEnter : UserType;
  registeredAdminUser: UserType;
  public errorMsg;
  public passwordStrength = {
    'float': 'left',
    'width': '100px',
    'height': '25px',
    'margin-left': '5px'
};

  constructor(private router: Router, public dashboardService: DashboardService,
  public bookingService: BookingFormService,
  private loginService: LoginService,
  private commonService: CommonService,
  public modalService: NgbModal,
  public spinner: NgxSpinnerService) {
    // this.registeredUsers = new Array<UserType>();
     this.userEnter = new UserType();
     this.userEnter.userId = '';
     this.userEnter.password = '';
    //  localStorage.setItem('userInfo')
    // localStorage.setItem('userInfo', JSON.stringify(this.userEnter));
    this.registeredUser = JSON.parse(localStorage.getItem('userInfo'));
    this.registeredAdminUser = JSON.parse(localStorage.getItem('adminInfo'));
  }

  ngOnInit() {
    this.bookingService.isAllEventBtnClicked = true;
    this.bookingService.isServiceConsumerClicked = false;
    this.bookingService.isServiceProviderClicked = false;
  }

  // onSubmit(){
  //   this.userEnter.confirmPassword = this.userEnter.password;
  //   if(this.registeredUser &&
  //     (this.registeredUser.email == this.userEnter.email
  //       && this.registeredUser.password == this.userEnter.password)){
  //         localStorage.setItem('isAdmin', 'No');
  //   // if(this.registeredUsers.includes(this.userEnter)){S
  //     this.router.navigate(['/dashboard']);
  //   } else if (this.registeredUser &&
  //     (this.registeredAdminUser.email == this.userEnter.email
  //       && this.registeredAdminUser.password == this.userEnter.password)){
  //         localStorage.setItem('isAdmin', 'Yes');
  //         this.router.navigate(['/dashboard']);
  //       }
  //   else{
  //     localStorage.setItem('isAdmin', 'No');
  //     alert("User is not registered. Please register yourself");
  //   }
  // }

  onSubmit(content): any {
    this.spinner.show();
    this.loginService.loginMethod(this.userEnter).subscribe((resp) => {
      // if (resp.adminUserReq && resp.adminUserReq.role === 'ADMIN') {
      //   this.commonService.isAdminUser = true;
      //   this.router.navigate(['/dashboard']);
      // } else if(resp.responseHeader && resp.responseHeader.decription) {
      //   alert(resp.responseHeader.decription)
      //   // resp.responseHeader.decription
      //   this.commonService.isAdminUser = false;
      // }
      this.spinner.hide();
      if (resp.genericUserReq.userExist) {
        this.commonService.loggedInUser.userRole = resp.genericUserReq.userRole;
        this.commonService.loggedInUser.userId = resp.genericUserReq.userId;
        // this.router.navigate(['/app-payment-gateway']);
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg = resp.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }
      console.log(JSON.stringify(resp));
    });

    // this.loginService.loginMethod(this.userEnter).pipe(first())
    // .subscribe(
    //     resp => {
    //       if (resp.adminUserReq && resp.adminUserReq.role === 'ADMIN') {
    //             this.commonService.isAdminUser = true;
    //             this.router.navigate(['/dashboard']);
    //           } else if(resp.responseHeader && resp.responseHeader.decription) {
    //             alert(resp.responseHeader.decription)
    //             // resp.responseHeader.decription
    //             this.commonService.isAdminUser = false;
    //           }
    //           console.log(JSON.stringify(resp));
    //     },
    //     error => {
    //         this.error = error;
    //         // this.loading = false;
    //     });
  }

  validateForm(){
    let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    if((this.userEnter.userId && this.userEnter.password) != ''){
      if(strongRegex.test(this.userEnter.password)) {
        this.passwordStrength['background-color'] = 'green';
        return true;
      } else if(mediumRegex.test(this.userEnter.password)) {
          this.passwordStrength['background-color'] = 'orange';
          return true;
      } else {
          this.passwordStrength['background-color'] = 'red';
          return false;
      }
    }else{
      return false;
    }
  }

}
