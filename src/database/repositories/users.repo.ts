import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { USER_MODEL_PROVIDER } from '../database.module';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // includes the password hash (needed later for login)
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  // includes the hidden verification fields
  findByEmailWithVerification(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+emailVerificationTokenHash +emailVerificationExpiresAt')
      .exec();
  }

  findByVerificationTokenHash(hash: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ emailVerificationTokenHash: hash })
      .select('+emailVerificationTokenHash +emailVerificationExpiresAt')
      .exec();
  }

  create(data: Partial<User>): Promise<UserDocument> {
    return new this.userModel(data).save();
  }

  async setVerificationToken(id: string, hash: string, expiresAt: Date) {
    await this.userModel
      .updateOne(
        { _id: id },
        {
          $set: {
            emailVerificationTokenHash: hash,
            emailVerificationExpiresAt: expiresAt,
          },
        },
      )
      .exec();
  }

  // marks verified and burns the token so it can't be reused
  async markEmailVerified(id: string) {
    await this.userModel
      .updateOne(
        { _id: id },
        {
          $set: { emailVerified: true },
          $unset: {
            emailVerificationTokenHash: '',
            emailVerificationExpiresAt: '',
          },
        },
      )
      .exec();
  }
}
