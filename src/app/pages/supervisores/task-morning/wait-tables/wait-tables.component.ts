import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PhotoService } from 'src/app/core/services/services/photo.service';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-wait-tables',
  templateUrl: './wait-tables.component.html',
  styleUrls: ['./wait-tables.component.scss'],
})
export class WaitTablesComponent implements OnInit {
  public user: any;
  public idTable: string;
  public today = new Date();
  public data: WaitTableModel = new WaitTableModel();
  public activeData = false;
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public url = 'http://operamx.mooo.com/back/api_rebel_wings/';
  public turno;
  public createDate = '';
  public visibleGuardar = true;
  public carga = 0;

  public valUsuario = 0;

  public fotosWaitlist;
  public options: CameraOptions = {
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
  };

  constructor(
    public routerActive: ActivatedRoute,
    public router: Router,
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    private camera: Camera,
    public datepipe: DatePipe,
    public alertController: AlertController
  ) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.idTable = this.routerActive.snapshot.paramMap.get('id');
    this.turno = this.routerActive.snapshot.paramMap.get('turno');


    this.valUsuario =Number(this.routerActive.snapshot.paramMap.get('us'));
    console.log(this.valUsuario);
    if(this.valUsuario === 1){this.valUsuario = this.user.id}

    console.log('turno select', this.turno);
    if (this.idTable === '0') {
      console.log('Completar la tarea');
      this.activeData = true;
    } else {
      console.log('Actualizar la tarea');
      this.getData();
    }
    console.log('fotos count', this.data.photoWaitlistTables.length);
    this.calculaCarga();
  }

  async ngOnInit() { }

  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('WaitListTable/' + this.idTable)
      .subscribe((resp) => {
        if (resp.success) {
          this.activeData = true;
          this.data = resp.result;
          console.log('get data', this.data);
        }
      });
  }
  calculaCarga(){
   const dia = new Date();
   if(dia.getHours() > 13 && dia.getHours() <= 15){
    console.log('carga 1', dia.getHours());
    this.carga = 1;
   }
   if(dia.getHours() > 15 && dia.getHours() <= 17){
    console.log('carga 2', dia.getHours());
    this.carga = 2;
   }
  }

  return() {
    // window.history.back();
    if (this.turno === '1') {
      this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
    }
    else {
      this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
    }
  }

  async addPhotoToGallery() {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoWaitlistTables.push({
      id: 0,
      waitlistTableId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.valUsuario,
      updatedDate: this.today,
    });
    console.log('fotos mesas en espera', this.data);
    console.log('fotos count', this.data.photoWaitlistTables.length);
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
            this.data.photoWaitlistTables.splice(position, 1);
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
                .serviceGeneralDelete(`WaitListTable/${id}/Photo`)
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
    if (this.idTable === '0') {
      console.log('add data');
      this.addData();
    }
    else {
      this.updateData();
    }

    // this.data.time = datetime;
  }

  save() {
    if(this.valUsuario !== 1){
      this.data.updatedBy = this.valUsuario;
      }

    if(this.data.numberPeople == undefined || this.data.numberPeople == null || this.data.comment == undefined || this.data.comment == null || this.data.comment == "" || this.data.photoWaitlistTables.length == 0){
     this.alertCampos();
    }
    else{
      this.visibleGuardar = false;
      this.load.presentLoading('Guardando..');

      this.disabled = true;
      this.fotosWaitlist = [];
      if (this.data.photoWaitlistTables.length !== 0) {
        this.data.photoWaitlistTables.forEach((photo) => {
          if (photo.id !== 0) {
            photo.photoPath = '';
          }
        });
      }
  
      this.data.howManyTables = 0;
      this.data.waitlistTables = true;
      this.data.branch = this.user.branchId;
      this.fotosWaitlist = this.photoService.photos;
      console.log('Obj To send => ', this.data);
      this.formartDate();

      // if (this.idTable === '0') {
      //   console.log('add data');
      //   this.formartDate();
      // }
      // else {
      //   this.updateData();
      // }

    }
  }
  addData() {
    this.data.createdBy = this.user.id;//
    this.data.createdDate = this.createDate;//
    console.log('Obj a guardar =>', this.data);//
    this.service.serviceGeneralPostWithUrl('WaitListTable', this.data).subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.data);
          if (this.turno === '1') {
            this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
          }
          else {
            this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
          }
        }
      });
  }
  updateData() {
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPut('WaitListTable', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('Resp Serv =>', data);
          if (this.turno === '1') {
            this.router.navigateByUrl('supervisor/control-matutino/tarea/1');

          }
          else {
            this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
          }
        }
      });
  }
}

class WaitTableModel {
  id: number;
  branch: number;
  waitlistTables: true;
  howManyTables: number;
  numberPeople: number;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoWaitlistTables: PhotoWaitlistModel[] = [];
}
class PhotoWaitlistModel {
  id: number;
  waitlistTableId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
