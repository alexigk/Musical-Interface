import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ami-image-button',
  templateUrl: './image-button.component.html',
  styleUrls: ['./image-button.component.scss']
})
export class ImageButtonComponent implements OnInit {

  @Input() icon_path = '';
  @Input() size = 'default';

  constructor() { }

  ngOnInit() {
  }

}
