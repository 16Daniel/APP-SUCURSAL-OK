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
  selector: 'app-resguardo-tableta',
  templateUrl: './resguardo-tableta.component.html',
  styleUrls: ['./resguardo-tableta.component.scss'],
})
export class ResguardoTabletaComponent implements OnInit {
  public today = new Date();
  public user: any;
  public idTablet: string;
  public data: TabletModel = new TabletModel();
  public base64 = 'data:image/jpeg;base64';
  public disabled = false;
  public fotosTablet;
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';
  // nombre de sucursal
  public branchId;
  public nameBranch = '';
  public dataBranch: any[] = [];

  public valUsuario = 0;

  constructor(
    public router: Router,
    private camera: Camera,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public actionSheetController: ActionSheetController,
    public photoService: PhotoService
  ) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.idTablet = this.routerActive.snapshot.paramMap.get('id');
    // get name de sucursal
    this.branchId = this.user.branchId;
    this.getBranch();

    this.valUsuario =Number(this.routerActive.snapshot.paramMap.get('us'));
    console.log(this.valUsuario);
    if(this.valUsuario === 1){this.valUsuario = this.user.id}

    if (this.idTablet === '0') {
      console.log('Completar la tarea');
    } else {
      console.log('Actualizar la tarea');
      this.getData();
    }
  }
  ngOnInit() { }

  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('TabletSafeKeeping/' + this.idTablet)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
          console.log('get data', this.data);
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl('supervisor/control-vespertino');
  }

  // get  name sucursal
  getBranch() {
    let branchIdNumber = 0;
    branchIdNumber = Number(this.branchId);
    console.log('branchIdNumber', branchIdNumber);
    this.service.serviceGeneralGet('StockChicken/Admin/All-Branch').subscribe(resp => {
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
    this.data.photoTabletSageKeepings.push({
      id: 0,
      tabletSafeKeepingId: this.data.id,
      photo: this.photoService.photos[0].webviewPath,
      photoPath: 'jpeg',
      createdBy: this.user.id,
      createdDate: this.today,
      updatedBy: this.valUsuario,
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
            this.data.photoTabletSageKeepings.splice(position, 1);
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
              .serviceGeneralDelete(`TabletSafeKeeping/${id}/Photo`)
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
    this.disabled = true;
    this.fotosTablet = [];
    // esto se pone aqui por que aun no se estrae la data de un get
    this.data.branchId = this.user.branchId;
    this.data.updatedBy = this.valUsuario,
    this.data.updatedDate = this.today;
    console.log('Obj To send => ', this.data);

    if (this.idTablet === '0') {
      this.addTablet();
    } else {
      this.updateTablet();
    }
  }
  addTablet() {
    this.data.createdBy = this.user.id;
    this.data.createdDate = this.today;
    this.service
      .serviceGeneralPostWithUrl('TabletSafeKeeping', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Guardando..');
          console.log('data', data);
          this.photoService.deleteAllPhoto(this.data);
          this.disabled = false;
          this.router.navigateByUrl('supervisor/control-vespertino');
        }
      });
  }
  updateTablet() {
    if (this.data.photoTabletSageKeepings.length !== 0) {
      this.data.photoTabletSageKeepings.forEach((element) => {
        if (element.id !== 0) {
          element.photoPath = '';
        }
      });
    }
    this.service
      .serviceGeneralPut('TabletSafeKeeping', this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.disabled = false;
          this.photoService.deleteAllPhoto(this.data);
          this.router.navigateByUrl('supervisor/control-vespertino');
        }
      });
  }
}
class TabletModel {
  id: number;
  branchId: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
  photoTabletSageKeepings: PhotoTabletModel[] = [];
}
class PhotoTabletModel {
  id: number;
  tabletSafeKeepingId: number;
  photo: string;
  photoPath: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}

