import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ami-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.scss'],
  animations: [
    trigger('isHovered', [
      state('hovered', style({
        opacity: 1.0,
      })),
      state('unhovered', style({
        opacity: 0.8
      })),
      transition('hovered => unhovered', [
        animate('0.2s')
      ]),
      transition('unhovered => hovered', [
        animate('0.2s')
      ]),
    ])
  ]
})
export class FabComponent implements OnInit {

  @Input()  icon_path = '';
  @Input() size = 'default';

  public isHovered : boolean = false;

  public onHover(b: boolean) {
    this.isHovered = b;
  }

  constructor() { }

  ngOnInit() {
  }

}
