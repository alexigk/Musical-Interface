import { Component, OnInit } from '@angular/core';
import { Howl, Howler } from 'howler';
import { MusicLibService, SocketsService } from 'src/app/global/services';
import { PlayerService } from 'src/app/global/services';


@Component({
  selector: 'ami-fullstack-edituser',
  templateUrl: './edituser.component.html',
  styleUrls: ['./edituser.component.scss']
})
export class EdituserComponent implements OnInit {

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

  ButtonInteractions(id: string){
    console.log(id);
    var x = document.getElementById(`${id}`).style.background;
    console.log(x);
    if(document.getElementById(`${id}`).style.background === 'transparent')
      document.getElementById(`${id}`).style.background = '#88297E';
    else
    document.getElementById(`${id}`).style.background = 'transparent';
 }
}