import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'login-modal',
  templateUrl: 'login-modal.page.html',
  styleUrls: ['login-modal.page.scss']
})
export class LoginModalPage {
	username: string = '';
	password: string = '';

	constructor(private alertCtrl: AlertController, public modalController: ModalController) {

	}

	async showAlert(title: string, message: string) {
	    const alert = await this.alertCtrl.create({
	      header: title,
	      message: message,
	      buttons: ['OK']
	    });
	    await alert.present();
  	}

  	onSumbit($event) {
	 	if(/^[a-zA-Z0-9]+$/.test(this.username)){
	 		this.modalController.dismiss(this.username)
	    } else {
	      this.showAlert('Error', 'Invalid Username');
	    }
  	}
}
