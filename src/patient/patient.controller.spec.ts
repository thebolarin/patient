import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from './interfaces/patient.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MessageParser } from '../common/utils/message-parser.util';
import { PatientRepository } from './patient.repository';

describe('PatientController', () => {
  let controller: PatientController;
  let service: PatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [PatientService, MessageParser, PatientRepository],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should parse a valid message', () => {
    const req = {
      rawBody: `MSG|^~\\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold` };

    const patient: Patient = {
      fullName: { lastName: 'Smith', firstName: 'John', middleName: 'A' },
      dateOfBirth: '1980-01-01',
      primaryCondition: 'Common Cold',
    };

    jest.spyOn(service, 'processMessage').mockReturnValue(patient);

    expect(controller.processMessage(req)).toEqual(patient);
  });

  it('should throw error when parsing fails', () => {
    const req = {
      rawBody: `MSG|^~\\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold` };

    jest.spyOn(service, 'processMessage').mockImplementation(() => {
      throw new HttpException('Invalid message format', HttpStatus.BAD_REQUEST);
    });

    expect(() => controller.processMessage(req)).toThrow(HttpException);
  });

  it('should get all stored parsed messages', () => {
    const patients: Patient[] = [
      {
        fullName: { lastName: 'Smith', firstName: 'John', middleName: 'A' },
        dateOfBirth: '1980-01-01',
        primaryCondition: 'Common Cold',
      },
    ];

    jest.spyOn(service, 'getAllPatients').mockImplementation(() => patients);

    expect(controller.getAll()).toEqual(patients);
  });
});
