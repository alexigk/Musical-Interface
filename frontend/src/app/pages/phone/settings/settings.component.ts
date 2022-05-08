import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ami-fullstack-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  ButtonInteractions(id: string){
    console.log(id);
    if(document.getElementById(`${id}`).style.backgroundColor === 'transparent')
      document.getElementById(`${id}`).style.backgroundColor = '#88297E';
    else
    document.getElementById(`${id}`).style.backgroundColor = 'transparent';

  }

}
