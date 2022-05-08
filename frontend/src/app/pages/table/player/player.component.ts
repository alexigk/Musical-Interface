import { Component, ComponentFactoryResolver, Input, OnInit, ViewContainerRef } from '@angular/core';
import { MusicLibService, PlayerService, SocketsService } from 'src/app/global/services';
import { TableComponent } from '../table.component';

@Component({
  selector: 'ami-fullstack-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input() orientation: string = 'front';
  @Input() container: TableComponent;
  
  constructor(
    private musicLibService: MusicLibService,
    private resolver: ComponentFactoryResolver,
    private socketService: SocketsService,
    private player: PlayerService
    ) { }

    
  public isPlaying: boolean = false;
  public isViewCurrent: boolean = false;
  public libs: any;

  ngOnInit() {
    this.libs = this.musicLibService.getLib().subscribe(msg => {
      this.libs = msg;

      this.socketService.syncMessages('play_state').subscribe(msg => {
        this.isPlaying = (msg.message == 'playing');
      });

      this.socketService.syncMessages('now_playing').subscribe(msg => {
        this.albumPath = this.libs[msg.message.album].cover;
      });
    });

  }

  public albumPath : string = '';

  public togglePlay() {
    console.log('Toggling play...');
    this.player.togglePlay();
  }

  public openAlbum() {
    this.isViewCurrent = !this.isViewCurrent;
  }

  public getOriRot() {
    if (this.orientation == 'front') {
      return "rotate(0deg)";
    } else if (this.orientation == 'back') {
      return "rotate(180deg)";
    } else if (this.orientation == 'left') {
      return "rotate(90deg)";
    } else {
      return "rotate(270deg)";
    }
  }

}
