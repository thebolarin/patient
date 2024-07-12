import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rawBody from 'raw-body';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const contentType = req.headers['content-type'];

    if (contentType === 'application/json') {
      return next();
    }

    if (contentType === 'text/plain' || contentType === 'application/octet-stream') {
      try {
        const body = await rawBody(req, { encoding: 'utf-8' });

        if (contentType === 'text/plain') {
          req.body = { message: body };
        } else if (contentType === 'application/octet-stream') {
          req.body = JSON.parse(body);
        }

        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  }
}

