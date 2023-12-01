/* eslint-disable max-len */
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { DialogAddPackageComponent } from '../../dialog/dialog-add-package/dialog-add-package.component';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { DialogUpdateStockPolloComponent } from '../../dialog/dialog-update-stock-pollo/dialog-update-stock-pollo.component';
import { AlertController } from '@ionic/angular';
import { DatePipe, formatNumber } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-sales-expectation',
  templateUrl: './sales-expectation.component.html',
  styleUrls: ['./sales-expectation.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SalesExpectationComponent implements OnInit {

  public today = new Date();
  public user: any;
  public idSucursal: string;
  public disabled = false;
  public createDate = '';
  public data;
  public turno;
  public dataInv: InvModel = new InvModel();
  public validado : boolean[] = [];
  public contador: number[] = [];
  public strikes: number[] = [];
  handlerRespMessage = '';
  handlerRespValor;
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
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.idSucursal = this.routerActive.snapshot.paramMap.get('id');
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
    this.getData();
    console.log('user: ', this.user);
    
  }
  ngOnInit() { }
  
  validaO(i){
     if(this.contador[i] >= 3 ){
          this.validado[i]= false;
     }
     else{
      this.validado[i]= true;
     }

  }
  
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet(`StockChicken/GetStock?id_sucursal=${this.user.branch}&dataBase=${this.user.dataBase}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
          this.data.forEach(element => {
            element.cantidad = 0;
          });
          console.log(this.data);
        }
        console.log('s ',resp.success);
      });
    console.log('sin data');
  }

  return() {
    // window.history.back();
    if (this.turno === '1') {
      this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
    }
    else {
      this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
    }
  }


  async addPackage(idPack: number) {
    console.log('id paquete', idPack);
    // package = 0 es nuevo registos, si es != 0 es update
    const modal = await this.modalController.create({
      component: DialogAddPackageComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        idSucursal: this.idSucursal, //se envia el id de sucursal
        idPackage: idPack,
      },
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      this.ionViewWillEnter();
    });
    this.modalController.dismiss();
    return await modal.present();
  }
  deletePackage(id: number) {
    this.service
      .serviceGeneralDelete('StockChicken/' + id)
      .subscribe((resp) => {
        if (resp.success) {
          console.log('delete success', resp);
          this.load.presentLoading('Eliminando paquete..');
          this.ionViewWillEnter();
        }
      });
  }
  save(item,i) {
    this.service
      .serviceGeneralPostWithUrl(`StockChicken/AddRegularizate?codArticulo=${item.codarticulo}&codAlmacen=${item.codalmacen}&cantidad=${item.cantidad}&dataBase=${this.user.dataBase}`, ``)
      .subscribe((resp) => {
        console.log(resp);

        if (resp.success) {

          this.load.presentLoading('Cantidad Permitida');
          this.presentAlert(i);
          // this.data.status = 'post';
        }
      });
    console.log('sin data');
    this.addInv(item,i);
  }

  addInv(item,i) {
    this.formartDate();
    this.dataInv.branch = this.user.branch;
    this.dataInv.invInicial = item.cantidad - item.diferencia;
    this.dataInv.invReg = item.cantidad;
    this.dataInv.diferencia = item.diferencia;
    this.dataInv.intentos = this.strikes[i];
    this.dataInv.articulo = item.descripcion;
    this.dataInv.createdBy = this.user.id;
    this.dataInv.createdDate = this.createDate;
    this.dataInv.updatedBy = this.user.id;
    this.dataInv.updatedDate = this.createDate;
    console.log('Obj To send  post=> ', this.dataInv);
    this.service
      .serviceGeneralPostWithUrl('Inventario', this.dataInv)
      .subscribe((data) => {
        if (data.success) {
          
          console.log('data inventario:', data);
          this.load.dismiss();
        }
        else{
          this.load.dismiss();
          location.reload();
        }
      });
  }

  formartDate() {
    // 2022-03-11T17:27:00
    console.log('date', this.today);
    let time = '';
    const hour = this.today.getHours();
    const minute = this.today.getMinutes();
    let hourString = hour.toString();
    let minuteString = minute.toString();
    const date = this.datepipe.transform(this.today, 'yyyy-MM-dd');
    if (hourString.length < 2) {
      hourString = `0${hourString}`;
    }
    if (minuteString.length < 2) {
      minuteString = `0${minuteString}`;
    }
    console.log('hour', hourString);
    console.log('minute', minuteString);
    time = `${hourString}:${minuteString}:00`;
    console.log('date', date);
    this.createDate = `${date}T${time}`;
  }

  async validarCantidad(stock, i) {
    let respValidar;
    console.log('info de validar', stock);
    // this.load.presentLoading('Validando..');
    this.service
      .serviceGeneralGet(`StockChicken/ValidateStock?id_sucursal=${this.user.branch}&dataBase=${this.user.dataBase}&cantidad=${stock.cantidad}&codarticulo=${stock.codarticulo}`)
      .subscribe((resp) => {
        respValidar = resp;
        console.log('validar', respValidar);
        if (resp.success) {
          // stock.diferencia
          stock.diferencia = respValidar.message;
          
          stock.invInicial = (Number(respValidar.message) - Number(stock.cantidad))* -1;
          console.log('stock inicial',stock.invInicial);

          this.openDialogValidarStock(stock,i);
          console.log('new valor permitida', stock);
          
        }
        else {
          
          stock.diferencia = respValidar.message;
          stock.invInicial = (Number(respValidar.message) - Number(stock.cantidad))* -1;
          console.log('stock inicial',stock.invInicial);

          console.log('no hay diferencia', stock);
          this.contador[i] = 3;
          if(isNaN(this.strikes[i])){this.strikes[i] = 1;}
          else{this.strikes[i] += 1;}
          
          console.log('cont', this.contador[i]);
          console.log('st', this.strikes[i]);
          this.validaO(i);
        }
      });
    console.log('sin data');
  }
  async openDialogValidarStock(nodo,i) {
    if(isNaN(this.contador[i])){
      this.contador[i] = 1;
      
    }
    else{
    this.contador[i] += 1;
    
    }
    if(isNaN(this.strikes[i])){this.strikes[i] = 1;}
          else{this.strikes[i] += 1;}
    console.log('contador: ', this.contador[i]);
    console.log('st', this.strikes[i]);
    this.validaO(i);
    
    if(this.contador[i] < 3){
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'DIFERENCIA DE STOCK',
      // subHeader: `De: ${nodo.diferencia}`,
      message: 'HAY UNA DIFERENCIA EN EL STOCK Y TU CONTEO: <BR><br>1.- CUENTA NUEVAMENTE TU STOCK <BR>2.-REVISA QUE TODAS TUS COMPRAS ESTEN CARGADAS EN EL SISTEMAS <BR>3.-REVISA QUE TUS MERMAS ESTEN CARGADAS CORRECTAMENTE',
      mode: 'ios', //sirve para tomar el diseño de ios
      buttons: [
        // {
        //   text: 'Cancelar',
        //   role: 'cancel',
        //   handler: () => { this.handlerRespMessage = 'Alert canceled'; }
        // },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => { this.handlerRespMessage = 'Alert confirmed'; }
          
        }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    this.handlerRespValor = role;
    console.log('onDidDismiss resolved with role', this.handlerRespValor);
  }

  }
  trackData(index, data) {
    return data ? data.id : undefined;
  }


  async presentAlert(i) {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'IMPORTANTE',
      subHeader: 'INVENTARIO',
      message: 'SE REALIZO EL AJUSTE DE INVENTARIO CON EXITO. <BR>RECUERDA REINICIAR TU SISTEMA FRONTREST PARA QUE RECIBA EL AJUSTE.',
      mode: 'ios',
      buttons: ['OK'],
    });
  

    await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      this.contador[i] += 1;
      this.validaO(i);
      this.ngOnInit();
  }
  

}
class InvModel {
  id: number;
  branch: number;
  invInicial: number;
  invReg: number;
  diferencia: number;
  intentos: number;
  articulo: string;
  createdBy: number;
  createdDate: String;
  updatedBy: number;
  updatedDate: String;
}