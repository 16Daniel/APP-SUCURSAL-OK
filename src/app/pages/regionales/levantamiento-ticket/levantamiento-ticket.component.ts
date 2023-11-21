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

@Component({
  selector: 'app-levantamiento-ticket',
  templateUrl: './levantamiento-ticket.component.html',
  styleUrls: ['./levantamiento-ticket.component.scss'],
})
export class LevantamientoTicketComponent implements OnInit {
  public today = new Date();
  public user: any;
  public data: LevantamientoTicketModel = new LevantamientoTicketModel();
  public dataId = false; //sirve para identificar si el get trae informacion y diferencia entre el post y put
  public branchId;
  public dataBranch: any[] = [];
  public dataBranchLocate: any[] = [];
  public dataCategory: any[] = [];

  public visibleGuardar = true;

  public nameBranch = '';
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosProducto: any;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  public activeData = false;
  constructor(public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.branchId = this.routerActive.snapshot.paramMap.get('id');
    this.getData();
    this.getBranch();
    this.getLocation();
    this.getCategory();

  }
  ngOnInit() { }
  // get data refrigerador
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('Ticketing/' + this.branchId)
      .subscribe((resp) => {
        if (resp.success) {
          // if (resp.result?.length !== 0 && resp.result !== null) {
          //   this.dataId = true; //si hay registro entonces se hara un put
          //   this.activeData = true;
          //   this.data = resp.result;
          //   console.log('get data', this.data);
          // }
          // else {
          console.log('completar tarea');
          this.data.id = 0;
          this.activeData = true;
          this.dataId = false; //no hay registro entonces se hara un post
          // }
        }
      });
  }

  getLocation() {
    let branchIdNumber = 0;
    branchIdNumber = Number(this.branchId);
    console.log('branchIdNumber', branchIdNumber);
    this.service.serviceGeneralGet(`Ticketing/Catalogue/BranchLocate`).subscribe(resp => {
      if (resp.success) {
        this.dataBranchLocate = resp.result;
        console.log('get specific station', this.dataBranchLocate);
      }
    });
  }
  getCategory() {
    this.service.serviceGeneralGet(`Ticketing/Catalogue/Category`).subscribe(resp => {
      if (resp.success) {
        this.dataCategory = resp.result;
        console.log('get status', this.dataCategory);
      }
    });
  }

  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
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
  // ---------add product complete----------

  async addPhotoToGallery(idType: number) {
    const name = new Date().toISOString();
    await this.photoService.addNewToGallery();
    await this.photoService.loadSaved();
    // agregaremos las fotos pero con id type de acuerdo al caso
    // al agregar las fotos en storage, las pasamos por lista
    console.log('obj fotos', this.photoService);
    this.data.photoTicketings.push({
      id: 0,
      ticketingId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.user.id,
      updatedDate: this.today,
    });
    console.log('fotos chicken', this.data);

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
            this.data.photoTicketings.splice(position, 1);
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
              .serviceGeneralDelete(`Ticketing/${id}/Photo`)
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
    let branchIdNumber = 0;
    branchIdNumber = Number(this.branchId);
    this.disabled = true;
    this.fotosProducto = [];
    this.data.status = true;
    this.data.commentTicketings = [];
    this.data.noTicket = '';
    this.data.dateOpen = this.today;
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = branchIdNumber;
    this.data.updatedBy = this.user.id;
    this.data.updatedDate = this.today;
    // si no hay registro en el get sera un post
    if (this.dataId === false) {
      this.addData();
    } else {
      this.updateData();
    }
  }
  addData() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    console.log('Obj To send  post=> ', this.data);
    this.service
      .serviceGeneralPostWithUrl('Ticketing', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.ionViewWillEnter();
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }
  updateData() {
    // al realizar el get el path viene null, al hacer el put marca error si no se manda una cadena de texto
    if (this.data.photoTicketings.length !== 0) {
      this.data.photoTicketings.forEach((photo) => {
        if (photo.id !== 0) {
          photo.photoPath = '';
        }
      });
    }
    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut('Ticketing', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.ionViewWillEnter();
          this.router.navigateByUrl(`regional/centro-control/${this.branchId}/tarea/1`);
        }
      });
  }
}
class LevantamientoTicketModel {
  id: number;
  branchId: number;
  status: boolean;
  whereAreYouLocated: number;
  specificLocation: string;
  category: number;
  noTicket: string;
  dateOpen: Date;
  dateClosed: Date;
  describeProblem: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  commentTicketings: CommentTicketingsModel[] = [];
  photoTicketings: PhotoTicketingsModel[] = [];
}
class PhotoTicketingsModel {
  id: number;
  ticketingId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
class CommentTicketingsModel {
  id: number;
  ticketingId: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}

