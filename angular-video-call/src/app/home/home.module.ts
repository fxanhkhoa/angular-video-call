import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input'
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';

import { SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { CallService } from '../services/call.service';
import { CallRequestComponent } from '../components/call-request/call-request.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    HomeComponent,
    CallRequestComponent
  ],
  providers:[
    CallService
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    MatDialogModule,
    MatCardModule,
    NgxSpinnerModule,
    SocketIoModule.forRoot(environment.socketIOConfig)
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    CallRequestComponent
  ]
})
export class HomeModule { }
