import { Customer } from "@interface/customer";
import { ApprovalOrderData, CustomerOrderData } from "@interface/order-data";
import { CustomerPaymentProof } from "@interface/payment";
import { Product } from "@interface/product";

export type CreatePDFDtos = {
  /**
   * Title of PDF table
   */
  title?: string;
  /**
   * Header of table
   * @example thead: [ "Data 1", "Data 2" ]
   */
  thead: string[];
  /**
   * Body content table
   * @example tbody: [[ "My data 1", "My Data 2" ], [ "My data 3", "My data 4" ]]
   */
  tbody: string[][];
  /**
   * Footer note, optional
   * @example bodyNote: "@copyright 2024"
   */
  footerNote?: string;
  /**
   * Autotable font size, optional
   * @default 9
   */
  tableFontSize?: number;
  /**
   * Create instance sub table before append main table
   */
  createSubTable?: boolean;
  /**
   * Sub Table data
   */
  subTable?: {
    /**
     * Title of subtable
     */
    subTitle: string;
    /**
     * Sub table column head
     */
    subThead: string[];
    /**
     * Sub table body
     */
    subTbody: string[][];
  };
  /**
   * Force align cells centered,
   * if `true` it will align center cells no 1-7,
   * otherwise align center cells no 1-2 only
   */
  forceAlignCells?: boolean;
  /**
   * Select premade custom cells alignment or create instance new one
   */
  preferSelectOptCellsAlign?: CustomOptionalDocs;
};

export type CustomOptionalDocs =
  | TypeDocs
  | {
      [k: number]: {
        halign?: "center" | "middle" | "start";
        valign?: "center" | "middle" | "start";
      };
    };

export type MapPremadeCells = {
  [K in CustomOptionalDocs]: {
    [K: number]: {
      halign?: "center" | "middle" | "start";
      valign?: "center" | "middle" | "start";
    };
  };
};

type CourierService = {
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

/**
 * ECO
 */
type CourierServicesEco = {
  /** Economy Service */
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

/**
 * REG
 */
type CourierServicesReg = {
  /** Reguler Service */
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

/**
 * EXP
 */
type CourierServicesExp = {
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
};

type CourierResult = {
  code: string;
  name: string;
  costs: [CourierServicesEco, CourierServicesReg, CourierServicesExp];
};

type DestinationDetails = {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
};

type OriginDetails = {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
};

type Query = {
  courier: string;
  origin: string;
  destination: string;
  weight: number;
};

type Status = {
  code: number;
  description: string;
};

type RajaOngkirResponse = {
  status: "OK" | (string & {});
  data: {
    query: Query;
    status: Status;
    origin_details: OriginDetails;
    destination_details: DestinationDetails;
    results: CourierResult[];
  };
};

type AxiosRajaOngkirResponse = {
  statusText: "OK";
  data: {
    rajaongkir: {
      query: Query;
      status: Status;
      origin_details: OriginDetails;
      destination_details: DestinationDetails;
      results: CourierResult[];
    };
  };
};

type City = {
  city_id: string;
  province_id: string;
  province: string;
  type: "Kabupaten" | "Kota";
  city_name: string;
  postal_code: string;
};

type CustomerBuckets = {
  id: string;
  username: string;
  buckets: {
    productId: string;
    productName: string;
    price: number;
    currentStock: number;
    qtyAmount: number;
  }[];
};

type TypeDocs =
  | "products"
  | "orders"
  | "payments"
  | "approvals"
  | "invoices"
  | "custdata"
  | "cmdmodules";

type TypeDto = {
  data: InferDocuments;
  type: TypeDocs;
};

interface OverrideDocuments extends ApprovalOrderData {}

interface OverrideCustData extends Customer {}

type MappedDocs = {
  /**
   * Exclusively only for Invoices
   */
  overrideDocs?: OverrideDocuments;
  /**
   * Exclusively only for Customer
   */
  overrideCustData?: OverrideCustData;
  /**
   * Centered Title of documents
   */
  title: string;
  /**
   * Table Head
   */
  thead: string[];
  /**
   * Table Body
   */
  tbody: string[][];
  /**
   * Table Footer
   */
  tfoot: string;
  /**
   * Table Font Size
   */
  tfontsize: number;
  cellsOption: TypeDocs;
  /**
   * **Sub Table**
   *
   * Override, append sub table before main table.
   *
   * [Sub Table]
   *
   * *- - - content - - -*
   *
   * [Main Table]
   *
   * *- - - content - - -*
   */
  override?: {
    subtitle: string;
    subthead: string[];
    subtbody: string[][];
    tfonsize: number;
  };
  forceAxis?: {
    top_y: {
      text: number;
      table: number;
    };
    bot_y: {
      text: number;
      table: number;
    };
  };
};

type InferDocuments = {
  products?: Product[];
  orders?: CustomerOrderData[];
  approvals?: ApprovalOrderData[];
  payments?: CustomerPaymentProof[];
  invoices: ApprovalOrderData;
  custdata?: Customer;
  cmdModules?: MappedCmdModule[];
};

type MapInputData = ({ data, type }: TypeDto) => MappedDocs;

type CreatePDFDto = {
  document: MappedDocs;
  type?: TypeDocs;
};

/**
 * PDF file `Promise<Buffer>`
 */
interface PDFDocument extends Buffer {}

type CreatePDF = ({ document, type }: CreatePDFDto) => Promise<{
  /**
   * PDF File, type: Buffer
   */
  doc: PDFDocument;
}>;

type PrintPurchaseHistory = ({ document, type }: CreatePDFDto) => Promise<{
  /**
   * PDF File, type: Buffer
   */
  doc: PDFDocument;
}>;

type MappedCmdModule = {
  cmdKeys: string;
  category: "admin" | "customer" | "general";
  permission: "admin" | "common";
  typeArgs: string;
  expectedArgs: string;
  exampleArgs: string;
  description: string;
};

interface CustomCellsOption extends MapPremadeCells {}

export type CustomAligmentCells = (type: TypeDocs) => CustomCellsOption;

export type CreateRaw = () => PDFDocument