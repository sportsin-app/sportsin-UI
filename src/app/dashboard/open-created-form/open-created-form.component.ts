import { Component, OnInit, EventEmitter, NgZone } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Router } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { BookingFormService } from '../../booking-form/booking-form.service';

@Component({
  selector: 'app-open-created-form',
  templateUrl: './open-created-form.component.html',
  styleUrls: ['./open-created-form.component.scss']
})
export class OpenCreatedFormComponent implements ICellRendererAngularComp  {

  public cellData: any;
  constructor(public router: Router, public dashboardService: DashboardService,
  public bookingFormService: BookingFormService,
public ngzone: NgZone){

  }

    agInit(params: any): void {
        this.cellData = params;
        // console.log('params :', JSON.stringify(this.params));
        // this.router.navigate(['/app-booking-form']);
    }

    clickEvent() {
      this.ngzone.run(() => {
        this.dashboardService.bookingCreatedObj = this.cellData.data;
        if (this.bookingFormService.isAllEventBtnClicked) {
          this.router.navigate(['/app-booking-form']);
        } else if(this.bookingFormService.isInvitationClicked){
          this.router.navigate(['/app-invitation']);
        } else {
          this.router.navigate(['/app-service-provider-form']);
        }
      });
    }

    // public invokeParentMethod() {
    //     this.params.context.componentParent.methodFromParent(`Row: ${this.params.node.rowIndex}, Col: ${this.params.colDef.headerName}`)
    // }

    refresh(): boolean {
        return false;
    }
}
