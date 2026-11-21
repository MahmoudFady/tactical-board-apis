export interface IWFRequest {
  _id: string;
  wfId: string;
  dataId: string;
  requestNumber: string;
  hasResult: boolean;
  serviceSlug: string;
  serviceName: string;
  createUser: string;
  stepCode: string;
  caseCode: string;
  stepMessage: string;
  caseMessage: string;
  reqStatusCode: string;
  reqStatusCodePIC: string;
  allowedActions: string[];
  canContinue: boolean;
  phoneNumber: string;
  otherPaymentRequestNumbers: any[];
  archived: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  GARequestId: string;
}
