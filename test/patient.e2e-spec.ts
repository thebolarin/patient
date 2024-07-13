import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PatientModule } from '../src/patient/patient.module';
import { Patient } from 'src/patient/entities/patient.entity';

describe('PatientController (e2e)', () => {
    let app: INestApplication;
    const patient: Patient = {
        fullName: {
            lastName: "Smith",
            firstName: "John",
            middleName: "A"
        },
        dateOfBirth: "1980-01-01",
        primaryCondition: "Common Cold"
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [PatientModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/GET patient', async () => {
        const { body } = await request(app.getHttpServer())
            .get('/patient')
            .expect(200);

        expect(body).toEqual([]);
    });

    it('/POST patient/process (JSON)', async () => {
        const processMessageDto = {
            message: `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold` };

        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(processMessageDto)
            .set('Content-Type', 'application/json')
            .expect(201);

        expect(body).toEqual(patient);

        const { body: patients } = await request(app.getHttpServer())
            .get('/patient')
            .expect(200);

        expect(patients).toEqual([patient]);
    });

    it('/POST patient/process (Plain Text)', async () => {
        const message = `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`;

        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(message)
            .set('Content-Type', 'text/plain')
            .expect(201);

        expect(body).toEqual(patient);
    });

    it('/POST patient/process (Missing Segments)', async () => {
        const message = `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
    ||DATA^TYPE|123456|P|2.5
    EVT|TYPE|20230502112233
    PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|`;

        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(message)
            .set('Content-Type', 'text/plain')
            .expect(400);

        expect(body.message).toEqual("Required segments (PRS OR DET) missing.");
    });

    it('/POST patient/process (Insufficient Fields in PRS)', async () => {
        const message = `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|M|19800101|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`;
        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(message)
            .set('Content-Type', 'text/plain')
            .expect(400);

        expect(body.message).toEqual("PRS segment does not have enough fields.");
    });

    it('/POST patient/process (Insufficient Fields in DET)', async () => {
        const message = `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19800101|
DET|1|I|Common Cold`;
        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(message)
            .set('Content-Type', 'text/plain')
            .expect(400);

        expect(body.message).toEqual("DET segment does not have enough fields.");
    });

    it('/POST patient/process (Incorrect Date Format)', async () => {
        const message = `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|198021|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`;
        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(message)
            .set('Content-Type', 'text/plain')
            .expect(400);

        expect(body.message).toEqual("Date of birth format is incorrect in PRS segment.");
    });

    it('/POST patient/process (Invalid Date)', async () => {
        const message = `MSG|^~\&|SenderSystem|Location|ReceiverSystem|Location|20230502112233
||DATA^TYPE|123456|P|2.5
EVT|TYPE|20230502112233
PRS|1|9876543210^^^Location^ID||Smith^John^A|||M|19802121|
DET|1|I|^^MainDepartment^101^Room 1|Common Cold`;
        const { body } = await request(app.getHttpServer())
            .post('/patient/process')
            .send(message)
            .set('Content-Type', 'text/plain')
            .expect(400);

        expect(body.message).toEqual('Date of birth is invalid.');
    });
});
