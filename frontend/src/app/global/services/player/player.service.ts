import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private hostURI: string;

    constructor(private http: HttpClient) {
        this.hostURI = environment.host;
    }

    public tellPlay() {
        // Seriously? This language is garbage.
        this.http.post(`${this.hostURI}/api/player/setPlayState/playing`,{}).subscribe({error: e => console.log(e)});
    }

    public enqueue(ai: number, ti: number) {
        this.http.post(`${this.hostURI}/api/player/enqueue/${ai.toString()}/${ti.toString()}`,{}).subscribe({error: e => console.log(e)});

    }

    public doPause() {
        // this.http.post(`${this.hostURI}/api/player/pause`,{}).toPromise();
    }

    public getTracksAtCursor(num: Number) {
        return this.http.post(`${this.hostURI}/api/player/getQueue/${num.toString()}`, {});
    }

    public togglePlay() {
        this.http.post(`${this.hostURI}/api/player/setPlayState/toggle`,{}).subscribe({error: e => console.log(e)});
    }
}