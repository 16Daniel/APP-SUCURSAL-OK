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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-encuesta-salon',
  templateUrl: './encuesta-salon.component.html',
  styleUrls: ['./encuesta-salon.component.scss'],
})
export class EncuestaSalonComponent implements OnInit {
  public today = new Date();
  public user: any;
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  // public data: EncuestaModel = new EncuestaModel();
  data;
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public disabled = false;
  public activeData = false;
  // ******variables de validacion ********
  public activeName = false;
  public activeEmail = false;
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
    this.data = new EncuestaModel();

  //  this.getData();
  // solo se insertaran encuestas
    console.log('Completar la tarea');
    this.dataId = false; //no hay registro entonces se hara un post
    this.activeData = true;
    this.getBranch(this.user.stateId);

  }
  ngOnInit() { }
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('SatisfactionSurvey/' + this.branchId+'/'+this.user.id)
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
  onRateChange(e){
    console.log('start', e);
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
  }
  validateSave() {
    if (
      this.data.name === '' ||
      this.data.name === undefined ||
      this.data.name === null
    ) {
      this.activeName = true;
    } else {
      this.activeName = false;
    }
    if (
      this.data.email === '' ||
      this.data.email === undefined ||
      this.data.email === null
    ) {
      this.activeEmail = true;
    } else {
      this.activeEmail = false;
    }
    if (
      this.data.name === '' ||
      this.data.name === undefined ||
      this.data.email === '' ||
      this.data.email === undefined
    ) {
      return;
    } 
  }
  save() {
    if(this.data.name === "" || this.data.name === undefined || this.data.name === null || this.data.email === "" || this.data.email === undefined || this.data.email === null || this.data.photoSatisfactionSurveys.length === 0){
      this.alertCampos();
      this.validateSave()
    }
    else{
    this.visibleGuardar = false;
    this.alertEncuesta();
    }
    
  }
  addPropina() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    console.log('Obj To send post => ', this.data);
    
    this.service
      .serviceGeneralPostWithUrl('SatisfactionSurvey', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
        }
      });

  }
  updatePropina() {
    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut('Spotlight', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          //window.location.reload();
          // this.Ractivo = false;
          // this.visibleGuardar = true;
          // if(this.data.brokenSpotlight === false){
            //this.levantamientoTicket();
            // }
            // else{
            // this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
            // }
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

  async alertEncuesta(){

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'GRACIAS',
      subHeader: 'ENTREGA TU PROMOCION',
      message: '"RECUERDA ENTREGAR TU CUPON O PROMOCION COMO AGRADECIMIENTO DE TU ENCUESTA"',
      mode: 'ios',
      buttons: ['OK'],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.load.presentLoading('Guardando..');
    this.disabled = true;
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = this.branchId;
    this.data.updatedBy = this.user.id;
    this.data.updatedDate = this.today;
    // if (this.branchId === '0') {
      this.addPropina();
    // } else {
    //   this.updatePropina();
    // }
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
      this.data.photoSatisfactionSurveys.push({
        id: 0,
        spotlightId: this.data.id,
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
              this.data.photoSatisfactionSurveys.splice(position, 1);
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
class EncuestaModel {
  id: number;
  branchId: number;
  name: string;
  email: string;
  questionOne: boolean;
  questionTwo: boolean;
  questionThree: boolean;
  questionFour: boolean;
  questionFive: boolean;
  questionSix: boolean;
  review: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoSatisfactionSurveys: PhotoSatisfactionSurveyModel[] = [];
}
class PhotoSatisfactionSurveyModel {
  id: number;
  satisfactionsurveyId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
