import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../common.service';
import * as checksum_lib from '../../../checksum/checksum.js';
import $ from 'jquery';

// const express = require('express');
import * as express from 'express';
const app = express();

app.get('/callback', (req, res) => {
console.log('callback');
});

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.scss']
})
export class PaymentGatewayComponent implements OnInit {
  public paytm = {};
  public checksum = '';

  constructor(private commonservice: CommonService,
    public changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.paytm = {
      MID: "UpnZit34783080376706", // paytm provide
      WEBSITE: "WEBSTAGING", // paytm provide
      INDUSTRY_TYPE_ID: "Retail", // paytm provide
      CHANNEL_ID: "WEB", // paytm provide
      ORDER_ID: 'ORDER_'  + new Date().getTime(), // unique id
      CUST_ID: "Customer001", // customer id
      MOBILE_NO: "7777777777", // customer mobile number
      EMAIL: "abc@mailinator.com", // customer email
      TXN_AMOUNT: "10.00", // transaction amount
      CALLBACK_URL: "http://localhost:4200/callback", // Call back URL that i want to redirect after payment fail or success
    };
this.createPaytmForm();
}

createPaytmForm() {
this.commonservice.paymentGateway(this.paytm).subscribe((resp) => {
  this.commonservice.paymentObject = resp;
  // this.checksum = resp;
  // this.paytm['CHECKSUMHASH'] = resp;
  // this.changeDetectorRef.detectChanges();
  // const my_form: any = document.createElement('form');
  // my_form.name = 'paytm_form';
  // my_form.method = 'post';
  // my_form.action = 'https://securegw-stage.paytm.in/order/process';

  // const myParams = Object.keys(this.paytm);
  // for (let i = 0; i < myParams.length; i++) {
  //   const key = myParams[i];
  //   let my_tb: any = document.createElement('input');
  //   my_tb.type = 'hidden';
  //   my_tb.name = key;
  //   my_tb.value = this.paytm[key];
  //   my_form.appendChild(my_tb);
  // };
  // document.body.appendChild(my_form);
  // this.changeDetectorRef.detectChanges();
  // my_form.submit();

  let txn_url = 'https://securegw-stage.paytm.in/order/process';
        let form_fields = "";
        for (let x in resp) {
            form_fields += "<input type='hidden' name='"+x+"' value='"+resp[x]+"'/>";
        }
        // form_fields += "<input type='hidden' name='CHECKSUMHASH' value='"+this.checksum+"'/>";
        var html = `<html>
                        <body>
                            <center>
                                <h1>Please wait! Do not refresh the page.
                                </h1>
                            </center>
                            <form method="post" action="`+txn_url+`" id="formSubmit" name="paytm">`+form_fields+`
                            </form>
                            <script type="text/javascript">document.f1.submit()
                            </script>
                        </body>
                    </html>`;
  document.body.innerHTML = html;
  this.changeDetectorRef.detectChanges();
(document.getElementById('formSubmit') as HTMLFormElement).submit();
  $('#formSubmit').submit(function(resp){
    console.log('payment resp is :'+resp);
  });
      // $('#')
  })
};



}
