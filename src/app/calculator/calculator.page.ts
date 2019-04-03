import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular'
import { ModalController } from '@ionic/angular';
import { HelpModalPage } from '../help-modal/help-modal.page'

@Component({
  selector: 'tab-calculator',
  templateUrl: 'calculator.page.html',
  styleUrls: ['calculator.page.scss']
})
export class CalculatorPage {
	equation:string = '';
	showOutout:boolean;

	constructor(public modalController: ModalController, public toastController: ToastController) {

	}

	onEvalLambdaEquation(event) {
		if(this.equation == null || this.equation == "") {
			this.errorToastMsg('Please ensure a value is entered.')
		}
		else{

		}
	}

	onLambdaClicked(event) {
		this.equation += 'λ' 
	}

	async errorToastMsg(msg:string) {
		const toast = await this.toastController.create({
			message: msg,
			duration: 2000
		});
		toast.present();
	}

	async showHelpModal(event) {
    const modal = await this.modalController.create({
      component: HelpModalPage
    });
    return await modal.present();
  }
}
