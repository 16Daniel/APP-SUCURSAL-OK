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
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-alarma',
  templateUrl: './alarma.component.html',
  styleUrls: ['./alarma.component.scss'],
})
export class AlarmaComponent implements OnInit {
  public today = new Date();
  public user: any;
  public idAlarma: string;
  public data: AlarmModel = new AlarmModel();
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosAlarma;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  // nombre de sucursal
  public branchId;
  public nameBranch = '';
  public dataBranch: any[] = [];
  public visibleGuardar = true;

  constructor(
    public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    public photoService: PhotoService
  ) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.idAlarma = this.routerActive.snapshot.paramMap.get('id');
    // get name de sucursal
    this.branchId = this.user.branchId;
    if (this.idAlarma === '0') {
      console.log('Completar la tarea');
    } else {
      console.log('Actualizar la tarea');
      this.getData();
    }
  }

  ngOnInit() { }
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('Alarm/' + this.idAlarma)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
          console.log('get data', this.data);
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
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

  async addPhotoToGallery() {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();

    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoAlarms.push({
      id: 0,
      alarmId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
    });
    console.log('fotos ', this.data);
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
            this.data.photoAlarms.splice(position, 1);
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
              .serviceGeneralDelete(`Alarm/${id}/Photo`)
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

  save() {
    // if(this.data.comment == undefined || this.data.colaborador == undefined || this.data.supervisor == undefined 
    //   || this.data.litrosF1 == undefined || this.data.litrosF2 == undefined || this.data.litrosF3 == undefined 
    //   || this.data.tipoF1 == undefined || this.data.tipoF2 == undefined || this.data.tipoF3 == undefined 
    //   || this.data.photoAlarms.length == 0){
    if(this.data.comment == undefined || this.data.litrosF1 == undefined || this.data.litrosF2 == undefined || this.data.litrosF3 == undefined 
      || this.data.tipoF1 == undefined || this.data.tipoF2 == undefined || this.data.tipoF3 == undefined 
      || this.data.photoAlarms.length == 0){

      this.alertCampos();
    }
    else{
      this.data.colaborador = "na";
      this.data.supervisor = "na";
      this.disabled = true;
      this.fotosAlarma = [];
      // esto se pone aqui por que aun no se estrae la data de un get
      this.data.branchId = this.user.branchId;
      this.data.updatedBy = this.user.id;
      this.data.updatedDate = this.today;
      console.log('Obj To send => ', this.data);
  
      if (this.idAlarma === '0') {
        this.addData();
      } else {
        this.updateData();
      }
    }
  }
  addData() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    this.service
      .serviceGeneralPostWithUrl('Alarm', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.disabled = false;
          this.return();
        }
      });
  }
  updateData() {
    if (this.data.photoAlarms.length !== 0) {
      this.data.photoAlarms.forEach((element) => {
        if (element.id !== 0) {
          element.photoPath = '';
        }
      });
    }
    this.service.serviceGeneralPut('Alarm', this.data).subscribe((data) => {
      if (data.success) {
        this.load.presentLoading('Actualizando..');
        console.log('data', data);
        this.photoService.deleteAllPhoto(this.data);
        this.disabled = false;
        this.return();
      }
    });
  }
}
class AlarmModel {
  id: number;
  branchId: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoAlarms: PhotoAlarmModel[] = [];
  tipoF1: string;
  tipoF2: string;
  tipoF3: string;
  litrosF1: number;
  litrosF2: number;
  litrosF3: number;
  colaborador: string;
  supervisor: string;
}
class PhotoAlarmModel {
  id: number;
  alarmId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
