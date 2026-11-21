import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, maxlength: 100 })
  firstName!: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  otherNames!: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    maxlength: 255,
  })
  email!: string;

  @Prop({ required: true, min: 1, max: 120 })
  age!: number;

  // never returned by default queries
  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  // SHA-256 of the emailed token (the raw token is never stored)
  @Prop({ type: String, select: false })
  emailVerificationTokenHash?: string;

  @Prop({ type: Date, select: false })
  emailVerificationExpiresAt?: Date;

  @Prop({ type: Date })
  createdAt?: Date;
  @Prop({ type: Date, select: false })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ emailVerificationTokenHash: 1 }, { sparse: true });
UserSchema.index({ email: 1 }, { unique: true });
export type IUser = User & { _id: string };
export type UserDocument = HydratedDocument<User>;
