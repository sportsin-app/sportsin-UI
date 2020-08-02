import { Component, OnInit, OnChanges, ViewChild, ChangeDetectorRef, OnDestroy, SimpleChanges, DoCheck, AfterViewChecked, AfterContentInit, AfterContentChecked, AfterViewInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { RowData } from './row-data';
import { Router } from '../../../node_modules/@angular/router';
import { OpenCreatedFormComponent } from './open-created-form/open-created-form.component';
import { UserType } from '../user-type';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { BookingFormService } from '../booking-form/booking-form.service';
import { CommonService } from '../common.service';
import { MediaMatcher } from '../../../node_modules/@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges, OnDestroy {
  public rowData: RowData;
  public columnDefs = [];
  public gridApi;
  public gridColumnApi;
  public eventListReqObj;
  public frameworkComponents;
  public user: UserType;
  public userRole: String;
  public userInfo;
  public eventBtnName = 'Create Event';
  public eventHeaderName = 'List of All Events';
  public isInvitation: Boolean = false;
  public sideNavItems: Array<any> = ['Home', 'Dashboard', 'Analytics'];
  public rowSelection = 'multiple';
  public defaultColDef;
  public isServiceConsumerForm: Boolean = false;
  public selectedData: Object;
  public isNewService: Boolean = false;
  public isUpdateBtn: Boolean = false;
  public createServiceForm: boolean = false;


  mobileQuery: MediaQueryList;
  // fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  // fillerContent = Array.from({length: 50}, () =>
  //     `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
  //      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
  //      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
  //      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
  //      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  private _mobileQueryListener: () => void;


  @ViewChild('agGridElement', {static: false}) public agGridElement;
  @ViewChild('navElement', {static: false}) public navElement;

  constructor(public dashboardService: DashboardService,
  public router: Router,
  public spinner: NgxSpinnerService,
  public bookingService: BookingFormService,
  public commonService: CommonService,
  changeDetectorRef: ChangeDetectorRef,
  media: MediaMatcher) {
    this.frameworkComponents = {
      childMessageRenderer: OpenCreatedFormComponent
    };
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
   }

  ngOnInit() {
    if (this.commonService.loggedInUser.userRole) {
      this.userRole = this.commonService.loggedInUser.userRole;
      this.bookingService.isAdminUser = (this.userRole === 'ADMIN' || this.userRole === 'SUPER_USER') ? true : false;
    // } else {
    //   this.isAdminUser = false;
    //   this.bookingService.isAdminUser = false;
    }
    this.dashboardService.bookingCreatedObj = null;
    this.allEventBindColumnDef();
    this.eventListReqObj = { serviceProvider: { id: 'SISP001' } };
    if (this.bookingService.isAllEventBtnClicked) {
      this.fetchListOfEvents(this.eventListReqObj);
    } else if (this.bookingService.isServiceConsumerClicked) {
      this.fetchServiceConsumerData(this.eventListReqObj);

    } else if (this.bookingService.isServiceProviderClicked) {
      this.fetchServiceProviderData(this.eventListReqObj);
    } else if (this.bookingService.isInvitationClicked) {
      this.inviteUsersData(this.eventListReqObj);
    } else if (this.commonService.isAdminUserClicked) {
      this.adminUsersData(this.eventListReqObj);
    } else if (this.commonService.isServiceNowClicked) {
      this.fetchCreatedServiceData(this.eventListReqObj);
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    this.dashboardService.bookingCreatedObj = null;
  }

fetchListOfEvents(eventListReqObj, event?) {
  this.bookingService.isServiceProviderClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isInvitationClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.bookingService.isAllEventBtnClicked = true;
  this.isInvitation = false;
  this.isServiceConsumerForm = false;
  this.createServiceForm = false;
  this.spinner.show();
  this.allEventBindColumnDef();
  this.eventHeaderName = 'List of All Events';
  this.eventBtnName = 'Create Event';
  this.resizeGridColumns();
  if(this.userRole) { // TODO: for each userRole, the api call is different
    this.dashboardService.getAllEventList(this.commonService.loggedInUser).subscribe((resp)=> {
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
  this.commonService.isServiceNowClicked = false;
  this.isInvitation = false;
  this.isServiceConsumerForm = false;
  this.createServiceForm = false;
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
  this.commonService.isServiceNowClicked = false;
  this.isInvitation = false;
  this.createServiceForm = false;
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
  this.commonService.isServiceNowClicked = false;
  this.isServiceConsumerForm = false;
  this.createServiceForm = false;
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

adminUsersData(eventListReqObj): any {
  this.bookingService.isInvitationClicked = false;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isAdminUserClicked = true;
  this.isInvitation = false;
  this.createServiceForm = false;
  this.isServiceConsumerForm = false;
  this.spinner.show();
  this.eventBtnName = 'Create Admin User';
  this.eventHeaderName = 'Admin User List';
  this.adminListColDef();
  this.resizeGridColumns();
  this.dashboardService.getAdminList().subscribe((resp) => {
    this.rowData = resp.adminUserList;
    this.spinner.hide();

  }, error => {
    this.spinner.hide();
  });
};

fetchCreatedServiceData(eventListReqObj): void {
  this.bookingService.isInvitationClicked = false;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.commonService.isAdminUserClicked = false;
  this.commonService.isServiceNowClicked = true;
  this.isInvitation = false;
  this.isServiceConsumerForm = false;
  this.spinner.show();
  this.eventBtnName = 'Create Service';
  this.eventHeaderName = 'Service Request';
  this.serviceListColDef();
  this.resizeGridColumns();
  let getServiceList;
  if (this.commonService.loggedInUser.userRole === 'SERVICE_PROVIDER') {
    getServiceList = this.commonService.findAllServiceRequestOfSP(this.commonService.loggedInUser.userId);
  } else if (this.commonService.loggedInUser.userRole === 'ADMIN' || this.commonService.loggedInUser.userRole === 'HELPDESK'
            || this.commonService.loggedInUser.userRole === 'SUPER_USER') {
              getServiceList = this.dashboardService.getServiceReqList();
            }
  getServiceList.subscribe((resp) => {
    this.rowData = resp.serviceRequestList;
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
        headerName: 'First Name', field: 'firstName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
      },
      { headerName: 'User Name', field: 'userName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'},
      { headerName: 'Consumer Id', field: 'serviceConsumerId', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Email', field: 'email', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'

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
        headerName: 'City', field: 'address.city', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto'
      }
    ];
  }

  invitationListColDef(){
    this.columnDefs = [
      {
        headerCheckboxSelection: true, checkboxSelection: true, width: 40, minWidth: 40, maxWidth: 150
      },{
      headerName: 'Organization', field: 'orgName', sortable: true, filter: "agTextColumnFilter", cellClass: 'ui-grid-cell-contents-auto',
      cellRendererFramework: OpenCreatedFormComponent
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

  adminListColDef(): any {
    this.columnDefs = [
      {
        headerCheckboxSelection: true, checkboxSelection: true, width: 40, minWidth: 40, maxWidth: 150
      },
      {
      headerName: 'Name', field: 'spoc', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
      editable: true
    },{
      headerName: 'Email', field: 'email', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto', editable: true
    },{
      headerName: 'Admin Id', field: 'adminId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto', editable: false
    },{
      headerName: 'Role', field: 'role', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto', editable: false
    },{
      headerName: 'Contact', field: 'contact.mobilePrimary', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto', editable: true
    }];
    // this.defaultColDef = { resizable: true };
  }

  serviceListColDef(): void {
    this.columnDefs = [
      {
        headerName: 'Request Id', field: 'requestId', sortable: true, filter: 'agTextColumnFilter',
        cellClass: 'ui-grid-cell-contains-auto', editable: false
      },
      {
        headerName: 'Description', field: 'requestShortDescription', sortable: true, filter: 'agTextColumnFilter',
        cellClass: 'ui-grid-cell-contains-auto', editable: false
      },
      {
        headerName: 'Raised Date', field: 'requestRaisedDate', sortable: true, filter: 'agTextColumnFilter',
        cellClass: 'ui-grid-cell-contains-auto', editable: false,
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      {
        headerName: 'Resolved Date', field: 'requestResolvedDate', sortable: true, filter: 'agTextColumnFilter',
        cellClass: 'ui-grid-cell-contains-auto', editable: false,
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      {
        headerName: 'Status', field: 'requestStatus', sortable: true, filter: 'agTextColumnFilter',
        cellClass: 'ui-grid-cell-contains-auto', editable: false
      }
    ]
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
      case 'Create Admin User': this.router.navigate(['/app-adminUser']);
      case 'Create Service Consumer':
            this.isServiceConsumerForm = true;
            this.isNewService = true;
            break;
      case 'Create Service':
            this.createServiceForm = true;
            this.isNewService = true;
    }
    // if (this.eventBtnName === 'Create Event') {
    //   this.router.navigate(['/app-booking-form']);
    // } else if( this.eventBtnName === 'Create Service Provider') {
    //   this.router.navigate(['/app-service-provider-form']);
    // } else if{
    //   // this.router.navigate(['/app-service-consumer-form']);
    // }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  onSelectionChanged() {
    var selectedRows = this.gridApi.api.getSelectedRows();
  }

  updateAdmin() {
    this.dashboardService.updateAdminData(this.gridApi.api.getSelectedRows()).subscribe((data) => {
      console.log(data);
    });


  }

  onRowClicked(event): any {
    if (this.bookingService.isServiceConsumerClicked) {
      this.isServiceConsumerForm = true;
      this.isNewService = false;
      this.selectedData = event.data;
    } else if (this.commonService.isServiceNowClicked) {
      this.createServiceForm = true;
      this.isNewService = false;
      this.selectedData = event.data;
    }
  }

  closeForm(closedForm: object): any {
    switch(closedForm['name']) {
      case 'serviceConsumer':
        if (closedForm['isClosed']) {
          this.isServiceConsumerForm = false;
          this.fetchServiceConsumerData(this.eventListReqObj);
        }
        break;
      case 'serviceRequest':
      if (closedForm['isClosed']) {
        this.createServiceForm = false;
        this.fetchCreatedServiceData(this.eventListReqObj);
      }
      break;
    }
  }

}
