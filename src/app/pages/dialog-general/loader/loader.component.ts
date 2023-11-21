import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  loading: any;
  isLoading = false;
  constructor(public loadingCrtl: LoadingController, public loadingController: LoadingController) {}

  ngOnInit() {}
  async presentLoading(message: string) {
    this.loading = await this.loadingCrtl.create({
      cssClass: 'my-custom-class',
      message,
      duration: 1000,
    });
    return this.loading.present();
  }

  async presentDismiss() {
    return this.loading.dismiss();
  }


  async present(message: string) {
    this.isLoading = true;
    return await this.loadingController.create({
      cssClass: 'my-custom-class',
      message,
    }).then(a => {
      a.present().then(() => {
        //console.log('presented');
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss();
  }

}
