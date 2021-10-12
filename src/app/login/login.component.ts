import { Component, OnInit, OnDestroy, SecurityContext, ViewChild, Renderer2, OnChanges, DoCheck } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType } from '../user-type';
import { DashboardService } from '../dashboard/dashboard.service';
import { BookingFormService } from '../booking-form/booking-form.service';
import { LoginService } from './login.service';
import { CommonService } from '../common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { faEnvelope, faLock, faLongArrowAltRight, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

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
lat: number = -23.8779431;
  lng: number = -49.8046873;
  zoom: number = 15;
  private subscriptions: Subscription[] = [];
  public resetPasswordEmailId: string;
  public resetPasswordResponseMsg: string;
  public faEnvelope = faEnvelope;
  public faLock = faLock;
  public faLongArrowRight = faLongArrowAltRight;
  public faPasswordVisible = faEye;

  @ViewChild('emailElement') private emailElement;
  @ViewChild('passwordElement') private passwordElement;

  constructor(private router: Router, public dashboardService: DashboardService,
  public bookingService: BookingFormService,
  private loginService: LoginService,
  private commonService: CommonService,
  public modalService: NgbModal,
  public spinner: NgxSpinnerService,
  public sanitizer: DomSanitizer,
  public dialog: MatDialog,
  private renderer: Renderer2) {
     this.userEnter = new UserType();
     this.userEnter.userId = '';
     this.userEnter.password = '';
    this.registeredUser = JSON.parse(localStorage.getItem('userInfo'));
    this.registeredAdminUser = JSON.parse(localStorage.getItem('adminInfo'));
  }

  public ngOnInit() {
    this.bookingService.isAllEventBtnClicked = true;
    this.bookingService.isServiceConsumerClicked = false;
    this.bookingService.isServiceProviderClicked = false;
  }

  onSubmit(content): any {
    this.spinner.show();
    this.subscriptions.push(this.loginService.loginMethod(this.userEnter).subscribe((resp) => {
      if (resp.genericUserReq.userExist) {
        this.commonService.loggedInUser = resp.genericUserReq;
        this.router.navigate(['/dashboard']);
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.errorMsg = resp.responseHeader.decription;
        this.dialog.open(content);
        // (content, {ariaLabelledBy: 'modal-basic-title'});
      }
    },
    error => {
      this.spinner.hide();
      this.errorMsg = 'Request failed. Please contact your admin for more information.';
      this.dialog.open(content);
    }));

  }

  validateForm(errorContent){
    // let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    // let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    this.renderer.removeClass(this.passwordElement.nativeElement, 'alert-validate');
    this.renderer.removeClass(this.emailElement.nativeElement, 'alert-validate');
    const isValidPassword = this.commonService.validatePassword(this.userEnter.password);
    // if(this.userEnter.userId != '' && isValidPassword){

    //   return true;
    // }else{
    //   return false;
    // }
    if (isValidPassword && !this.emailElement.nativeElement.classList.contains('ng-invalid')) {
      this.onSubmit(errorContent);
    } else {
      if (!isValidPassword) {
        this.renderer.addClass(this.passwordElement.nativeElement, 'alert-validate');
      }
      if (this.emailElement.nativeElement.classList.contains('ng-invalid')) {
        this.renderer.addClass(this.emailElement.nativeElement, 'alert-validate');
      }
    }
  }

  public forgotPassword(forgotPasswordDialogTmpl): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '350px';
    this.dialog.open(forgotPasswordDialogTmpl, dialogConfig);
  }

  public recoverPassword(passwordSuccessMsgTmpl): void {
    const reqObj = {
      email: this.resetPasswordEmailId
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
      this.errorMsg = 'Request failed. Please contact your admin for more information.';
      // this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    }));
  }

  public seePasswordContent(): void {
    if (this.faPasswordVisible === faEye) {
      this.faPasswordVisible = faEyeSlash;
      this.passwordElement.nativeElement.type = 'text';
    } else if (this.faPasswordVisible === faEyeSlash) {
      this.faPasswordVisible = faEye;
      this.passwordElement.nativeElement.type = 'password';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
