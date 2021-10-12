import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingFormService } from './booking-form/booking-form.service';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatIconModule, MatToolbarModule, MatSidenavModule, MatListModule, MatDialogModule, MatCardModule, MatProgressSpinnerModule, MatAutocompleteModule} from '@angular/material';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AgGridModule } from 'ag-grid-angular';
import { OpenCreatedFormComponent } from './dashboard/open-created-form/open-created-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ServiceProviderFormComponent } from './booking-form/service-provider-form/service-provider-form.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { InvitationComponent } from './invitation/invitation.component';
import { AdminUserFormComponent } from './admin-user-form/admin-user-form.component';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { SvgIconDirective } from './directives/svg-icon.directive';
import { ServiceConsumerComponent } from './service-consumer/service-consumer.component';
import { ServiceNowComponent } from './service-now/service-now.component';
import { InputNumberDirective } from './directives/input-number.directive';
import { RazorpayDirective } from './directives/razorpay.directive';
import { NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { AgmCoreModule } from '@agm/core';
import { CouponCodeFormComponent } from './coupon-code-form/coupon-code-form.component';
import {MatRadioModule} from '@angular/material/radio';
import { ProfilePhotoComponent } from './profile-photo/profile-photo.component';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TomTomMapComponent } from './tom-tom-map/tom-tom-map.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MembershipFormComponent } from './membership-form/membership-form.component';
import { DateFormatPipe } from './pipes/date-format.pipe';

@NgModule({
  declarations: [
    AppComponent,
    BookingFormComponent,
    DashboardComponent,
    OpenCreatedFormComponent,
    LoginComponent,
    RegisterComponent,
    ServiceProviderFormComponent,
    InvitationComponent,
    AdminUserFormComponent,
    SvgIconDirective,
    ServiceConsumerComponent,
    ServiceNowComponent,
    InputNumberDirective,
    RazorpayDirective,
    ProfileDetailComponent,
    CouponCodeFormComponent,
    ProfilePhotoComponent,
    LandingPageComponent,
    TomTomMapComponent,
    MembershipFormComponent,
    DateFormatPipe
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    AgGridModule.withComponents([OpenCreatedFormComponent]),
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    NgxSpinnerModule,
    NgxMaterialTimepickerModule,
    BsDropdownModule.forRoot(),
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSidenavModule,
    MatListModule,
    FontAwesomeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA07VLQe9q3gqtxlS07W0sbOzFgNJLHtak'
    }),
    MatRadioModule,
    CommonModule,
    AlertModule.forRoot(),
    NgbPopoverModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DragDropModule,
    MatAutocompleteModule

  ],
  providers: [BookingFormService],
  bootstrap: [AppComponent]
})
export class AppModule { }
