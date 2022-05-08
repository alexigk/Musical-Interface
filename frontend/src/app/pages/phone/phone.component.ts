import { AfterViewInit, Component, ComponentFactory, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SettingsComponent } from './settings/settings.component';
import { PlaylistviewComponent } from './playlistview/playlistview.component';
import { createComponent } from '@angular/compiler/src/core';
import { Router } from '@angular/router';
import { MainviewComponent } from './mainview/mainview.component';
import { Howl, Howler } from 'howler';
import { MusicLibService, SocketsService } from 'src/app/global/services';
import { PlayerService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss']
})
export class PhoneComponent implements OnInit, AfterViewInit {

  private sound: Howl;
  private library: any = null;


  constructor(
    private mlib: MusicLibService,
    private socketService: SocketsService,
    private playerService: PlayerService
  ) { }

  ngAfterViewInit(): void{
   
  }

  ngOnInit() {
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

  togglePlay(){
    this.playerService.togglePlay();
  }

  
}
