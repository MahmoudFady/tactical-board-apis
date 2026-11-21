import { PipeTransform, Injectable } from '@nestjs/common';
import { JoiDataValidationUtil } from '../utils/joi-data-validation.util';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: any) {}

  transform(value: any) {
    return JoiDataValidationUtil(this.schema, value);
  }
}
