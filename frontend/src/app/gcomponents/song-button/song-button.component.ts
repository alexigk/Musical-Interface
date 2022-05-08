import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'song-button',
  templateUrl: './song-button.component.html',
  styleUrls: ['./song-button.component.scss']
})
export class SongButtonComponent implements OnInit {

  @Input() tag  = '';
  @Input() name = '';

  constructor() { }

  ngOnInit() {
  }

}
