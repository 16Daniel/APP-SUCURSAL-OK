import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AlertController } from '@ionic/angular';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-cocina-mantenimiento',
  templateUrl: './cocina-mantenimiento.component.html',
  styleUrls: ['./cocina-mantenimiento.component.scss'],
})
export class CocinaMantenimientoComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public data: CookModel = new CookModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public disabled = false;
  public activeData = false;

  public radioValue = '1'; 
  public pick1 = 0;
  public pick2 = 0;
  public pick3 = 0;
  public pick4 = 0;
  public pick5 = 0;
  public pick6 = 0;
  public pick7 = 0;
  public pick8 = 0;
  public pick9 = 0;
  public pick10 = 0;
  public pick11 = 0;
  public pick = 0;
  public visibleGuardar = true;
  public Ractivo = false;
  public comentarioId = false; 

  // ******fotos*********
  public base64 = 'data:image/jpeg;base64';
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
      .serviceGeneralGet('Kitchen/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            this.data = resp.result;
            console.log('get data', this.data);
          }
          else {
            this.data.id = 0;
            console.log('completar tarea');
            this.activeData = true;
            this.dataId = false; //no hay registro entonces se hara un post
            this.data.sink = false;
            this.data.correctDistance = false;
            this.data.extractor = false;
            this.data.fryer = false;
            this.data.luminaires = false;
            this.data.mixer = false;
            this.data.doors = false;
            this.data.refrigerator = false;
            this.data.interiorTemperature = false;
            this.data.strainer = false;
            this.data.electricalConnections = false;
          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/5`);
  }
  levantamientoTicket() {
    this.router.navigateByUrl('regional/levantamiento-ticket/' + this.branchId);
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


  conteoFotos(){
    this.pick1 = this.data.photoKitchens.filter(pick => pick.type === 1).length;
    this.pick2 = this.data.photoKitchens.filter(pick => pick.type === 2).length;
    this.pick3 = this.data.photoKitchens.filter(pick => pick.type === 3).length;
    this.pick4 = this.data.photoKitchens.filter(pick => pick.type === 4).length;
    this.pick5 = this.data.photoKitchens.filter(pick => pick.type === 5).length;
    this.pick6 = this.data.photoKitchens.filter(pick => pick.type === 6).length;
    this.pick7 = this.data.photoKitchens.filter(pick => pick.type === 7).length;
    this.pick8 = this.data.photoKitchens.filter(pick => pick.type === 8).length;
    this.pick9 = this.data.photoKitchens.filter(pick => pick.type === 9).length;
    this.pick10 = this.data.photoKitchens.filter(pick => pick.type === 10).length;
    this.pick11 = this.data.photoKitchens.filter(pick => pick.type === 11).length;

    if(this.data.commentCorrectDistance === "" || this.data.commentCorrectDistance === undefined ){
      if(this.data.commentCorrectDistance !== " "){
      this.data.commentCorrectDistance = " ";
      }
    }
    if(this.data.commentDoors === "" || this.data.commentDoors === undefined ){
      if(this.data.commentDoors!== " "){
        this.data.commentDoors = " ";
        }
    }
    if(this.data.commentElectricalConnections === "" || this.data.commentElectricalConnections === undefined ){
      if(this.data.commentElectricalConnections !== " "){
      this.data.commentElectricalConnections = " ";
      }
    }
    if(this.data.commentExtractor === "" || this.data.commentExtractor === undefined ){
      if(this.data.commentExtractor !== " "){
        this.data.commentExtractor = " ";
        }
    }
    if(this.data.commentFryer === "" || this.data.commentFryer === undefined ){
      if(this.data.commentFryer !== " "){
      this.data.commentFryer = " ";
      }
    }
    if(this.data.commentInteriorTemperature === "" || this.data.commentInteriorTemperature === undefined ){
      if(this.data.commentInteriorTemperature !== " "){
        this.data.commentInteriorTemperature = " ";
        }
    }
    if(this.data.commentLuminaires === "" || this.data.commentLuminaires === undefined ){
      if(this.data.commentLuminaires !== " "){
      this.data.commentLuminaires = " ";
      }
    }
    if(this.data.commentMixer === "" || this.data.commentMixer === undefined ){
      if(this.data.commentMixer !== " "){
        this.data.commentMixer = " ";
        }
    }
    if(this.data.commentRefrigerator === "" || this.data.commentRefrigerator === undefined ){
      if(this.data.commentRefrigerator !== " "){
      this.data.commentRefrigerator = " ";
      }
    }
    if(this.data.commentSink === "" || this.data.commentSink === undefined ){
      if(this.data.commentSink !== " "){
        this.data.commentSink = " ";
        }
    }
    if(this.data.commentStrainer === "" || this.data.commentStrainer === undefined ){
      if(this.data.commentStrainer !== " "){
      this.data.commentStrainer = " ";
      }
    }

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
    this.data.photoKitchens.push({
      id: 0,
      kitchenId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      type: idType,
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
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
            this.data.photoKitchens.splice(position, 1);
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
              .serviceGeneralDelete(`Kitchen/${id}/Photo`)
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
    this.comentarioId = true;
    if(this.radioValue === '1' && this.data.commentSink === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '2' && this.data.commentMixer === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '3' && this.data.commentStrainer === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '4' && this.data.commentFryer === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '5' && this.data.commentExtractor === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '6' && this.data.commentRefrigerator === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '7' && this.data.commentInteriorTemperature === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '8' && this.data.commentDoors === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '9' && this.data.commentCorrectDistance === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '10' && this.data.commentElectricalConnections === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '11' && this.data.commentLuminaires === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    this.pick = this.data.photoKitchens.filter(pick => pick.type === Number(this.radioValue)).length;
    if(this.pick === 0 || this.comentarioId === false){
     this.alertCampos();
    }
    else{
    this.visibleGuardar = false;
    this.load.presentLoading('Guardando..');
    this.disabled = true;
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = this.branchId;
    this.data.updatedBy = this.user.id;
    this.data.updatedDate = this.today;
    console.log('Obj To send => ', this.data);
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
    const list: any[] = [];
    list.push(this.data);
    console.log('Obj To send  post=> ', list);
    this.service
      .serviceGeneralPostWithUrl('Kitchen', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          // if(this.data.sink === false || this.data.mixer === false || this.data.strainer === false || this.data.fryer === false || this.data.extractor === false 
          //   || this.data.refrigerator === false || this.data.interiorTemperature === false || this.data.doors === false || this.data.correctDistance === false 
          //   || this.data.electricalConnections === false || this.data.luminaires === false ){
          //   this.levantamientoTicket();
          //  }
          //  else{
          //   this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/5`);
          //  }
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
          
        }
      });
  }
  updateData() {
    const list: any[] = [];
    list.push(this.data);
    console.log('Obj To send put => ', list);
    this.service.serviceGeneralPut('Kitchen', this.data).subscribe((data) => {
      if (data.success) {
        this.load.presentLoading('Actualizando..');
        console.log('data', data);

       if(this.pick1 !== 0 && this.pick2 !== 0 && this.pick3 !== 0 && this.pick4 !== 0 && this.pick5 !== 0 && this.pick6 !== 0 && this.pick7 !== 0 && this.pick8 !== 0 && this.pick9 !== 0 && this.pick10 !== 0 && this.pick11 !== 0){
          if(this.data.sink === false || this.data.mixer === false || this.data.strainer === false || this.data.fryer === false || this.data.extractor === false 
               || this.data.refrigerator === false || this.data.interiorTemperature === false || this.data.doors === false || this.data.correctDistance === false 
               || this.data.electricalConnections === false || this.data.luminaires === false){
            this.levantamientoTicket();
          }
          else{
            window.location.reload();
            this.Ractivo = false;
            this.visibleGuardar = true;
           }
        }
        else{
         window.location.reload();
         this.Ractivo = false;
         this.visibleGuardar = true;
        }
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

class CookModel {
  id: number;
  branchId: number;
  sink: boolean; //type 1
  commentSink: string;
  mixer: boolean; //type 2
  commentMixer: string;
  strainer: boolean; //type 3
  commentStrainer: string;
  fryer: boolean; //type 4
  commentFryer: string;
  extractor: boolean; //type 5
  commentExtractor: string;
  refrigerator: boolean; //type 9
  commentRefrigerator: string;
  interiorTemperature: boolean; //type 6
  commentInteriorTemperature: string;
  doors: boolean; //type 7
  commentDoors: string;
  correctDistance: boolean; //type 8
  commentCorrectDistance: string;
  electricalConnections: boolean; //type 10
  commentElectricalConnections: string;
  luminaires: boolean; //type 11
  commentLuminaires: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoKitchens: PhotoKitchensModel[] = [];
}
class PhotoKitchensModel {
  id: number;
  kitchenId: number;
  photo: string;
  photoPath: string;
  type: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}


