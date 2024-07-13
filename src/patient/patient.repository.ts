import { Injectable } from '@nestjs/common';
import { Patient } from './interfaces/patient.interface';

@Injectable()
export class PatientRepository {
  private patients: Patient[] = [];

  save(patientData: Patient): Patient {
    this.patients.push(patientData);
    return patientData;
  }

  findAll(): Patient[] {
    return this.patients;
  }
}
