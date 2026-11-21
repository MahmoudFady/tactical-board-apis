import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@JoiSchemaOptions({ allowUnknown: false })
export class ResendVerificationEmailDto {
  @ApiProperty()
  @Expose()
  @JoiSchema(Joi.string().trim().required().max(100))
  email!: string;
}
