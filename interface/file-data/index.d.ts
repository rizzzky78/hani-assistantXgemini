import { CustomerInvoice } from "@interface/customer";

export type FileDataInvoice = {
  metadata: CustomerInvoice;
  data: {
    pdf: string;
  };
};

export type FileDataAttachment = {
  metadata: {
    timeStamp: string;
  };
  data: {
    attachment: string;
  };
};
