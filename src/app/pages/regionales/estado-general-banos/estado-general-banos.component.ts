import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
@Component({
  selector: 'app-estado-general-banos',
  templateUrl: './estado-general-banos.component.html',
  styleUrls: ['./estado-general-banos.component.scss'],
})
export class EstadoGeneralBanosComponent implements OnInit {

  public today = new Date();
  public user: any;
  public data: GeneralStateModel = new GeneralStateModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public disabled = false;
  public activeData = false;

  public base64 = 'data:image/jpeg;base64';
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';

  public visibleGuardar = true;

  constructor(public router: Router,
    public routerActive: ActivatedRoute,
    public alertController: AlertController,
    public service: ServiceGeneralService,
    public actionSheetController: ActionSheetController,
    public load: LoaderComponent,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);

  }
  ngOnInit() { }
  // get data audio
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('BathRoomsOverallStatus/' + this.branchId+'/'+this.user.id)
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
            this.data.doesAnyBathroomLeakMen = true;
            this.data.isThereAnyFaultsMen = true;
            this.data.doesAnyBathroomLeakWomen = true;
            this.data.isThereAnyFaultsWomen = true;
            this.data.commentDoesAnyBathroomLeakMen = '';
            this.data.commentAreThereAnyFaultsMen = '';
            this.data.commentDoesAnyBathroomLeakWomen = '';
            this.data.commentAreThereAnyFaultsWomen = '';

          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/3`);
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
          }
        });
      }
    });
  }
  save() {
    if(this.data.commentAreThereAnyFaultsMen === "" || this.data.commentAreThereAnyFaultsWomen === "" || this.data.commentDoesAnyBathroomLeakMen === "" || this.data.commentDoesAnyBathroomLeakWomen === ""
    || this.data.commentAreThereAnyFaultsMen === null || this.data.commentAreThereAnyFaultsWomen === null || this.data.commentDoesAnyBathroomLeakMen === null || this.data.commentDoesAnyBathroomLeakWomen === null
    || this.data.commentAreThereAnyFaultsMen === undefined || this.data.commentAreThereAnyFaultsWomen === undefined || this.data.commentDoesAnyBathroomLeakMen === undefined || this.data.commentDoesAnyBathroomLeakWomen === undefined || this.data.photoBathRoomsOverallStatuss.length === 0){
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
      .serviceGeneralPostWithUrl('BathRoomsOverallStatus', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          if(this.data.doesAnyBathroomLeakMen === true || this.data.doesAnyBathroomLeakWomen === true || this.data.isThereAnyFaultsMen === true || this.data.isThereAnyFaultsWomen === true){
           this.levantamientoTicket();
          }
          else{
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/3`);
          }
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
          if(this.data.doesAnyBathroomLeakMen === true || this.data.doesAnyBathroomLeakWomen === true || this.data.isThereAnyFaultsMen === true || this.data.isThereAnyFaultsWomen === true){
            this.levantamientoTicket();
           }
           else{
           this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/3`);
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

    // agregar fotos de limpieza de salon
    async addPhotoToGallery(idType: number) {
      this.photoService.limpiaStorage();
      const name = new Date().toISOString();
      await this.photoService.addNewToGallery();
      await this.photoService.loadSaved();
      // agregaremos las fotos pero con id type de acuerdo al caso
      // al agregar las fotos en storage, las pasamos por lista
      console.log('obj fotos', this.photoService);
      this.data.photoBathRoomsOverallStatuss.push({
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
              this.data.photoBathRoomsOverallStatuss.splice(position, 1);
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
class GeneralStateModel {
  id: number;
  branchId: number;
  doesAnyBathroomLeakMen: boolean;
  commentDoesAnyBathroomLeakMen: string;
  isThereAnyFaultsMen: boolean;
  commentAreThereAnyFaultsMen: string;
  doesAnyBathroomLeakWomen: boolean;
  commentDoesAnyBathroomLeakWomen: string;
  isThereAnyFaultsWomen: boolean;
  commentAreThereAnyFaultsWomen: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoBathRoomsOverallStatuss: PhotoBathRoomsOverallStatusModel[] = [];
}
class PhotoBathRoomsOverallStatusModel {
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