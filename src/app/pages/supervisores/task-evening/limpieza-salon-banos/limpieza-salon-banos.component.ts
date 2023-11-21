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
  selector: 'app-limpieza-salon-banos',
  templateUrl: './limpieza-salon-banos.component.html',
  styleUrls: ['./limpieza-salon-banos.component.scss'],
})
export class LimpiezaSalonBanosComponent implements OnInit {
  public today = new Date();
  public user: any;
  public idLimpieza: string;
  public data: LimpiezaModel = new LimpiezaModel();
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosLimpieza;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  // ******variables de validacion ********
  public activeComment = false;
  // nombre de sucursal
  public branchId;
  public nameBranch = '';
  public dataBranch: any[] = [];
  public createDate = '';
  public visibleGuardar = true;

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
    this.idLimpieza = this.routerActive.snapshot.paramMap.get('id');

    
    this.valUsuario =Number(this.routerActive.snapshot.paramMap.get('us'));
    console.log(this.valUsuario);
    if(this.valUsuario === 1){this.valUsuario = this.user.id}

    // get name de sucursal
    this.branchId = this.user.branchId;
    this.getBranch();
    if (this.idLimpieza === '0') {
      console.log('Completar la tarea');
      this.activeData = true;
    } else {
      console.log('Actualizar la tarea');
      this.getData();
    }
  }
  ngOnInit() { }
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('LivingRoomBathroomCleaning/' + this.idLimpieza)
      .subscribe((resp) => {
        if (resp.success) {
          this.activeData = true;
          this.data = resp.result;
          console.log('get data', this.data);
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
  }
  // get  name sucursal
  getBranch() {
    let db;
    // id 1 cdmx DB2
    if (this.user.stateId === 1) {
      db = 'DB2';
    }
    // id 2 queretaro DB1
    else if (this.user.stateId === 2) {
      db = 'DB1';
    }
    let branchIdNumber = 0;
    branchIdNumber = Number(this.branchId);
    console.log('branchIdNumber', branchIdNumber);
    this.service.serviceGeneralGet(`StockChicken/Admin/All-Branch?dataBase=${db}`).subscribe(resp => {
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
    this.data.photoLivingRoomBathroomCleanings.push({
      id: 0,
      livingRoomBathroomCleaningId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.valUsuario,
      updatedDate: this.today,
    });
    console.log('fotos', this.data);
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
            this.data.photoLivingRoomBathroomCleanings.splice(position, 1);
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
              .serviceGeneralDelete(`LivingRoomBathroomCleaning/${id}/Photo`)
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

  validateSave() {
    if (this.data.comment == undefined || this.data.comment == null || this.data.comment == "" || this.data.photoLivingRoomBathroomCleanings.length == 0) {
       this.alertCampos();
    } 
    else {
       this.visibleGuardar = false;
       this.load.presentLoading('Guardando..');
       this.save();
    }
  }
  save() {
    this.disabled = true;
    this.fotosLimpieza = [];
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = this.user.branchId;
    this.formartDate();
    // if (this.idLimpieza === '0') {
    //   this.addData();
    // } else {
    //   this.updateData();
    // }
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
    this.data.updatedBy = this.valUsuario;
    this.data.updatedDate = this.createDate;
    if (this.idLimpieza === '0') {
      this.addData();
    } else {
      this.updateData();
    }
  }

  addData() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.createDate;
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPostWithUrl('LivingRoomBathroomCleaning', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
        }
      });
  }
  updateData() {
    if (this.data.photoLivingRoomBathroomCleanings.length !== 0) {
      this.data.photoLivingRoomBathroomCleanings.forEach((element) => {
        if (element.id !== 0) {
          element.photoPath = '';
        }
      });
    }
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPut('LivingRoomBathroomCleaning', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
        }
      });
  }
}
class LimpiezaModel {
  id: number;
  branchId: number;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoLivingRoomBathroomCleanings: PhotoLimpiezaModel[] = [];
}
class PhotoLimpiezaModel {
  id: number;
  livingRoomBathroomCleaningId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
