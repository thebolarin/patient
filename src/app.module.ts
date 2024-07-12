import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    PatientModule,
    ThrottlerModule.forRoot([{
			ttl: 60,
			limit: 1500,
		}]),
  ],
  controllers: [AppController],
  providers: [AppService,
    {
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		},
  ],
})
export class AppModule {}
