import { Component, OnInit } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType } from '../user-type';
import { DashboardService } from '../dashboard/dashboard.service';
import { BookingFormService } from '../booking-form/booking-form.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  registeredUser : UserType;
  userEnter : UserType;
  registeredAdminUser: UserType;
  constructor(private router: Router, public dashboardService: DashboardService,
  public bookingService: BookingFormService) {
    // this.registeredUsers = new Array<UserType>();
     this.userEnter = new UserType();
    //  this.userEnter.email = 'admin';
    //  this.userEnter.password = 'admin';
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

  onSubmit(){
    this.userEnter.confirmPassword = this.userEnter.password;
    if(this.registeredUser &&
      (this.registeredUser.email == this.userEnter.email
        && this.registeredUser.password == this.userEnter.password)){
          localStorage.setItem('isAdmin', 'No');
    // if(this.registeredUsers.includes(this.userEnter)){S
      this.router.navigate(['/dashboard']);
    } else if (this.registeredUser &&
      (this.registeredAdminUser.email == this.userEnter.email
        && this.registeredAdminUser.password == this.userEnter.password)){
          localStorage.setItem('isAdmin', 'Yes');
          this.router.navigate(['/dashboard']);
        }
    else{
      localStorage.setItem('isAdmin', 'No');
      alert("User is not registered. Please register yourself");
    }
  }

  validateForm(){
    if((this.userEnter.email && this.userEnter.password) != ''){
      return false;
    }else{
      return true;
    }
  }

}
