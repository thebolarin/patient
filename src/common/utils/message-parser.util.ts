import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class MessageParser {
    parseMessage(message: String) {
        const segments = message.split('\n');
        const patientSegment = segments.find(seg => seg.startsWith('PRS'));
        const detailsSegment = segments.find(seg => seg.startsWith('DET'));
        if (!patientSegment || !detailsSegment) {
            throw new HttpException('Required segments (PRS OR DET) missing.', HttpStatus.BAD_REQUEST);
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

        if (!lastName) {
            throw new HttpException('Patent last name is required', HttpStatus.BAD_REQUEST);
        }

        if (!firstName) {
            throw new HttpException('Patent first name is required', HttpStatus.BAD_REQUEST);
        }

        const dateOfBirth = patientFields[8];

        if (!dateOfBirth) {
            throw new HttpException('Patent Date of Birth is required', HttpStatus.BAD_REQUEST);
        }

        const formattedDate = this.formatDate(dateOfBirth);

        const primaryCondition = detailsFields[4];

        if (!primaryCondition) {
            throw new HttpException('Patent primary condition is required', HttpStatus.BAD_REQUEST);
        }

        return {
            fullName: {
                lastName,
                firstName,
                middleName: middleName || undefined,
            },
            dateOfBirth: formattedDate,
            primaryCondition,
        };
    }

    private formatDate(date: string): String {
        if (!/^\d{8}$/.test(date)) {
            throw new HttpException('Date of birth format is incorrect in PRS segment.', HttpStatus.BAD_REQUEST);
        }

        const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

        if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
            throw new HttpException('Date of birth is invalid.', HttpStatus.BAD_REQUEST);
        }

        return formattedDate;
    }
}
