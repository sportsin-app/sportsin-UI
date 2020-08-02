import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../common.service';
import { NgxSpinnerService } from '../../../node_modules/ngx-spinner';

@Component({
  selector: 'app-service-now',
  templateUrl: './service-now.component.html',
  styleUrls: ['./service-now.component.scss']
})
export class ServiceNowComponent implements OnInit, OnChanges {

  public serviceRequestForm;
  public createEventResp: string = '';
  public serviceComment: string = '';
  public conversationList: Array<any> = [];
  public disabledSubmit: boolean = false;
  @Input('selectedServiceRequest') public selectedServiceRequest = null;
  @Input('isNewServiceRequest') public isNewServiceRequest: boolean = false;
  @Output() closeServiceRequest = new EventEmitter<object>();
  constructor(public modalService: NgbModal,
    public fb: FormBuilder,
    public commonService: CommonService,
    public spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges() {
    this.disabledSubmit = false;
    this.resetForm();
  }

  resetForm(): void {
    if (this.isNewServiceRequest) {
      this.serviceRequestForm = this.fb.group({
        requestorId: [this.commonService.loggedInUser.userId],
        requestorRole: [this.commonService.loggedInUser.userRole],
        requestedForUser: [null, Validators.required],
        requestedForUserRole: ['SERVICE_CONSUMER'],
        requestShortDescription: [null, Validators.required],
        requestLongDescription: [null, Validators.required],
        conversationHistory:[null],
        requestStatus: ['WORK IN PROGRESS', Validators.required]
      });

    } else {
      this.conversationList = this.selectedServiceRequest.conversationHistory;
      if (this.selectedServiceRequest.requestStatus === 'RESOLVED') {
        this.disabledSubmit = true;
      }
      this.serviceRequestForm = this.fb.group({
        requestId: [this.selectedServiceRequest.requestId],
        requestorId: [this.selectedServiceRequest.requestorId],
        requestorRole: [this.selectedServiceRequest.requestorRole],
        requestedForUser: [this.selectedServiceRequest.requestedForUser, Validators.required],
        requestedForUserRole: [this.selectedServiceRequest.requestedForUserRole],
        requestShortDescription: [this.selectedServiceRequest.requestShortDescription, Validators.required],
        requestLongDescription: [this.selectedServiceRequest.requestLongDescription, Validators.required],
        conversationHistory:this.selectedServiceRequest.conversationHistory ? this.fb.array(this.selectedServiceRequest.conversationHistory)
                            : [null],
        requestStatus: [this.selectedServiceRequest.requestStatus, Validators.required]
      });

    }
  }

  dismissMessage() {
    this.modalService.dismissAll();
    this.createEventResp = '';
      this.closeServiceRequest.emit({'name': 'serviceRequest', 'isClosed': true});
  }

  onSubmit(content): void {
    this.spinner.show();
    let submitReq;
    if (this.isNewServiceRequest) {
      this.serviceRequestForm.get('conversationHistory').setValue([]);
      submitReq = this.commonService.createServiceRequest(this.serviceRequestForm['value']);
    } else {
      let conversationHistory = [this.addNewConversation()];
      if (this.conversationList.length > 0) {
        conversationHistory = [...this.conversationList, ...conversationHistory];
      }
      if (this.serviceComment && this.serviceComment !== '') {
        this.serviceRequestForm.get('conversationHistory').controls = this.fb.array(conversationHistory);
        this.serviceRequestForm['value']['conversationHistory'] = conversationHistory;
      }
      submitReq = this.commonService.updateServiceRequest(this.serviceRequestForm['value']);
    }
    submitReq.subscribe((data) => {
      this.spinner.hide();
      this.createEventResp = data.responseHeader.decription;
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    });
  }

  addNewConversation(): Object {
    const requestId = this.selectedServiceRequest ? this.selectedServiceRequest.requestId : '';
    const conversationHistory = {
        'comment': this.serviceComment,
        'requestId': requestId,
        'userId': this.commonService.loggedInUser.userId,
        'userName': this.commonService.loggedInUser.name,
        'userRole': this.commonService.loggedInUser.userRole,
        'commentDate': new Date()
      }
      return conversationHistory;

  }

}
