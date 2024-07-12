import { Body, Controller, Get, Post } from '@nestjs/common';
import { PatientService } from './patient.service';
import { Patient } from './interfaces/patient.interface';
import { ProcessMessageDto } from './dto/process-message.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  getAll(): Patient[] {
    return this.patientService.getAllPatients();
  }

  @Post('process')
    processMessage(@Body() processMessageDto: ProcessMessageDto): Patient {
    return this.patientService.processMessage(processMessageDto);
  }
}
