/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../entities/user.entity';
import { UserAddress } from '../../entities/user-address.entity';
import { UserAccount } from '../../entities/user-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAddress, UserAccount]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
