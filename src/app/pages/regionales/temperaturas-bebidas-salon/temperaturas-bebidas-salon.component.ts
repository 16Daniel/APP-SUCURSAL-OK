import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
// fotos
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AlertController } from '@ionic/angular';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
import { ActionSheetController } from '@ionic/angular';
@Component({
  selector: 'app-temperaturas-bebidas-salon',
  templateUrl: './temperaturas-bebidas-salon.component.html',
  styleUrls: ['./temperaturas-bebidas-salon.component.scss'],
})
export class TemperaturasBebidasSalonComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public data: DrinkTemperatureModel = new DrinkTemperatureModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public disabled = false;
  public activeData = false;

  public radioValue = '1';
  public pick = 0;
  public pick1 = 0;
  public pick2 = 0;
  public pick3 = 0;
  public Ractivo = false;

  public visibleGuardar = true;


  // ******fotos*********
  public base64 = 'data:image/jpeg;base64';
  public fotosCleanRoom: any;
  public fotosCleanCubeta: any;
  public fotosCleanBooths: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  constructor(public router: Router,
    public routerActive: ActivatedRoute,
    public alertController: AlertController,
    public service: ServiceGeneralService,
    public load: LoaderComponent, private camera: Camera, public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);

  }
  ngOnInit() { }

  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('DrinksTemperature/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            this.data = resp.result[0];
            console.log('get data', this.data);
            if(this.data.chope == false){ this.radioValue = '3'}
          }
          else {
            this.data.id = 0;
            console.log('completar tarea');
            this.activeData = true;
            this.dataId = false; //no hay registro entonces se hara un post
            this.data.lightBeer = false;
            this.data.darkBeer= false;
            this.data.drinkOne = false;
            this.data.drinkTwo = false;
            this.data.drinkThree = false;
            this.data.drinkFour = false;
            this.data.drinkFive = false;
            this.data.chope = true;

          }
        }
      });
  }

  conteoFotos(){
    this.pick1 = this.data.photoDrinksTemperatures.filter(pick => pick.type === 1).length;
    this.pick2 = this.data.photoDrinksTemperatures.filter(pick => pick.type === 2).length;
    this.pick3 = this.data.photoDrinksTemperatures.filter(pick => pick.type === 3).length;
    
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
            this.conteoFotos();
          }
        });
      }
    });
  }
  myChange($event) {
    if(this.data.chope == false){
      this.radioValue = '3';
    }
    else{this.radioValue = '1';}
  }
  // agregar fotos de limpieza de salon
  async addPhotoToGallery(idType: number) {
    this.Ractivo = true;
    this.photoService.limpiaStorage();
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoDrinksTemperatures.push({
      id: 0,
      drinkTemperatureId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      type: idType,
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
      filepath: ''
    });
    console.log('fotos chicken', this.data);
    this.conteoFotos();
  }
  // acciones para las fotos de limpieza de salon
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
            this.data.photoDrinksTemperatures.splice(position, 1);
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
              .serviceGeneralDelete(`DrinksTemperature/${id}/Photo`)
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
    this.pick = this.data.photoDrinksTemperatures.filter(pick => pick.type === Number(this.radioValue)).length;
    if(this.pick === 0){
     this.alertCampos();
    }
    else{
    this.load.presentLoading('Guardando..');
    this.visibleGuardar = false;
    this.disabled = true;
    this.fotosCleanBooths = [];
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = this.branchId;
    this.data.updatedBy = this.user.id;
    this.data.updatedDate = this.today;
    console.log('Obj To send => ', this.data);
    // si no hay registro en el get sera un post
    if (this.dataId === false) {
      this.addDrinkTemperature();
    } else {
      this.updateDrinkTemperature();
    }
  }
  }
  addDrinkTemperature() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    const list:  any[]= [];
    list.push(this.data);
    console.log('Obj To send  post=> ', list);
    this.service
      .serviceGeneralPostWithUrl('DrinksTemperature', list)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          // this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
          // this.router.navigateByUrl('regional/temperatura-bebidas/' + this.branchId);
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
        }
      });
      
  }
  updateDrinkTemperature() {

    if (this.data.photoDrinksTemperatures.length !== 0) {
      this.data.photoDrinksTemperatures.forEach((photo) => {
        if (photo.id !== 0) {
          photo.photoPath = '';
        }
      });
    }
    const list: any[] = [];
    list.push(this.data);
    console.log('Obj To send put => ', list);
    this.service.serviceGeneralPut('DrinksTemperature', list).subscribe((data) => {
      if (data.success) {
        this.load.presentLoading('Actualizando..');
        console.log('data', data);
        // this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
        // this.router.navigateByUrl('regional/temperatura-bebidas/' + this.branchId);
        window.location.reload();
        this.Ractivo = false;
        this.visibleGuardar = true;
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


class DrinkTemperatureModel {
  id: number;
  branchId: number;
  lightBeer: boolean;
  darkBeer: boolean;
  drinkOne: boolean;
  drinkTwo: boolean;
  drinkThree: boolean;
  drinkFour: boolean;
  drinkFive: boolean;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoDrinksTemperatures: PhotoDrinksTemperaturesModel[] = [];
  chope: boolean;
}
class PhotoDrinksTemperaturesModel {
  id: number;
  drinkTemperatureId: number;
  photo: string;
  photoPath: string;
  type: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  filepath: string; //no es parte del modelo solo es para eliminar todas las fotos filesystem

}

