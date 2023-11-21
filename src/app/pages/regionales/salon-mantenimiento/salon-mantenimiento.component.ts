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
  selector: 'app-salon-mantenimiento',
  templateUrl: './salon-mantenimiento.component.html',
  styleUrls: ['./salon-mantenimiento.component.scss'],
})
export class SalonMantenimientoComponent implements OnInit {

  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public data: RoomModel = new RoomModel();
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
  public pick = 0;
  public visibleGuardar = true;
  public Ractivo = false;
  public comentarioId = false; 

  // ******fotos*********
  public base64 = 'data:image/jpeg;base64';
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  constructor(public router: Router,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public alertController: AlertController,
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
      .serviceGeneralGet('Salon/' + this.branchId)
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
            this.data.accessDoors = false;
            this.data.furnitureOne = false;
            this.data.switches = false;
            this.data.badges = false;
            this.data.fireExtinguishers = false;
            this.data.furnitureTwo = false;
            this.data.boths = false;
            this.data.luminaires = false;
          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/5`);
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
    this.pick1 = this.data.photoSalons.filter(pick => pick.type === 1).length;
    this.pick2 = this.data.photoSalons.filter(pick => pick.type === 2).length;
    this.pick3 = this.data.photoSalons.filter(pick => pick.type === 3).length;
    this.pick4 = this.data.photoSalons.filter(pick => pick.type === 4).length;
    this.pick5 = this.data.photoSalons.filter(pick => pick.type === 5).length;
    this.pick6 = this.data.photoSalons.filter(pick => pick.type === 6).length;
    this.pick7 = this.data.photoSalons.filter(pick => pick.type === 7).length;
    this.pick8 = this.data.photoSalons.filter(pick => pick.type === 8).length;


    if(this.data.commentAccessDoors === "" || this.data.commentAccessDoors=== undefined ){
      if(this.data.commentAccessDoors !== " "){
      this.data.commentAccessDoors = " ";
      }
    }
    if(this.data.commentBadges === "" || this.data.commentBadges === undefined ){
      if(this.data.commentBadges!== " "){
        this.data.commentBadges = " ";
        }
    }
    if(this.data.commentBoths === "" || this.data.commentBoths === undefined ){
      if(this.data.commentBoths !== " "){
      this.data.commentBoths = " ";
      }
    }
    if(this.data.commentFireExtinguishers === "" || this.data.commentFireExtinguishers === undefined ){
      if(this.data.commentFireExtinguishers !== " "){
        this.data.commentFireExtinguishers = " ";
        }
    }
    if(this.data.commentFurnitureOne === "" || this.data.commentFurnitureOne === undefined ){
      if(this.data.commentFurnitureOne !== " "){
      this.data.commentFurnitureOne = " ";
      }
    }
    if(this.data.commentFurnitureTwo === "" || this.data.commentFurnitureTwo === undefined ){
      if(this.data.commentFurnitureTwo !== " "){
        this.data.commentFurnitureTwo = " ";
        }
    }
    if(this.data.commentLuminaires === "" || this.data.commentLuminaires === undefined ){
      if(this.data.commentLuminaires !== " "){
      this.data.commentLuminaires = " ";
      }
    }
    if(this.data.commentSwitches === "" || this.data.commentSwitches=== undefined ){
      if(this.data.commentSwitches !== " "){
        this.data.commentSwitches = " ";
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
    this.data.photoSalons.push({
      id: 0,
      salonId: this.data.id,
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
            this.data.photoSalons.splice(position, 1);
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
              .serviceGeneralDelete(`Salon/${id}/Photo`)
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

  levantamientoTicket() {
    this.router.navigateByUrl('regional/levantamiento-ticket/' + this.branchId);
  }
  save() {

    this.comentarioId = true;
    if(this.radioValue === '1' && this.data.commentAccessDoors === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '2' && this.data.commentBadges === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '3' && this.data.commentLuminaires === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '4' && this.data.commentSwitches === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '5' && this.data.commentFurnitureOne === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '6' && this.data.commentFurnitureTwo === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '7' && this.data.commentBoths === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '8' && this.data.commentFireExtinguishers === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }

    this.pick = this.data.photoSalons.filter(pick => pick.type === Number(this.radioValue)).length;
    if(this.pick === 0 || this.comentarioId === false){
     this.alertCampos();
    }
    else{
    this.load.presentLoading('Guardando..');
    this.visibleGuardar = false;
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
    console.log('Obj To send  post=> ', this.data);
    this.service
      .serviceGeneralPostWithUrl('Salon/', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          // if(this.data.accessDoors === false || this.data.badges === false || this.data.luminaires === false || this.data.switches === false || this.data.furnitureOne === false
          //   || this.data.furnitureTwo === false || this.data.boths === false || this.data.fireExtinguishers === false){
          //  this.levantamientoTicket();
          // }
          // else{
          // this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/5`);
          // }
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
        }
      });
  }
  updateData() {
    console.log('Obj To send put => ', this.data);
    this.service.serviceGeneralPut('Salon/', this.data).subscribe((data) => {
      if (data.success) {
        this.load.presentLoading('Actualizando..');
        console.log('data', data);

        if(this.pick1 !== 0 && this.pick2 !== 0 && this.pick3 !== 0 && this.pick4 !== 0 && this.pick5 !== 0 && this.pick6 !== 0 && this.pick7 !== 0 && this.pick8 !== 0 ){
          if(this.data.accessDoors === false || this.data.badges === false || this.data.luminaires === false || this.data.switches === false || this.data.furnitureOne === false
               || this.data.furnitureTwo === false || this.data.boths === false || this.data.fireExtinguishers === false){
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

class RoomModel {
  id: number;
  branchId: number;
  accessDoors: boolean; //type 1
  commentAccessDoors: string;
  badges: boolean; //type 2
  commentBadges: string;
  luminaires: boolean; //type 3
  commentLuminaires: string;
  switches: boolean; //type 4
  commentSwitches: string;
  furnitureOne: boolean; //type 5
  commentFurnitureOne: string;
  furnitureTwo: boolean; //type 6
  commentFurnitureTwo: string;
  boths: boolean; //type 7
  commentBoths: string;
  fireExtinguishers: boolean; //type 8
  commentFireExtinguishers: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoSalons: PhotoSalonsModel[]=[];
}
class PhotoSalonsModel {
  id: number;
  salonId: number;
  photo: string;
  photoPath: string;
  type: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}



