import { Component, OnInit, OnChanges, ViewChild, ChangeDetectorRef, OnDestroy, SimpleChanges,
  DoCheck, AfterViewChecked, AfterContentInit, AfterContentChecked, AfterViewInit, SecurityContext } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { RowData } from './row-data';
import { Router } from '@angular/router';
import { OpenCreatedFormComponent } from './open-created-form/open-created-form.component';
import { UserType } from '../user-type';
import { NgxSpinnerService } from 'ngx-spinner';
import { BookingFormService } from '../booking-form/booking-form.service';
import { CommonService } from '../common.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { Subscription, Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { faCamera, faSignOutAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
  public gridOptions;
  // public eventListReqObj;
  public frameworkComponents;
  public user: UserType;
  public userRole: string;
  public userInfo;
  public eventBtnName = 'Create Event';
  public formHeaderName: string = '';
  public eventHeaderName = 'Events';
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
  public isProfileSpinner: boolean = false;


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
    this.gridOptions = {
      rowData: this.rowData
    };
   }

  ngOnInit() {
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
    this.loadProfilePhoto();
  }

  private loadProfilePhoto(): void {
    this.isProfileSpinner = true;
    const photoReqObj = {
      id: 'profileId'
    }
    this.subscriptions.push(this.bookingService.downloadImage(this.commonService.loggedInUser.userId, photoReqObj).subscribe((downloadPhotoResp) => {
      // if (downloadPhotoResp.size > 0) {
      //   let base64Data;
      //   const reader = new FileReader();
      //   reader.readAsDataURL(downloadPhotoResp);
      //   reader.onloadend = () => {
      //     base64Data = reader.result;
      //     const image = this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustUrl(base64Data));
      //     this.commonService.loggedInUser.photoSrc = image;
      //     // this.router.navigate(['/dashboard']);
      //     if (this.commonService.loggedInUser.photoSrc) {
      //       this.profileObj['maleSrc'] = this.commonService.loggedInUser.photoSrc;
      //       this.profileObj['photoLabel'] = 'Delete';
      //     }
      //     this.profileObj['maleSrc'] = this.commonService.loggedInUser.photoSrc ? this.commonService.loggedInUser.photoSrc
      //                                   : this.profileObj['maleSrc'];
      //     this.isProfileSpinner = false;
      //   };
      // } else {
      //   this.commonService.loggedInUser.photoSrc = '';
      //   this.isProfileSpinner = false;
      //   // this.router.navigate(['/dashboard']);
      // }
      this.isProfileSpinner = false;
      if (downloadPhotoResp && downloadPhotoResp[0] && downloadPhotoResp[0].imageResp) {
        this.profileObj['maleSrc'] = 'data:image/png;base64,' + downloadPhotoResp[0].imageResp;
        this.commonService.loggedInUser.photoSrc = this.profileObj['maleSrc'];
        this.profileObj['photoLabel'] = 'Delete';
      } else {
        this.profileObj['maleSrc'] = this.profileObj['maleSrc'];
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dashboardService.bookingCreatedObj = null;
  }

fetchListOfEvents(eventId?) {
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
  this.isOpenSideNavItem = false;
  this.commonService.isMemberShipClicked = false;
  this.spinner.show();
  this.allEventBindColumnDef();
  this.eventHeaderName = 'Events';
  this.eventBtnName = 'Create Event';
  this.formHeaderName = 'Event Details';
  this.rowData = null;
  this.resizeGridColumns();
  this.subscriptions.push(this.dashboardService.getAllEventList(this.commonService.loggedInUser).subscribe((resp) => {
    this.rowData = resp.eventList;
    if (eventId) {
      const selectionIndex = resp.eventList.indexOf(resp.eventList.find((item) => {return (item.eventId == eventId)}))
    // TODO Select row on the basis of the index
    // this.gridOptions.api.forEachNode((node) => {
    //   node.setSelected(node.data.id === eventId);
    // });
    // this.agGridElement.api.setIndex(selectionIndex);
    // this.gridOptions.api.forEachNode(node=> node.rowIndex ? 0 : node.setSelected(true));

      let nodes = this.gridOptions.api.getRenderedNodes();
      if (nodes.length) {
        nodes[selectionIndex].setSelected(true); //selects the first row in the rendered view
      }
    }
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
  this.isOpenSideNavItem = false;
  this.commonService.isMemberShipClicked = false;
  this.spinner.show();
  this.eventHeaderName = 'Service Providers';
  this.serviceProviderColumnDef();
  this.resizeGridColumns();
  this.eventBtnName = 'Create Service Provider';
  this.formHeaderName = 'Service Provider Details';
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
  this.isOpenSideNavItem = false;
  this.commonService.isMemberShipClicked = false;
  this.spinner.show();
  this.eventBtnName = 'Create Service Consumer';
  this.formHeaderName = 'Service Consumer Details';
  this.eventHeaderName = 'Service Consumers';
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
  this.isOpenSideNavItem = false;
  this.commonService.isMemberShipClicked = false;
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
  this.commonService.isMemberShipClicked = false;
  // this.createServiceForm = false;
  // this.isServiceConsumerForm = false;
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
  this.isOpenSideNavItem = false;
  this.commonService.isMemberShipClicked = false;
  this.spinner.show();
  this.eventBtnName = 'Create Service';
  this.formHeaderName = 'Service Request Details';
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

public openMembership(): void {
  this.spinner.show();
  this.bookingService.isInvitationClicked = false;
  this.bookingService.isAllEventBtnClicked = false;
  this.bookingService.isServiceConsumerClicked = false;
  this.bookingService.isServiceProviderClicked = false;
  this.commonService.isAdminUserClicked = false;
  this.commonService.isServiceNowClicked = false;
  this.commonService.isCouponCodeClicked = false;
  this.isInvitation = false;
  this.commonService.isMemberShipClicked = true;
  this.isOpenSideNavItem = false;
  this.eventBtnName = 'Create Membership';
  this.formHeaderName = 'Membership Details';
  this.eventHeaderName = 'Membership';
  this.membershipListColDef();
  this.resizeGridColumns();
  this.rowData = null;
  this.subscriptions.push(this.dashboardService.getMembershipList().subscribe((resp) => {
    if (resp) {
      this.rowData = resp.memberShipList;
    }
    this.spinner.hide();

  }, error => {
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
        headerName: 'Service Provider Id', field: 'serviceProvider.serviceProviderId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Organisation Name', field: 'serviceProvider.orgName', sortabke: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Activity Name', field: 'eventCategoryDetails.activityName', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Created Date', field: 'createdDate', sortable: true,
        filter: 'agDateColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      { headerName: 'Charges', field: 'charges', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'},
      // {
      //   headerName: 'Approved', field: 'approved', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
      //   cellRenderer: (data) => {
      //     return (data.value === true) ? 'Yes' : 'No';
      //   }
      // },
      {
        headerName: 'Country', field: 'address.country', sortabke: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'City', field: 'address.city', sortabke: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
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

  public membershipListColDef(): void {
    this.columnDefs = [
      {
        headerName: 'Membership Name', field: 'memberShipName', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      }, 
      {
        headerName: 'Membership Id', field: 'memberShipId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Service Provider Id', field: 'serviceProvider.serviceProviderId', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Organisation Name', field: 'serviceProvider.orgName', sortabke: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Area Indoor', field: 'areaIndoor', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Area Outdoor', field: 'areaOutdoor', sortable: true, filter: 'agNumberColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      // {
      //   headerName: 'Activity Name', field: 'eventCategoryDetails.activityName', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      // },
      {
        headerName: 'Created Date', field: 'createdDate', sortable: true,
        filter: 'agDateColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return data.value ? (new Date(data.value)).toLocaleDateString() : '';
        }
      },
      // {
      //   headerName: 'Approved', field: 'approved', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
      //   cellRenderer: (data) => {
      //     return (data.value === true) ? 'Yes' : 'No';
      //   }
      // },
      {
        headerName: 'Country', field: 'serviceProvider.address.country', sortabke: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'City', field: 'serviceProvider.address.city', sortabke: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto'
      },
      {
        headerName: 'Active', field: 'active', sortable: true, filter: 'agTextColumnFilter', cellClass: 'ui-grid-cell-contents-auto',
        cellRenderer: (data) => {
          return (data.value === true) ? 'Yes' : 'No';
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
    // tslint:disable-next-line:no-string-literal
    switch (closedForm['name']) {
      case 'serviceConsumer':
        // tslint:disable-next-line:no-string-literal
        this.isFormOpen = false;
        if (closedForm['isClosed']) {
          // this.isServiceConsumerForm = false;
          this.fetchServiceConsumerData();
        }
        break;
      case 'serviceRequest':
      // tslint:disable-next-line:no-string-literal
      this.isFormOpen = false;
      if (closedForm['isClosed']) {
        // this.createServiceForm = false;
        this.fetchCreatedServiceData();
      }
      break;
      case 'eventForm':
        if (closedForm['isClosed']) {
          this.fetchListOfEvents(closedForm['eventId']);
        }
        break;
      case 'couponCode':
        this.isFormOpen = false;
        if (closedForm['isClosed']) {
          this.fetchAllCouponCodes();
        }
        break;
      case 'eventSPForm':
        this.isFormOpen = false;
        if (closedForm['isClosed']) {
          this.fetchServiceProviderData();
        }
        break;
      case 'eventInvitationForm':
        this.isFormOpen = false;
        if (closedForm['isClosed']) {
          this.inviteUsersData();
        }
        break;
      case 'eventAdminForm':
        this.isFormOpen = false;
        if (closedForm['isClosed']) {
          this.adminUsersData();
        }
        break;
      case 'membershipForm':
        this.isFormOpen = false;
        if (closedForm['isClosed']) {
          this.openMembership();
        }
    }
  }

  public addProfilePhoto(event): any {
    this.profileObj['isProfileChanged'] = true;
    if (event.target.files.length > 0) {
      this.spinner.show();
      const file = event.target.files[0];
      const objectId = 'profileId'
      this.bookingService.uploadImage(file, this.commonService.loggedInUser.userId, objectId).subscribe((resp) => {
        if (resp && resp[0] && resp[0].imageResp)
        this.profileObj.maleSrc = "data:image/jpeg;base64," + resp[0].imageResp;
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
