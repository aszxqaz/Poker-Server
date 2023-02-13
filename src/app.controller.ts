import { Controller, Get, Render } from '@nestjs/common'
const path = require('path')

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {}
}
