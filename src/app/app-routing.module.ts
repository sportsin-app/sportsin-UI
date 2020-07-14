import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ServiceProviderFormComponent } from './booking-form/service-provider-form/service-provider-form.component';
import { InvitationComponent } from './invitation/invitation.component';
import { RegisterComponent } from './register/register.component';
import { AdminUserFormComponent } from './admin-user-form/admin-user-form.component';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway.component';


const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full'},
  { path: 'registerUser', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'app-booking-form', component: BookingFormComponent },
  { path: 'app-service-provider-form', component: ServiceProviderFormComponent},
  { path: 'app-invitation', component: InvitationComponent},
  { path: 'app-adminUser', component: AdminUserFormComponent },
  { path: 'app-payment-gateway', component: PaymentGatewayComponent}
  // { path: '**', component: P }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
