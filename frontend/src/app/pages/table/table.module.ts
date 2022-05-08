import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { TableComponent } from './table.component';
import { VinylComponent } from './vinyl/vinyl.component';
import { TableRoutingModule } from './table.routing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PlayerComponent } from './player/player.component';
import { GcomponentsModule } from 'src/app/gcomponents/gcomponents.module';
import { AlbumComponent } from './album/album.component';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      TableRoutingModule,
      DragDropModule,
      GcomponentsModule
    ],
    declarations: [
      TableComponent,
      VinylComponent,
      PlayerComponent,
      AlbumComponent,
    ],
    entryComponents: [
      PlayerComponent
    ],
    exports: [
      CommonModule
    ]
  })
  export class TableModule { }
  