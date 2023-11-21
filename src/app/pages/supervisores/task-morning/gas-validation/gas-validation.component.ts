import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {UserPhoto,PhotoService,} from 'src/app/core/services/services/photo.service';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { data } from 'jquery';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-gas-validation',
  templateUrl: './gas-validation.component.html',
  styleUrls: ['./gas-validation.component.scss'],
})
export class GasValidationComponent implements OnInit {
  public user: any;
  public idGas: string;
  public today = new Date();
  public data: GasDataModel = new GasDataModel();
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public createDate = '';
  public radioValue = '1'; 
  public visibleGuardar = true;

  public valUsuario = 0;


  public fotosGas;
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
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    private camera: Camera,
    public datepipe: DatePipe

  ) { }
  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.user);
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.idGas = this.routerActive.snapshot.paramMap.get('id');
    
    this.valUsuario =Number(this.routerActive.snapshot.paramMap.get('us'));
    console.log(this.valUsuario);
    if(this.valUsuario === 1){this.valUsuario = this.user.id}

    if (this.idGas === '0') {
      console.log('Completar la tarea');
    } else {
      console.log('Actualizar la tarea');
      this.getData();
    }
  }
  async ngOnInit() { }

  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('ValidationGas/' + this.idGas)
      .subscribe((resp) => {
        if (resp.success) {
          this.load.presentLoading('Cargando..');
          this.data = resp.result;
          console.log('get data', this.data);
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
  }
  async addPhotoToGallery() {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoValidationGas.push({
      id: 0,
      validationGasId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.valUsuario,
      updatedDate: this.today,
    });
    console.log('fotos validacion gas', this.data);
  }

  showValue(){
    // console.log('',this.radioValue);
    if(this.radioValue === '2'){
      console.log('',this.radioValue);
      this.data.amount = 100;
      this.data.comment = "NO APLICA";
      
    }
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
            this.data.photoValidationGas.splice(position, 1);
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
              .serviceGeneralDelete(`ValidationGas/${id}/Photo`)
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
    if (this.idGas === '0') {
      this.addData();
    } else {
      this.updateData();
    }
  }
  validaInfra(){

      this.presentAlert();


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
    
    this.disabled = true;
    this.fotosGas = [];
    if (this.data.photoValidationGas.length !== 0) {
      this.data.photoValidationGas.forEach((photo) => {
        if (photo.id !== 0) {
          photo.photoPath = '';
        }
      });
    }
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branch = this.user.branchId;
    this.fotosGas = this.photoService.photos;
    console.log('Obj To send => ', this.data);
    this.formartDate();
 
    // if (this.idGas === '0') {
    //   this.formartDate();
    // } else {

    //   this.updateData();
    // }
    
  }

  addData() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.createDate;
    console.log('Obj a guardar =>', this.data);
    this.service.serviceGeneralPostWithUrl('ValidationGas', this.data).subscribe((data) => {
      if (data.success) {
        this.load.presentLoading('Guardando..');
        console.log('Resp Serv =>', data);
        this.photoService.deleteAllPhoto(this.data);
        this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
      }
    });
  }
  updateData() {
    console.log('Obj a guardar =>', this.data);
    this.service
      .serviceGeneralPut('ValidationGas', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('Resp Serv =>', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
        }
      });
  }

  async presentAlert() {
    if(this.radioValue === "2"){
      this.visibleGuardar = false;
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'IMPORTANTE',
      subHeader: 'PAGOS',
      message: 'VALIDAR QUE LOS PAGOS SE ENCUENTREN <BR><BR>AL CORRIENTE CON ADMINISTRACION!',
      mode: 'ios',
      buttons: ['OK'],
    });
  

    await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      this.load.presentLoading('Guardando..');
      this.save();
    }
    else{
      if(this.data.comment == undefined || this.data.comment == null || this.data.comment == "" || this.data.amount == undefined || this.data.amount == null || this.data.photoValidationGas.length == 0){

         this.alertCampos();

      }
      else{
       
        if(this.data.amount < 40 ){
          this.visibleGuardar = false;
          const alert = await this.alertController.create({
            cssClass: 'custom-alert',
            header: 'IMPORTANTE',
            subHeader: 'PORCENTAJE DE GAS',
            message: 'ESTAS DEBAJO DEL 40% <BR><BR>SOLICITA TU RECARGA DE GAS!',
            mode: 'ios',
            buttons: ['OK'],
          });
       
     
          await alert.present();
           const { role } = await alert.onDidDismiss();
           console.log('onDidDismiss resolved with role', role);
           this.load.presentLoading('Guardando..');
           this.save();
          }
        else{
          this.visibleGuardar = false;
          this.load.presentLoading('Guardando..');
          this.save();
        }

      }
    }
  }


}



class GasDataModel {
  id: number;
  branch: number;
  amount: number;
  comment: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  photoValidationGas: PhotoGasModel[] = [];
}
class PhotoGasModel {
  id: number;
  validationGasId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
