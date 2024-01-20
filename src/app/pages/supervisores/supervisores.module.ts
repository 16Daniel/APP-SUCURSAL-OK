import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RemisionesComponent } from './task-evening/remisiones/remisiones.component';
import { DialogAddAlbaranesComponent } from './dialog/dialog-add-albaranes/dialog-add-albaranes.component';
import { AlbaranesComponent } from './task-evening/albaranes/albaranes.component';
import { DialogAddTransferComponent } from './dialog/dialog-add-transfer/dialog-add-transfer.component';
import { TransferenciasComponent } from './task-evening/transferencias/transferencias.component';
import { LimpiezaSalonBanosComponent } from './task-evening/limpieza-salon-banos/limpieza-salon-banos.component';
import { ResguardoTabletaComponent } from './task-evening/resguardo-tableta/resguardo-tableta.component';
import { AlarmaComponent } from './task-evening/alarma/alarma.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SupervisoresRoutingModule } from './supervisores-routing.module';
import { ScheduleComponent } from './schedule/schedule.component';
import { CentroControlVespertinoComponent } from './task-evening/centro-control-vespertino/centro-control-vespertino.component';
import { CentroControlMatutinoComponent } from './task-morning/centro-control-matutino/centro-control-matutino.component';
import { AttendanceValidationComponent } from './task-morning/attendance-validation/attendance-validation.component';
import { GasValidationComponent } from './task-morning/gas-validation/gas-validation.component';
import { LoungeMountedComponent } from './task-morning/lounge-mounted/lounge-mounted.component';
import { BanosMatutinoComponent } from './task-morning/Banos-Matutino/Banos-Matutino.component';
import { SalesExpectationComponent } from './task-morning/sales-expectation/sales-expectation.component';
import { InventarioSemanalComponent } from './task-evening/inventario-semanal/inventario-semanal.component';
import { DialoAddCommentAttendanceComponent } from './dialog/dialo-add-comment-attendance/dialo-add-comment-attendance.component';
import { DialogAddPackageComponent } from './dialog/dialog-add-package/dialog-add-package.component';
import { DialogAddRegisterUsePackageComponent } from './dialog/dialog-add-register-use-package/dialog-add-register-use-package.component';
import { WaitTablesComponent } from './task-morning/wait-tables/wait-tables.component';
import { ResguardoPropinaComponent } from './task-evening/resguardo-propina/resguardo-propina.component';
import { VoladoEfectivoComponent } from './task-evening/volado-efectivo/volado-efectivo.component';
import { ProductoRiesgoComponent } from './task-evening/producto-riesgo/producto-riesgo.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { IonicSelectableModule } from 'ionic-selectable';
import { ResguardoTabletAlarmaComponent } from './task-evening/resguardo-tablet-alarma/resguardo-tablet-alarma.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DialogNotificationAlarmComponent } from './dialog/dialog-notification-alarm/dialog-notification-alarm.component';
import { DialogUpdateStockPolloComponent } from './dialog/dialog-update-stock-pollo/dialog-update-stock-pollo.component';
import { GraficaTiemposComponent } from './graficas/grafica-tiempos/grafica-tiempos.component';
import { C25ptsComponent } from './graficas/c25pts/c25pts.component';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [
    ScheduleComponent,
    CentroControlMatutinoComponent,
    CentroControlVespertinoComponent,
    AttendanceValidationComponent,
    GasValidationComponent,
    LoungeMountedComponent,
    BanosMatutinoComponent,
    SalesExpectationComponent,
    InventarioSemanalComponent,
    DialoAddCommentAttendanceComponent,
    DialogAddPackageComponent,
    DialogAddRegisterUsePackageComponent,
    WaitTablesComponent,
    AlarmaComponent,
    ResguardoTabletaComponent,
    ResguardoPropinaComponent,
    VoladoEfectivoComponent,
    LimpiezaSalonBanosComponent,
    ProductoRiesgoComponent,
    TransferenciasComponent,
    DialogAddTransferComponent,
    AlbaranesComponent,
    DialogAddAlbaranesComponent,
    RemisionesComponent,
    ResguardoTabletAlarmaComponent,
    DialogNotificationAlarmComponent,
    DialogUpdateStockPolloComponent,
    GraficaTiemposComponent,
    C25ptsComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SupervisoresRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    IonicSelectableModule,
    Ng2SearchPipeModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [DatePicker,NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupervisoresModule {}
