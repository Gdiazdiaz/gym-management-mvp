import http from 'http'
import express from 'express'
import { loggingHandler } from './middleware/loggingHandler'
import { routeNotFound } from './middleware/notFound'
import membersRoutes from './routes/members.routes'
import plansRoutes from './routes/plan.routes'
import checkInRoutes from './routes/checkIns.routes'
import membershipsRoutes from './routes/memberships.routes'
import { SERVER_HOSTNAME, SERVER_PORT } from './config/config'
import * as logging from './config/logging'

export const router = express()
export let httpServer: ReturnType<typeof http.createServer>

export const Main = () => {
    logging.info('Starting server...');
    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());
    
    logging.info('Logging & Configuration')
    router.use(loggingHandler)

    logging.info('Define Controller Routing')
    router.get('/main/healtcheck', (req, res, next) => {
        return res.status(200).json({ status: 'ok' });
    })

    router.use('/api/members', membersRoutes);
    router.use('/api/plans', plansRoutes);
    router.use('/api/check-ins', checkInRoutes);
    router.use('/api/memberships', membershipsRoutes);

    logging.info('Define Controller Routing')
    router.use(routeNotFound)

    logging.info('Start Server')
    httpServer = http.createServer(router);
    httpServer.listen(process.env.PORT || 3000, () => {
        logging.info('Server is running on port' + SERVER_HOSTNAME + ':' + SERVER_PORT);
    });
}

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main()