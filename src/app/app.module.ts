import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingFormService } from './booking-form/booking-form.service';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule} from '@angular/material';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '../../node_modules/@ng-bootstrap/ng-bootstrap';
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

@NgModule({
  declarations: [
    AppComponent,
    BookingFormComponent,
    DashboardComponent,
    OpenCreatedFormComponent,
    LoginComponent,
    RegisterComponent,
    ServiceProviderFormComponent,
    InvitationComponent
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
    BsDropdownModule.forRoot()

  ],
  providers: [BookingFormService],
  bootstrap: [AppComponent]
})
export class AppModule { }
