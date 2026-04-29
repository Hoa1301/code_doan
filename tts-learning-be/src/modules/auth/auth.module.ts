import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

// UNUSED ENTITIES:
// import { Role } from './entities/role.entity';
// import { Permission } from './entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      // UNUSED ENTITIES:
      // Role,
      // Permission,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRESIN') || '1d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [UsersService, AuthService, JwtStrategy],
  exports: [UsersService, AuthService],
})
export class AuthModule {}
