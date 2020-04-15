import { Component, OnInit, OnChanges, ViewChild } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { RowData } from './row-data';
import { Router } from '../../../node_modules/@angular/router';
import { OpenCreatedFormComponent } from './open-created-form/open-created-form.component';
import { UserType } from '../user-type';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { BookingFormService } from '../booking-form/booking-form.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges {
  public rowData: RowData;
  public columnDefs = [];
  public gridApi;
  public gridColumnApi;
  public eventListReqObj;
  public frameworkComponents;
  public user: UserType;
  public isAdminUser: Boolean = false;
  public userInfo;
  public eventBtnName = 'Create Event';
  public eventHeaderName = 'List of All Events';
  public isInvitation: Boolean = false;
  @ViewChild('agGridElement', {static: false}) public agGridElement;
  @ViewChild('navElement', {static: false}) public navElement;

  constructor(public dashboardService: DashboardService,
  public router: Router,
  public spinner: NgxSpinnerService,
  public bookingService: BookingFormService) {
    this.frameworkComponents = {
      childMessageRenderer: OpenCreatedFormComponent
    };
   }

  ngOnInit() {
    if(localStorage.getItem('isAdmin') === 'Yes') {
      this.isAdminUser = true;
      this.bookingService.isAdminUser = true;
    } else {
      this.isAdminUser = false;
      this.bookingService.isAdminUser = false;
    }
    this.dashboardService.bookingCreatedObj = null;
    this.allEventBindColumnDef();
this.eventListReqObj = {serviceProvider: {id: 'SISP001'}};
if (this.bookingService.isAllEventBtnClicked) {
  this.fetchListOfEvents(this.eventListReqObj);
} else if(this.bookingService.isServiceConsumerClicked) {
  this.fetchServiceConsumerData(this.eventListReqObj);

} else if(this.bookingService.isServiceProviderClicked) {
this.fetchServiceProviderData(this.eventListReqObj);
} else if(this.bookingService.isInvitationClicked) {
  this.inviteUsersData(this.eventListReqObj);
}
  }

  ngOnChanges() {
    this.dashboardService.bookingCreatedObj = null;
  }

fetchListOfEvents(eventListReqObj, event?) {
  this.bookingService.isServiceProviderClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isInvitationClicked = false;
  this.bookingService.isAllEventBtnClicked = true;
  this.isInvitation = false;
  this.spinner.show();
  this.allEventBindColumnDef();
  this.eventHeaderName = 'List of All Events';
  this.eventBtnName = 'Create Event';
  this.resizeGridColumns();
  if(this.isAdminUser) {
    this.dashboardService.getAllEventList().subscribe((resp)=> {
      this.rowData = resp.eventList;
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
    });
  } else {
    this.dashboardService.getServiceProviderEventList(eventListReqObj).subscribe((resp)=> {
      this.rowData = resp.eventList;
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
    });
  }
}

onGridReady(params) {
  this.gridApi = params;
    // this.gridColumnApi = params.columnApi;

  params.api.sizeColumnsToFit();
}

logoutFn() {

  this.router.navigate(['/']);
}

fetchServiceProviderData(eventListReqObj) {
  this.bookingService.isServiceProviderClicked = true;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isInvitationClicked = false;
  this.isInvitation = false;
  this.spinner.show();
  this.eventHeaderName = 'List of Service Provider';
  this.serviceProviderColumnDef();
  this.resizeGridColumns();
  this.eventBtnName = 'Create Service Provider';
  this.dashboardService.fetchServiceProviders().subscribe((resp)=> {
    this.rowData = resp.providerList;
    this.spinner.hide();
  }, error => {
    this.spinner.hide();
  });
}
fetchServiceConsumerData(eventListReqObj) {
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.bookingService.isServiceConsumerClicked = true;
  this.bookingService.isInvitationClicked = false;
  this.isInvitation = false;
  this.spinner.show();
  this.eventBtnName = 'Create Service Consumer';
  this.eventHeaderName = 'List of Service Consumer';
  this.serviceConsumerColumnDef();
  this.resizeGridColumns();
  this.dashboardService.getServiceConsumerEventList(eventListReqObj).subscribe((resp)=> {
    this.rowData = resp.consumerList;
    this.spinner.hide();
  }, error => {
    this.spinner.hide();
  });
}

