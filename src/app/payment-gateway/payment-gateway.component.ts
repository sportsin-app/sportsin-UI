import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.scss']
})
export class PaymentGatewayComponent implements OnInit {

  constructor(private commonservice: CommonService) { }

  ngOnInit() {
  }

  // I have all below fields values
paytm = {
  MID: "UpnZit34783080376706", // paytm provide
  WEBSITE: "WEBSTAGING", // paytm provide
  INDUSTRY_TYPE_ID: "Retail", // paytm provide
  CHANNEL_ID: "WEB", // paytm provide
  ORDER_ID: 'TEST_'  + new Date().getTime(), // unique id
  CUST_ID: "Customer001", // customer id
  MOBILE_NO: "7777777777", // customer mobile number
  EMAIL: "abc@mailinator.com", // customer email
  TXN_AMOUNT: "10.00", // transaction amount
  CALLBACK_URL: "http://localhost:4200/callback", // Call back URL that i want to redirect after payment fail or success
};

submitForm() {
  // I will do API call and will get CHECKSUMHASH.
  this.commonservice.createChecksum(this.paytm).subscribe((res) => {
    // As per my backend i will get checksumhash under res.data
    this.paytm['CHECKSUMHASH'] = res.data;
    // than i will create form
    this.createPaytmForm();
  });
};

createPaytmForm() {
 const my_form: any = document.createElement('form');
  my_form.name = 'paytm_form';
  my_form.method = 'post';
  my_form.action = 'https://securegw-stage.paytm.in/order/process';

  const myParams = Object.keys(this.paytm);
  for (let i = 0; i < myParams.length; i++) {
    const key = myParams[i];
    let my_tb: any = document.createElement('input');
    my_tb.type = 'hidden';
    my_tb.name = key;
    my_tb.value = this.paytm[key];
    my_form.appendChild(my_tb);
  };

  document.body.appendChild(my_form);
  my_form.submit();
// after click will fire you will redirect to paytm payment page.
// after complete or fail transaction you will redirect to your CALLBACK URL
};

}
