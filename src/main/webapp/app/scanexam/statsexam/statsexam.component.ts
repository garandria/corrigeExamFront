/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable guard-for-in */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { CourseService } from 'app/entities/course/service/course.service';
import { IQuestion } from 'app/entities/question/question.model';
import { QuestionService } from 'app/entities/question/service/question.service';
import { Observable } from 'rxjs';
import { db } from '../db/db';

// Couleurs à utiliser
const GRIS = 'rgba(179,181,198,1)';
const VERT = 'rgba(120,255,132,1)';
const ROUGE = 'rgb(255, 120, 120)';
const BLEU_FONCE = 'rgb(72, 61, 139)';
const BLANC = 'rgba(255,255,255,1)';
const VIOLET = 'rgb(233, 120, 255)';
const VIOLET_TIEDE = 'rgb(233, 120, 255,0.6)';
const VIOLET_LEGER = 'rgb(233, 120, 255,0.2)';
const BLEU_AERO = 'rgb(142, 184, 229)';
const BLEU_AERO_TIEDE = 'rgb(142, 184, 229,0.6)';
const TRANSPARENT = 'rgba(255,255,255,0.0)';

@Component({
  selector: 'jhi-statsexam',
  templateUrl: './statsexam.component.html',
  styleUrls: ['./statsexam.component.scss'],
})
export class StatsExamComponent implements OnInit {
  // Page related variables
  examid = '-1';
  infosQuestions: IQuestion[] = [];
  infosStudents: StudentRes[] = [];
  q_notees: QuestionNotee[] = [];
  notes_eleves: number[] = [];
  choixTri = true;

  // Graphical data
  data_radar_courant: IRadar = {
    labels: [],
    datasets: [],
    vue: '',
  };
  etudiantSelec: StudentRes | null | undefined;
  listeMobileEtudiant: StudSelecMobile[] = [];
  mobileSortChoices: ISortMobile[] = [
    { icon: 'pi pi-id-card', sort: 'ine' },
    { icon: 'pi pi-sort-alpha-up', sort: 'alpha' },
    { icon: 'pi pi-sort-numeric-up', sort: 'note' },
  ];
  mobileSortChoice: ISortMobile = this.mobileSortChoices[2];
  knobsCourants: string[] = [];
  COLOR_KNOBS = BLEU_AERO_TIEDE;
  idQuestionSelected = 0;
  questionSelectionnee = false;
  texte_correction = 'Correction';
  readonly ICONSORTUP = 'pi pi-sort-amount-up-alt'; // Permet d'éviter une étrange erreur de vscode (Unexpected keyword or identifier.javascript)

  activeIndex = 1;
  responsiveOptions2: any[] = [
    {
      breakpoint: '1500px',
      numVisible: 5,
    },
    {
      breakpoint: '1024px',
      numVisible: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  displayBasic = false;
  images: any[] = [];
  noalign = false;
  nbreFeuilleParCopie: number | undefined;

  constructor(
    protected applicationConfigService: ApplicationConfigService,
    private http: HttpClient,
    protected courseService: CourseService,
    public questionService: QuestionService,
    protected activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.examid = params.get('examid') ?? '-1';

      if (this.examid === '-1') {
        return;
      }
      if (this.images.length === 0) {
        this.loadAllPages();
      }

      this.translateService.get('scanexam.noteattribuee').subscribe(() => {
        this.initStudents().then(() => {
          this.performInfoQuestionsQuery();
        });

        this.translateService.onLangChange.subscribe(() => {
          this.performInfoQuestionsQuery();
        });
      });
    });
  }

  private performInfoQuestionsQuery(): void {
    this.requeteInfoQuestions().subscribe(b => {
      // Getting and sorting the questions
      this.infosQuestions = (b.body ?? []).sort((i1, i2) => (i1.numero ?? 0) - (i2.numero ?? 0));
      this.initStatVariables();
      this.initDisplayVariables();
      this.style();
    });
  }

