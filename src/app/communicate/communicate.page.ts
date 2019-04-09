import { Component } from '@angular/core';
import { AngularFireDatabase   } from "@angular/fire/database"; 
import { ModalController, NavParams, ToastController } from '@ionic/angular'
import { LoginModalPage } from '../login-modal/login-modal.page';

@Component({
  selector: 'tab-communicate',
  templateUrl: 'communicate.page.html',
  styleUrls: ['communicate.page.scss']
})
export class CommunicatePage {
	username: string='';
 	message:string='';
	messages: object[] =[];
  showMessages: boolean = false;


	constructor(public db: AngularFireDatabase, public toastController: ToastController, public modalController: ModalController) {    
		if (this.username === '') {
			this.showLoginModal();
		} 
  			
		this.db.list('chat').valueChanges().subscribe(data => {
			this.messages = data;
		});  	  
  }

  	async toastMsg(msg: string) {
		const toast = await this.toastController.create({
			message: msg,
			duration: 2000
		});
		toast.present();
	} 

	async showLoginModal() {
	    const modal = await this.modalController.create({
	      component: LoginModalPage
	    });

	    modal.onDidDismiss().then((data) => {
        this.showMessages = true;
	    	this.username = data['data'];
	    	console.log(data['data']);
	    })
	    return await modal.present();
  	}

  	 sendMessage() {
      if (this.message === '') {
        return;
      }
        
    	this.db.list('/chat').push({
      		username : this.username,
      		message: this.message 
    	}).then( () => {
      		// message is sent
    	}).catch( () => {
			  this.toastMsg('An error has occured while sending the message');
    	});
    	this.message='';
  } 


  	isEmptyObject(object) {
  		for (let o in object) {
  			return false;
  		}
  		return true;
  	}
}
