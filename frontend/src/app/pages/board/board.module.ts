import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { BoardComponent } from './board.component';
import { BoardRoutingModule } from './board.routing';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BoardRoutingModule
  ],
  declarations: [
    BoardComponent,
  ],
})
export class BoardModule { }