  loadAllPages(): void {
    db.templates
      .where('examId')
      .equals(+this.examid)
      .count()
      .then(e2 => {
        this.nbreFeuilleParCopie = e2;
      });
    this.images = [];

    if (this.noalign) {
      db.nonAlignImages
        .where({ examId: +this.examid })
        .sortBy('pageNumber')
        .then(e1 =>
          e1.forEach(e => {
            const image = JSON.parse(e.value, this.reviver);

            this.images.push({
              src: image.pages,
              alt: 'Description for Image 2',
              title: 'Exam',
            });
          })
        );
    } else {
      db.alignImages
        .where({ examId: +this.examid })
        .sortBy('pageNumber')
        .then(e1 =>
          e1.forEach(e => {
            const image = JSON.parse(e.value, this.reviver);
            this.images.push({
              src: image.pages,
              alt: 'Description for Image 2',
              title: 'Exam',
            });
          })
        );
    }
  }

  private reviver(key: any, value: any): any {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  public changementTriMobile(): void {
    // Clic automatique qui permet de modifier l'affichage de la sélection dans le tableau (si l'utilisateur rebascule de vue)
    this.clickColonneTableau(this.mobileSortChoice.sort);
    const evenement: ISort = {
      data: this.infosStudents,
      mode: 'single',
      field: this.mobileSortChoice.sort,
      order: this.choixTri ? 1 : -1,
    };
    this.triSelection(evenement);
    this.initMobileSelection();
  }

  private async initStudents(): Promise<void> {
    this.infosStudents = await this.loadStudents();
  }

  private requeteInfoQuestions(): Observable<HttpResponse<IQuestion[]>> {
    return this.questionService.query({ examId: this.examid });
  }

  private async loadStudents(): Promise<StudentRes[]> {
    return new Promise<StudentRes[]>(res => {
      this.http.get<StudentRes[]>(this.applicationConfigService.getEndpointFor(`api/showResult/${this.examid}`)).subscribe(s => {
        res(s);
      });
    });
  }

  private initStatVariables(): void {
    this.triNotes(this.infosStudents);
    const qn: QuestionNotee[] = [];
    for (const q of this.infosQuestions) {
      const numero = q.numero ?? 0;
      const bareme = q.point ?? 0;
      const labelBegin: string = this.translateService.instant('scanexam.questionLow');
      const label = `${labelBegin} ${numero}`;
      const notesAssociees: number[] = [];
      const quest_divisee = qn.find(quest => quest.label === label);
      if (quest_divisee === undefined) {
        // On ne prend pas en compte la notation de la deuxième partie s'il y en a une
        // (même comportement que lorsque l'on note la question dans la partie  correction)
        qn.push({ bareme, numero, label, notesAssociees });
      }
    }
    this.infosStudents
      .filter(s => s.ine !== '')
      .forEach(s => {
        for (const key in s.notequestions) {
          // semi-column char instead of decimal dot, so:
          const note = this.s2f(s.notequestions[key]);
          qn[parseFloat(key) - 1]?.notesAssociees?.push(note);
        }
        const note = s.note === undefined ? 0 : this.s2f(s.note);
        this.notes_eleves.push(note);
      });
    this.q_notees = qn.sort((a, b) => a.numero - b.numero);
  }

  public s2f(str: string): number {
    return parseFloat(str.replace(',', '.'));
  }

  public triSelection(event: ISort): void {
    switch (event.field) {
      case 'ine':
        this.triINE(this.infosStudents);
        this.mobileSortChoice = this.mobileSortChoices[0];
        break;
      case 'alpha':
        this.triAlpha(this.infosStudents);
        this.mobileSortChoice = this.mobileSortChoices[1];
        break;
      default:
        this.triNotes(this.infosStudents);
        this.mobileSortChoice = this.mobileSortChoices[2];
        break;
    }
    if (event.order === -1) {
      event.data.reverse();
    }
    this.choixTri = event.order === 1;
    this.initMobileSelection();
  }

  private triNotes(etudiants: StudentRes[]): StudentRes[] {
    etudiants.sort((s1: StudentRes, s2: StudentRes) => {
      const note1 = s1.note;
      const note2 = s2.note;
      if (note1 === undefined && note2 === undefined) {
        return 0;
      } else if (note1 === undefined) {
        return -1;
      } else if (note2 === undefined) {
        return 1;
      } else if (this.s2f(note1) < this.s2f(note2)) {
        return -1;
      } else if (this.s2f(note1) === this.s2f(note2)) {
        return this.compareAlpha(s1, s2);
      }
      return 1;
    });
    return etudiants.reverse();
  }

  private triINE(etudiants: StudentRes[]): StudentRes[] {
    etudiants.sort((s1: StudentRes, s2: StudentRes) => {
      const ine1 = s1.ine;
      const ine2 = s2.ine;
      return ine1.localeCompare(ine2);
    });
    return etudiants;
  }

  private triAlpha(etudiants: StudentRes[]): StudentRes[] {
    etudiants.sort((s1: StudentRes, s2: StudentRes) => {
      const diff = this.compareAlpha(s1, s2);
      return diff;
    });
    return etudiants;
  }

  private compareAlpha(s1: StudentRes, s2: StudentRes): number {
    const nom1 = s1.nom;
    const nom2 = s2.nom;
    let diff = nom1.localeCompare(nom2);
    if (diff === 0) {
      diff = s1.prenom.localeCompare(s2.prenom);
    }
    return diff;
  }

  /** @return The notation for each question */
  public getBaremes(stats: QuestionNotee[]): number[] {
    return stats.map(s => s.bareme);
  }

  public getBaremeExam(): number {
    return this.sum(this.getBaremes(this.q_notees));
  }

  private getNotes(etudiant: StudentRes): number[] {
    const notes: number[] = [];
    for (const key in etudiant.notequestions) {
      notes.push(this.s2f(etudiant.notequestions[key]));
    }
    return notes;
  }
  // Permet de pouvoir accéder facilement aux notes de l'étudiant sélectionné et de ne pas devoir gérer les erreurs en cas d'étudiant non sélectionné
  public getNotesSelect(): number[] {
    if (this.etudiantSelec !== null && this.etudiantSelec !== undefined) {
      return this.getNotes(this.etudiantSelec);
    } else {
      return [];
    }
  }

  getNoteSelect(): number {
    return this.sum(this.getNotesSelect());
  }

  /** @return Average mark for all the questions (ordered) */
  private getMoyennesQuestions(): number[] {
    return this.q_notees.map(ns => this.avg(ns.notesAssociees));
  }

  private updateKnobs(): void {
    const knobsNb = this.etudiantSelec !== null && this.etudiantSelec !== undefined ? this.getNotesSelect() : this.getMoyennesQuestions();
    this.knobsCourants = [];
    knobsNb.forEach(knobValue => {
      this.knobsCourants.push(knobValue.toFixed(2));
    });
  }

  public getMoyenneExam(): number {
    return this.sum(this.notes_eleves) / this.notes_eleves.length;
  }

  public getMedianeExam(): number {
    return this.med(this.notes_eleves);
  }

  public getVarianceExam(): number {
    return this.var(this.notes_eleves);
  }

  public getEcartTypeExam(): number {
    return this.ecart_type(this.notes_eleves);
  }

  public getMaxNoteExam(): number {
    return this.max(this.notes_eleves);
  }

  public getMinNoteExam(): number {
    return this.min(this.notes_eleves);
  }

  /** @param tab un tableau non vide @returns la valeur la plus élevée  */
  private max(tab: number[]): number {
    return Math.max(...tab);
  }

  /** @param tab un tableau non vide @returns la valeur la moins élevée  */
  private min(tab: number[]): number {
    return Math.min(...tab);
  }

  /** @param tab un tableau non vide @returns la moyenne  */
  sum(tab: number[]): number {
    return tab.reduce((x, y) => x + y, 0);
  }

  /** @param tab un tableau non vide @returns la moyenne correspondant à ce tableau*/
  private avg(tab: number[]): number {
    return tab.length > 0 ? this.sum(tab) / tab.length : 0;
  }

  /** @param tab un tableau non vide @returns la mediane correspondant à ce tableau*/
  private med(tab: number[]): number {
    tab.sort();
    const moitie: number = tab.length / 2;
    const indiceMilieu: number = Number.isInteger(moitie) ? moitie : Math.floor(moitie);
    return tab[indiceMilieu];
  }

  /** @param tab un tableau non vide @returns la variance correspondant à ce tableau*/
  private var(tab: number[]): number {
    const moy: number = this.avg(tab);
    let variance = 0;
    for (const xi of tab) {
      variance += Math.pow(xi - moy, 2);
    }
    variance /= tab.length;
    return variance;
  }

  /** @param tab un tableau non vide @returns l'écart-type correspondant à ce tableau*/
  private ecart_type(tab: number[]): number {
    return Math.sqrt(this.var(tab));
  }

  private normaliseNotes(notes: number[], baremes: number[], norme = 100): number[] {
    notes.forEach((note, indice) => {
      note /= baremes[indice];
      notes[indice] = note * norme;
    });
    return notes;
  }

  private initDisplayVariables(): void {
    this.data_radar_courant = this.initGlobalRadarData(this.q_notees, true);
    this.updateKnobs();
    this.updateCarteRadar();
    this.changementTriMobile();
  }

  private initMobileSelection(): void {
    if (this.listeMobileEtudiant.length > 0) {
      while (this.listeMobileEtudiant.length !== 0) {
        this.listeMobileEtudiant.pop();
      }
    }
    for (const etudiant of this.infosStudents) {
      const note = this.s2f(etudiant.note === undefined ? '0' : etudiant.note)
        .toFixed(2)
        .toString();
      const name = etudiant.ine + ' | ' + this.s_red(etudiant.prenom, 1) + ' ' + this.s_red(etudiant.nom, 8) + ' | ' + note;
      const value = etudiant;
      const etmob: StudSelecMobile = { name, value };
      this.listeMobileEtudiant.push(etmob);
    }
  }

  private s_red(s: string, length = 3, abrevSymbol = '.'): string {
    if (length >= s.length) {
      return s;
    }
    return s.slice(0, length) + abrevSymbol;
  }

  /** Initialises radar data to display **/
  private initGlobalRadarData(stats: QuestionNotee[], pourcents = false): IRadar {
    const labels = stats.map(e => e.label);
    const datasets = [this.radarMoy(), this.radarMed(), this.radarMaxNote(), this.radarMinNote()];

    if (pourcents) {
      datasets.forEach((ds, indice) => {
        datasets[indice].data = this.normaliseNotes(ds.data, this.getBaremes(stats));
      });
    }
    const vue = pourcents ? 'pourcents' : 'brut';
    return { labels, datasets, vue };
  }

  private initStudentRadarData(etudiant: StudentRes, pourcents = false): IRadar {
    const labels = this.data_radar_courant.labels;
    const datasets = [this.radarStudent(etudiant), this.radarMoy(), this.radarMed()];
    if (pourcents) {
      datasets.forEach((ds, indice) => {
        datasets[indice].data = this.normaliseNotes(ds.data, this.getBaremes(this.q_notees));
      });
    }
    const vue = pourcents ? this.translateService.instant('scanexam.pourcents') : this.translateService.instant('scanexam.brut');
    return { labels, datasets, vue };
  }

  private radarMoy(): IRadarDataset {
    return this.basicDataset(this.translateService.instant('scanexam.average'), BLEU_AERO, TRANSPARENT, this.getMoyennesQuestions());
  }

  private radarMed(): IRadarDataset {
    return this.basicDataset(
      this.translateService.instant('scanexam.mediane'),
      BLEU_FONCE,
      TRANSPARENT,
      this.q_notees.map(ns => this.med(ns.notesAssociees))
    );
  }

  private radarMaxNote(): IRadarDataset {
    return this.basicDataset(
      this.translateService.instant('scanexam.notemax1'),
      VERT,
      TRANSPARENT,
      this.q_notees.map(ns => this.max(ns.notesAssociees))
    );
  }
  private radarMinNote(): IRadarDataset {
    return this.basicDataset(
      this.translateService.instant('scanexam.notemin1'),
      ROUGE,
      TRANSPARENT,
      this.q_notees.map(ns => this.min(ns.notesAssociees))
    );
  }

  private radarStudent(etudiant: StudentRes): IRadarDataset {
    return this.basicDataset(this.translateService.instant('scanexam.notes'), VIOLET, VIOLET_LEGER, this.getNotes(etudiant));
  }

  private basicDataset(label: string, couleurForte: string, couleurLegere: string, data: number[]): IRadarDataset {
    return this.radarDataset(label, couleurLegere, couleurForte, couleurForte, BLANC, BLANC, GRIS, data);
  }

  public toggleRadar(): void {
    const choixPrct = this.data_radar_courant.vue === this.translateService.instant('scanexam.pourcents');

    this.data_radar_courant.vue = choixPrct
      ? this.translateService.instant('scanexam.brut')
      : this.translateService.instant('scanexam.pourcents');
    // Carte
    this.updateCarteRadar();
  }

  public updateCarteRadar(): void {
    const choixPrct = this.data_radar_courant.vue === this.translateService.instant('scanexam.pourcents');
    if (this.etudiantSelec !== null && this.etudiantSelec !== undefined) {
      this.data_radar_courant = this.initStudentRadarData(this.etudiantSelec, choixPrct);
    } else {
      this.data_radar_courant = this.initGlobalRadarData(this.q_notees, choixPrct);
    }
    const selection: string = choixPrct
      ? this.translateService.instant('scanexam.valeursnormalisees')
      : this.translateService.instant('scanexam.valeursbrutes');
    const infosExam = undefined; // : string = this.resumeExam();
    this.updateCarte('questions_stats', undefined, selection, infosExam);
  }

  onStudentSelect(): void {
    if (this.etudiantSelec !== null && this.etudiantSelec !== undefined) {
      this.data_radar_courant = this.initStudentRadarData(
        this.etudiantSelec,
        this.data_radar_courant.vue === this.translateService.instant('scanexam.pourcents')
      );
      this.updateCarteRadar();
      this.updateKnobs();
      this.COLOR_KNOBS = VIOLET_TIEDE;
    }
  }
  onStudentUnselect(): void {
    this.updateCarteRadar();
    this.updateKnobs();
    this.COLOR_KNOBS = BLEU_AERO_TIEDE;
  }

  /** @modifies les valeurs textuelles d'un élément < p-card > */
  private updateCarte(id: string, titre: string | undefined, soustitre: string | undefined, texte: string | undefined): void {
    const c = document.getElementById(id);
    if (c == null) {
      return;
    }
    if (titre !== undefined) {
      c.getElementsByClassName('p-card-title')[0].innerHTML = titre;
    }
    if (soustitre !== undefined) {
      c.getElementsByClassName('p-card-subtitle')[0].innerHTML = soustitre;
    }
    if (texte) {
      c.getElementsByTagName('p')[0].innerHTML = texte;
    }
  }

  private radarDataset(
    label: string,
    backgroundColor: string,
    borderColor: string,
    pointBackgroundColor: string,
    pointBorderColor: string,
    pointHoverBackgroundColor: string,
    pointHoverBorderColor: string,
    data: number[]
  ): IRadarDataset {
    return {
      label,
      backgroundColor,
      borderColor,
      pointBackgroundColor,
      pointBorderColor,
      pointHoverBackgroundColor,
      pointHoverBorderColor,
      data,
    };
  }

  /** @info méthode dédiée à modifier le style de certaines balises de PrimeNG inaccessibles via le CSS de manière classique*/
  private style(): void {
    // Modification de l'espace entre le header et le body d'une carte
    const e = document.getElementsByClassName('p-card-content');
    for (let i = 0; i < e.length; i++) {
      e[i].setAttribute('style', 'padding:0px;');
    }
  }

  /**
   *
   * @warning méthode non fiable à n'utiliser que pour le style.  La version localhost fontionne, mais pas sa version en production
   */
  private clickColonneTableau(id: string): void {
    const es = document.getElementById('selectstudent')?.getElementsByClassName('p-element p-sortable-column');
    if (es === undefined) {
      return;
    }
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      if (e.getAttribute('psortablecolumn') === id) {
        e.id = 'order-' + id;
        document.getElementById('order-' + id)?.click();
        break;
      }
    }
  }

