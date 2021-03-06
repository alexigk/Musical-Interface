import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './board.component';

const routes: Routes = [
    { path: '', component: BoardComponent, },
    { path: '**', redirectTo: '', pathMatch: 'full' },

]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class BoardRoutingModule {}