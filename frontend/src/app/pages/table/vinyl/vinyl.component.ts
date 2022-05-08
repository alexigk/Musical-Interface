import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlayerService, SocketsService } from 'src/app/global/services';
import { MusicLibService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-vinyl',
  templateUrl: './vinyl.component.html',
  styleUrls: ['./vinyl.component.scss']
})
export class VinylComponent implements OnInit {

  public albumSrc: string = '';
  public music: any = null;
  public isPlaying: boolean = false;
  private animationState: string = 'paused';
  constructor(
    private socketService: SocketsService,
    private mlib: MusicLibService,
    private player: PlayerService,
  ) { 
  }

  ngOnInit() {
    this.mlib.getLib().subscribe(l => {
      this.music = l;
      this.socketService.syncMessages('play_state').subscribe(msg => {
        this.setPlaying(msg.message == 'playing');
      });
  
      this.socketService.syncMessages('now_playing').subscribe(msg => {
        this.albumSrc = this.music[msg.message.album].cover;
      });
  
    })
  }

  public setPlaying(isPlaying: boolean): void {
    this.isPlaying = isPlaying;
    this.animationState = isPlaying
      ? 'playing'
      : 'paused';
  }

  public togglePlaying(): void {
    this.player.togglePlay();
    console.log(this.animationState);
  }

}
