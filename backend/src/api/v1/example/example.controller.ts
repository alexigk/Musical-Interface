import { DIContainer, SocketsService } from '@app/services';
import { Request, Response, NextFunction, Router } from 'express';

export class ExampleController {

    public applyRoutes(): Router {
        const router = Router();
        router.post('/treatSomeone', this.treatSomeone);

        return router;
    }

    public treatSomeone(req: Request, res: Response) {
        const message: string = req.body.message;
        const event: string = req.body.event;

        const socketService = DIContainer.get(SocketsService);
        socketService.broadcast(event, message);
    }

}
