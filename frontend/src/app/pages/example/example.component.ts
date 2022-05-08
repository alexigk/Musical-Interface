import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketsService, ExampleService } from 'src/app/global/services';


@Component({
  selector: 'ami-fullstack-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {

  public myUserID;
  public userToTreat;
  public foodToTreat;
  public socketEvents: {event: string, message: any}[];


  constructor(private route: ActivatedRoute, private exampleService: ExampleService, private socketService: SocketsService) {
    this.socketEvents = [];
  }

  ngOnInit() {
    this.myUserID = this.route.snapshot.paramMap.get("id");
    this.userToTreat = "userToTreat";
    this.foodToTreat = "food";
    this.socketService.syncMessages("treating").subscribe(msg => {
      this.socketEvents.push(msg);
    });
    this.treatSomeone();
  }

  public treatSomeone() {
    this.exampleService.treatSomeone(this.foodToTreat, this.userToTreat, "browser"+this.myUserID).subscribe();
  }

}
