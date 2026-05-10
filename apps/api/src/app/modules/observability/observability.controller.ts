import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ObservabilityService } from './observability.service';

@Controller()
export class ObservabilityController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get('metrics')
  async getMetrics(@Res() response: Response) {
    response.setHeader('Content-Type', this.observabilityService.getContentType());
    response.send(await this.observabilityService.getMetrics());
  }
}

