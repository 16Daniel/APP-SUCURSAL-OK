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
  selector: 'app-limpieza-barra-salon',
  templateUrl: './limpieza-barra-salon.component.html',
  styleUrls: ['./limpieza-barra-salon.component.scss'],
})
export class LimpiezaBarraSalonComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public data: BarCleaningModel = new BarCleaningModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosRefrigerador: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  public toggleChicken = true;

  public visibleGuardar = true;

  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public alertController: AlertController,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    console.log('user', this.user);
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);

  }
  ngOnInit() { }

  getData() {
    console.log('get de refrigeradores');
    this.load.presentLoading('Cargando..');
    this.service
      // this.user.branchId
      .serviceGeneralGet('BarCleaning/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          // comprobar si tiene registros por dia
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            console.log('si hay registros del dia', resp);
            this.activeData = true;
            this.data = resp.result;
            console.log('get data', this.data);
          }
          else {
            console.log('Completar la tarea');
            this.dataId = false; //no hay registro entonces se hara un post
            this.activeData = true;
            this.data.id = 0;
          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
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
  // eliminar indice de orden
  async addPhotoToGallery() {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoBarCleanings.push({
      id: 0,
      barCleaningId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
    });
    // this.fotosRefrigerador = this.photoService.photos;
    console.log('fotos refrigerador', this.data);
  }
  // eliminacion de images en storage
  public async showActionSheet(photo, position: number) {
    console.log('photo', photo);
    console.log('posicion', position);
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
            this.data.photoBarCleanings.splice(position, 1);

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
              .serviceGeneralDelete(`BarCleaning/${id}/Photo`)
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
  save() {
    if(this.data.comment === "" || this.data.comment === null || this.data.comment ===undefined || this.data.photoBarCleanings.length === 0){
      this.alertCampos();
    }
    else{
    this.load.presentLoading('Guardando..');
    this.visibleGuardar = false;
    this.data.branchId = this.branchId;
    this.data.updatedBy = this.user.id;
    this.data.updatedDate = this.today;
    this.disabled = true;
    this.fotosRefrigerador = [];
    // si no hay registro en el get sera un post
    if (this.dataId === false) {
      this.addData();
    } else {
      this.updateData();
    }
  }
  }
  addData() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    console.log('Obj To send post => ', this.data);
  
    this.service
      .serviceGeneralPostWithUrl('BarCleaning', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
        }
      });
  }
  updateData() {
    // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto
    if (this.data.photoBarCleanings.length !== 0) {
      this.data.photoBarCleanings.forEach((photo) => {
        if (photo.id !== 0) {
          photo.photoPath = '';
        }
      });
    }
    console.log('Obj To send put=> ', this.data);
    this.service
      .serviceGeneralPut('BarCleaning', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
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
class BarCleaningModel {
  id: number;
  branchId: number;
  isClean: boolean;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoBarCleanings: PhotoBarCleaningsModel[] = [];
}
class PhotoBarCleaningsModel {
  id: number;
  barCleaningId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
