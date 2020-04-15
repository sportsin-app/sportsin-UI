import { Component, OnInit } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType } from '../user-type';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  title = 'app';
  user : UserType;

  // router: Router;
  // usersInfo : Array<UserType>;
  constructor(private router: Router){
    this.user = new UserType();
    // this.usersInfo = new Array<UserType>();
  }

  ngOnInit() {
  }

  onSubmit(){
    if(this.user.password !== this.user.confirmPassword){
      alert("Confirm Password doesn't match");
      this.user = new UserType();
    }else{
      // this.usersInfo.push(this.user);
      localStorage.setItem('userInfo', JSON.stringify(this.user));
      this.router.navigate(['/app-home']);
    }
  }

  validateForm(){
    if((this.user.email && this.user.password && this.user.confirmPassword) != ''){
      return false;
    }else{
      return true;
    }
  }
}
