import React, { useState, useEffect } from 'react';
import { ExamPaper, Question, SchoolConfig } from './types/exam';
import { SAMPLE_EXAMS } from './constants/sampleExams';
import { INITIAL_QUESTION_BANK } from './constants/initialQuestionBank';
import { Header } from './components/Header';
import { A4ExamView } from './components/A4Preview/A4ExamView';
import { MatrixTable } from './components/MatrixTable';
import { SpecTable } from './components/SpecTable';
import { AnswerKeyView } from './components/AnswerKeyView';
import { ExamWizard } from './components/ExamWizard/ExamWizard';
import { SavedExamsList } from './components/SavedExamsList';
import { ConfigManager } from './components/ConfigManager';
import { QuestionBankModal } from './components/QuestionBankModal';
import { AuditReportModal } from './components/AuditReportModal';
import { ExportModal } from './components/ExportModal';
import { validateExam, AuditReport } from './services/examValidator';
import { generateMatrixFromQuestions, generateSpecsFromQuestions } from './services/matrixSpecGenerator';
import {
  FileText,
  Table as TableIcon,
  FileSpreadsheet,
  CheckSquare,
  Database,
  Sliders,
  Sparkles,
  Layers,
  FolderOpen,
} from 'lucide-react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    'saved' | 'preview' | 'matrix' | 'specs' | 'answers' | 'wizard' | 'config'
  >('saved');

  // Exams State (Initialized with pre-seeded sample exams for Math 1-5, Vietnamese, Informatics)
  const [savedExams, setSavedExams] = useState<ExamPaper[]>(() => {
    const saved = localStorage.getItem('ptdtbt_exams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SAMPLE_EXAMS;
  });

  // Current active working exam
  const [currentExamId, setCurrentExamId] = useState<string>(() => {
    return savedExams[0]?.id || 'sample-toan-1';
  });

  // Question Bank State
  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    const saved = localStorage.getItem('ptdtbt_question_bank');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_QUESTION_BANK;
  });

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQuestionBankModalOpen, setIsQuestionBankModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ptdtbt_exams', JSON.stringify(savedExams));
  }, [savedExams]);

  useEffect(() => {
    localStorage.setItem('ptdtbt_question_bank', JSON.stringify(questionBank));
  }, [questionBank]);

  // Current selected exam
  const currentExam = savedExams.find((e) => e.id === currentExamId) || savedExams[0];

  // Current validation audit report
  const auditReport: AuditReport = currentExam
    ? validateExam(currentExam)
    : {
        isValid: false,
        score: 0,
        errors: [],
        warnings: [],
        stats: {
          totalPoints: 0,
          totalQuestions: 0,
          tnPoints: 0,
          tlPoints: 0,
          level1Points: 0,
          level2Points: 0,
          level3Points: 0,
          strandBreakdown: {},
        },
      };

  // Exam updating handlers
  const handleUpdateExam = (updated: ExamPaper) => {
    setSavedExams((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  const handleSelectExam = (exam: ExamPaper) => {
    setCurrentExamId(exam.id);
    setActiveTab('preview');
  };

  const handleDuplicateExam = (exam: ExamPaper) => {
    const copy: ExamPaper = {
      ...exam,
      id: `exam-${Date.now()}`,
      title: `${exam.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };
    setSavedExams([copy, ...savedExams]);
    setCurrentExamId(copy.id);
    setActiveTab('preview');
  };

  const handleAddExamVariant = (variant: ExamPaper) => {
    setSavedExams([variant, ...savedExams]);
    setCurrentExamId(variant.id);
    setActiveTab('preview');
  };

  const handleDeleteExam = (id: string) => {
    const remaining = savedExams.filter((e) => e.id !== id);
    setSavedExams(remaining);
    if (currentExamId === id && remaining.length > 0) {
      setCurrentExamId(remaining[0].id);
    }
  };

  // Sync matrix & specs from questions
  const handleSyncMatrix = () => {
    if (!currentExam) return;
    const newMatrix = generateMatrixFromQuestions(currentExam.questions);
    handleUpdateExam({
      ...currentExam,
      matrix: newMatrix,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSyncSpecs = () => {
    if (!currentExam) return;
    const newSpecs = generateSpecsFromQuestions(currentExam.questions);
    handleUpdateExam({
      ...currentExam,
      specifications: newSpecs,
      updatedAt: new Date().toISOString(),
    });
  };

  // Insert a question from bank into current exam
  const handleInsertQuestionToExam = (q: Question) => {
    if (!currentExam) return;
    const newQ: Question = {
      ...q,
      id: `q-inserted-${Date.now()}`,
      orderNumber: currentExam.questions.length + 1,
    };
    const updatedQuestions = [...currentExam.questions, newQ];
    const newMatrix = generateMatrixFromQuestions(updatedQuestions);
    const newSpecs = generateSpecsFromQuestions(updatedQuestions);

    handleUpdateExam({
      ...currentExam,
      questions: updatedQuestions,
      matrix: newMatrix,
      specifications: newSpecs,
      updatedAt: new Date().toISOString(),
    });

    alert(`Đã thêm Câu hỏi vào đề thi: Câu ${newQ.orderNumber}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Header */}
      <Header
        currentExam={currentExam}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Main Tab Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between overflow-x-auto py-1">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Đề đã lưu ({savedExams.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wizard')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'wizard'
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Tạo đề mới tự động</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Xem trước đề A4</span>
              </button>

              <button
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TableIcon className="w-4 h-4 text-blue-600" />
                <span>Ma trận đề</span>
              </button>

              <button
                onClick={() => setActiveTab('specs')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Bảng đặc tả</span>
              </button>

              <button
                onClick={() => setActiveTab('answers')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'answers'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Đáp án & Biểu điểm</span>
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Cấu hình khảo thí</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2">
              <button
                onClick={() => setIsQuestionBankModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Ngân hàng câu hỏi ({questionBank.length})</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === 'saved' && (
          <SavedExamsList
            exams={savedExams}
            currentExamId={currentExamId}
            onSelectExam={handleSelectExam}
            onDuplicateExam={handleDuplicateExam}
            onAddExamVariant={handleAddExamVariant}
            onDeleteExam={handleDeleteExam}
            onNewExamClick={() => setActiveTab('wizard')}
          />
        )}

        {activeTab === 'wizard' && (
          <ExamWizard
            onComplete={(newExam) => {
              setSavedExams([newExam, ...savedExams]);
              setCurrentExamId(newExam.id);
              setActiveTab('preview');
            }}
            onCancel={() => setActiveTab('saved')}
          />
        )}

        {activeTab === 'preview' && currentExam && (
          <A4ExamView
            exam={currentExam}
            onUpdateExam={handleUpdateExam}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenAudit={() => setIsAuditModalOpen(true)}
          />
        )}

        {activeTab === 'matrix' && currentExam && (
          <MatrixTable
            matrix={currentExam.matrix}
            onSyncMatrix={handleSyncMatrix}
            grade={currentExam.header.grade}
            subject={currentExam.header.subject}
          />
        )}

        {activeTab === 'specs' && currentExam && (
          <SpecTable
            specs={currentExam.specifications}
            onSyncSpecs={handleSyncSpecs}
            grade={currentExam.header.grade}
            subject={currentExam.header.subject}
          />
        )}

        {activeTab === 'answers' && currentExam && (
          <AnswerKeyView exam={currentExam} />
        )}

        {activeTab === 'config' && currentExam && (
          <ConfigManager
            currentConfig={currentExam.config}
            onUpdateConfig={(newCfg) => {
              handleUpdateExam({
                ...currentExam,
                config: newCfg,
                updatedAt: new Date().toISOString(),
              });
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        exam={currentExam}
        report={auditReport}
        onApplyFix={handleUpdateExam}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exam={currentExam}
      />

      <QuestionBankModal
        isOpen={isQuestionBankModalOpen}
        onClose={() => setIsQuestionBankModalOpen(false)}
        bankQuestions={questionBank}
        onAddQuestionToBank={(newQ) => setQuestionBank([newQ, ...questionBank])}
        onDeleteQuestionFromBank={(id) =>
          setQuestionBank(questionBank.filter((q) => q.id !== id))
        }
        onInsertToExam={handleInsertQuestionToExam}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Trường PTDTBT Tiểu học Chí Cà – Xã Xín Mần. Phần mềm khảo thí định kì Tiểu học GDPT 2018.
          </div>
          <div className="text-slate-400">
            Hỗ trợ đầy đủ khối lớp 1–5 • Ma trận • Đặc tả • Xuất Word chuẩn A4
          </div>
        </div>
      </footer>
    </div>
  );
}
