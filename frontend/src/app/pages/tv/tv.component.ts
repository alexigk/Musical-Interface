import { Component, OnInit } from '@angular/core';
import { MusicLibService } from 'src/app/global/services';
import { SocketsService } from 'src/app/global/services';
import { PlayerService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-tv',
  templateUrl: './tv.component.html',
  styleUrls: ['./tv.component.scss']
})
export class TvComponent implements OnInit {

  private element = null;
  private library: any = null;
  constructor(
    private mlib: MusicLibService,
    private socketService: SocketsService
  ) { }

  ngOnInit(): void {
    document.getElementById("autoplay").play();
    this.element = document.getElementById("autoplay");
    this.element.muted = "muted";

    this.mlib.getLib().subscribe((val) => {
      this.library = val;
      console.log('Music library is ' + JSON.stringify(val));
    })

    this.socketService.syncMessages("now playing").subscribe(msg => {
      console.log('Now playing: ' + JSON.stringify(msg));
    });
  }



}
