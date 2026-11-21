import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dtos/register.dto';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { AuthService } from './auth.service';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResendVerificationEmailDto } from './dtos/resend-verfication-email.dto';
import { LoginDto } from './dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(
    @Body(new JoiValidationPipe(RegisterDto)) registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  verifyEmail(
    @Body(new JoiValidationPipe(VerifyEmailDto)) dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  resendVerification(
    @Body(new JoiValidationPipe(ResendVerificationEmailDto))
    dto: ResendVerificationEmailDto,
  ) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('login')
  login(@Body(new JoiValidationPipe(LoginDto)) dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
