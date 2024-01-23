import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DialoAddCommentAttendanceComponent } from '../../dialog/dialo-add-comment-attendance/dialo-add-comment-attendance.component';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { LoaderGeneralService } from 'src/app/pages/dialog-general/loader-general.service';
@Component({
  selector: 'app-attendance-validation',
  templateUrl: './attendance-validation.component.html',
  styleUrls: ['./attendance-validation.component.scss'],
})
export class AttendanceValidationComponent implements OnInit {
  public today = new Date();
  public user;
  public turno;
  public data: any[] = [];
  public activeData = false;


  constructor(
    public router: Router,
    public modalController: ModalController,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public loader: LoaderGeneralService,
    public routerActive: ActivatedRoute
  ) { }

  ionViewWillEnter() {
    console.log('hora', this.today);
    console.log(this.routerActive.snapshot.paramMap.get('turno'));
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log('checador: ', this.user);
    this.service
      .serviceGeneralGet(`ValidateAttendance/All/${this.user.branchId}`)
      .subscribe((resp) => {
        this.loader.loadingPresent();
        if (resp.success) {
          this.data = resp.result;
          console.log('resp', this.data);
          this.activeData = true;
          if (this.data.length === 0) {
            this.data.push({
              jobTitle: 'No data'
            });
          }
          this.loader.loadingDismiss();
        }
      }, error => {
        console.log('Error', error);
        this.activeData= true;

      });
  }

  ngOnInit() { }

  return() {
    window.history.back();
    // this.router.navigateByUrl('supervisor/control-matutino');
  }
  async commentAttendance(idPerson: number, claveTrabajo, nombre, trabajo) {
    const modal = await this.modalController.create({
      component: DialoAddCommentAttendanceComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        id: idPerson,
        clabTrab: claveTrabajo,
        name: nombre,
        jobTitle: trabajo,
      },
    });
    this.ionViewWillEnter();
    return await modal.present();
  }

}

