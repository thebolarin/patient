import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { Patient } from './interfaces/patient.interface';
import { HttpException } from '@nestjs/common';
import { MessageParser } from '../common/utils/message-parser.util';
import { PatientRepository } from './patient.repository';
import { ProcessMessageDto } from './dto/process-message.dto';

describe('PatientService', () => {
  let service: PatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientService, MessageParser, PatientRepository],
    }).compile();

    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse message correctly', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    const result: Patient = {
      fullName: {
        lastName: 'Smith',
        firstName: 'John',
        middleName: 'A',
      },
      dateOfBirth: '1980-01-01',
      primaryCondition: 'Common Cold',
    };

    expect(service.processMessage(body)).toEqual(result);
  });

  it('should store and fetch parsed message correctly', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    expect(service.getAllPatients().length).toEqual(0);
    service.processMessage(body);
    expect(service.getAllPatients().length).toEqual(1);
  });

  it('should throw error when PRS segment is incomplete', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    expect(() => service.processMessage(body)).toThrow(HttpException);
  });

  it('should throw error when patient date of birth is missing', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
    ||DATA^TYPE|123456|P|2.5
    EVT|TYPE|20230502112233
    PRS|1|9876543210^^^Location^ID||Smith^John^A|||M||
    DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    expect(() => service.processMessage(body)).toThrow(HttpException);
  });

  it('should throw error when patient first name is missing', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
        ||DATA^TYPE|123456|P|2.5
        EVT|TYPE|20230502112233
        PRS|1|9876543210^^^Location^ID||Smith^^A|||M|19800101|
        DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    expect(() => service.processMessage(body)).toThrow(HttpException);
  });

  it('should throw error when patient last name is missing', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
            ||DATA^TYPE|123456|P|2.5
            EVT|TYPE|20230502112233
            PRS|1|9876543210^^^Location^ID||^John^A|||M|19800101|
            DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    expect(() => service.processMessage(body)).toThrow(HttpException);
  });

  it('should throw error when date of birth format is incorrect', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|1980-01-01|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`
    };

    expect(() => service.processMessage(body)).toThrow(HttpException);
  });

  it('should throw error when DET segment is incomplete', () => {
    const body: ProcessMessageDto = {
      message: `MSG|^~\\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I`
    };

    expect(() => service.processMessage(body)).toThrow(Error);
  });
});
