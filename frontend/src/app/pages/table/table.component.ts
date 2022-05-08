import { createComponent } from '@angular/compiler/src/core';
import { AfterViewInit, Component, ComponentFactory, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MusicLibService, PlayerService } from 'src/app/global/services';
import { Gestures, LeapService } from 'src/app/global/services/leap.service';
import { PlayerComponent } from './player/player.component';
import { Howl, Howler } from 'howler';
import { SocketsService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})

export class TableComponent implements OnInit, AfterViewInit {

  @ViewChild('tableContent', {read: ViewContainerRef, static: true}) container: ViewContainerRef;

  private _counter: number = 0;

  private currentSound : Howl = null;
  private onSwipe(x: number, y: number) {
    console.log("Swipe! " + x + " " + y);
  }

  constructor(
    private resolver: ComponentFactoryResolver,
    private leap: LeapService,
    private mlib: MusicLibService,
    private socketService: SocketsService,
    private player: PlayerService,
    ) {

  }

  private library: any = null;
  private isPlaying: boolean = false;

  private curAlbum: number = 100;
  private curTrack: number = 100;

  ngAfterViewInit(): void {
    this.mlib.getLib().subscribe((val) => {
      this.library = val;


      this.socketService.syncMessages("now_playing").subscribe(msg => {
  
        
        const track = this.library[msg.message.album].tracks[msg.message.track];
        
        console.log("Playing sound: " + track.file);
        var shouldCreateNew = false;

        if (this.currentSound != null) {
          
          if ((this.curAlbum != msg.message.album) || (this.curTrack != msg.message.track)) {
            shouldCreateNew = true;
            this.currentSound.stop();
          }
        } else {
          shouldCreateNew = true;
        }

        console.log('Create new: ' + shouldCreateNew);

        if (shouldCreateNew) {
          this.currentSound = new Howl({
            src: [track.file],
            html5: true
          });
        }
        
        this.curAlbum = msg.message.album;
        this.curTrack = msg.message.track;
  
      });

      this.socketService.syncMessages("play_state").subscribe(msg => {
        this.isPlaying = msg.message;

        if (this.currentSound == null) {
          return;
        }

        if (msg.message == 'playing') {
          this.currentSound.play();
          console.log('Playing...');
        } else if (msg.message == 'paused') {
          this.currentSound.pause();
        } else {
          this.currentSound.stop();
        }
      });
    })


    // Temporarily Disabled because we work on multiple computers
    // this.leap.gestureRecognizer().subscribe((gesture) => {

    //   if (gesture == Gestures.SWIPE_RIGHT) {
    //     console.log("hajfjsf");
    //   }

    // });


  }

  ngOnInit() {

  }

  addPlayer() {

    if (this.isPlaying) {
      this.player.doPause();
    } else {
      this.player.tellPlay();
    }

    this.currentSound.pause();
    const orientations = [
      'front',
      'back',
      'left',
      'right',
    ]

    return;

  }

}
