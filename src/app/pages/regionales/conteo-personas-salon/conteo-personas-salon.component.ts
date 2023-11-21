import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import {
  UserPhoto,
  PhotoService,
} from 'src/app/core/services/services/photo.service';
@Component({
  selector: 'app-conteo-personas-salon',
  templateUrl: './conteo-personas-salon.component.html',
  styleUrls: ['./conteo-personas-salon.component.scss'],
})
export class ConteoPersonasSalonComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public data: CountPersonModel = new CountPersonModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public disabled = false;
  public activeData = false;
  // ******variables de validacion ********
  public activeMesas = false;
  public activeComensales = false;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';

  public visibleGuardar = true;
  public fotosPeople: any;
  public base64 = 'data:image/jpeg;base64';
 
  constructor(public router: Router,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public alertController: AlertController,
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
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('PeopleCounting/' + this.branchId+'/'+this.user.id)
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
            console.log('Completar la tarea');
            this.dataId = false; //no hay registro entonces se hara un post
            this.activeData = true;
            this.data.id = 0;
          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
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
  // validateSave() {
  //   if (
  //     this.data.tables === 0 ||
  //     this.data.tables === undefined ||
  //     this.data.tables === null
  //   ) {
  //     this.activeMesas = true;
  //   } else {
  //     this.activeMesas = false;
  //   }
  //   if (
  //     this.data.dinners === 0 ||
  //     this.data.dinners === undefined ||
  //     this.data.dinners === null
  //   ) {
  //     this.activeComensales = true;
  //   } else {
  //     this.activeComensales = false;
  //   }
  //   if (
  //     this.data.tables === 0 ||
  //     this.data.tables === undefined ||
  //     this.data.dinners === 0 ||
  //     this.data.dinners === undefined
  //   ) {
  //     return;
  //   } else {
  //     this.save();
  //   }
  // }
  save() {
    if(this.data.tables === 0 || this.data.tables === undefined ||  this.data.tables === null || this.data.dinners === 0 || this.data.dinners === undefined ||  this.data.dinners === null
      || this.data.comment === "" || this.data.comment === null || this.data.comment === undefined || this.data.photoPeoplesCountings.length === 0){
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
      this.fotosPeople = [];
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
    console.log('Obj To send post => ', this.data);
    
    this.service
      .serviceGeneralPostWithUrl('PeopleCounting', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
        }
      });
  }




updateData() {
  // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto
  if (this.data.photoPeoplesCountings.length !== 0) {
    this.data.photoPeoplesCountings.forEach((photo) => {
      if (photo.id !== 0) {
        photo.photoPath = '';
      }
    });
  }
  console.log('Obj To send put=> ', this.data);
  this.service
    .serviceGeneralPut('PeopleCounting', this.data)
    .subscribe((data) => {
      if (data.success) {
        this.load.presentLoading('Actualizando..');
        console.log('data', data);
        this.photoService.deleteAllPhoto(this.data);
        this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
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



   // eliminar indice de orden
   async addPhotoToGallery() {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoPeoplesCountings.push({
      id: 0,
      peopleId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
    });
    // this.fotosRefrigerador = this.photoService.photos;
    console.log('fotos ConteoP', this.data);
  }
  // eliminacion de images en storage
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
            this.data.photoPeoplesCountings.splice(position, 1);

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
              .serviceGeneralDelete(`PeopleCounting/${id}/Photo`)
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
class CountPersonModel {
  id: number;
  branchId: number;
  tables: number;
  dinners: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoPeoplesCountings: PhotoPeopleCountingModel[] = [];
}
class PhotoPeopleCountingModel {
  id: number;
  peopleId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}

