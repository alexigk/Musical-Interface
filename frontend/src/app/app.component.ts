import { Component } from '@angular/core';
import { SocketsService } from './global/services';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ami-fullstack-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private socketsService: SocketsService, private matReg: MatIconRegistry, private domSanitizer: DomSanitizer) {
    // Connect to sockets server on startup
    this.socketsService.initAndConnect();



    //How to consume an event
    this.socketsService.syncMessages('eventName').subscribe((data)=>{
      console.log('The message i received for this event is: ', data);
    });
    

    this.matReg.addSvgIcon(
        `mediaplay`,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`../assets/MediaPlay.svg`)
      );
  }
}
