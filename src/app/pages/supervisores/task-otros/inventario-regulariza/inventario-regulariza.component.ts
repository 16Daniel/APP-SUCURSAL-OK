import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { AlertController } from '@ionic/angular';
import { DatePipe, formatNumber } from '@angular/common';

@Component({
  selector: 'app-inventario-regulariza',
  templateUrl: './inventario-regulariza.component.html',
  styleUrls: ['./inventario-regulariza.component.scss'],
})
export class InventarioRegularizaComponent implements OnInit {

  public today = new Date();
  public user: any;
  public idSucursal: string;
  public data;
  public turno;
  public registro;
  public valorStock;
  public valorStockDif;
  constructor(
    public router: Router,
    public modalController: ModalController,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public datepipe: DatePipe,

  ) { }
  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    this.registro = this.routerActive.snapshot.paramMap.get('registro');
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
   
    console.log('user: ', this.user);
    console.log('registro: ',this.registro); 
    this.getCapturas(this.registro);
    this.valorStock = 0;
    this.valorStockDif = 0;
    
  }
  ngOnInit() { }
  
 

  return() {
    window.history.back();
    // if (this.turno === '1') {
    //   this.router.navigateByUrl('supervisor/inventario-mensual/tarea/1').then(()=>{
    //     location.reload();
    //   });;
      
    // }
    // else {
    //   this.router.navigateByUrl('supervisor/inventario-mensual/tarea/1').then(()=>{
    //     location.reload();
    //   });;
      
    // }
  }
 
  getCapturas(reg) {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet(`StockChicken/GetCaptura?registro=${reg}&dataBase=${this.user.dataBase}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data= resp.result;
          console.log('Capturas: ', this.data);
          this.getValor();
          this.getValorDif();

        }
        //console.log('s ',resp.success);
      });
    
  }
  getValor(){
    const initialValue = 0;
    const sumWithInitial = this.data.reduce(
      (accumulator, currentValue) => accumulator + currentValue.valor,
      initialValue,
    );
    this.valorStock = sumWithInitial;
  }
  getValorDif(){
    const initialValue = 0;
    const sumWithInitial = this.data.reduce(
      (accumulator, currentValue) => accumulator + (currentValue.diferencia >= 0 ? (currentValue.diferencia*currentValue.precio): ((currentValue.diferencia*-1)*currentValue.precio)) ,
      initialValue,
    );
    this.valorStockDif = sumWithInitial;

  }
  procesarInv() {
    this.load.present('Regularizando..');
    this.service
      .serviceGeneralGet(`StockChicken/GetExcel?registro=${this.registro}&dataBase=${this.user.dataBase}&sucursal=${this.user.branchName}&correo=${this.user.email}&idsucursal=${this.user.branchId}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data= resp.result;
          console.log('Capturas: ', this.data);
          this.getValor();
          this.presentAlert();
          this.load.dismiss();
        }
        else{
          this.load.dismiss();
        }
        //console.log('s ',resp.success);
      });
    
  }
  showValidaProcesar() {
    this.alertController.create({
      cssClass: 'custom-alert',
      header: 'IMPORTANTE',
      subHeader: 'PROCESAR',
      message: 'AL PROCESAR YA NO SE PODRA REALIZAR NINGUNA MODIFICACION',
      mode: 'ios', 
      buttons: [
        {
          text: 'CANCELAR',
          handler: (data: any) => {
            console.log('PROCESAR CANCELADO');
          }
        },
        {
          text: 'ACEPTAR',
          handler: (data: any) => {
            console.log('PROCESADO');
            this.procesarInv();
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'inv',
      header: 'IMPORTANTE',
      subHeader: 'INVENTARIO',
      message: 'SE REALIZO EL AJUSTE DE INVENTARIO CON EXITO. <BR>RECUERDA REINICIAR TU SISTEMA FRONTREST PARA QUE RECIBA EL AJUSTE.',
      mode: 'ios',
      buttons: ['OK'],
    });
  

    await alert.present();
      const { role } = await alert.onDidDismiss();
      this.router.navigateByUrl('login');
  }

}
