import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainviewComponent } from '../mainview/mainview.component';
import { Howl, Howler } from 'howler';
import { MusicLibService, SocketsService } from 'src/app/global/services';
import { PlayerService } from 'src/app/global/services';


@Component({
  selector: 'ami-fullstack-playlistview',
  templateUrl: './playlistview.component.html',
  styleUrls: ['./playlistview.component.scss']
})
export class PlaylistviewComponent implements OnInit {
  private sound: Howl;
  private library: any = null;


  constructor(
    private mlib: MusicLibService,
    private socketService: SocketsService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this.sound = new Howl({
      src: ["../../assets/heathens.mp3"],
      html5: true,
      volume: 0.1,
    });

    this.mlib.getLib().subscribe((val) => {
      this.library = val;
      console.log('Music library is ' + JSON.stringify(val));
    })

    this.socketService.syncMessages("now playing").subscribe(msg => {
      console.log('Now playing: ' + JSON.stringify(msg));
    });

    this.socketService.syncMessages("play_state").subscribe(msg => {
      console.log('play state is: ' + JSON.stringify(msg));
      if(msg.message == 'paused'){
        this.sound.pause();
      }else if(msg.message == "playing"){
        this.sound.play();
      }
    });
    
  }

  MusicInteraction(){
    this.playerService.togglePlay();
  }

}
