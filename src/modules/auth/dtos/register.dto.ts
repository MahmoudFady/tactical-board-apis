import { JoiSchema, JoiSchemaOptions } from 'nestjs-joi';
import Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@JoiSchemaOptions({ allowUnknown: false })
export class RegisterDto {
  @ApiProperty()
  @Expose()
  @JoiSchema(Joi.string().trim().required().max(100))
  firstName!: string;

  @ApiProperty()
  @Expose()
  @JoiSchema(Joi.string().trim().required().max(150))
  otherNames!: string;

  @ApiProperty()
  @Expose()
  @JoiSchema(Joi.string().trim().lowercase().email().max(255).required())
  email!: string;

  @ApiProperty()
  @Expose()
  @JoiSchema(Joi.number().integer().min(1).max(120).required())
  age!: number;

  @ApiProperty()
  @Expose()
  @JoiSchema(
    Joi.string()
      .min(8)
      .max(72)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      .required()
      .messages({
        'string.pattern.base':
          'password must contain at least one uppercase letter, one lowercase letter and one number',
      }),
  )
  password!: string;
}
