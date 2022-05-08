import { Component, OnInit } from '@angular/core';
import { Howl, Howler } from 'howler';
import { MusicLibService, SocketsService } from 'src/app/global/services';
import { PlayerService } from 'src/app/global/services';


@Component({
  selector: 'ami-fullstack-mainview',
  templateUrl: './mainview.component.html',
  styleUrls: ['./mainview.component.scss']
})
export class MainviewComponent implements OnInit {

  lovebutton = {
      status: 0
    };

  plusbutton = {
    status: 0
  };

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
  

  lovebuttonInteraction(id: string){
    console.log(id);
    if(this.lovebutton.status === 0){
      document.getElementById(`${id}`).style.background= 'white';
      document.getElementById(`${id}`).style.backgroundImage = 'url("../../../../assets/MediaFavorite_1.png")';
      document.getElementById(`${id}`).style.backgroundRepeat = 'no-reppeat';
      document.getElementById(`${id}`).style.backgroundSize = '100%';
      this.lovebutton.status = 1;
    }else{
      document.getElementById(`${id}`).style.background = 'transparent';
      document.getElementById(`${id}`).style.backgroundImage = 'url("../../../../assets/MediaFavorite_1.png")';
      document.getElementById(`${id}`).style.backgroundRepeat = 'no-reppeat';
      document.getElementById(`${id}`).style.backgroundSize = '100%';
      this.lovebutton.status = 0;
    }
  }
    plusbuttonInteraction(id: string){
      console.log(id);
      if(this.plusbutton.status === 0){
        document.getElementById(`${id}`).style.background= 'white';
        document.getElementById(`${id}`).style.backgroundImage = 'url("../../../../assets/MediaAdd_2.png")';
        document.getElementById(`${id}`).style.backgroundRepeat = 'no-reppeat';
        document.getElementById(`${id}`).style.backgroundSize = '100%';
        this.plusbutton.status = 1;
      }else{
        document.getElementById(`${id}`).style.background = 'transparent';
        document.getElementById(`${id}`).style.backgroundImage = 'url("../../../../assets/MediaAdd_2.png")';
        document.getElementById(`${id}`).style.backgroundRepeat = 'no-reppeat';
        document.getElementById(`${id}`).style.backgroundSize = '100%';
        this.plusbutton.status = 0;
      }
  }

}
