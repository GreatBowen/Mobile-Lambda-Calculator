import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelpModalPageModule } from './help-modal/help-modal.module';
import { LoginModalPageModule } from './login-modal/login-modal.module';

import { AngularFireModule } from 'angularfire2'
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

let config = {
  apiKey: "AIzaSyDxaTC2NAglEUpskYP5ISvcXmFhrGWKJhU",
  authDomain: "finalchatdb.firebaseapp.com",
  databaseURL: "https://finalchatdb.firebaseio.com",
  projectId: "finalchatdb",
  storageBucket: "",
  messagingSenderId: "415327023808"
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
  	BrowserModule, 
  	IonicModule.forRoot(), 
  	AppRoutingModule, 
  	AngularFireModule.initializeApp(config),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
  	HelpModalPageModule,
    LoginModalPageModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
