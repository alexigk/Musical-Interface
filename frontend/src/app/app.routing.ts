import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExampleComponent } from './pages/example/example.component';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'socket-events', loadChildren: () => import('./pages/socket-events/socket-events.module').then(m => m.SocketEventsModule) },
  { path: 'tasks', loadChildren: () => import('./pages/tasks/tasks.module').then(m => m.TasksModule) },
  { path: 'example/:id', component: ExampleComponent},
  { path: 'table', loadChildren: () => import('./pages/table/table.module').then(m => m.TableModule)},
  { path: 'board', loadChildren: () => import('./pages/board/board.module').then(m => m.BoardModule)},
  { path: 'tv', loadChildren: () => import('./pages/tv/tv.module').then(m => m.TvModule)},
  { path: 'phone', loadChildren: () => import('./pages/phone/phone.module').then(m => m.PhoneModule)},
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
