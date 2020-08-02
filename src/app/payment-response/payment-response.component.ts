import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment-response',
  templateUrl: './payment-response.component.html',
  styleUrls: ['./payment-response.component.scss']
})
export class PaymentResponseComponent implements OnInit {
  public paymentRespObj = {'MID': '', 'ORDERID': '', 'CHECKSUMHASH': ''};

  constructor(public commonService: CommonService,
  public http: HttpClient) { }

  ngOnInit() {
    this.paymentRespObj['MID'] = this.commonService.paymentObject['MID'];
    this.paymentRespObj['ORDERID'] = this.commonService.paymentObject['ORDER_ID'];
    this.paymentRespObj['CHECKSUMHASH'] = this.commonService.paymentObject['CHECKSUMHASH'];
    this.getPaymentStatus();
  }


  getPaymentStatus(): void {
    const url = 'https://securegw-stage.paytm.in/order/status';
    this.http.post(url, this.paymentRespObj).subscribe((resp) => {
      console.log('Payment response :'+JSON.stringify(resp));
    });
  }
}
