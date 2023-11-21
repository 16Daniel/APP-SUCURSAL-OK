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
  // public data: LevantamientoTicketModel = new LevantamientoTicketModel();
  public data;
  public branchId;
  public idTicket;
  public dataBranch: any[] = [];
  public nameBranch = '';
  public activeData = false;
  public disabled = false;
  public today = new Date();
  public url = 'http://opera.no-ip.net/back/api_rebel_wings/';

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
        else {
          this.activeData = true;
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
  save() {
    this.disabled = true;
    this.data.userId = this.user.id;
    this.data.closedDate = this.today;
    this.updateData();
  }

  updateData() {
    console.log('Obj To send put => ', this.data);
    this.service
      .serviceGeneralPut(`Ticketing/${this.idTicket}/Status`, this.data)
      .subscribe((data) => {
        if (data.success) {
          this.load.presentLoading('Actualizando..');
          console.log('data', data);
          this.ionViewWillEnter();
          this.disabled = false;
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
  categoryNavigation: CategoryNavigationModel[] = [];
  createdByNavigation: CreatedByNavigationModel[] = [];
  whereAreYouLocatedNavigation: WhereAreYouLocatedNavigationModel[] = [];
  commentTicketings: CommentTicketings[] = [];
  photoTicketings: PhotoTicketingsModel[] = [];
}
class CategoryNavigationModel {
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


