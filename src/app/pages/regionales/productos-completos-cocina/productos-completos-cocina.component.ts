import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-productos-completos-cocina',
  templateUrl: './productos-completos-cocina.component.html',
  styleUrls: ['./productos-completos-cocina.component.scss'],
})
export class ProductosCompletosCocinaComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  // public data: ProductoModel = new ProductoModel();
  public objProduct: any[] = [];
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosProducto: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  // ******variables de validacion ********
  public activeCode = false;
  public activeComment = false;
  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch();
  }
  ngOnInit() { }
  // get data productos
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('CompleteProductsInOrder/' + this.branchId)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            this.objProduct = resp.result;
            console.log('get data', this.objProduct);
          }
          else {
            console.log('Completar la tarea');
            this.activeData = true;
            this.dataId = false; //no hay registro entonces se hara un post
            this.objProduct = [
              {
                id: 0,
                branchId: this.branchId,
                code: '',
                comment: '',
                createdBy: this.user.id,
                createdDate: this.today,
                updatedBy: this.user.id,
                updatedDate: this.today,
                photoCompleteProductsInOrders: [],
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
  getBranch() {
    let branchIdNumber = 0;
    branchIdNumber = Number(this.branchId);
    console.log('branchIdNumber', branchIdNumber);
    this.service.serviceGeneralGet('StockChicken/Admin/All-Branch').subscribe(resp => {
      if (resp.success) {
        this.dataBranch = resp.result;
        console.log('get branch', this.dataBranch);
        this.dataBranch.forEach(element => {
          if (element.branchId === branchIdNumber) {
            this.nameBranch = element.branchName;
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
      code: '',
      comment: '',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
      photoCompleteProductsInOrders: [],
    });
    console.log('obj data', this.objProduct);
  }
  deleteObjProduct(index) {
    console.log('delete index', index);
    this.objProduct.splice(index, 1);
  }


  async addPhotoToGallery(index) {
    console.log('index de', index);
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    console.log('data obj', this.objProduct);
    for (let i = 0; i < this.objProduct.length; i++) {
      if (index === i) {
        const element = this.objProduct[i];
        element.photoCompleteProductsInOrders.push({
          id: 0,
          completeProductsInOrderId: element.id,
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
    console.log('objProducto', this.objProduct);
  }

  public async showActionSheet(photo: UserPhoto, position: number, index) {
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
                element.photoCompleteProductsInOrders.splice(position, 1);
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
    console.log('id', id);

    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.service
              .serviceGeneralDelete(`CompleteProductsInOrder/${id}/Photo`)
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
  // validateSave() {
  //   if (
  //     this.objProduct.code === '' ||
  //     this.objProduct.code === undefined ||
  //     this.objProduct.code === null
  //   ) {
  //     this.activeCode = true;
  //   } else {
  //     this.activeCode = false;
  //   }
  //   if (
  //     this.objProduct.comment === '' ||
  //     this.objProduct.comment === undefined ||
  //     this.objProduct.comment === null
  //   ) {
  //     this.activeComment = true;
  //   } else {
  //     this.activeComment = false;
  //   }
  //   if (
  //     this.objProduct.code === '' ||
  //     this.objProduct.code === undefined ||
  //     this.objProduct.comment === '' ||
  //     this.objProduct.comment === undefined
  //   ) {
  //     return;
  //   } else {
  //     this.save();
  //   }
  // }
  save() {
    this.disabled = true;
    this.fotosProducto = [];
    // si no hay registro en el get sera un post
    if (this.dataId === false) {
      this.addProduct();
    } else {
      this.updateProduct();
    }
  }
  addProduct() {
    console.log('Obj To send => ', this.objProduct);
    this.service
      .serviceGeneralPostWithUrl('CompleteProductsInOrder', this.objProduct)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.objProduct);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }
  updateProduct() {
    // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto
    this.objProduct.forEach(element => {
      if (element.photoCompleteProductsInOrders.length !== 0) {
        element.photoCompleteProductsInOrders.forEach((photo) => {
          if (photo.id !== 0) {
            photo.photoPath = '';
          }
        });
      }
    });
    console.log('Obj To send => ', this.objProduct);
    this.service
      .serviceGeneralPut('CompleteProductsInOrder', this.objProduct)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.objProduct);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }
}
class ProductoModel {
  id: number;
  code: string;
  branchId: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoCompleteProductsInOrders: PhotoProductoModel[] = [];
}
class PhotoProductoModel {
  completeProductsInOrderId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  filepath: string; //no es parte del modelo solo es para eliminar todas las fotos filesystem
}


