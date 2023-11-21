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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-ticket-mesa-sistema-caja',
  templateUrl: './ticket-mesa-sistema-caja.component.html',
  styleUrls: ['./ticket-mesa-sistema-caja.component.scss'],
})
export class TicketMesaSistemaCajaComponent implements OnInit {

  public today = new Date();
  public user: any;
  public data: TicketTableModel = new TicketTableModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public branchId;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosProducto: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;

  public radioValue = '1'; 
  public comentarioId = false; 
  public pick = 0;
  public pick1 = 0;
  public pick2 = 0;
  public visibleGuardar = true;
  public Ractivo = false;

  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch(this.user.stateId);
  }
  ngOnInit() { }
  // get data refrigerador
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('TicketTable/' + this.branchId+'/'+this.user.id)
      .subscribe((resp) => {
        if (resp.success) {
          if (resp.result?.length !== 0 && resp.result !== null) {
            this.dataId = true; //si hay registro entonces se hara un put
            this.activeData = true;
            this.data = resp.result;
            console.log('get data', this.data);
          }
          else {
            console.log('completar tarea');
            this.data.id = 0;
            this.activeData = true;
            this.dataId = false; //no hay registro entonces se hara un post
          }
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/4`);
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
    this.pick1 = this.data.photoTicketTables.filter(pick => pick.type === 1).length;
    this.pick2 = this.data.photoTicketTables.filter(pick => pick.type === 2).length;
    if(this.data.commentFoodOnTable === "" || this.data.commentFoodOnTable === undefined ){
      if(this.data.commentFoodOnTable !== " "){
      this.data.commentFoodOnTable = " ";
      }
    }
    if(this.data.commentTicket === "" || this.data.commentTicket === undefined ){
      if(this.data.commentTicket !== " "){
        this.data.commentTicket = " ";
        }
    }
  }

  // ---------add product complete----------

  async addPhotoToGallery(idType: number) {
    this.Ractivo = true;
    this.photoService.limpiaStorage();
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoTicketTables.push({
      id: 0,
      ticketTableId: this.data.id,
      type: idType,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
      filepath: ''
    });
    console.log('fotos chicken', this.data);
    this.conteoFotos();
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
            this.data.photoTicketTables.splice(position, 1);
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
              .serviceGeneralDelete(`TicketTable/${id}/Photo`)
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
  save() {
    this.comentarioId = true;
    if(this.radioValue === '1' && this.data.commentFoodOnTable === " "){
       this.comentarioId = false;
       console.log('nombre', this.comentarioId);
    }
    if(this.radioValue === '2' && this.data.commentTicket === " "){
      this.comentarioId = false;
      console.log('nombre', this.comentarioId);
    }
    this.pick = this.data.photoTicketTables.filter(pick => pick.type === Number(this.radioValue)).length;
    if(this.pick === 0 || this.comentarioId === false){
     this.alertCampos();
    }
    else{
    this.visibleGuardar = false;
    this.load.presentLoading('Guardando..');
    this.disabled = true;
    this.fotosProducto = [];
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
      .serviceGeneralPostWithUrl('TicketTable', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          // this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/4`);
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
        }
      });
  }
  updateData() {
    // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto
    if (this.data.photoTicketTables.length !== 0) {
      this.data.photoTicketTables.forEach((photo) => {
        if (photo.id !== 0) {
          photo.photoPath = '';
        }
      });
    }
    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut('TicketTable', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          // this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/4`);
          window.location.reload();
          this.Ractivo = false;
          this.visibleGuardar = true;
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

}
class TicketTableModel {
  id: number;
  branchId: number;
  commentFoodOnTable: string;
  commentTicket: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoTicketTables: PhotoTicketModel[] = [];
}
class PhotoTicketModel {
  id: number;
  ticketTableId: number;
  type: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  filepath: string; //no es parte del modelo solo es para eliminar todas las fotos filesystem

}
