import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FabComponent } from './fab/fab.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SliderComponent } from './slider/slider.component';
import { SongButtonComponent } from './song-button/song-button.component';
import { ImageButtonComponent } from './image-button/image-button.component';


@NgModule({
  declarations: [FabComponent, SliderComponent, SongButtonComponent, ImageButtonComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    FabComponent,
    SliderComponent,
    SongButtonComponent,
    ImageButtonComponent
  ]
})
export class GcomponentsModule { }
