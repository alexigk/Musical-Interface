import { Request, Response, NextFunction, Router } from 'express';

import { MusicLibrary } from "../music_library";

export class MusicLibController {
    public applyRoutes(): Router {
        const router = Router();
        router.post('/get', this.get);

        return router;
    }

    public get(req: Request, res: Response) {
        res.json(MusicLibrary);
    }
}