import { DIContainer, SocketsService } from '@app/services';
import { Request, Response, NextFunction, Router } from 'express';
import { MusicLibrary } from '../music_library';
/**
 * Messages
 * -------------------------------------
 * "now_playing": {
 *  "album": albumIndex,
 *  "track": trackIndex
 * }
 * 
 * "play_state": string (
 *  'playing'    // We are now playing :)
 *  'paused'     // We are paused
 *  'stopped'    // We are stopped (so play will enqueue next)
 * )
 * 
 * 
 */

class SongIndex {
    public album: number;
    public track: number;
    
    constructor(ai: number, ti: number) {
        this.album = ai;
        this.track = ti;
    }
};

class SongQueue {
    private tracks: Array<SongIndex>;
    private ptr: number = 0;

    constructor() {
        this.tracks = new Array<SongIndex>();
    }

    public enq(ai: number, ti: number) {
        this.tracks.push(new SongIndex(ai, ti));
    }

    public getTracksOnCursor(numTracks: number) : SongIndex[] {

        const trackStart = Math.max(0, this.ptr - numTracks);
        const trackEnd = Math.min(this.tracks.length - 1, this.ptr + numTracks);

        return this.tracks.slice(trackStart, trackEnd + 1);
    }

    public hasAnyTracks() : boolean {
        return this.tracks.length != 0;
    }

    public getCurrent() : SongIndex {
        if (this.ptr >= this.tracks.length)
            return null;
        
        return this.tracks[this.ptr];
    }

    public skip() : boolean {
        this.ptr += 1;

        if (this.ptr > this.tracks.length) {
            this.ptr = this.tracks.length - 1;
            return false;
        } else {
            return true;
        }
    }
}

export class PlayerController {
    public applyRoutes(): Router {
        var router = Router();
        router.post('/setPlayState/:target', this.setPlayState.bind(this));
        router.post('/enqueue/:album_id/:track_id', this.enqueue.bind(this));
        router.post('/getQueue/:numTracks', this.getQueue.bind(this));
        return router;
    }

    private queue : SongQueue;
    private isPlaying: boolean = false;


    constructor() {
        this.queue = new SongQueue();
    }

    public getQueue(req: Request, res: Response) {
        res.json(this.queue.getTracksOnCursor(Number(req.params.numTracks)));
    }

    public enqueue(req: Request, res: Response) {
        this.queue.enq(Number(req.params.album_id), Number(req.params.track_id));
        res.sendStatus(200);
    }

    public setPlayState(req: Request, res: Response) {
        const socketService = DIContainer.get(SocketsService);
        var shouldBroadcast = false;

        switch (req.params.target) {
            case 'toggle': {
                if (!this.isPlaying) {
                    const songIdx = this.queue.getCurrent();
                    socketService.broadcast('now_playing', {"album": songIdx.album, "track": songIdx.track});    
                }

                this.isPlaying = !this.isPlaying;

                shouldBroadcast = true;
            } break;

            case 'playing': {

                console.log("[Logic] Play Received");

                const songIdx = this.queue.getCurrent();
                socketService.broadcast('now_playing', {"album": songIdx.album, "track": songIdx.track});

                shouldBroadcast = !this.isPlaying;
                this.isPlaying = true;

            } break;

            case 'paused': {
                console.log("[Logic] Pause Received");
                shouldBroadcast = this.isPlaying;
                this.isPlaying = false;

            } break;

            default: {

            } break;
        }

        if (shouldBroadcast) {
            socketService.broadcast('play_state', this.getPlayState());
            console.log("[Logic] Play broadcasted");
        }

        res.sendStatus(200);
    }

    private getPlayState() : string {
        return this.isPlaying
            ? 'playing'
            : 'paused';
    }

    public getStat(req: Request, res: Response) {
        res.json(this.isPlaying);
    }

    public getCurr(req: Request, res: Response) {
        res.json(this.getCurrentSong);
    }
    
    /**
     * Returns
     * {
     *   "album": index,
     *   "track": index,
     * }
     */
    private getCurrentSong() {
        const curr = this.queue.getCurrent();

        return curr === null
            ? null
            : {
                "album": curr.album,
                "track": curr.track
            };
    }

}