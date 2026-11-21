declare namespace Express {
  interface Request {
    correlationId?: string;
    startTime?: number;
    wfRequest?: any;
    userInfo?: {
      id: string;
    };
  }
}
