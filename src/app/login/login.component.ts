import { Component, OnInit, OnDestroy, SecurityContext } from '@angular/core';
import { Router }          from '@angular/router';
import { UserType } from '../user-type';
import { DashboardService } from '../dashboard/dashboard.service';
import { BookingFormService } from '../booking-form/booking-form.service';
import { LoginService } from './login.service';
import { CommonService } from '../common.service';
import { first, map } from '../../../node_modules/rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { error } from '../../../node_modules/@angular/compiler/src/util';
import { Subscription } from '../../../node_modules/rxjs';
import { DomSanitizer } from '@angular/platform-browser';

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

  constructor(private router: Router, public dashboardService: DashboardService,
  public bookingService: BookingFormService,
  private loginService: LoginService,
  private commonService: CommonService,
  public modalService: NgbModal,
  public spinner: NgxSpinnerService,
  public sanitizer: DomSanitizer) {
     this.userEnter = new UserType();
     this.userEnter.userId = '';
     this.userEnter.password = '';
    this.registeredUser = JSON.parse(localStorage.getItem('userInfo'));
    this.registeredAdminUser = JSON.parse(localStorage.getItem('adminInfo'));
  }

  ngOnInit() {
    this.bookingService.isAllEventBtnClicked = true;
    this.bookingService.isServiceConsumerClicked = false;
    this.bookingService.isServiceProviderClicked = false;
  }

  onSubmit(content): any {
    this.spinner.show();
    this.subscriptions.push(this.loginService.loginMethod(this.userEnter).subscribe((resp) => {
      // this.spinner.hide();
      if (resp.genericUserReq.userExist) {
        this.commonService.loggedInUser = resp.genericUserReq;
        // const storage = this.db.firestore.app.storage('gs://sportsin-test-a.appspot.com');
        // const storage = this.db.firestore.app.storage('gs://sportsin-test-a.appspot.com').ref(this.commonService.loggedInUser.userId.toUpperCase());
        // const downloadedFile = storage.getDownloadURL();
        // downloadedFile.then(function(data) {
        //   console.log(data);
        // });
        this.subscriptions.push(this.bookingService.downloadImage(this.commonService.loggedInUser.userId).subscribe((downloadPhotoResp) => {
          if (downloadPhotoResp.size > 0) {
            let base64Data;
            const reader = new FileReader();
            reader.readAsDataURL(downloadPhotoResp);
            reader.onloadend = () => {
              base64Data = reader.result;
              const image = this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustUrl(base64Data));
              this.commonService.loggedInUser.photoSrc = image;
              this.spinner.hide();
              this.router.navigate(['/dashboard']);
            };
          } else {
            this.commonService.loggedInUser.photoSrc = '';
            this.spinner.hide();
            this.router.navigate(['/dashboard']);
          }
        }));

      } else {
        this.spinner.hide();
        this.errorMsg = resp.responseHeader.decription;
        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
      }
    },
    error => {
      this.spinner.hide();
      this.errorMsg = 'Request failed. Please contact your admin for more information.';
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    }));

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

  mapClicked($event: MouseEvent) {
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
    this.lat = $event['coords'].lat;
    this.lng = $event['coords'].lng;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
