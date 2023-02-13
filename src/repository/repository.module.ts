import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module';
import { TourneyRepository } from './tourney.repository';

@Module({
  imports: [PrismaModule],
  providers: [TourneyRepository],
  exports: [TourneyRepository]
})
export class RepositoryModule {

}