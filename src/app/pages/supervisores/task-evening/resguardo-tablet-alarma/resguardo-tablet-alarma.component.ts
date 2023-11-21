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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-resguardo-tablet-alarma',
  templateUrl: './resguardo-tablet-alarma.component.html',
  styleUrls: ['./resguardo-tablet-alarma.component.scss'],
})
export class ResguardoTabletAlarmaComponent implements OnInit {

  public today = new Date();
  public user: any;
  public idTablet: string;
  public idAlarma: string;

  public dataTablet: TabletModel = new TabletModel();
  public dataAlarma: AlarmModel = new AlarmModel();

  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosTablet;
  public fotosAlarma;
  public createDate = '';
  public visibleGuardar = true;

  public valUsuario = 0;

  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService,
    public alertController: AlertController,
    public datepipe: DatePipe
  ) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    this.idTablet = this.routerActive.snapshot.paramMap.get('idTablet');
    //this.idAlarma = this.routerActive.snapshot.paramMap.get('idAlarma');
    //console.log(`idTablet ${this.idTablet} idAlarma ${this.idAlarma}`);
    console.log(`idTablet ${this.idTablet}`);
    // get name de sucursal
    if (this.idTablet === '0') {
      console.log('Completar la tarea');
    } else {
      console.log('Actualizar la tarea');
      this.getDataTablet();
    }

    this.valUsuario =Number(this.routerActive.snapshot.paramMap.get('us'));
    console.log(this.valUsuario);
    if(this.valUsuario === 1){this.valUsuario = this.user.id}
    // if (this.idAlarma === '0') {
    //   console.log('Completar la tarea');
    // } else {
    //   console.log('Actualizar la tarea');
    //   this.getDataAlarma();
    // }
  }
  ngOnInit() { }

  getDataTablet() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('TabletSafeKeeping/' + this.idTablet)
      .subscribe((resp) => {
        if (resp.success) {
          this.dataTablet = resp.result;
          console.log('get dataTablet', this.dataTablet);
        }
      });
  }
  // getDataAlarma() {
  //   this.load.presentLoading('Cargando..');
  //   this.service
  //     .serviceGeneralGet('Alarm/' + this.idAlarma)
  //     .subscribe((resp) => {
  //       if (resp.success) {
  //         this.dataAlarma = resp.result;
  //         console.log('get data', this.dataAlarma);
  //       }
  //     });
  // }
  return() {
    this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
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

  async addPhotoToGalleryTablet() {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.dataTablet.photoTabletSageKeepings.push({
      id: 0,
      tabletSafeKeepingId: this.dataTablet.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.valUsuario,
      updatedDate: this.today,
    });
    console.log('fotos chicken', this.dataTablet);
  }
  // async addPhotoToGalleryAlarma() {
  //   const name = new Date().toISOString();
  //   await this.photoService.addNewToGallery();
  //   await this.photoService.loadSaved();

  //   // agregaremos las fotos pero con id type de acuerdo al caso
  //   // al agregar las fotos en storage, las pasamos por lista
  //   console.log('obj fotos', this.photoService);
  //   this.dataAlarma.photoAlarms.push({
  //     id: 0,
  //     alarmId: this.dataAlarma.id,
  //     photo: this.photoService.photos[0].webviewPath,
  //     photoPath: 'jpeg',
  //     createdBy: this.user.id,
  //     createdDate: this.today,
  //     updatedBy: this.user.id,
  //     updatedDate: this.today,
  //   });
  //   console.log('fotos ', this.dataAlarma);
  // }


  public async showActionSheetTablet(photo, position: number) {
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
            this.dataTablet.photoTabletSageKeepings.splice(position, 1);
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
  // public async showActionSheetAlarma(photo, position: number) {
  //   console.log('photo', photo);
  //   console.log('posicion', position);

  //   const actionSheet = await this.actionSheetController.create({
  //     header: 'Photos',
  //     buttons: [
  //       {
  //         text: 'Delete',
  //         role: 'destructive',
  //         icon: 'trash',
  //         handler: () => {
  //           this.photoService.deletePicture(photo, position);
  //           //
  //           this.dataAlarma.photoAlarms.splice(position, 1);
  //         },
  //       },
  //       {
  //         text: 'Cancel',
  //         icon: 'close',
  //         role: 'cancel',
  //         handler: () => {
  //           // Nothing to do, action sheet is automatically closed
  //         },
  //       },
  //     ],
  //   });
  //   await actionSheet.present();
  // }


  //eliminar imagenes bd
  public async deleteImgShowActionTablet(id) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.service
              .serviceGeneralDelete(`TabletSafeKeeping/${id}/Photo`)
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
  // public async deleteImgShowActionAlarma(id) {
  //   const actionSheet = await this.actionSheetController.create({
  //     header: 'Photos',
  //     buttons: [
  //       {
  //         text: 'Delete',
  //         role: 'destructive',
  //         icon: 'trash',
  //         handler: () => {
  //           this.service
  //             .serviceGeneralDelete(`Alarm/${id}/Photo`)
  //             .subscribe((data) => {
  //               if (data.success) {
  //                 this.load.presentLoading('Eliminando..');
  //                 console.log('data', data);
  //                 this.ionViewWillEnter();
  //               }
  //             });
  //         },
  //       },
  //       {
  //         text: 'Cancel',
  //         icon: 'close',
  //         role: 'cancel',
  //         handler: () => {
  //           // Nothing to do, action sheet is automatically closed
  //         },
  //       },
  //     ],
  //   });
  //   await actionSheet.present();
  // }
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
    this.saveTablet();
  }

  allSave() {
    if(this.dataTablet.comment == undefined || this.dataTablet.comment == "" || this.dataTablet.comment == null || this.dataTablet.photoTabletSageKeepings.length == 0){
     this.alertCampos();
    }
    else{
      this.visibleGuardar = false;
      this.load.presentLoading('Guardando..');
      this.alertAlarma();
    }
    
    
  }
  async alertAlarma(){

      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'IMPORTANTE',
        subHeader: 'ALARMA',
        message: 'RECUERDA NO SALIR DE LA SUCURSAL <BR>SIN ANTES ACTIVAR LA ALARMA',
        mode: 'ios',
        buttons: ['OK'],
      });
      await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      this.formartDate();
  }


  saveTablet() {
    this.disabled = true;
    this.fotosTablet = [];
    // esto se pone aqui por que aun no se estrae la data de un get
    this.dataTablet.branchId = this.user.branchId;
    this.dataTablet.updatedBy = this.valUsuario,
    this.dataTablet.updatedDate = this.createDate;
    if (this.idTablet === '0') {
      this.addTablet();
    } else {
      this.updateTablet();
    }
  }
  // saveAlarma() {
  //   this.disabled = true;
  //   this.fotosAlarma = [];
  //   // esto se pone aqui por que aun no se estrae la data de un get
  //   this.dataAlarma.branchId = this.user.branchId;
  //   this.dataAlarma.updatedBy = this.user.id;
  //   this.dataAlarma.updatedDate = this.createDate;
  //   if (this.idAlarma === '0') {
  //     this.addDataAlarma();
  //   } else {
  //     this.updateDataAlarma();
  //   }
  // }
  addTablet() {
    this.dataTablet.createdBy = this.user.id;
    this.dataTablet.createdDate = this.createDate;
    console.log('Obj a guardar =>', this.dataTablet);
    this.service
      .serviceGeneralPostWithUrl('TabletSafeKeeping', this.dataTablet)
      .subscribe((data) => {
        if (data.success) {
          // this.load.presentLoading('Guardando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.dataTablet);
          // this.disabled = false;
          //this.saveAlarma();
          this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
        }
      });
  }
  updateTablet() {
    if (this.dataTablet.photoTabletSageKeepings.length !== 0) {
      this.dataTablet.photoTabletSageKeepings.forEach((element) => {
        if (element.id !== 0) {
          element.photoPath = '';
        }
      });
    }
    this.service
      .serviceGeneralPut('TabletSafeKeeping', this.dataTablet)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          // this.disabled = false;
          this.photoService.deleteAllPhoto(this.dataTablet);
          this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
          //this.saveAlarma();
        }
      });
  }
  // addDataAlarma() {
  //   this.dataAlarma.createdBy = this.user.id;
  //   this.dataAlarma.createdDate = this.createDate;
  //   console.log('Obj a guardar =>', this.dataAlarma);
  //   this.service
  //     .serviceGeneralPostWithUrl('Alarm', this.dataAlarma)
  //     .subscribe((data) => {
  //       if (data.success) {
  //         this.load.presentLoading('Guardando..');
  //         console.log('Resp Serv =>', data);
  //         this.photoService.deleteAllPhoto(this.dataAlarma);
  //         this.disabled = false;
  //         this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
  //       }
  //     });
  // }
  // updateDataAlarma() {
  //   if (this.dataAlarma.photoAlarms.length !== 0) {
  //     this.dataAlarma.photoAlarms.forEach((element) => {
  //       if (element.id !== 0) {
  //         element.photoPath = '';
  //       }
  //     });
  //   }
  //   console.log('Obj a guardar =>', this.dataAlarma);
  //   this.service.serviceGeneralPut('Alarm', this.dataAlarma).subscribe((data) => {
  //     if (data.success) {
  //       this.load.presentLoading('Actualizando..');
  //       console.log('Resp Serv =>', data);
  //       this.photoService.deleteAllPhoto(this.dataAlarma);
  //       this.disabled = false;
  //       this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
  //     }
  //   });
  // }

}
class TabletModel {
  id: number;
  branchId: number;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoTabletSageKeepings: PhotoTabletModel[] = [];
}
class PhotoTabletModel {
  id: number;
  tabletSafeKeepingId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
class AlarmModel {
  id: number;
  branchId: number;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoAlarms: PhotoAlarmModel[] = [];
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

