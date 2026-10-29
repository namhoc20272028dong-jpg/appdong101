import React, { useState } from 'react';
import { ExamPaper, Question } from '../../types/exam';
import { Printer, Download, Eye, Edit3, CheckCircle, RefreshCw, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';

interface A4ExamViewProps {
  exam: ExamPaper;
  onUpdateExam: (updated: ExamPaper) => void;
  onOpenExport: () => void;
  onOpenAudit: () => void;
}

export const A4ExamView: React.FC<A4ExamViewProps> = ({
  exam,
  onUpdateExam,
  onOpenExport,
  onOpenAudit,
}) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isEditingHeader, setIsEditingHeader] = useState<boolean>(false);

  // Editable header state
  const [headerState, setHeaderState] = useState(exam.header);

  const handleSaveHeader = () => {
    onUpdateExam({
      ...exam,
      header: headerState,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingHeader(false);
  };

  const handleQuestionChange = (qIndex: number, updatedFields: Partial<Question>) => {
    const newQuestions = [...exam.questions];
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      ...updatedFields,
    };
    onUpdateExam({
      ...exam,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-10 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chế độ xem:</span>
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('student')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'student'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Bản học sinh (Đề thi in)
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'teacher'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              Bản giáo viên (Kèm đáp án)
            </button>
          </div>

          <button
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              isEditingHeader
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingHeader ? 'Đang sửa đầu đề' : 'Sửa đầu đề'}
          </button>
        </div>

        {/* Zoom & Action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 hover:text-blue-600 cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-medium">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1 hover:text-blue-600 cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            In đề ngay (A4)
          </button>

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Tải tệp Word (.docx)
          </button>
        </div>
      </div>

      {/* Editable Header Drawer */}
      {isEditingHeader && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl shadow-sm text-sm print:hidden">
          <div className="font-bold text-amber-900 mb-3 flex items-center justify-between">
            <span>Chỉnh sửa thông tin hành chính đầu đề</span>
            <span className="text-xs font-normal text-amber-700">Mẫu chuẩn theo quy định văn bản trường học</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cơ quan chủ quản</label>
              <input
                type="text"
                value={headerState.governingBody}
                onChange={(e) => setHeaderState({ ...headerState, governingBody: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên trường</label>
              <input
                type="text"
                value={headerState.schoolName}
                onChange={(e) => setHeaderState({ ...headerState, schoolName: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kì kiểm tra</label>
              <input
                type="text"
                value={headerState.examPeriod}
                onChange={(e) => setHeaderState({ ...headerState, examPeriod: e.target.value as any })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Năm học</label>
              <input
                type="text"
                value={headerState.schoolYear}
                onChange={(e) => setHeaderState({ ...headerState, schoolYear: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian làm bài (phút)</label>
              <input
                type="number"
                value={headerState.durationMinutes}
                onChange={(e) => setHeaderState({ ...headerState, durationMinutes: Number(e.target.value) || 40 })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã đề (nếu có)</label>
              <input
                type="text"
                value={headerState.examCode || ''}
                onChange={(e) => setHeaderState({ ...headerState, examCode: e.target.value })}
                placeholder="VD: 101, 102 hoặc ĐỀ CHÍNH THỨC"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsEditingHeader(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveHeader}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* A4 Paper Canvas Container */}
      <div className="flex justify-center overflow-x-auto p-2 sm:p-6 bg-slate-200/70 rounded-2xl">
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] text-slate-900 border border-slate-300 font-serif leading-relaxed text-[13.5pt] print:m-0 print:p-0 print:border-none print:shadow-none print:w-full"
        >
          {/* Header 2 columns */}
          <div className="flex justify-between items-start border-b pb-4 mb-4 text-center">
            <div className="w-[45%] text-center">
              <p className="text-[12pt] uppercase tracking-wide font-normal">
                {exam.header.governingBody || 'UBND XÃ XÍN MẦN'}
              </p>
              <p className="text-[12pt] uppercase tracking-wide font-bold">
                {exam.header.schoolName || 'TRƯỜNG PTDTBT TH CHÍ CÀ'}
              </p>
              <div className="w-24 h-0.5 bg-slate-800 mx-auto mt-1 mb-2"></div>
            </div>

            <div className="w-[55%] text-center">
              <p className="text-[12.5pt] uppercase font-bold tracking-wide">
                {exam.header.examTitle || 'ĐỀ KIỂM TRA ĐỊNH KÌ'} {exam.header.examPeriod?.toUpperCase() || 'CUỐI HỌC KÌ I'}
              </p>
              <p className="text-[12pt] font-bold">
                NĂM HỌC {exam.header.schoolYear || '2026–2027'}
              </p>
              <p className="text-[11pt] italic text-slate-700">
                {exam.header.examCode ? `Mã đề: ${exam.header.examCode}` : 'ĐỀ CHÍNH THỨC'}
              </p>
            </div>
          </div>

          {/* Exam Title & Timing */}
          <div className="text-center my-3">
            <h2 className="text-[15pt] font-bold uppercase tracking-wide text-slate-950">
              MÔN: {exam.header.subject.toUpperCase()} – LỚP {exam.header.grade}
            </h2>
            <p className="text-[12pt] italic text-slate-700 mt-0.5">
              (Thời gian làm bài: {exam.header.durationMinutes || 40} phút, không kể thời gian giao đề)
            </p>
          </div>

          {/* Student Info Box & Score Box */}
          <div className="border border-slate-700 my-4 flex">
            <div className="w-[68%] p-3 border-r border-slate-700 space-y-2 text-[12pt]">
              <p>Họ và tên học sinh: ............................................................................</p>
              <p>Lớp: {exam.header.grade}..... Trường: PTDTBT TH Chí Cà</p>
            </div>
            <div className="w-[32%] text-center flex flex-col justify-center bg-slate-50/60 p-2">
              <div className="text-[11pt] font-bold uppercase">Điểm số</div>
              <div className="text-[16pt] font-bold text-slate-800 mt-1">
                ........ / 10
              </div>
            </div>
          </div>

          {/* Reading Passage (if Tiếng Việt) */}
          {exam.readingPassage && exam.readingPassage.content && (
            <div className="my-5 p-4 bg-slate-50 border border-slate-300 rounded-md">
              <div className="text-center font-bold text-[13.5pt] uppercase tracking-wide mb-2">
                {exam.readingPassage.title || 'BÀI ĐỌC HIỂU'}
              </div>
              <p className="text-[13pt] text-justify leading-relaxed indent-8">
                {exam.readingPassage.content}
              </p>
              {exam.readingPassage.author && (
                <p className="text-right italic text-[12pt] mt-2">
                  (Theo {exam.readingPassage.author})
                </p>
              )}
            </div>
          )}

          {/* Questions Section */}
          <div className="mt-6 space-y-5">
            {exam.questions.map((q, idx) => (
              <div key={q.id || idx} className="group relative">
                {/* Question line:
                    Số câu viết ĐẬM
                    Điểm số viết NGHIÊNG, KHÔNG ĐẬM
                    Nội dung câu viết thường
                */}
                <div className="text-[13pt] leading-relaxed">
                  <span className="font-bold text-slate-950">Câu {q.orderNumber} </span>
                  <span className="italic font-normal text-slate-800">
                    ({q.points.toString().replace('.', ',')} điểm):{' '}
                  </span>
                  <span>{q.content}</span>

                  {/* Level & Format Badge (visible in teacher mode) */}
                  {viewMode === 'teacher' && (
                    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded text-[10pt] font-sans font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {q.cognitiveLevel} • {q.format === 'multiple_choice' ? 'Trắc nghiệm' : q.format}
                    </span>
                  )}
                </div>

                {/* Multiple Choice Options (Indented 1cm) */}
                {q.format === 'multiple_choice' && q.options && (
                  <div className="ml-[10mm] mt-2 space-y-1.5 text-[13pt]">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`flex items-start gap-2 ${
                          viewMode === 'teacher' && opt.isCorrect
                            ? 'text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300'
                            : ''
                        }`}
                      >
                        <span className="font-bold min-w-[24px]">{opt.key}.</span>
                        <span>{opt.text}</span>
                        {viewMode === 'teacher' && opt.isCorrect && (
                          <span className="text-xs font-sans text-emerald-600 ml-1">✓ (Đáp án đúng)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* True/False Items */}
                {q.format === 'true_false' && q.trueFalseItems && (
                  <div className="ml-[10mm] mt-2 space-y-1 text-[12.5pt]">
                    {q.trueFalseItems.map((tf, tfIdx) => (
                      <div key={tfIdx} className="flex items-center justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span>
                          {String.fromCharCode(97 + tfIdx)}) {tf.statement}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="border border-slate-500 w-12 text-center text-xs py-0.5">
                            {viewMode === 'teacher' ? (tf.isTrue ? 'Đ' : 'S') : '[   ]'}
                          </span>
                          {viewMode === 'teacher' && (
                            <span className="text-[10pt] font-sans text-indigo-600">
                              ({tf.isTrue ? 'Đúng' : 'Sai'})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Matching Pairs */}
                {q.format === 'matching' && q.matchingPairs && (
                  <div className="ml-[10mm] mt-2 text-[12.5pt]">
                    <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded bg-slate-50/50">
                      <div>
                        <div className="font-bold text-center border-b pb-1 mb-2">CỘT A</div>
                        {q.matchingPairs.map((p, pIdx) => (
                          <div key={pIdx} className="py-1">
                            {pIdx + 1}. {p.left}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="font-bold text-center border-b pb-1 mb-2">CỘT B</div>
                        {q.matchingPairs.map((p, pIdx) => (
                          <div key={pIdx} className="py-1">
                            {String.fromCharCode(97 + pIdx)}. {p.right}
                          </div>
                        ))}
                      </div>
                    </div>
                    {viewMode === 'teacher' && (
                      <div className="mt-2 text-xs font-sans text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                        <strong>Đáp án nối đúng: </strong>
                        {q.matchingPairs.map((p, i) => `${i + 1} nối với ${String.fromCharCode(97 + i)}`).join('; ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Fill Blank */}
                {q.format === 'fill_blank' && q.fillBlankTemplate && (
                  <div className="ml-[10mm] mt-2 italic text-[13pt] bg-slate-50/70 p-2 border border-slate-200 rounded">
                    {q.fillBlankTemplate}
                    {viewMode === 'teacher' && q.fillBlankAnswers && (
                      <div className="mt-1 text-xs font-sans not-italic text-emerald-700">
                        <strong>Đáp án cần điền: </strong>
                        {q.fillBlankAnswers.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Essay / Practice Writing Lines or Rubric */}
                {(q.format === 'essay' || q.format === 'practice') && (
                  <div className="mt-2">
                    {viewMode === 'teacher' ? (
                      <div className="ml-[5mm] p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-sans text-slate-800">
                        <div className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                          <span>Hướng dẫn chấm & Biểu điểm chi tiết ({q.points}đ):</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{q.essayGuide || 'Chấm theo thang điểm và yêu cầu cần đạt nêu trong chương trình.'}</p>
                      </div>
                    ) : (
                      <div className="ml-[5mm] space-y-2 mt-2">
                        <p className="italic text-[11.5pt] text-slate-600">Bài làm:</p>
                        <div className="border-b border-dotted border-slate-400 h-6"></div>
                        <div className="border-b border-dotted border-slate-400 h-6"></div>
                        <div className="border-b border-dotted border-slate-400 h-6"></div>
                        <div className="border-b border-dotted border-slate-400 h-6"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Exam End Footer */}
          <div className="mt-12 text-center text-slate-700 border-t pt-4">
            <p className="font-bold text-[12pt] tracking-widest">---------------- HẾT ----------------</p>
            <p className="italic text-[10.5pt] mt-1">(Cán bộ coi kiểm tra không giải thích gì thêm)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
