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
  selector: 'app-pollo-precoccion-cocina',
  templateUrl: './pollo-precoccion-cocina.component.html',
  styleUrls: ['./pollo-precoccion-cocina.component.scss'],
})
export class PolloPrecoccionCocinaComponent implements OnInit {
  public today = new Date();
  public user: any;
  public data: PrecookedChickenModel = new PrecookedChickenModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosProducto: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  public toggleChicken;

  public visibleGuardar = true;

  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);
  }
  ngOnInit() { }
  // get data refrigerador
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('PrecookedChicken/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            this.data = resp.result;
            console.log('get data', this.data);
            // cambiar el toggle por el valor correcto
            if (this.data.precookedChickenOnTheTable === true){
              this.toggleChicken = true;
            }
            else{
              this.toggleChicken = false;
            }
          }
          else {
            console.log('completar tarea');
            this.data.id = 0;
            this.toggleChicken = false;
            this.activeData = true;
            this.dataId = false; //no hay registro entonces se hara un post
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

  async addPhotoToGallery(idType: number) {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoPrecookedChickens.push({
      id: 0,
      precookedChickenId: this.data.id,
      type: idType,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
      filepath: ''
    });
    console.log('fotos chicken', this.data);

  }

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
            this.data.photoPrecookedChickens.splice(position, 1);
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
              .serviceGeneralDelete(`PrecookedChicken/${id}/Photo`)
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
    if(this.data.amountPrecookedChickenOnTheTable === null || this.data.amountPrecookedChickenOnTheTable ===  undefined || this.data.commentPrecookedChickenOnTheTable === null || this.data.commentPrecookedChickenOnTheTable === "" || this.data.commentPrecookedChickenOnTheTable === undefined || this.data.photoPrecookedChickens.length === 0){
      this.alertCampos();
    }
    else{
      this.visibleGuardar = false;
      this.load.presentLoading('Guardando..');
      this.disabled = true;
      this.fotosProducto = [];
      // esto se pone aqui por que aun no se estrae la data de un get
      this.data.branchId = this.branchId;
      this.data.updatedBy = this.user.id;
      this.data.updatedDate = this.today;
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
    // validar togles
      this.data.precookedChickenOnTheTable = true;
      this.data.precookedChickenInGeneral = true;
      this.data.bonelesOrPrecookedPotatoes = true;
      // se manda cadena ya que el servicio marca error
      this.data.commentPrecookedChickenInGeneral = '';
      this.data.commentBonelesOrPrecookedPotatoes = '';   

    console.log('Obj To send  post=> ', this.data);
    this.service
      .serviceGeneralPostWithUrl('PrecookedChicken', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }
  updateData() {
    // validar togles
      this.data.precookedChickenOnTheTable = true;
      this.data.precookedChickenInGeneral = true;
      this.data.bonelesOrPrecookedPotatoes = true;
      // se manda cadena ya que el servicio marca error
      this.data.commentPrecookedChickenInGeneral = '';
      this.data.commentBonelesOrPrecookedPotatoes = '';

    // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto

    if (this.data.photoPrecookedChickens.length !== 0) {
      this.data.photoPrecookedChickens.forEach((photo) => {
        if (photo.id !== 0) {
          photo.photoPath = '';
        }
      });
    }


    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut('PrecookedChicken', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
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
class PrecookedChickenModel {
  id: number;
  branchId: number;
  precookedChickenOnTheTable: boolean;
  amountPrecookedChickenOnTheTable: number;
  amountPrecookedChickenInGeneral: number;
  precookedChickenInGeneral: boolean;
  amountBonelesOrPrecookedPotatoes: number;
  bonelesOrPrecookedPotatoes: boolean;
  commentPrecookedChickenOnTheTable: string;
  commentPrecookedChickenInGeneral: string;
  commentBonelesOrPrecookedPotatoes: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoPrecookedChickens: PhotoPrecookedChickensModel[] = [];
}
class PhotoPrecookedChickensModel {
  id: number;
  precookedChickenId: number;
  type: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  filepath: string; //no es parte del modelo solo es para eliminar todas las fotos filesystem

}
