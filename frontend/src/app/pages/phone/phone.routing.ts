import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhoneComponent } from './phone.component';
import { PlaylistviewComponent } from './playlistview/playlistview.component';
import { SettingsComponent } from './settings/settings.component';
import { MainviewComponent } from './mainview/mainview.component';
import { CurrentusersComponent } from './currentusers/currentusers.component';
import { EdituserComponent } from './edituser/edituser.component';
import { SongoptionsComponent } from './songoptions/songoptions.component';

const routes: Routes = [
    { path: '', component: PhoneComponent},
    { path: 'Settings', component: SettingsComponent},
    { path: 'Playlistview', component: PlaylistviewComponent},
    { path: 'Mainview', component: MainviewComponent},
    { path: 'Currentusers', component: CurrentusersComponent},
    { path: 'Edituser', component: EdituserComponent},
    { path: 'Songoptions', component: SongoptionsComponent},
    { path: '**', redirectTo: '', pathMatch: 'full' },

]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class PhoneRoutingModule {}