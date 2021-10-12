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
    amount?: number;  // amount in the smallest currency unit
    currency?: string;
    receipt?: string;
    payment_capture?: number;
    userId?: string;
    userRole?: string;
    comment?: string;
    eventId?: string;
    eventCreationFee?: boolean;
    registrationFee?: boolean;
    paymentCaptured?: boolean;
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

export class MapDetails {
  latitude: any;
  longitude: any;
}

export class Address {
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  pinCode?: number;
  latitude?: number;
  longitude?: number
  streetName?: string;
  crossStreet?: string;
  municipalitySubdivision?: string;
  municipality?: string;
  countrySecondarySubdivision?: string;
  countrySubdivision?: string;
  countrySubdivisionName?: string;
  postalCode?: number
  countryCode?: string;
  countryCodeISO3?: string;
  freeformAddress?: string;
  localName?: string;
  street?: string;
}

export class PaymentDetails {
  actualAmount?: number;
  calculatedAmount?: number;
  cgstPercentage?: number;
  createdDate?: Date;
  currency?: string;
  gstPercentage?: number;
  gstTaxAmnt?: number;
  gstTinNr?: string;
  icgstPercentage?: number;
  lastUpdatedDate?: Date;
  payable?: boolean;
  paymentContext?: string;
  paymentDescription?: string;
  paymentTitle?: string;
  premiumEventFee?: boolean;
  premiumMemShipFee?: boolean;
  regularEventFee?: boolean;
  regularMemShipFee?: boolean;
  supremeEventFeeCityWise?: boolean;
  supremeEventFeeNationWide?: boolean;
  supremeEventFeeStateWise?: boolean;
  supremeMemShipFeeCityWise?: boolean;
  supremeMemShipFeeNationWide?: boolean;
  supremeMemShipFeeStateWise?: boolean;
}

export class EventCategory {
  category: string;
  activityName?: string;
  measurement?: string;
  distance?: string;
  height?: string;
  eventMeasureName?: string;
  charges?: any;
  commonPlan?: any;
}

