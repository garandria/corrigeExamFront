import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MesCoursComponent } from './mes-cours/mes-cours.component';
import { CreercoursComponent } from './creercours/creercours.component';
import { CoursdetailsComponent } from './coursdetail/coursdetails.component';
import { ImportStudentComponent } from './import-student/import-student.component';
import { ListstudentcourseComponent } from './liststudentcourse/liststudentcourse.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { BlockUIModule } from 'primeng/blockui';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { DockModule } from 'primeng/dock';
import { HotTableModule } from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
import { SliderModule } from 'primeng/slider';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'app/shared/shared.module';
import { Route, RouterModule } from '@angular/router';
import { CreerexamComponent } from './creerexam/creerexam.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';
import { AnnotateTemplateComponent } from './annotate-template/annotate-template.component';

import { PaintComponent } from './annotate-template/paint/paint.component';
import { GraphicalToolbarComponent } from './annotate-template/paint/toolbar/toolbar.component';
import { FormsModule } from '@angular/forms';
import { EventHandlerService } from './annotate-template/paint/event-handler.service';
import { FabricShapeService } from './annotate-template/paint/shape.service';
import { ColourPaletteComponent } from './annotate-template/paint/toolbar/colour-palette/colour-palette.component';
import { FabricCanvasComponent } from './annotate-template/paint/fabric-canvas/fabric-canvas.component';
import { ThicknessSliderComponent } from './annotate-template/paint/toolbar/thickness-slider/thickness-slider.component';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { QuestionpropertiesviewComponent } from './annotate-template/paint/questionpropertiesview/questionpropertiesview.component';
import { ChargerscanComponent } from './chargerscan/chargerscan.component';
import { ShowextractImageComponent } from './showextract-image/showextract-image.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageExtractorComponent } from './image-extractor/image-extractor.component';
import { AssocierCopiesEtudiantsComponent } from './associer-copies-etudiants/associer-copies-etudiants.component';
import { NgxOpenCVModule } from 'ngx-opencv';

// set the location of the OpenCV files
const openCVConfig = {
  openCVDirPath: '/content/opencv',
};
registerAllModules();

export const COURSMAIN_ROUTE: Route = {
  path: 'course/:courseid',
  component: CoursdetailsComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const CREERCOURS_ROUTE: Route = {
  path: 'creercours',
  component: CreercoursComponent,
  data: {
    pageTitle: 'home.creercours',
  },
};

export const REGISTERSTUDENT_ROUTE: Route = {
  path: 'registerstudents/:courseid',
  component: ImportStudentComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const LISTESTUDENT_ROUTE: Route = {
  path: 'liststudents/:courseid',
  component: ListstudentcourseComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const CREEREXAM_ROUTE: Route = {
  path: 'creerexam/:courseid',
  component: CreerexamComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const CHARGERSCAN_ROUTE: Route = {
  path: 'loadscan/:examid',
  component: ChargerscanComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const EXAMDETAIL_ROUTE: Route = {
  path: 'exam/:examid',
  component: ExamDetailComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const ANNOTATETEMPLATE_ROUTE: Route = {
  path: 'exam/annotate/:examid',
  component: AnnotateTemplateComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const SHOWIMAGE_ROUTE: Route = {
  path: 'showimage/:examid',
  component: ShowextractImageComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const AssocierCopiesEtudiants_ROUTE: Route = {
  path: 'studentbindings/:examid',
  component: AssocierCopiesEtudiantsComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

export const CorrigerCopiesEtudiants_ROUTE: Route = {
  path: 'answer/:examid',
  component: AssocierCopiesEtudiantsComponent,
  data: {
    authorities: ['ROLE_USER'],
    pageTitle: 'home.creercours',
  },
};

@NgModule({
  declarations: [
    MesCoursComponent,
    CreercoursComponent,
    CoursdetailsComponent,
    ImportStudentComponent,
    ListstudentcourseComponent,
    CreerexamComponent,
    ExamDetailComponent,
    AnnotateTemplateComponent,
    PaintComponent,
    GraphicalToolbarComponent,
    ColourPaletteComponent,
    FabricCanvasComponent,
    ThicknessSliderComponent,
    QuestionpropertiesviewComponent,
    ChargerscanComponent,
    ShowextractImageComponent,
    ImageExtractorComponent,
    AssocierCopiesEtudiantsComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ButtonModule,
    SharedModule,
    FontAwesomeModule,
    BlockUIModule,
    MenuModule,
    NgxOpenCVModule.forRoot(openCVConfig),
    ImageCropperModule,
    DockModule,
    TooltipModule,
    ToastModule,
    SliderModule,
    HotTableModule,
    TableModule,
    ConfirmDialogModule,
    FormsModule,
    NgxExtendedPdfViewerModule,

    RouterModule.forChild([
      CREERCOURS_ROUTE,
      COURSMAIN_ROUTE,
      REGISTERSTUDENT_ROUTE,
      LISTESTUDENT_ROUTE,
      CREEREXAM_ROUTE,
      EXAMDETAIL_ROUTE,
      ANNOTATETEMPLATE_ROUTE,
      CHARGERSCAN_ROUTE,
      SHOWIMAGE_ROUTE,
      AssocierCopiesEtudiants_ROUTE,
      CorrigerCopiesEtudiants_ROUTE,
    ]),
  ],
  exports: [MesCoursComponent, CreercoursComponent, CoursdetailsComponent, ImportStudentComponent, ListstudentcourseComponent],
  providers: [EventHandlerService, FabricShapeService],
})
export class ScanexamModule {}
