import { Module, Global } from "@nestjs/common";
import { TransformService } from "./transform.service";

@Global()
@Module({
  providers: [TransformService],
  exports: [TransformService]
})
export class TransformModule {

}