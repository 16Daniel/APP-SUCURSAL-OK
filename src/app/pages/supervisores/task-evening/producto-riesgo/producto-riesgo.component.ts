import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { DatePipe } from '@angular/common';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-producto-riesgo',
  templateUrl: './producto-riesgo.component.html',
  styleUrls: ['./producto-riesgo.component.scss'],
})
export class ProductoRiesgoComponent implements OnInit {
  public today = new Date();
  public user: any;
  public idProductoRiesgo: string;
  public data: ProductoRiesgoModel = new ProductoRiesgoModel();
  public disabled = false;
  public activeData = false;
  public objProduct;
  public search: string;
  public selectCatalogs: any[] = [];
  // nombre de sucursal
  public branchId;
  // public nameBranch = '';
  public dataBranch: any[] = [];
  // identificador de nuevo registro
  public newProduct: boolean;
  public createDate = '';
  public visibleGuardar = true;
  public descProduct;

  public riesgo = true;
  public turno;

  constructor(
    public router: Router,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public datepipe: DatePipe

  ) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log('user', this.user);
    this.idProductoRiesgo = this.routerActive.snapshot.paramMap.get('id');
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
    console.log('id producto en riesgo ', this.idProductoRiesgo);
    this.formartDate();
    this.getData();
    
  }

  ngOnInit() { }
  return() {
    // window.history.back();
    if (this.turno === '1') {
      this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
    }
    else {
      this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
    }
  }
  getData() {
    this.load.presentLoading('Cargando..');
    this.service.serviceGeneralGet(`RiskProduct/${this.idProductoRiesgo}/Branch/`).subscribe((resp) => {
      if (resp.success) {
        // si no hay registros en la sucursal
        if (resp.result?.length === 0) {
          this.newProduct = true;
          console.log('Completar la tarea');
          this.objProduct = [
            {
              id: 0,
              branchId: this.user.branchId,
              productId: 0,
              code: '1',
              comment: '',
              createdBy: this.user.id,
              createdDate: this.createDate,
              updatedBy: this.user.id,
              updatedDate: this.createDate,
              search: '',
            },
          ];
          this.activeData = true;
          this.data = this.objProduct;

        } else {
          this.newProduct = false;
          this.objProduct = resp.result;
          console.log('get data', this.objProduct);
          console.log('Actualizar la tarea');
          this.activeData = true;
          this.objProduct.forEach(obj => {
            this.getCatalog(obj.product);
          });

        }
      }
    });
  }
  getCatalog(search) {
    console.log('search', search);
    this.selectCatalogs = [];
    if (search.length > 2) {
      this.service
        .serviceGeneralGet(`Items/${this.user.branchId}/${search}`)
        .subscribe((resp) => {
          if (resp.success) {
            console.log('get productos', resp);
            this.selectCatalogs = resp.result[search.length - 1];
          }
        });
    } else {
      this.selectCatalogs = [
        { codarticulo: 0, descripcion: 'No hay información' },
      ];
      return;
    }
  }
  async alertCampos(){

    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'IMPORTANTE',
      subHeader: 'CAMPOS',
      message: 'VALIDA QUE TODOS LOS CAMPOS ESTEN CARGADOS CORRECTAMENTE',
      mode: 'ios',
      buttons: ['OK'],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);

}
async alertRiesgo(){

  const alert = await this.alertController.create({
    cssClass: 'custom-alert',
    header: 'IMPORTANTE',
    subHeader: 'PRODUCTOS',
    message: 'ASEGURATE DE NOTIFICAR EL PRODUCTO EN RIESGO A TU REGIONAL',
    mode: 'ios',
    buttons: ['OK'],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();
  console.log('onDidDismiss resolved with role', role);

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
    console.log('createDate', this.createDate);
    // this.data.updatedBy = this.user.id;
    // this.data.updatedDate = this.createDate;
    // if (this.idGas === '0') {
    //   this.addData();
    // } else {
    //   this.updateData();
    // }
  }

  agregarLista(){
    if(this.data.comment == '' || this.data.comment == undefined){
    this.data.comment = '' + this.descProduct;
    console.log('agregado ' , this.descProduct);
    }
    else{
    this.data.comment += ', ' + this.descProduct;
    console.log('agregado ' , this.descProduct);
    }
  }
  addProductRisk() {
    console.log('push');
    this.objProduct.push({
      id: 0,
      branchId: this.user.branchId,
      productId: 0,
      code: '',
      comment: '',
      createdBy: this.user.id,
      createdDate: this.createDate,
      updatedBy: this.user.id,
      updatedDate: this.createDate,
      search: '',
    });
    console.log('obj data', this.objProduct);
  }

  deleteObjProduct(index) {
    console.log('delete index', index);
    this.objProduct.splice(index, 1);
  }

  myChange($event) {
    if(this.riesgo == true){
      this.data.code = '1';
      this.data.comment = "";
    }
    else{this.data.code = '0';}
  }

  save() {
    this.disabled = true;
    // esto se pone aqui por que aun no se estrae la data de un get
    // if (this.newProduct === true) {
    //   this.addProductoRiesgo();
    // } else {
    //   // this.formartDateUpdate();
    //   this.updateProductoRiesgo();
    // }

    if(this.riesgo == false){
      this.deleteObjProduct(0);
      this.objProduct.push({
      id: 0,
      branchId: this.user.branchId,
      comment : 'SIN PRODUCTO EN RIESGO',
      productId : 0,
      code: '0',
      createdBy : this.user.id,
      createdDate: this.createDate,
      updatedBy: this.user.id,
      updatedDate: this.createDate,
      search: '',
      });
      
      console.log('cond 1', this.objProduct);
      this.addProductoRiesgo();
    }
    else{
     if(this.data.comment === undefined){
        this.alertCampos();
        console.log('cond 2', this.data);
     }
     else{
      this.deleteObjProduct(0);
      this.objProduct.push({
      id: 0,
      branchId: this.user.branchId,
      comment : this.data.comment,
      productId : 0,
      code: '1',
      createdBy : this.user.id,
      createdDate: this.createDate,
      updatedBy: this.user.id,
      updatedDate: this.createDate,
      search: '',
      });
      console.log('cond 3', this.data);
      this.addProductoRiesgo();
     }
      
    }
  }
  addProductoRiesgo() {
    
    
    console.log('Obj a guardar =>', this.objProduct);
    this.service
      .serviceGeneralPostWithUrl('RiskProduct', this.objProduct)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading(`Guardando..`);
          console.log('Resp Serv =>', data);
          if(this.objProduct.code === '1'){
          this.alertRiesgo();
          }
          this.ionViewWillEnter();
          this.return();
        }
      });
  }

  

  updateProductoRiesgo() {
    this.objProduct.forEach(obj => {
      obj.updatedBy = this.user.id;
      obj.updatedDate = this.createDate;
    });
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPut('RiskProduct', this.objProduct)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('Resp Serv =>', data);
          this.ionViewWillEnter();
          this.router.navigateByUrl('supervisor/control-vespertino');
        }
      });
  }
}
class ProductoRiesgoModel {
  id: number;
  branchId: number;
  productId: number;
  code: string;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  search: string;
}
