import { Component, OnInit, SecurityContext, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from 'ngx-spinner';
import { BookingFormService } from '../booking-form/booking-form.service';
import { CommonService } from '../common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfilePhotoObj } from '../user-type';

@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss']
})
export class ProfilePhotoComponent implements OnInit, OnChanges {

  public profileObj: ProfilePhotoObj;
  public faCamera = faCamera;

  @Input('isNewForm') public isNewForm: boolean;
  @Input('photoId') public photoId;
  @Input('cssClass') public cssClass: string;
  @Output('fileEvent') public fileEvent = new EventEmitter<any>();

  constructor(private spinner: NgxSpinnerService,
    private bookingService: BookingFormService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // if (this.commonService.loggedInUser.photoSrc) {
    //   this.profileObj['maleSrc'] = this.commonService.loggedInUser.photoSrc;
    //   this.profileObj['photoLabel'] = 'Delete';
    // }
    // this.profileObj['maleSrc'] = this.commonService.loggedInUser.photoSrc ? this.commonService.loggedInUser.photoSrc
    //                               : this.profileObj['maleSrc'];

    this.downloadPhoto();
  }

  ngOnChanges() {
    this.resetProfile();
    this.downloadPhoto();
  }

  public resetProfile(): void {
    this.profileObj = {
      maleSrc: '../../assets/profile_pic_male.jpg',
      femaleSrc: '../../assets/profile_pic_female.jpg',
      isFemaleProfile: false,
      isProfileChanged: false,
      photoLabel: 'Add'
    };
  }

  public addProfilePhoto(event): any {
    this.profileObj['isProfileChanged'] = true;
    if (event.target.files.length > 0) {
      // this.spinner.show();
      const file = event.target.files[0];
      // this.bookingService.uploadImage(file, this.photoId).subscribe((resp) => {
      //   this.profileObj.maleSrc = "data:image/jpeg;base64,"+resp.imageResp;
      //   this.spinner.hide();
      // });
      const reader = new FileReader();
      // const src = reader.readAsDataURL(file);
      reader.onload = (e) => {
        this.profileObj.maleSrc = e.target.result;
      }
      reader.readAsDataURL(file);
      // this.profileObj.maleSrc = src;
      this.fileEvent.emit(file);
    }
  }

  public downloadPhoto(): void {
    if (!this.isNewForm && this.photoId) {
      this.spinner.show();
      this.bookingService.downloadImage(this.photoId).subscribe((downloadResp) => {
        if (downloadResp && downloadResp['size'] > 0) {
          let base64Data;
          const reader = new FileReader();
          reader.readAsDataURL(downloadResp);
          reader.onloadend = () => {
            base64Data = reader.result;
            const image = this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustUrl(base64Data));
            this.profileObj.maleSrc = image;
            this.profileObj['photoLabel'] = 'Delete';
          };
        }
        this.spinner.hide();
      });
    } else {
      this.resetProfile();
    }
  }
}
