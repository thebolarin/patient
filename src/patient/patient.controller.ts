import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './interfaces/patient.interface';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  getAll(): Patient[] {
    return this.patientService.getAllPatients();
  }

  @Post('process')
  processMessage(@Req() req: any): Patient {
    const message = req.rawBody;
    return this.patientService.processMessage(message);
  }
}
