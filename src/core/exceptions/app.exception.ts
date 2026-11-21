import { HttpException } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    private readonly err: {
      msg: string;
      code: number;
      key: string;
      details?: { [k: string]: any };
      errLevel?: string;
      isHidden?: boolean;
    },
  ) {
    super(err.msg, err.code);
  }
  get error() {
    return { errLevel: '1', isHidden: false, ...this.err };
  }
}
