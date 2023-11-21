import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DialoAddCommentAttendanceComponent } from '../../dialog/dialo-add-comment-attendance/dialo-add-comment-attendance.component';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { LoaderGeneralService } from 'src/app/pages/dialog-general/loader-general.service';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-attendance-validation',
  templateUrl: './attendance-validation.component.html',
  styleUrls: ['./attendance-validation.component.scss'],
})
export class AttendanceValidationComponent implements OnInit {
  public today = new Date();
  public user;
  public turno;
  public data: ValidateAttendanceModel = new ValidateAttendanceModel();
  public activeData = false;
  public visibleGuardar = true;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put

  public base64 = 'data:image/jpeg;base64';
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public createDate = '';

  constructor(
    public router: Router,
    public modalController: ModalController,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public loader: LoaderGeneralService,
    public routerActive: ActivatedRoute,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService,
    public datepipe: DatePipe) { }

  ionViewWillEnter() {
    console.log('hora', this.today);
    console.log(this.routerActive.snapshot.paramMap.get('turno'));
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);
    // this.service
    //   .serviceGeneralGet(`ValidateAttendance/All/${this.user.branchId}`)
    //   .subscribe((resp) => {
    //     this.loader.loadingPresent();
    //     if (resp.success) {
    //       this.data = resp.result;
    //       console.log('resp', this.data);
    //       this.activeData = true;
    //       if (this.data.length === 0) {
    //         this.data.push({
    //           jobTitle: 'No data'
    //         });
    //       }
    //       this.loader.loadingDismiss();
    //     }
    //   }, error => {
    //     console.log('Error', error);
        this.activeData= true;

      // });
  }

  ngOnInit() { }

  // get data audio
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('ValidateAttendance/' + this.branchId)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            console.log('si hay registros del dia');
            this.data = resp.result;
            console.log('get data', this.data);
          }
          else {
            this.activeData = true;
            console.log('completar tarea');
            this.dataId = false; //no hay registro entonces se hara un post
            this.data.id = 0;


          }
        }
      });
  }
  return() {
    window.history.back();
    
  }
  // async commentAttendance(idPerson: number, claveTrabajo, nombre, trabajo) {
  //   const modal = await this.modalController.create({
  //     component: DialoAddCommentAttendanceComponent,
  //     cssClass: 'my-custom-class',
  //     componentProps: {
  //       id: idPerson,
  //       clabTrab: claveTrabajo,
  //       name: nombre,
  //       jobTitle: trabajo,
  //     },
  //   });
  //   this.ionViewWillEnter();
  //   return await modal.present();
  // }
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
    this.data.updatedBy = this.user.id;
    this.data.updatedDate = this.createDate;

  }

  save() {
    if(this.data.photoValidateAttendances.length === 0){
     this.alertCampos();
    }
    else{
    this.data.branchId = this.user.branchId;
    this.data.attendance = this.user.id;
    this.data.clabtrab = this.user.id;
    this.data.comment = " ";
    this.visibleGuardar = false;
    this.load.presentLoading('Guardando..');
    //this.disabled = true;
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = this.branchId;
    this.data.updatedBy = this.user.id;
    this.formartDate();
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
    this.data.createdDate = this.createDate;
    this.data.time = this.createDate;
    console.log('Obj To send  post=> ', this.data);
    this.service
      .serviceGeneralPostWithUrl('BathRoomsOverallStatus', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);

          this.return();

        }
      });
  }
  updateData() {
    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut('BathRoomsOverallStatus', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.return();
        }
      });
  }

    // agregar fotos de limpieza de salon
    async addPhotoToGallery(idType: number) {
      this.photoService.limpiaStorage();
      const name = new Date().toISOString();
      await this.photoService.addNewToGallery();
      await this.photoService.loadSaved();
      // agregaremos las fotos pero con id type de acuerdo al caso
      // al agregar las fotos en storage, las pasamos por lista
      console.log('obj fotos', this.photoService);
      this.data.photoValidateAttendances.push({
        id: 0,
        bathroomsoverallstatusId: this.data.id,
        photo: this.photoService.photos[0].webviewPath,
        photoPath: 'jpeg',
        type: idType,
        createdBy: this.user.id,
        createdDate: this.today,
        updatedBy: this.user.id,
        updatedDate: this.today,
      });
      console.log('fotos chicken', this.data);
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
              this.data.photoValidateAttendances.splice(position, 1);
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
              .serviceGeneralDelete(`SatisfactionSurvey/${id}/Photo`)
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

}
class ValidateAttendanceModel {
  id: number;
  branchId: number;
  attendance: number;
  clabtrab: number;
  time: string;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoValidateAttendances: PhotoValidateAttendanceModel[] = [];
}
class PhotoValidateAttendanceModel {
  id: number;
  bathroomsoverallstatusId: number;
  photo: string;
  photoPath: string;
  type: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}


