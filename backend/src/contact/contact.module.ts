import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactLogger } from './contact.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSetting } from './entities/contact.entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactSetting]),
    AuthModule
  ],

  controllers: [ContactController],
  providers: [ContactService, ContactLogger]
})
export class ContactModule {}
