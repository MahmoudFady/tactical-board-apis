import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './repositories/users.repo';

export const USER_MODEL_PROVIDER = 'USER_MODEL';

@Global()
@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule, // ensure ConfigService is available
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('database.uri'),
          }),
        }),
      ],
      providers: [
        {
          provide: USER_MODEL_PROVIDER,
          useFactory: (connection: Connection) => {
            const model = connection.model(User.name, UserSchema);
            return model;
          },
          inject: [getConnectionToken()],
        },
        UsersRepository,
      ],
      exports: [USER_MODEL_PROVIDER, UsersRepository],
    };
  }
}
