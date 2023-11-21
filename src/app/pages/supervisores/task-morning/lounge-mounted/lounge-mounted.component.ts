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
import { DatePipe } from '@angular/common';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-lounge-mounted',
  templateUrl: './lounge-mounted.component.html',
  styleUrls: ['./lounge-mounted.component.scss'],
})
export class LoungeMountedComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public data: SalonDataModel = new SalonDataModel();
  public dataBranch: any[] = [];
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosSalon;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  public createDate = '';

  public radioValue = '1'; 
  public pick = 0;
  public pick1 = 0;
  public pick2 = 0;
  public pick3 = 0;
  public pick4 = 0;
  public pick5 = 0;
  public pick6 = 0;
  public visibleGuardar = true;
  public Ractivo = false;

  public valUsuario = 0;

  constructor(
    public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService,
    public datepipe: DatePipe,
    public alertController: AlertController

  ) { }
  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    
    this.getData();

    this.valUsuario =Number(this.routerActive.snapshot.paramMap.get('us'));
    console.log(this.valUsuario);
    if(this.valUsuario === 1){this.valUsuario = this.user.id}
  }

  ngOnInit() {
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
  }
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('ToSetTable/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            console.log('si hay registros del dia');
            this.data = resp.result;
            console.log('get data', this.data);
            this.conteoFotos();
          }
          else {
            this.activeData = true;
            console.log('completar tarea');
            this.dataId = false; //no hay registro entonces se hara un post
            this.data.id = 0;
            this.data.cajeros = 0;
            this.data.cocineros = 0;
            this.data.vendedores = 0;      

          }
        }
        this.conteoFotos();
      });
      this.conteoFotos();
  }

    conteoFotos(){
    this.pick1 = this.data.photoToSetTables.filter(pick => pick.type === 1).length;
    this.pick2 = this.data.photoToSetTables.filter(pick => pick.type === 2).length;
    this.pick3 = this.data.photoToSetTables.filter(pick => pick.type === 3).length;
    this.pick4 = this.data.photoToSetTables.filter(pick => pick.type === 4).length;
    this.pick5 = this.data.photoToSetTables.filter(pick => pick.type === 5).length;
    this.pick6 = this.data.photoToSetTables.filter(pick => pick.type === 6).length;

    if(this.data.commentCocina === "" || this.data.commentCocina === undefined ){
      if(this.data.commentCocina  !== " "){
      this.data.commentCocina  = " ";
      }
    }
    if(this.data.commentMeet === "" || this.data.commentMeet === undefined ){
      if(this.data.commentMeet !== " "){
        this.data.commentMeet = " ";
        }
    }
    if(this.data.commentSalon === "" || this.data.commentSalon === undefined ){
      if(this.data.commentSalon !== " "){
      this.data.commentSalon = " ";
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
      this.data.photoToSetTables.push({
        id: 0,
        toSetTableId: this.data.id,
        photo: this.photoService.photos[0].webviewPath,
        photoPath: 'jpeg',
        type: idType,
        createdBy: this.user.id,
        createdDate: this.today,
        updatedBy: this.valUsuario,
        updatedDate: this.today,
      });
      console.log('fotos chicken', this.data);
      this.conteoFotos();
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
            this.data.photoToSetTables.splice(position, 1);
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
              .serviceGeneralDelete(`ToSetTable/${id}/Photo`)
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
    this.data.updatedBy = this.valUsuario,
    this.data.updatedDate = this.createDate;
    if (this.data.id === 0) {
      this.addSalon();
    } else {
      this.updateSAlon();
    }
  }

  save() {
    this.pick=0;
    if(this.radioValue == '1' && this.pick1 !== 0 && this.data.commentSalon !== " "){
      this.pick = 1;
    }
    if(this.radioValue == '2' && this.pick2 !== 0 && this.data.commentCocina !== " "){
      this.pick = 1;
    }
    if(this.radioValue == '3' && this.pick3 !== 0 && this.pick4 !== 0 && this.pick5 !== 0){
      this.pick = 1;
    }
    if(this.radioValue == '4' && this.pick6 !== 0 && this.data.commentMeet !== " "){
      this.pick = 1;
    }
    if(this.pick === 0){
      this.alertCampos();
    }
    else{
      this.load.presentLoading('Guardando..');
      this.visibleGuardar = false;
      this.disabled = true;
      this.fotosSalon = [];
      if (this.data.photoToSetTables.length !== 0) {
        this.data.photoToSetTables.forEach((photo) => {
          if (photo.id !== 0) {
            photo.photoPath = '';
          }
        });
      }
      this.data.branch = this.user.branchId;
      this.formartDate();

      // if (this.branchId === '0') {
      // } else {
      //   this.updateSAlon();
      // }
    }
  }
  addSalon() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.createDate;
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPostWithUrl('ToSetTable', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.data);
          //this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
        }
      });
  }
  updateSAlon() {
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPut('ToSetTable', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.data);
          //this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
          this.disabled = false;
        } else {
          this.disabled = false;
        }
      });
  }
}

class SalonDataModel {
  id: number;
  branch: number;
  commentSalon: string;
  commentCocina: string;
  commentMeet: string;
  cajeros: number;
  vendedores: number;
  cocineros: number;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoToSetTables: PhotoTableModel[] = [];
}
class PhotoTableModel {
  id: number;
  toSetTableId: number;
  photoPath: string;
  photo: string;
  type: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
