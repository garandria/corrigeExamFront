import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { StudentResponseService } from '../service/student-response.service';
import { IStudentResponse, StudentResponse } from '../student-response.model';
import { IQuestion } from 'app/entities/question/question.model';
import { QuestionService } from 'app/entities/question/service/question.service';
import { IExamSheet } from 'app/entities/exam-sheet/exam-sheet.model';
import { ExamSheetService } from 'app/entities/exam-sheet/service/exam-sheet.service';

import { StudentResponseUpdateComponent } from './student-response-update.component';

describe('StudentResponse Management Update Component', () => {
  let comp: StudentResponseUpdateComponent;
  let fixture: ComponentFixture<StudentResponseUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let studentResponseService: StudentResponseService;
  let questionService: QuestionService;
  let examSheetService: ExamSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [StudentResponseUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(StudentResponseUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StudentResponseUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    studentResponseService = TestBed.inject(StudentResponseService);
    questionService = TestBed.inject(QuestionService);
    examSheetService = TestBed.inject(ExamSheetService);

    comp = fixture.componentInstance;
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<StudentResponse>>();
      const studentResponse = { id: 123 };
      jest.spyOn(studentResponseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ studentResponse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: studentResponse }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(studentResponseService.update).toHaveBeenCalledWith(studentResponse);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<StudentResponse>>();
      const studentResponse = new StudentResponse();
      jest.spyOn(studentResponseService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ studentResponse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: studentResponse }));
      saveSubject.complete();

      // THEN
      expect(studentResponseService.create).toHaveBeenCalledWith(studentResponse);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<StudentResponse>>();
      const studentResponse = { id: 123 };
      jest.spyOn(studentResponseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ studentResponse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(studentResponseService.update).toHaveBeenCalledWith(studentResponse);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