inviteUsersData(eventListReqObj) {
  this.bookingService.isInvitationClicked = true;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.spinner.show();
  this.eventBtnName = 'Create Invitation';
  this.eventHeaderName = 'Invitation List';
  this.isInvitation = true;
  this.invitationListColDef();
  this.resizeGridColumns();
  this.dashboardService.getInvitationList().subscribe((resp) => {
    this.rowData = resp.inviteList;
    this.spinner.hide();

  }, error => {
    this.spinner.hide();
  });
}

allEventBindColumnDef(): any {
    this.columnDefs = [
      {
        headerName: 'Event Name', field: 'eventName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRendererFramework: OpenCreatedFormComponent
      },{
        headerName: 'Event Id', field: 'eventId', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Created Date', field: 'createdDate', sortable: true, filter: "agDateColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      { headerName: 'Charges', field: 'charges', sortable: true, filter: "agNumberColumnFilter", cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Approved', field: 'approved', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return (data.value == true) ? 'Yes' : 'No';
        }
      },
      {
        headerName: 'Active', field: 'active', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return (data.value == true) ? 'Yes' : 'No';
        }
      }
    ];
  }

  serviceProviderColumnDef(): any {
    this.columnDefs = [
      {
        headerName: 'Service Provider Name', field: 'orgName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRendererFramework: OpenCreatedFormComponent
      },
      {
        headerName: 'Service Provider Id', field: 'serviceProviderId', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
      },
      { headerName: 'Contact Person', field: 'spoc', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Email', field: 'email', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'

      },{
        headerName: 'Contact', field: 'contact.mobilePrimary', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'City', field: 'address.city', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
      }
    ];
  }

  serviceConsumerColumnDef(): any {
    this.columnDefs = [
      {
        headerName: 'First Name', field: 'firstName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRendererFramework: OpenCreatedFormComponent
      },
      { headerName: 'User Name', field: 'userName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'},
      { headerName: 'User Id', field: 'id', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Email', field: 'emailId', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'

      },{
        headerName: 'Age Group', field: 'ageGroup', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'

      },{
        headerName: 'Created Date', field: 'createdDate', sortable: true, filter: "agDateColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },{
        headerName: 'Last Updated Date', field: 'lastUpdatedDate', sortable: true, filter: "agDateColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },{
        headerName: 'Gender', field: 'gender', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'

      },{
        headerName: 'Contact', field: 'mobile', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'City', field: 'address', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
      }
    ];
  }

  invitationListColDef(){
    this.columnDefs = [{
      headerName: 'Organization', field: 'orgName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
      cellRendererFramework: OpenCreatedFormComponent, headerCheckboxSelection: true, checkboxSelection: true
    },{
      headerName: 'Invitation Id', field: 'invitationId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    },{
      headerName: 'Contact Person', field: 'spoc', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
    },{
      headerName: 'Contact', field: 'contact.mobilePrimary', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    },{
      headerName: 'Email', field: 'emailId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    },{
      headerName: 'Invitation Sent', field: 'invitationSent', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
      cellRenderer: (data) => {
        return (data.value == true) ? 'Yes' : 'No';
      }
    }, {
      headerName: 'City', field: 'address.city', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
    }];
  }

  resizeGridColumns() {
    setTimeout(() => {
      this.agGridElement && this.agGridElement.columnApi.autoSizeColumns();
      this.agGridElement && this.agGridElement.api.sizeColumnsToFit();
    })
  }

  createEvent() {
    switch (this.eventBtnName) {
      case 'Create Event' : this.router.navigate(['/app-booking-form']);
            break;
      case 'Create Service Provider': this.router.navigate(['/app-service-provider-form']);
            break;
      case 'Create Invitation': this.router.navigate(['/app-invitation']);
            break;
    }
    // if (this.eventBtnName === 'Create Event') {
    //   this.router.navigate(['/app-booking-form']);
    // } else if( this.eventBtnName === 'Create Service Provider') {
    //   this.router.navigate(['/app-service-provider-form']);
    // } else if{
    //   // this.router.navigate(['/app-service-consumer-form']);
    // }
  }

}
