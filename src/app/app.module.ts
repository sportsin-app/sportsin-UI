import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingFormService } from './booking-form/booking-form.service';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatIconModule, MatToolbarModule, MatSidenavModule, MatListModule} from '@angular/material';
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
import { AdminUserFormComponent } from './admin-user-form/admin-user-form.component';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { SvgIconDirective } from './directives/svg-icon.directive';
import { ServiceConsumerComponent } from './service-consumer/service-consumer.component';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway.component';
import { ServiceNowComponent } from './service-now/service-now.component';
import { PaymentResponseComponent } from './payment-response/payment-response.component';

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
    PaymentGatewayComponent,
    ServiceNowComponent,
    PaymentResponseComponent
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
    MatListModule

  ],
  providers: [BookingFormService],
  bootstrap: [AppComponent]
})
export class AppModule { }
