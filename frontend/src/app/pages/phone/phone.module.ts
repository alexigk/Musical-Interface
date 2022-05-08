import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneComponent } from './phone.component';
import { PhoneRoutingModule } from './phone.routing';
import { PlaylistviewComponent } from './playlistview/playlistview.component';
import { SettingsComponent } from './settings/settings.component';
import { GcomponentsModule } from 'src/app/gcomponents/gcomponents.module';
import { MainviewComponent } from './mainview/mainview.component';
import { CurrentusersComponent } from './currentusers/currentusers.component';
import { EdituserComponent } from './edituser/edituser.component';
import { SongoptionsComponent } from './songoptions/songoptions.component';



@NgModule({
  declarations: [PhoneComponent,  SettingsComponent,  PlaylistviewComponent, MainviewComponent, CurrentusersComponent, EdituserComponent, SongoptionsComponent],
  imports: [
    CommonModule,
    PhoneRoutingModule,
    GcomponentsModule
  ],
  entryComponents:[
    SettingsComponent,
    PlaylistviewComponent
  ]
})
export class PhoneModule { }
