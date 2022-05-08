import { Component, OnInit } from '@angular/core';
import { MusicLibService, PlayerService, SocketsService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  constructor(
    private musicLib: MusicLibService,
    private player: PlayerService,
    private socketService: SocketsService
  ) { }

  private mlib : any = null;
  private tracks: any = null;

  public curAlbumIndex = 1000;
  public curTrackIndex = 1000;

  public getSongInfo(ai: number, ti: number) : string {
    return this.mlib[ai].tracks[ti].name;
  }

  ngOnInit() {

    this.musicLib.getLib().subscribe(lib => {
      this.mlib = lib;
      this.curAlbumIndex = 0;
      this.curTrackIndex = 1;
      this.player.getTracksAtCursor(3).subscribe(msg => {
        this.tracks = msg;
        console.log('music is ' + this.tracks.length);
      });

      this.socketService.syncMessages('now_playing').subscribe(msg => {

        this.curAlbumIndex = msg.message.album;
        this.curTrackIndex = msg.message.track;
        console.log('now play ' + this.curAlbumIndex + ', ' + this.curTrackIndex);

        this.player.getTracksAtCursor(3).subscribe(msg => {
          this.tracks = msg;
        });

      });
      
    })
  }

}
