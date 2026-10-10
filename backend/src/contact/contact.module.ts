import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactLogger } from './contact.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactSetting } from './entities/contact.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactSetting])
  ],

  controllers: [ContactController],
  providers: [ContactService, ContactLogger]
})
export class ContactModule {}
