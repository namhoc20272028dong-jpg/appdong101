import React, { useState } from 'react';
import {
  GradeLevel,
  Subject,
  ExamType,
  ExamPaper,
} from '../../types/exam';
import {
  SUBJECT_LIST,
  EXAM_PERIODS,
  DEFAULT_HEADER,
  CURRICULUM_DATA,
} from '../../constants/curriculumData';
import { generateExamPaper, ExamGenerationParams } from '../../services/examGenerator';
import { validateExam } from '../../services/examValidator';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Settings,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface ExamWizardProps {
  onComplete: (createdExam: ExamPaper) => void;
  onCancel: () => void;
}

export const ExamWizard: React.FC<ExamWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [grade, setGrade] = useState<GradeLevel>(1);
  const [subject, setSubject] = useState<Subject>('Toán');
  const [semester, setSemester] = useState<ExamType>('Cuối học kì I');
  const [schoolYear, setSchoolYear] = useState<string>('2026–2027');
  const [duration, setDuration] = useState<number>(40);
  const [schoolName, setSchoolName] = useState<string>('TRƯỜNG PTDTBT TH CHÍ CÀ');
  const [governingBody, setGoverningBody] = useState<string>('UBND XÃ XÍN MẦN');

  // Step 2: Topics
  const [selectedStrands, setSelectedStrands] = useState<string[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Step 3: Preset config
  const [configPreset, setConfigPreset] = useState<
    'standard' | 'school_custom_60_40' | 'school_custom_70_30' | 'school_grade5_50_50'
  >('school_custom_60_40');

  // Preview generated paper
  const [generatedPaper, setGeneratedPaper] = useState<ExamPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Steps definition
  const steps = [
    { number: 1, title: 'Thông tin chung', desc: 'Lớp, môn, kì thi' },
    { number: 2, title: 'Phạm vi bài học', desc: 'Chủ đề & tài liệu' },
    { number: 3, title: 'Cấu hình khảo thí', desc: 'Tỉ lệ TN/TL & điểm' },
    { number: 4, title: 'Sinh ma trận & Đề', desc: 'Tạo tự động theo GDPT' },
    { number: 5, title: 'Kiểm tra & Hoàn tất', desc: 'Thẩm định & xuất bản' },
  ];

  // Available topics for chosen subject & grade
  const availableTopics = CURRICULUM_DATA[subject]?.[grade] || [];

  const handleNext = () => {
    if (currentStep === 3) {
      // Trigger generation
      setIsGenerating(true);
      setTimeout(() => {
        const params: ExamGenerationParams = {
          subject,
          grade,
          semester,
          schoolYear,
          governingBody,
          schoolName,
          durationMinutes: duration,
          totalPoints: 10,
          selectedStrands,
          configPreset,
          teacherNote: teacherNotes,
        };
        const paper = generateExamPaper(params);
        setGeneratedPaper(paper);
        setIsGenerating(false);
        setCurrentStep(4);
      }, 400);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (generatedPaper) {
      onComplete(generatedPaper);
    }
  };

  const toggleStrand = (strandName: string) => {
    if (selectedStrands.includes(strandName)) {
      setSelectedStrands(selectedStrands.filter((s) => s !== strandName));
    } else {
      setSelectedStrands([...selectedStrands, strandName]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Wizard Header & Stepper */}
      <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-b border-blue-950">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              QUY TRÌNH TẠO ĐỀ KIỂM TRA ĐỊNH KÌ TỰ ĐỘNG
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Hỗ trợ tự động lập Ma trận, Bảng đặc tả, Câu hỏi và Đáp án chuẩn GDPT 2018
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition cursor-pointer"
          >
            Hủy thao tác
          </button>
        </div>

        {/* Stepper progress */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {steps.map((st) => (
            <div
              key={st.number}
              onClick={() => {
                if (st.number < currentStep || (st.number === 4 && generatedPaper)) {
                  setCurrentStep(st.number);
                }
              }}
              className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                currentStep === st.number
                  ? 'bg-blue-600/50 border-amber-400 shadow-sm'
                  : currentStep > st.number
                  ? 'bg-blue-950/40 border-emerald-500/60 text-emerald-200'
                  : 'bg-blue-950/20 border-blue-900 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">Bước {st.number}</span>
                {currentStep > st.number && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-xs font-semibold truncate mt-0.5">{st.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* STEP 1: General Info */}
        {currentStep === 1 && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Bước 1: Chọn Khối lớp, Môn học và Thông tin kì kiểm tra
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lớp *</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const g = Number(e.target.value) as GradeLevel;
                    setGrade(g);
                    setSelectedStrands([]);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Lớp 1 (3 phương án A, B, C)</option>
                  <option value={2}>Lớp 2 (3 phương án A, B, C)</option>
                  <option value={3}>Lớp 3 (3 phương án A, B, C)</option>
                  <option value={4}>Lớp 4 (4 phương án A, B, C, D)</option>
                  <option value={5}>Lớp 5 (4 phương án A, B, C, D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học *</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value as Subject);
                    setSelectedStrands([]);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SUBJECT_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loại kiểm tra *</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as ExamType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {EXAM_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Năm học</label>
                <input
                  type="text"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian làm bài</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value={35}>35 phút</option>
                  <option value={40}>40 phút (Chuẩn)</option>
                  <option value={45}>45 phút</option>
                  <option value={50}>50 phút</option>
                  <option value={60}>60 phút</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên trường</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
              💡 <strong>Lưu ý:</strong> Khi chọn <strong>Lớp {grade}</strong>, hệ thống tự động thiết lập số lượng phương án trắc nghiệm: {grade <= 3 ? '3 phương án (A, B, C)' : '4 phương án (A, B, C, D)'} theo đúng Thông tư 27 Bộ GD&ĐT.
            </div>
          </div>
        )}

        {/* STEP 2: Topics & Content Scope */}
        {currentStep === 2 && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              Bước 2: Chọn Mạch kiến thức, Chủ đề đã dạy và Tài liệu nguồn
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Các mạch kiến thức / chủ đề trọng tâm trong học kì (Tích chọn để bao gồm trong đề):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableTopics.map((top) => {
                  const isChecked =
                    selectedStrands.length === 0 || selectedStrands.includes(top.strand);
                  return (
                    <div
                      key={top.strand}
                      onClick={() => toggleStrand(top.strand)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-medium shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div
                          className="rounded text-indigo-600 pointer-events-none"
                        />
                        <span className="text-xs font-bold">{top.strand}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-6 mt-1">
                        {top.units.map((u) => u.name).join(' • ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Upload or Paste Text */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Tài liệu kế hoạch dạy học / SGK hoặc yêu cầu riêng của giáo viên (tùy chọn):
              </label>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="file"
                  id="doc-upload"
                  accept=".docx,.pdf,.xlsx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFileName(file.name);
                    }
                  }}
                />
                <label htmlFor="doc-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-blue-700 font-semibold">Tải lên tệp tài liệu bài học</span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Hỗ trợ DOCX, PDF, XLSX, TXT (Ưu tiên kiến thức từ tài liệu này)
                  </span>
                </label>
                {uploadedFileName && (
                  <div className="mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 py-1 px-3 rounded inline-block">
                    ✓ Đã đính kèm: {uploadedFileName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Ghi chú hoặc yêu cầu đặc biệt của tổ chuyên môn:
                </label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="VD: Tập trung vào bài toán chuyển động đều, giảm bớt câu hỏi lý thuyết trừu tượng..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Assessment Configuration & Weights */}
        {currentStep === 3 && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-600" />
              Bước 3: Chọn cấu hình điểm số và tỉ lệ Trắc nghiệm – Tự luận
            </h3>

            <div className="space-y-3">
              <div
                onClick={() => setConfigPreset('school_custom_60_40')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  configPreset === 'school_custom_60_40'
                    ? 'bg-blue-50 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={configPreset === 'school_custom_60_40'}
                      onChange={() => {}}
                      className="text-blue-600 pointer-events-none"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Cấu hình 1: Trắc nghiệm 6,0 điểm – Tự luận 4,0 điểm (Khuyên dùng)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Phổ biến Lớp 1, 2, 3, 4
                  </span>
                </div>
                <p className="text-xs text-slate-500 pl-6 mt-1">
                  Mức 1 = 50% (5,0đ), Mức 2 = 30% (3,0đ), Mức 3 = 20% (2,0đ). Nghiêm cấm câu trắc nghiệm ở Mức 3.
                </p>
              </div>

              <div
                onClick={() => setConfigPreset('school_custom_70_30')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  configPreset === 'school_custom_70_30'
                    ? 'bg-blue-50 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={configPreset === 'school_custom_70_30'}
                      onChange={() => {}}
                      className="text-blue-600 pointer-events-none"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Cấu hình 2: Trắc nghiệm 7,0 điểm – Tự luận 3,0 điểm
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Yêu cầu khảo sát nhanh
                  </span>
                </div>
                <p className="text-xs text-slate-500 pl-6 mt-1">
                  Tăng số câu trắc nghiệm khách quan để rà soát rộng phạm vi kiến thức.
                </p>
              </div>

              <div
                onClick={() => setConfigPreset('school_grade5_50_50')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  configPreset === 'school_grade5_50_50'
                    ? 'bg-blue-50 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={configPreset === 'school_grade5_50_50'}
                      onChange={() => {}}
                      className="text-blue-600 pointer-events-none"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Cấu hình 3: Trắc nghiệm 5,0 điểm – Tự luận 5,0 điểm
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Chuẩn Lớp 5 & Tin học
                  </span>
                </div>
                <p className="text-xs text-slate-500 pl-6 mt-1">
                  Đánh giá sâu năng lực tính toán nhiều bước, lập luận tự luận và kỹ năng giải toán.
                </p>
              </div>
            </div>

            {/* Config summary table */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 mb-2">Bảng tổng kết cấu hình chuẩn bị sinh đề:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                <div>• Tổng điểm: <strong>10,0 điểm</strong></div>
                <div>• Dự kiến: <strong>10 câu hỏi</strong></div>
                <div>• Mức 1: <strong>50% (5,0đ)</strong></div>
                <div>• Mức 2: <strong>30% (3,0đ)</strong></div>
                <div>• Mức 3: <strong>20% (2,0đ)</strong></div>
                <div>• Trắc nghiệm Mức 3: <strong className="text-emerald-700">0 câu (Cấm)</strong></div>
                <div>• Số phương án: <strong>{grade <= 3 ? '3 phương án' : '4 phương án'}</strong></div>
                <div>• Đơn vị: <strong>Trường TH Chí Cà</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review Generated Matrix & Questions */}
        {currentStep === 4 && generatedPaper && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bước 4: Xem và phê duyệt kết quả Ma trận & Câu hỏi tự động
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đã tự động tính toán tổng điểm, tỉ lệ mức độ và đánh số câu hỏi liên tục từ Câu 1
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Tổng: {generatedPaper.questions.length} câu • {generatedPaper.config.totalPoints} điểm
              </span>
            </div>

            {/* Quick Question List Preview */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto bg-slate-50/50">
              {generatedPaper.questions.map((q) => (
                <div key={q.id} className="p-3 text-xs flex items-start justify-between gap-3 bg-white">
                  <div>
                    <span className="font-bold text-slate-900">Câu {q.orderNumber} </span>
                    <span className="italic text-slate-600">({q.points} điểm): </span>
                    <span className="text-slate-800">{q.content}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {q.cognitiveLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                      {q.format === 'multiple_choice' ? 'TN' : q.format}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              ✓ Ma trận đề và Bảng đặc tả đã được đồng bộ 100% với danh sách câu hỏi.
            </div>
          </div>
        )}

        {/* STEP 5: Verification & Publish */}
        {currentStep === 5 && generatedPaper && (
          <div className="space-y-4 max-w-2xl text-center py-6 mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Đề kiểm tra đã hoàn thành thẩm định và sẵn sàng!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Hệ thống đã tạo đầy đủ Đề thi chuẩn A4, Ma trận phân bổ, Bảng đặc tả 1:1, Đáp án và Biểu điểm chi tiết.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 max-w-md mx-auto">
              <div>• <strong>Tên đề:</strong> {generatedPaper.title}</div>
              <div>• <strong>Trường:</strong> {generatedPaper.header.schoolName}</div>
              <div>• <strong>Kì thi:</strong> {generatedPaper.header.examPeriod} – {generatedPaper.header.schoolYear}</div>
              <div>• <strong>Thời gian:</strong> {generatedPaper.header.durationMinutes} phút</div>
              <div>• <strong>Điểm số:</strong> {generatedPaper.config.totalPoints} điểm ({generatedPaper.questions.length} câu)</div>
            </div>

            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mở bản xem trước A4 & Xuất Word (.docx)
            </button>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại
        </button>

        {currentStep < 5 && (
          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
          >
            {isGenerating ? (
              <span>Đang tính toán ma trận & sinh câu hỏi...</span>
            ) : currentStep === 3 ? (
              <span>Tạo đề tự động</span>
            ) : (
              <span>Tiếp theo</span>
            )}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
