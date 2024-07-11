import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class MessageParser {
    parseMessage(message: String) {
        const segments = message.split('\n');
        const patientSegment = segments.find(seg => seg.startsWith('PRS'));
        const detailsSegment = segments.find(seg => seg.startsWith('DET'));

        if (!patientSegment || !detailsSegment) {
            throw new HttpException('Required segments are missing.', HttpStatus.BAD_REQUEST);
        }

        const patientFields = patientSegment.split('|');
        if (patientFields.length < 9) {
            throw new HttpException('PRS segment does not have enough fields.', HttpStatus.BAD_REQUEST);
        }

        const detailsFields = detailsSegment.split('|');

        if (detailsFields.length < 5) {
            throw new HttpException('DET segment does not have enough fields.', HttpStatus.BAD_REQUEST);
        }

        const nameComponents = patientFields[4].split('^');

        if (!nameComponents || nameComponents.length < 2) {
            throw new HttpException('Name components in PRS segment are missing or incomplete.', HttpStatus.BAD_REQUEST);
        }

        const [lastName, firstName, middleName] = nameComponents
        const dateOfBirth = this.formatDate(patientFields[8]);
        const primaryCondition = detailsFields[4];

        return {
            fullName: {
                lastName,
                firstName,
                middleName: middleName || undefined,
            },
            dateOfBirth,
            primaryCondition,
        };
    }

    private formatDate(date: string): String {
        if (!/^\d{8}$/.test(date)) {
            throw new HttpException('Date of birth format is incorrect in PRS segment.', HttpStatus.BAD_REQUEST);
        }

        return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }
}
