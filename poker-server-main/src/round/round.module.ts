import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { RoundService } from "./round.service";

@Module({
  imports: [PrismaModule],
  providers: [RoundService],
  exports: [RoundService]
})
export class RoundModule {

}