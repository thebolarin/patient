import { Injectable } from '@nestjs/common';
import { Patient } from './interfaces/patient.interface';

@Injectable()
export class PatientRepository {
  private patients = [];

  save(patientData: Patient) {
    this.patients.push(patientData);
    return patientData;
  }

  findAll() {
    return this.patients;
  }
}
