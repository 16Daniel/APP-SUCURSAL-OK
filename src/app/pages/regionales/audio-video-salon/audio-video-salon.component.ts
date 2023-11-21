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
import { isThisSecond } from 'date-fns';
@Component({
  selector: 'app-audio-video-salon',
  templateUrl: './audio-video-salon.component.html',
  styleUrls: ['./audio-video-salon.component.scss'],
})
export class AudioVideoSalonComponent implements OnInit {
  public today = new Date();
  public user: any;
  public data: PrecookedChickenModel = new PrecookedChickenModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public disabled = false;
  public activeData = false;
  public base64 = 'data:image/jpeg;base64';
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public pick1 = 0;
  public pick2 = 0;

  public visibleGuardar = true;
  public Terraza = true;

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
      .serviceGeneralGet('AudioVideo/' + this.branchId+'/'+this.user.id)
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
            this.data.tvWorksProperly = false;
            this.data.speakersWorkProperly = false;
            this.data.terraceTvWorksProperly = false;
            this.data.terraceSpeakersWorkProperly = false;
            this.data.commentTvWorksProperly = '';
            this.data.commentSpeakersWorkProperly = '';
            this.data.commentTerraceTvWorksProperly = '';
            this.data.commentTerraceSpeakersWorkProperly = '';

          }
        }
      });
  }

  updateTerraza() {
    if(this.Terraza === false){
      this.data.terraceTvWorksProperly = true;
      this.data.terraceSpeakersWorkProperly = true;
      this.data.commentTerraceSpeakersWorkProperly = "NO APLICA";
      this.data.commentTerraceTvWorksProperly = "NO APLICA";
    }
    else{
      this.data.terraceTvWorksProperly = false;
      this.data.terraceSpeakersWorkProperly = false;
      this.data.commentTerraceSpeakersWorkProperly = "";
      this.data.commentTerraceTvWorksProperly = "";
    }
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
            this.conteoFotos();
          }
        });
      }
    });
  }

  conteoFotos(){
    this.pick1 = this.data.photoAudioVideos.filter(pick => pick.type === 1).length;
    this.pick2 = this.data.photoAudioVideos.filter(pick => pick.type === 2).length;
  }

  save() {
    if(this.data.commentSpeakersWorkProperly === "" || this.data.commentTerraceSpeakersWorkProperly === "" || this.data.commentTerraceTvWorksProperly === "" || this.data.commentTvWorksProperly === ""
    || this.data.commentSpeakersWorkProperly === null || this.data.commentTerraceSpeakersWorkProperly === null || this.data.commentTerraceTvWorksProperly === null || this.data.commentTvWorksProperly === null
    || this.data.commentSpeakersWorkProperly === undefined || this.data.commentTerraceSpeakersWorkProperly === undefined || this.data.commentTerraceTvWorksProperly === undefined || this.data.commentTvWorksProperly === undefined
    || this.pick1 === 0 || this.pick2 === 0){
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
    // si no hay registro en el get sera un post
    if (this.dataId === false) {
      this.addVideo();
    } else {
      this.updateVideo();
    }
   }
  }

  levantamientoTicket() {
    this.router.navigateByUrl('regional/levantamiento-ticket/' + this.branchId);
  }

  addVideo() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    console.log('Obj To send  post=> ', this.data);
    this.service
      .serviceGeneralPostWithUrl('AudioVideo', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          if(this.data.speakersWorkProperly === false || this.data.terraceSpeakersWorkProperly === false || this.data.terraceTvWorksProperly === false || this.data.tvWorksProperly === false){
            this.levantamientoTicket();
          }
          else{
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
          }
        }
      });
  }
  updateVideo() {
    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut('AudioVideo', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          if(this.data.speakersWorkProperly === false || this.data.terraceSpeakersWorkProperly === false || this.data.terraceTvWorksProperly === false || this.data.tvWorksProperly === false){
            this.levantamientoTicket();
          }
          else{
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/2`);
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
      this.data.photoAudioVideos.push({
        id: 0,
        audiovideoId: this.data.id,
        photo: this.photoService.photos[0].webviewPath,
        photoPath: 'jpeg',
        type: idType,
        createdBy: this.user.id,
        createdDate: this.today,
        updatedBy: this.user.id,
        updatedDate: this.today,
      });
      console.log('fotos chicken', this.data);
      this.conteoFotos();
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
              this.data.photoAudioVideos.splice(position, 1);
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
class PrecookedChickenModel {
  id: number;
  branchId: number;
  tvWorksProperly: boolean;
  commentTvWorksProperly: string;
  speakersWorkProperly: boolean;
  commentSpeakersWorkProperly: string;
  terraceTvWorksProperly: boolean;
  commentTerraceTvWorksProperly: string;
  terraceSpeakersWorkProperly: boolean;
  commentTerraceSpeakersWorkProperly: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoAudioVideos: PhotoAudioVideoModel[] = [];
}
class PhotoAudioVideoModel {
  id: number;
  audiovideoId: number;
  photo: string;
  photoPath: string;
  type: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}

