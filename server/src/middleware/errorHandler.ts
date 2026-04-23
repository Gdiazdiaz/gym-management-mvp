import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logging.error(err);
    if (res.headersSent) {
    return next(err)
    }

    return res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.Node_ENV === 'production' ? undefined : err.message
    });
}