  public selectQuestion(idQuestion: number): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.etudiantSelec == null || this.etudiantSelec === undefined) {
      return;
    }
    let q_selectionne = true;
    if (this.idQuestionSelected === idQuestion) {
      // Effet toggle
      q_selectionne = !this.questionSelectionnee;
    }
    if (this.questionSelectionnee && document.getElementsByClassName('knobSelected').length > 0) {
      document.getElementsByClassName('knobSelected')[0].setAttribute('class', 'knobQuestion');
    }
    this.idQuestionSelected = idQuestion;
    if (!q_selectionne) {
      this.texte_correction = this.translateService.instant('scanexam.correction');
      this.questionSelectionnee = false;
      this.idQuestionSelected = 0;
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      this.texte_correction = this.translateService.instant('scanexam.correction') + '(' + (idQuestion + 1).toString() + ')';
      const knobCard = document.getElementById('knobquest' + idQuestion.toString());
      knobCard?.setAttribute('class', 'knobQuestion knobSelected');
      this.questionSelectionnee = true;
    }
  }

  public goToCorrection(): void {
    location.href = `answer/${this.examid}/${this.idQuestionSelected + 1}/${this.etudiantSelec?.studentNumber?.toString() ?? ''}`;
  }
  public voirLaCopie(): void {
    if (this.etudiantSelec?.studentNumber?.toString() !== undefined) {
      this.activeIndex = (+this.etudiantSelec.studentNumber.toString() - 1) * this.nbreFeuilleParCopie!;
    } else {
      this.activeIndex = 1;
    }
    this.displayBasic = true;
  }
  gotoResultat(): void {
    this.router.navigateByUrl(`/showresults/${this.examid}`);
  }
}
export interface ISortMobile {
  icon: string;
  sort: string;
}
export interface StudSelecMobile {
  name: string;
  value: StudentRes;
}
export interface ISort {
  data: StudentRes[];
  mode: string;
  field: string;
  order: number;
}
export interface QuestionNotee {
  label: string;
  numero: number;
  bareme: number;
  notesAssociees: number[];
}
export interface StudentRes {
  ine: string;
  mail: string;
  nom: string;
  prenom: string;
  abi: boolean;
  note?: string;
  notequestions: { [key: string]: string };
  studentNumber?: string;
  uuid?: string;
}
export interface IRadar {
  labels: string[];
  datasets: IRadarDataset[];
  vue: string;
}
export interface IRadarDataset {
  label: string;
  backgroundColor: string;
  borderColor: string;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointHoverBackgroundColor: string;
  pointHoverBorderColor: string;
  data: number[];
}
