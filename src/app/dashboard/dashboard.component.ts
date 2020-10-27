import { Component, OnInit, OnChanges, ViewChild, ChangeDetectorRef, OnDestroy, SimpleChanges,
  DoCheck, AfterViewChecked, AfterContentInit, AfterContentChecked, AfterViewInit, SecurityContext } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { RowData } from './row-data';
import { Router } from '../../../node_modules/@angular/router';
import { OpenCreatedFormComponent } from './open-created-form/open-created-form.component';
import { UserType } from '../user-type';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';
import { BookingFormService } from '../booking-form/booking-form.service';
import { CommonService } from '../common.service';
import { MediaMatcher } from '../../../node_modules/@angular/cdk/layout';
import { Subscription } from '../../../node_modules/rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { faCamera, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { WindowRefService } from '../window-ref.service';
import { ElementRef, Renderer2, NgZone } from '@angular/core';

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
  // public eventListReqObj;
  public frameworkComponents;
  public user: UserType;
  public userRole: string;
  public userInfo;
  public eventBtnName = 'Create Event';
  public formHeaderName: string = '';
  public eventHeaderName = 'List of All Events';
  public isInvitation = false;
  public sideNavItems: Array<string> = [];
  public rowSelection = 'multiple';
  public defaultColDef;
  // public isServiceConsumerForm = false;
  public selectedData: object;
  public isNewService = false;
  public isUpdateBtn = false;
  // public createServiceForm = false;
  public isFormOpen = false;
  private subscriptions: Subscription[] = [];
  public profileObj = {
    maleSrc: '../../assets/profile_pic_male.jpg',
    femaleSrc: '../../assets/profile_pic_female.jpg',
    isFemaleProfile: false,
    isProfileChanged: false,
    photoLabel: 'Add'
  };
  public faCamera = faCamera;
  public faLogout = faSignOutAlt;
  public isOpenSideNavItem = false;


  mobileQuery: MediaQueryList;
  // fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  // fillerContent = Array.from({length: 50}, () =>
  //     `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
  //      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
  //      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
  //      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
  //      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  // tslint:disable-next-line:variable-name
  private _mobileQueryListener: () => void;


  @ViewChild('agGridElement', {static: false}) public agGridElement;
  @ViewChild('navElement', {static: false}) public navElement;

  constructor(public dashboardService: DashboardService,
              public router: Router,
              public spinner: NgxSpinnerService,
              public bookingService: BookingFormService,
              public commonService: CommonService,
              public changeDetectorRef: ChangeDetectorRef,
              public media: MediaMatcher,
              public windowService: WindowRefService,
              private sanitizer: DomSanitizer,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              private ngZone: NgZone) {
    this.frameworkComponents = {
      childMessageRenderer: OpenCreatedFormComponent
    };
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);
   }

  ngOnInit() {
    if (this.commonService.loggedInUser.photoSrc) {
      this.profileObj['maleSrc'] = this.commonService.loggedInUser.photoSrc;
      this.profileObj['photoLabel'] = 'Delete';
    }
    this.profileObj['maleSrc'] = this.commonService.loggedInUser.photoSrc ? this.commonService.loggedInUser.photoSrc
                                  : this.profileObj['maleSrc'];
    if (this.commonService.loggedInUser.userRole) {
      this.userRole = this.commonService.loggedInUser.userRole;
      this.bookingService.isAdminUser = (this.userRole === 'ADMIN' || this.userRole === 'SUPER_USER') ? true : false;
      if (this.bookingService.isAdminUser) {
        this.sideNavItems = ['Profile', 'Dashboard', 'Coupon codes'];
      } else {
        this.sideNavItems = ['Profile', 'Dashboard'];
      }
    // } else {
    //   this.isAdminUser = false;
    //   this.bookingService.isAdminUser = false;
    }
    this.dashboardService.bookingCreatedObj = null;
    this.allEventBindColumnDef();
    // this.eventListReqObj = { serviceProvider: { id: 'SISP001' } };
    if (this.bookingService.isAllEventBtnClicked) {
      this.fetchListOfEvents();
    } else if (this.bookingService.isServiceConsumerClicked) {
      this.fetchServiceConsumerData();

    } else if (this.bookingService.isServiceProviderClicked) {
      this.fetchServiceProviderData();
    } else if (this.bookingService.isInvitationClicked) {
      this.inviteUsersData();
    } else if (this.commonService.isAdminUserClicked) {
      this.adminUsersData();
    } else if (this.commonService.isServiceNowClicked) {
      this.fetchCreatedServiceData();
    } else if (this.commonService.isCouponCodeClicked) {
      this.fetchAllCouponCodes();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dashboardService.bookingCreatedObj = null;
  }

fetchListOfEvents(event?) {
  this.bookingService.isServiceProviderClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isInvitationClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isCouponCodeClicked = false;
  this.bookingService.isAllEventBtnClicked = true;
  this.commonService.isAdminUserClicked = false;
  this.isInvitation = false;
  // this.isServiceConsumerForm = false;
  // this.createServiceForm = false;
  this.isFormOpen = false;
  this.isOpenSideNavItem = false;
  this.spinner.show();
  this.allEventBindColumnDef();
  this.eventHeaderName = 'List of All Events';
  this.eventBtnName = 'Create Event';
  this.formHeaderName = 'Event';
  this.rowData = null;
  this.resizeGridColumns();
  this.subscriptions.push(this.dashboardService.getAllEventList(this.commonService.loggedInUser).subscribe((resp) => {
    this.rowData = resp.eventList;
    this.spinner.hide();
  }, error => {
    this.spinner.hide();
  }));
}

onGridReady(params) {
  this.gridApi = params;
    // this.gridColumnApi = params.columnApi;

  params.api.sizeColumnsToFit();
}

logoutFn() {
  this.ngZone.run(() => {
    this.router.navigate(['/']);
  })
}

fetchServiceProviderData() {
  this.bookingService.isServiceProviderClicked = true;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isInvitationClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isCouponCodeClicked = false;
  this.commonService.isAdminUserClicked = false;
  this.isInvitation = false;
  // this.isServiceConsumerForm = false;
  // this.createServiceForm = false;
  this.isFormOpen = false;
  this.isOpenSideNavItem = false;
  this.spinner.show();
  this.eventHeaderName = 'List of Service Provider';
  this.serviceProviderColumnDef();
  this.resizeGridColumns();
  this.eventBtnName = 'Create Service Provider';
  this.formHeaderName = 'Service Provider';
  this.rowData = null;
  this.subscriptions.push(this.dashboardService.fetchServiceProviders().subscribe((resp) => {
    this.rowData = resp.providerList;
    this.spinner.hide();
  }, error => {
    this.spinner.hide();
  }));
}
fetchServiceConsumerData() {
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.bookingService.isServiceConsumerClicked = true;
  this.bookingService.isInvitationClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isCouponCodeClicked = false;
  this.commonService.isAdminUserClicked = false;
  this.isInvitation = false;
  // this.createServiceForm = false;
  this.isFormOpen = false;
  this.isOpenSideNavItem = false;
  this.spinner.show();
  this.eventBtnName = 'Create Service Consumer';
  this.formHeaderName = 'Service Consumer';
  this.eventHeaderName = 'List of Service Consumer';
  this.serviceConsumerColumnDef();
  this.resizeGridColumns();
  this.rowData = null;
  this.subscriptions.push(this.dashboardService.getServiceConsumerEventList().subscribe((resp) => {
    this.rowData = resp.consumerList;
    this.spinner.hide();
  }, error => {
    this.spinner.hide();
  }));
}

inviteUsersData() {
  this.bookingService.isInvitationClicked = true;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isCouponCodeClicked = false;
  this.commonService.isAdminUserClicked = false;
  // this.isServiceConsumerForm = false;
  // this.createServiceForm = false;
  this.isFormOpen = false;
  this.isOpenSideNavItem = false;
  this.spinner.show();
  this.eventBtnName = 'Create Invitation';
  this.formHeaderName = 'Invitation';
  this.eventHeaderName = 'Invitation List';
  this.isInvitation = true;
  this.invitationListColDef();
  this.resizeGridColumns();
  this.rowData = null;
  this.subscriptions.push(this.dashboardService.getInvitationList().subscribe((resp) => {
    this.rowData = resp.inviteList;
    this.spinner.hide();

  }, error => {
    this.spinner.hide();
  }));
}

adminUsersData(): any {
  this.bookingService.isInvitationClicked = false;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isCouponCodeClicked = false;
  this.commonService.isAdminUserClicked = true;
  this.isInvitation = false;
  this.isOpenSideNavItem = false;
  // this.createServiceForm = false;
  // this.isServiceConsumerForm = false;
  this.isFormOpen = false;
  this.spinner.show();
  this.eventBtnName = 'Create Admin User';
  this.formHeaderName = 'Admin';
  this.eventHeaderName = 'Admin User List';
  this.adminListColDef();
  this.resizeGridColumns();
  this.rowData = null;
  this.subscriptions.push(this.dashboardService.getAdminList().subscribe((resp) => {
    this.rowData = resp.adminUserList;
    this.spinner.hide();

  }, error => {
    this.spinner.hide();
  }));
}

fetchCreatedServiceData(): void {
  this.bookingService.isInvitationClicked = false;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.commonService.isAdminUserClicked = false;
  this.commonService.isServiceNowClicked = true;
  this.commonService.isCouponCodeClicked = false;
  this.isInvitation = false;
  // this.isServiceConsumerForm = false;
  this.isFormOpen = false;
  this.isOpenSideNavItem = false;
  this.spinner.show();
  this.eventBtnName = 'Create Service';
  this.formHeaderName = 'Service Request';
  this.eventHeaderName = 'Service Request';
  this.serviceListColDef();
  this.resizeGridColumns();
  this.rowData = null;
  let getServiceList;
  if (this.commonService.loggedInUser.userRole === 'SERVICE_PROVIDER') {
    getServiceList = this.commonService.findAllServiceRequestOfSP(this.commonService.loggedInUser.userId);
  } else if (this.commonService.loggedInUser.userRole === 'ADMIN' || this.commonService.loggedInUser.userRole === 'HELPDESK'
            || this.commonService.loggedInUser.userRole === 'SUPER_USER') {
              getServiceList = this.dashboardService.getServiceReqList();
            }
  this.subscriptions.push(getServiceList.subscribe((resp) => {
    this.rowData = resp.serviceRequestList;
    this.spinner.hide();
  }));
}



allEventBindColumnDef(): any {
    this.columnDefs = [
      {
        headerName: 'Event Name', field: 'eventName', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      }, {
        headerName: 'Event Id', field: 'eventId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Created Date', field: 'createdDate', sortable: true,
        filter: 'agDateColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      { headerName: 'Charges', field: 'charges', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Approved', field: 'approved', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return (data.value === true) ? 'Yes' : 'No';
        }
      },
      {
        headerName: 'Active', field: 'active', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return (data.value === true) ? 'Yes' : 'No';
        }
      }
    ];
  }

  serviceProviderColumnDef(): any {
    this.columnDefs = [
      {
        headerName: 'Service Provider Name', field: 'orgName', sortable: true,
        filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Service Provider Id', field: 'serviceProviderId', sortable: true,
        filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      { headerName: 'Contact Person', field: 'spoc', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Email', field: 'email', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'

      }, {
        headerName: 'Contact', field: 'contact.mobilePrimary', sortable: true,
        filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'City', field: 'address.city', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      }
    ];
  }

  serviceConsumerColumnDef(): any {
    this.columnDefs = [
      {
        headerName: 'First Name', field: 'firstName', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      { headerName: 'Consumer Id', field: 'serviceConsumerId', sortable: true,
      filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'},
      {
        headerName: 'Email', field: 'email', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'

      }, {
        headerName: 'Age Group', field: 'ageGroup', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'

      }, {
        headerName: 'Created Date', field: 'createdDate', sortable: true,
        filter: 'agDateColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      }, {
        headerName: 'Last Updated Date', field: 'lastUpdatedDate', sortable: true,
        filter: 'agDateColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      }, {
        headerName: 'Gender', field: 'gender', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'

      }, {
        headerName: 'Contact', field: 'mobile', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'City', field: 'address.city', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      }
    ];
  }

  invitationListColDef() {
    this.columnDefs = [
      {
        headerCheckboxSelection: true, checkboxSelection: true, width: 40, minWidth: 40, maxWidth: 150
      }, {
      headerName: 'Organization', field: 'orgName', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    }, {
      headerName: 'Invitation Id', field: 'invitationId', sortable: true,
      filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    }, {
      headerName: 'Contact Person', field: 'spoc', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    }, {
      headerName: 'Contact', field: 'contact.mobilePrimary', sortable: true,
      filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    }, {
      headerName: 'Email', field: 'emailId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
    }, {
      headerName: 'Invitation Sent', field: 'invitationSent', sortable: true,
      filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
      cellRenderer: (data) => {
        return (data.value === true) ? 'Yes' : 'No';
      }
    }, {
      headerName: 'City', field: 'address.city', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
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
    }, {
      headerName: 'Email', field: 'email', sortable: true, filter: 'agTextColumnFilter',
      cellClass: 'ui-grid-cell-contents-auto', editable: true
    }, {
      headerName: 'Admin Id', field: 'adminId', sortable: true, filter: 'agTextColumnFilter',
      cellClass: 'ui-grid-cell-contents-auto', editable: false
    }, {
      headerName: 'Role', field: 'role', sortable: true, filter: 'agTextColumnFilter',
      cellClass: 'ui-grid-cell-contents-auto', editable: false
    }, {
      headerName: 'Contact', field: 'contact.mobilePrimary', sortable: true,
      filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto', editable: true
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
    ];
  }

  public couponCodesColumnDef(): void {
    this.columnDefs = [
      {
        headerName: 'Coupon code', field: 'couponCode', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Coupon code context', field: 'couponCodeContext', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Discount percentage', field: 'discountPercentage', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Actual amount', field: 'actualAmount', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Discount amount', field: 'discountAmount', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Min amount limit', field: 'minAmtLimit', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Max allowed discount Amount', field: 'maxAllowedDiscountAmt', sortable: true, cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Active', field: 'active', sortable: true, cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? 'Yes' : 'No';
        }
      },
      {
        headerName: 'Valid from', field: 'validFrom', sortable: true, cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      {
        headerName: 'Valid to', field: 'validTo', sortable: true, cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      }
    ];
  }

  resizeGridColumns() {
    setTimeout(() => {
      if (this.agGridElement) {
        this.agGridElement.columnApi.autoSizeColumns();
        this.agGridElement.api.sizeColumnsToFit();
      }
    });
  }

  createEvent(event) {
    this.isFormOpen = true;
    this.selectedData = {};
    this.isNewService = true;
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.api.getSelectedRows();
  }

  updateAdmin() {
    this.subscriptions.push(this.dashboardService.updateAdminData(this.gridApi.api.getSelectedRows()).subscribe((data) => {
      console.log(data);
    }));


  }

  onRowClicked(event): any {
    this.isNewService = false;
    this.selectedData = event.data;
    this.isFormOpen = true;
  }

  closeForm(closedForm: object): any {
    this.isFormOpen = false;
    // tslint:disable-next-line:no-string-literal
    switch (closedForm['name']) {
      case 'serviceConsumer':
        // tslint:disable-next-line:no-string-literal
        if (closedForm['isClosed']) {
          // this.isServiceConsumerForm = false;
          this.fetchServiceConsumerData();
        }
        break;
      case 'serviceRequest':
      // tslint:disable-next-line:no-string-literal
      if (closedForm['isClosed']) {
        // this.createServiceForm = false;
        this.fetchCreatedServiceData();
      }
      break;
      case 'eventForm':
        if (closedForm['isClosed']) {
          this.fetchListOfEvents();
        }
        break;
      case 'couponCode':
        if (closedForm['isClosed']) {
          this.fetchAllCouponCodes();
        }
        break;
      case 'eventSPForm':
        if (closedForm['isClosed']) {
          this.fetchServiceProviderData();
        }
        break;
      case 'eventInvitationForm':
        if (closedForm['isClosed']) {
          this.inviteUsersData();
        }
        break;
      case 'eventAdminForm':
        if (closedForm['isClosed']) {
          this.adminUsersData();
        }
        break;
    }
  }

  public addProfilePhoto(event): any {
    this.profileObj['isProfileChanged'] = true;
    if (event.target.files.length > 0) {
      this.spinner.show();
      const file = event.target.files[0];
      this.bookingService.uploadImage(file, this.commonService.loggedInUser.userId).subscribe((resp) => {
        this.profileObj.maleSrc = "data:image/jpeg;base64,"+resp.imageResp;
        this.spinner.hide();
      });
    }
  }

  public downloadPhoto(): void {
    this.spinner.show();
    this.bookingService.downloadImage(this.commonService.loggedInUser.userId).subscribe((downloadResp) => {
      let base64Data;
      const reader = new FileReader();
      reader.readAsDataURL(downloadResp);
      reader.onloadend = () => {
        base64Data = reader.result;
        const image = this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustUrl(base64Data));
        this.profileObj.maleSrc = image;
        this.profileObj['photoLabel'] = 'Delete';
        this.spinner.hide();
      };
    });
  }

  public openSideNavItem(eventName): void {
    this.bookingService.isInvitationClicked = false;
    this.bookingService.isAllEventBtnClicked = false;
    this.bookingService.isServiceConsumerClicked = false;
    this.bookingService.isServiceProviderClicked = false;
    this.commonService.isAdminUserClicked = false;
    this.commonService.isServiceNowClicked = false;
    this.isInvitation = false;
    this.isFormOpen = false;
    this.rowData = null;
    switch(eventName) {
      case 'Profile':
        this.isOpenSideNavItem = true;
        break;
      case 'Coupon codes':
        this.eventHeaderName = eventName;
        this.eventBtnName = 'Create coupon';
        this.formHeaderName = 'Create Coupon';
        this.couponCodesColumnDef();
        this.fetchAllCouponCodes();
        break;
      default:
        this.fetchListOfEvents();
        break;
    }
  }

  ngAfterViewChecked(): void {
    const element = document.getElementsByClassName('mat-drawer-inner-container');
    if (element.length >= 1) {
      this.renderer.setAttribute(element[0], 'overflow', 'hidden !important');
    }
  }

  public fetchAllCouponCodes(): void {
    this.spinner.show();
    this.bookingService.isServiceProviderClicked = false;
    this.bookingService.isServiceConsumerClicked = false;
    this.bookingService.isInvitationClicked = false;
    this.commonService.isServiceNowClicked = false;
    this.commonService.isCouponCodeClicked = true;
    this.bookingService.isAllEventBtnClicked = false;
    this.isInvitation = false;
    // this.isServiceConsumerForm = false;
    // this.createServiceForm = false;
    this.isFormOpen = false;
    this.isOpenSideNavItem = false;
    this.subscriptions.push(this.commonService.getAllCouponCodes().subscribe((data) => {
      this.spinner.hide();
      if (data['promoCodeList']) {
        this.rowData = data['promoCodeList'];
      }
    }));
  }

  ngOnDestroy(): void {
    // tslint:disable-next-line: deprecation
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
