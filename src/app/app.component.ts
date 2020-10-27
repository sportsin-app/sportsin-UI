import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from '../../node_modules/rxjs';
import { BookingFormService } from './booking-form/booking-form.service';
export let browserRefresh = false;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'onlineGamesBooking';
  private subscriptions: Subscription[] = [];
  constructor(public router: Router, public bookingService: BookingFormService) {
    localStorage.setItem('userInfo', JSON.stringify({'email':'user','password':'user','confirmPassword':''}));
    localStorage.setItem('adminInfo', JSON.stringify({'email':'admin','password':'admin','confirmPassword':''}));
    this.router.navigate(['']);
  }

  ngOnInit() {
    this.subscriptions.push(this.bookingService.getEventCategoryDetailsJson().subscribe((data) => {
      this.bookingService.eventCategoryDetails = data;
    }));

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
