import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { RawBodyMiddleware } from '../common/middleware/raw-body.middleware';
import { MessageParser } from '../common/utils/message-parser.util';
import { PatientRepository } from './patient.repository';

@Module({
  controllers: [PatientController],
  providers: [PatientService, MessageParser, PatientRepository],
})
export class PatientModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware)
    .forRoutes(
      { path: 'patient/process', method: RequestMethod.POST },
    );
  }
}
