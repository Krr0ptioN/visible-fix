import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return { message: 'VisibleFix API' };
  }

  getHealth() {
    return { status: 'ok' as const };
  }
}
