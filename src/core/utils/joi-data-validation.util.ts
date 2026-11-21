import { plainToInstance } from 'class-transformer';
import { getClassSchema } from 'nestjs-joi';
import { AppException } from '../exceptions/app.exception';

export const JoiDataValidationUtil = <T>(
  dto: any,
  data: { [k: string]: any },
): T => {
  const bodyInput = plainToInstance(dto, data, {
    excludeExtraneousValues: true,
  }) as T;
  const dataSchema = getClassSchema(dto);
  const error = dataSchema.validate(bodyInput, { abortEarly: false }).error;
  if (error) {
    console.log(error.details);
    throw new AppException({
      msg: error.details
        .reduce((acc, err) => {
          acc.push(err.message.replace(/['"]/g, ''));
          return acc;
        }, [] as string[])
        .join(', '),
      key: 'validation_error',
      code: 400,
    });
  }
  return bodyInput;
};
