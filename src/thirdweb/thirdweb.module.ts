import { Module } from '@nestjs/common'
import { ThirdwebService } from './thirdweb.service';

@Module({
  imports: [],
  providers: [ThirdwebService],
  exports: [ThirdwebService]
})
export class ThirdWebModule {}
