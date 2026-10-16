import { Module } from '@nestjs/common';
import { RecruitmentsController } from './recruitments.controller';
import { RecruitmentsService } from './recruitments.service';
import { RecruitmentLogger } from './recruitments.logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recruitment } from './entities/recruitment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recruitment]),
    AuthModule
  ],

  controllers: [RecruitmentsController],
  providers: [RecruitmentsService, RecruitmentLogger]
})
export class RecruitmentsModule {}
