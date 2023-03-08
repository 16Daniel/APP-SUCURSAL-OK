import { DialogNotificationComponent } from './pages/nav/dialog-notification/dialog-notification.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from './pages/nav/sidebar/sidebar.component';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogGeneralMessageComponent } from './pages/dialog-general/dialog-general-message/dialog-general-message.component';
// eslint-disable-next-line max-len
import { DialogGeneralConfirmationMessageComponent } from './pages/dialog-general/dialog-general-confirmation-message/dialog-general-confirmation-message.component';
import { LoaderComponent } from './pages/dialog-general/loader/loader.component';
import { Camera } from '@ionic-native/camera/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { IonicSelectableModule } from 'ionic-selectable';
import { PopoverTransferRequestComponent } from './pages/supervisores/popover/popover-transfer-request/popover-transfer-request.component';
import { LogoutComponent } from './pages/popover/logout/logout.component';
import { HistoryTicketComponent } from './pages/shared/history-ticket/history-ticket.component';
import { OpenTicketComponent } from './pages/shared/open-ticket/open-ticket.component';
import { DialogViewTransferComponent } from './pages/supervisores/dialog/dialog-view-transfer/dialog-view-transfer.component';
// eslint-disable-next-line max-len
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { APP_ROUTING } from './app-routing.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormatePipePipe } from './pages/shared/formate-pipe.pipe';
import { NativeAudio } from '@ionic-native/native-audio/ngx';


@NgModule({
  declarations: [
    AppComponent,
    DialogGeneralMessageComponent,
    DialogGeneralConfirmationMessageComponent,
    SidebarComponent,
    DialogNotificationComponent,
    PopoverTransferRequestComponent,
    LogoutComponent,
    HistoryTicketComponent,
    OpenTicketComponent,
    DialogViewTransferComponent,
    FormatePipePipe,
  ],
  entryComponents: [],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    FilterPipeModule,
    IonicSelectableModule,
    APP_ROUTING,
    Ng2SearchPipeModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  providers: [
    LoaderComponent,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    Camera,
    Dialogs,
    NativeAudio,
    DatePipe,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
