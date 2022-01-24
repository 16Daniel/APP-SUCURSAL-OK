import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-open-ticket',
  templateUrl: './open-ticket.component.html',
  styleUrls: ['./open-ticket.component.scss'],
})
export class OpenTicketComponent implements OnInit {
  public user: any;
  public data: LevantamientoTicketModel = new LevantamientoTicketModel();
  public branchId;
  public idTicket;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public activeData = false;
  public today = new Date();
  public url = 'http://34.237.214.147/back/api_rebel_wings/';

  constructor(public router: Router, public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent, public actionSheetController: ActionSheetController,) { }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    console.log(this.routerActive.snapshot.paramMap.get('branch'));
    this.idTicket = this.routerActive.snapshot.paramMap.get('id');
    this.branchId = this.routerActive.snapshot.paramMap.get('branch');
    this.getData();
    this.getBranch();

  }

  ngOnInit() { }
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet('Ticketing/' + this.idTicket)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
            this.activeData = true;
          console.log('get data', this.data);
        }
        else{
          this.activeData = true;
        }
      });
  }
  return() {
    // window.history.back();
    this.router.navigateByUrl(`regional/centro-control/${this.branchId}`);
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
  categoryNavigation: CategoryNavigationModel [] = [];
  createdByNavigation: CreatedByNavigationModel [] = [];
  whereAreYouLocatedNavigation: WhereAreYouLocatedNavigationModel []= [];
  commentTicketings: CommentTicketings[]= [];
  photoTicketings: PhotoTicketingsModel []= [];
}
class CategoryNavigationModel{
  id: number;
  category: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
class CreatedByNavigationModel {
  id: number;
  email: string;
  password: string;
  clabTrab: number;
  token: string;
  name: string;
  lastName: string;
  motherName: string;
  roleId: number;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
class WhereAreYouLocatedNavigationModel {
  id: number;
  locate: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
}
class CommentTicketings {
  id: number;
  ticketingId: number;
  comment: string;
  createdBy: number;
  createdDate: Date;
  updatedBy: number;
  updatedDate: Date;
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


