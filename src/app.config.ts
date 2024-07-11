import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig: any = process.env;

import * as Joi from 'joi';

export const AppConfigValidationSchema = Joi.object({
  PORT: Joi.number().required(),
});
