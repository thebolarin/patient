import {
    IsString,
    IsNotEmpty,
} from 'class-validator';

export class ProcessMessageDto {
    @IsString({
        message: 'Message is required.',
    })
    @IsNotEmpty()
    readonly message: String;
}