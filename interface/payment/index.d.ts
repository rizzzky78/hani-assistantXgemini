import { RecordPurchaseData } from "@interface/customer";

export type PaymentProvider =
  | "GOPAY"
  | "SHOPEPAY"
  | "DANA"
  | "QRIS"
  | "BSI"
  | "UNPAID"
  | "TRANSFER"

export type CustomerPaymentProofDto = {
  orderId: string;
  metadata: {
    tagName: string;
    phoneNumber: string;
    paymentVia: PaymentProvider;
    image: string;
  };
  data: RecordPurchaseData;
};

export type CustomerPaymentProof = {
  timeStamp: string;
  isVerified: boolean;
  metadata: {
    orderId: string;
    transactionId: string;
  };
  payer: {
    custId?: string;
    tagName: string;
    phoneNumber: string;
  };
  payment: {
    via: PaymentProvider;
    nominal: number;
    image: string;
  };
};
