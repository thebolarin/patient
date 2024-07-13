import { Test, TestingModule } from '@nestjs/testing';
import { PatientRepository } from './patient.repository';
import { Patient } from './interfaces/patient.interface';

describe('PatientRepository', () => {
  let repository: PatientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientRepository],
    }).compile();

    repository = module.get<PatientRepository>(PatientRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save patient data correctly', () => {
    const patientData: Patient = {
      fullName: {
        lastName: 'Doe',
        firstName: 'Jane',
        middleName: 'M',
      },
      dateOfBirth: '1990-05-15',
      primaryCondition: 'Flu',
    };

    const result = repository.save(patientData);
    expect(result).toEqual(patientData);

    const allPatients = repository.findAll();
    expect(allPatients).toContainEqual(patientData);
  });

  it('should retrieve all patient data correctly', () => {
    const patientData1: Patient = {
      fullName: {
        lastName: 'Doe',
        firstName: 'Jane',
        middleName: 'M',
      },
      dateOfBirth: '1990-05-15',
      primaryCondition: 'Flu',
    };

    const patientData2: Patient = {
      fullName: {
        lastName: 'Smith',
        firstName: 'John',
        middleName: 'A',
      },
      dateOfBirth: '1980-01-01',
      primaryCondition: 'Common Cold',
    };

    repository.save(patientData1);
    repository.save(patientData2);

    const allPatients = repository.findAll();
    expect(allPatients).toEqual([patientData1, patientData2]);
  });
});
