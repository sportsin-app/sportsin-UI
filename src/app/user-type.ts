export class UserType {
  userId: string = '';
  password: string = '';
  // confirmPassword = '';
}

export class PaytmRespObj {
  MID:string;
  WEBSITE: string;
  INDUSTRY_TYPE_ID: string;
  CHANNEL_ID: string;
  ORDER_ID: string;
  CUST_ID: string;
  MOBILE_NO: string;
  EMAIL: string;
  TXN_AMOUNT: string;
  CALLBACK_URL: string;
  CHECKSUMHASH?: string
}

export class RazorPayCreateOrderConfig {
    amount: number;  // amount in the smallest currency unit
    currency: string;
    receipt: string;
    payment_capture: number;
    userId: string;
    userRole: string;
    comment: string;
    eventId: string;
    eventCreationFee: boolean;
    registrationFee: boolean;
    paymentCaptured: boolean;
}

export class RazorPayPaymentConfig {
      key: string; // add razorpay key here
      name: string;
      description: string;
      amount: number;
      currency: string;
      order_id: string; // Need to replace order id value with id in the first step
      prefill: {
        name: string;
        email: string;
        contact: number;
      };
      notes: object;
      theme: {
        color: string;
      };
      handler: any;
      modal: any;
    }

export class ProfilePhotoObj {
    maleSrc: any;
    femaleSrc: any;
    isFemaleProfile: boolean;
    isProfileChanged: boolean;
    photoLabel: string;
}
