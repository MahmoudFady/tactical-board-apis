import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { MailService } from 'src/core/shared/services/email.service';
import { UsersRepository } from 'src/database/repositories/users.repo';
import { RegisterDto } from './dtos/register.dto';
import { UserDocument } from 'src/database/schemas/user.schema';
import { LoggerService } from 'src/core/shared/services/logger.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AppException } from 'src/core/exceptions/app.exception';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private static readonly SALT_ROUNDS = 12;
  private static readonly VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
  private static readonly RESEND_COOLDOWN_MS = 60 * 1000; // 1 min

  constructor(
    private readonly usersService: UsersRepository,
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new AppException({
        msg: 'Email is already registered',
        code: 409,
        key: 'email_already_registered',
      });
    }

    const hashed = await bcrypt.hash(dto.password, AuthService.SALT_ROUNDS);

    let user: UserDocument;
    try {
      user = await this.usersService.create({
        firstName: dto.firstName,
        otherNames: dto.otherNames,
        email: dto.email,
        age: dto.age,
        password: hashed,
      });
    } catch (err: any) {
      // race condition: unique index hit between check and insert
      if (err?.code === 11000) {
        throw new AppException({
          msg: 'Email is already registered',
          code: 409,
          key: 'email_already_registered',
        });
      }
      throw err;
    }

    // A mail failure must not fail registration; the user can request a resend.
    this.sendVerification(user)
      .then()
      .catch((e) => {
        this.loggerService.log('error', 'registration_email_failed', {
          email: user.email,
          error: e.message,
        });
      });

    return {
      ...this.toSafeUser(user),
      message: 'Registered. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationTokenHash(
      this.hashToken(token),
    );

    if (
      !user ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new AppException({
        msg: 'Invalid or expired verification token',
        code: 400,
        key: 'invalid_or_expired_verification_token',
      });
    }

    await this.usersService.markEmailVerified(user.id);
    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    // Same response in every case, so this endpoint can't be used
    // to discover which emails are registered.
    const generic = {
      message:
        'If that email is registered and not yet verified, a new link has been sent.',
    };

    const user = await this.usersService.findByEmailWithVerification(email);
    if (!user || user.emailVerified) return generic;

    // Cooldown: skip if a token was issued less than a minute ago.
    if (user.emailVerificationExpiresAt) {
      const issuedAt =
        user.emailVerificationExpiresAt.getTime() -
        AuthService.VERIFICATION_TTL_MS;
      if (Date.now() - issuedAt < AuthService.RESEND_COOLDOWN_MS)
        return generic;
    }

    await this.sendVerification(user);
    return generic;
  }

  // ---- helpers ----

  private async sendVerification(user: UserDocument) {
    try {
      const token = randomBytes(32).toString('hex');
      await this.usersService.setVerificationToken(
        user.id,
        this.hashToken(token),
        new Date(Date.now() + AuthService.VERIFICATION_TTL_MS),
      );
      await this.mailService.sendVerificationEmail(
        user.email,
        user.firstName,
        token,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  // plain object with `id`, without password / verification fields / __v
  private toSafeUser(user: UserDocument) {
    const {
      _id,
      __v,
      password,
      emailVerificationTokenHash,
      emailVerificationExpiresAt,
      createdAt,
      updatedAt,
      ...rest
    } = user.toObject();
    return { id: _id.toString(), ...rest };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new AppException({
        msg: 'Invalid email or password',
        code: 400,
        key: 'invalid_email_or_password',
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppException({
        msg: 'Invalid email or password',
        code: 400,
        key: 'invalid_email_or_password',
      });
    }

    if (!user.emailVerified) {
      throw new AppException({
        msg: 'Email is not verified',
        code: 400,
        key: 'email_not_verified',
      });
    }

    return {
      token: jwt.sign(
        { id: user.id },
        this.configService.get('app.jwtSecret')!,
        { expiresIn: '1h' },
      ),
      user: this.toSafeUser(user),
    };
  }
}
