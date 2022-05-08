import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ExampleService {
    private hostURI: string;
    
    constructor(private http: HttpClient) {
        this.hostURI = environment.host;
    }

    public treatSomeone(foodToTreat, toUserID, fromUserID) {
        console.log('hola here');

        return this.http.post(`${this.hostURI}/api/example/treatSomeone`,
        {
            message: {
                food: foodToTreat,
                userID: toUserID,
                fromUserID: fromUserID
            },
            event: "treating"
        })
    }
}