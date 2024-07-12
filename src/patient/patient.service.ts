import { Injectable } from '@nestjs/common';
import { Patient } from './interfaces/patient.interface';
import { MessageParser } from '../common/utils/message-parser.util';
import { PatientRepository } from './patient.repository';
import { ProcessMessageDto } from './dto/process-message.dto';

@Injectable()
export class PatientService {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly messageParser: MessageParser
  ) {}

  processMessage(processMessageDto: ProcessMessageDto): Patient {
      const patientData: Patient = this.messageParser.parseMessage(processMessageDto.message);
      this.patientRepository.save(patientData);
      return patientData;
  }

  getAllPatients(): Patient[] {
    const patients = this.patientRepository.findAll()
    return patients
  }
}
