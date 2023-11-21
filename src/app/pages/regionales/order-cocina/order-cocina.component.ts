import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { AlertController } from '@ionic/angular';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-order-cocina',
  templateUrl: './order-cocina.component.html',
  styleUrls: ['./order-cocina.component.scss'],
})
export class OrderCocinaComponent implements OnInit {
  
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  // public data: RefrigeradorModel = new RefrigeradorModel();
  public objProduct: any[] = [];
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public disabled = false;
  public base64 = 'data:image/jpeg;base64';
  public fotosOrden: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  // ******variables de validacion ********
  public activeTime = false;
  public activeComment = false;

  public visibleGuardar = true;

  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ngOnInit() { }
  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);
    
    
    
    
  }
  // get data order
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('Order/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          // comprobar si tiene registros por dia
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            console.log('si hay registros del dia');
            this.activeData = true;
            this.objProduct = resp.result;
            console.log('get data', this.objProduct);
          }
          else {
            console.log('Completar la tarea');
            this.dataId = false; //no hay registro entonces se hara un post
            this.activeData = true;
            this.objProduct = [
              {
                id: 0,
                branchId: this.branchId,
                averageTime: '',
                comment: '',
                createdBy: this.user.id,
                createdDate: this.today,
                updatedBy: this.user.id,
                updatedDate: this.today,
                photoOrders: [],
              },
            ];
          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
  }
  // get  name sucursal
  getBranch(id) {
    let branchIdNumber = 0;
    branchIdNumber = Number(this.branchId);
    console.log('branchIdNumber', branchIdNumber);
    this.service.serviceGeneralGet(`User/GetSucursalList?idState=${id}`).subscribe(resp => {
      if (resp.success) {
        this.dataBranch = resp.result;
        console.log('get branch', this.dataBranch);
        this.dataBranch.forEach(element => {
          if (element.idfront === branchIdNumber) {
            this.nameBranch = element.titulo;
            this.nameBranch = this.nameBranch.toUpperCase();
            console.log('nombre', this.nameBranch);
          }
        });
      }
    });
  }
  // ---------add product complete----------
  addProductRisk() {
    console.log('push');
    this.objProduct.push({
      id: 0,
      branchId: this.branchId,
      averageTime: '',
      comment: '',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
      photoOrders: [],
    });
    console.log('obj data', this.objProduct);
  }
  // eliminar indice de orden
  deleteObjProduct(index) {
    console.log('delete index', index);
    this.objProduct.splice(index, 1);
  }

  async addPhotoToGallery(index) {
    console.log('index de', index);
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    for (let i = 0; i < this.objProduct.length; i++) {
      if (index === i) {
        const element = this.objProduct[i];
        element.photoOrders.push({
          id: 0,
          orderId: element.id,
          photo: this.photoService.photos[0].webviewPath,
          photoPath: 'jpeg',
          createdBy: this.user.id,
          createdDate: this.today,
          updatedBy: this.user.id,
          updatedDate: this.today,
          filepath: ''
        });
      }
    }
    console.log('objORder', this.objProduct);
  }

  public async showActionSheet(photo, position: number, index) {
    console.log('photo', photo);
    console.log('posicion', position);
    console.log('index de', index);
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.photoService.deletePicture(photo, position);
            //
            for (let i = 0; i < this.objProduct.length; i++) {
              if (index === i) {
                const element = this.objProduct[i];
                element.photoOrders.splice(position, 1);
              }
            }
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Nothing to do, action sheet is automatically closed
          },
        },
      ],
    });
    await actionSheet.present();
  }
  //eliminar imagenes bd
  public async deleteImgShowAction(id) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.service
              .serviceGeneralDelete(`Order/${id}/Photo`)
              .subscribe((data) => {
                if (data.success) {
                  this.load.presentLoading('Eliminando..');
                  console.log('data', data);
                  this.ionViewWillEnter();
                }
              });
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // Nothing to do, action sheet is automatically closed
          },
        },
      ],
    });
    await actionSheet.present();
  }
  validateSave() {
    
    // if (
    //   this.objProduct.time === '' ||
    //   this.objProduct.time === undefined ||
    //   this.objProduct.time === null
    // ) {
    //   this.activeTime = true;
    // } else {
    //   this.activeTime = false;
    // }
    // if (
    //   this.objProduct.comment === '' ||
    //   this.objProduct.comment === undefined ||
    //   this.objProduct.comment === null
    // ) {
    //   this.activeComment = true;
    // } else {
    //   this.activeComment = false;
    // }
    // if (
    //   this.objProduct.time === '' ||
    //   this.objProduct.time === undefined ||
    //   this.objProduct.comment === '' ||
    //   this.objProduct.comment === undefined
    // ) {
    //   return;
    // } else {
    //   this.save();
    // }
  }
  save() {

    if(this.objProduct[0].averageTime === "" || this.objProduct[0].averageTime === undefined || this.objProduct[0].averageTime === null 
      || this.objProduct[0].comment === null || this.objProduct[0].comment === "" || this.objProduct[0].comment === undefined
      || this.objProduct[0].photoOrders.length === 0){
        this.alertCampos();
    }
    else{

      console.log('data', this.objProduct);
  
      this.load.presentLoading('Guardando..');
      this.visibleGuardar = false;
      this.disabled = true;
      this.fotosOrden = [];
  
      // si no hay registro en el get sera un post
      if (this.dataId === false) {
        this.addOrder();
      } else {
        this.updateOrder();
      }
    }
  }
  addOrder() {
    console.log('Obj To send post => ', this.objProduct);
    this.service
      .serviceGeneralPostWithUrl('Order', this.objProduct)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.objProduct);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }
  // no hay update
  updateOrder() {
    // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto
    this.objProduct.forEach(element => {
      if (element.photoOrders.length !== 0) {
        element.photoOrders.forEach((photo) => {
          if (photo.id !== 0) {
            photo.photoPath = '';
          }
        });
      }
    });
    console.log('Obj To send put => ', this.objProduct);
    this.service
      .serviceGeneralPut('Order', this.objProduct)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.objProduct);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }

  async alertCampos(){

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
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

}
class RefrigeradorModel {
  id: number;
  branchId: number;
  averageTime: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoOrders: PhotoReOrderModel[] = [];
}
class PhotoReOrderModel {
  id: number;
  orderId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  filepath: string; //no es parte del modelo solo es para eliminar todas las fotos filesystem
}
