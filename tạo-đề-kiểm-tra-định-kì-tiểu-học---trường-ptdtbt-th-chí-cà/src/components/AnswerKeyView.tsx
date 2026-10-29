import React from 'react';
import { ExamPaper } from '../types/exam';
import { CheckSquare, Award, HelpCircle } from 'lucide-react';

interface AnswerKeyViewProps {
  exam: ExamPaper;
}

export const AnswerKeyView: React.FC<AnswerKeyViewProps> = ({ exam }) => {
  const questions = exam.questions || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM BÀI KIỂM TRA ĐỊNH KÌ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dành riêng cho cán bộ chấm thi – Trường PTDTBT TH Chí Cà (Năm học {exam.header.schoolYear})
          </p>
        </div>

        <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
          Tổng thang điểm: {exam.config.totalPoints || 10} điểm
        </div>
      </div>

      {/* Answer list */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Table of multiple choice answers for fast grading */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-3">
            1. Bảng tra nhanh đáp án trắc nghiệm
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {questions
              .filter((q) => q.format === 'multiple_choice')
              .map((q) => {
                const correct = q.options?.find((o) => o.isCorrect);
                return (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-300 rounded p-2 text-center shadow-xs"
                  >
                    <div className="text-[11px] font-semibold text-slate-500">Câu {q.orderNumber}</div>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">
                      {correct ? correct.key : '?'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">({q.points}đ)</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Detailed question by question breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-4">
            2. Hướng dẫn chấm và biểu điểm chi tiết từng câu
          </h3>

          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Câu {q.orderNumber}</span>
                    <span className="text-xs text-slate-500 italic">
                      ({q.points.toString().replace('.', ',')} điểm)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {q.cognitiveLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {q.strand} – {q.lessonTopic}
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                  <strong>Đề bài: </strong>
                  {q.content}
                </div>

                {/* Specific answer content by format */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  {q.format === 'multiple_choice' && (
                    <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                      <span className="font-bold">Đáp án đúng:</span>
                      {q.options?.find((o) => o.isCorrect) ? (
                        <span>
                          <strong>{q.options.find((o) => o.isCorrect)?.key}.</strong>{' '}
                          {q.options.find((o) => o.isCorrect)?.text}
                        </span>
                      ) : (
                        <span className="text-rose-600">Chưa chọn đáp án đúng!</span>
                      )}
                    </div>
                  )}

                  {q.format === 'true_false' && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="font-semibold text-slate-700 mb-1">Đáp án Đúng/Sai từng ý:</div>
                      {q.trueFalseItems?.map((tf, i) => (
                        <div key={i} className="flex justify-between items-center text-slate-700">
                          <span>
                            {String.fromCharCode(97 + i)}) {tf.statement}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              tf.isTrue ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tf.isTrue ? 'Đúng (Đ)' : 'Sai (S)'}
                          </span>
                        </div>
                      ))}
                      <div className="text-[11px] text-slate-500 mt-1 italic">
                        * Mỗi ý đúng được {(q.points / (q.trueFalseItems?.length || 4)).toFixed(2)} điểm.
                      </div>
                    </div>
                  )}

                  {q.format === 'matching' && (
                    <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 space-y-1">
                      <div className="font-semibold text-indigo-900 mb-1">Phương án ghép nối đúng:</div>
                      {q.matchingPairs?.map((pair, pIdx) => (
                        <div key={pIdx} className="text-slate-800">
                          • <strong>Cột A:</strong> {pair.left} ➔ <strong>Nối với Cột B:</strong> {pair.right}
                        </div>
                      ))}
                      <div className="text-[11px] text-slate-500 mt-1 italic">
                        * Nối đúng mỗi cặp được {(q.points / (q.matchingPairs?.length || 4)).toFixed(2)} điểm.
                      </div>
                    </div>
                  )}

                  {q.format === 'fill_blank' && (
                    <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 space-y-1">
                      <div className="font-semibold text-amber-900 mb-1">Từ hoặc số cần điền:</div>
                      <div className="text-slate-800 font-bold">
                        {q.fillBlankAnswers?.join(' ; ') || 'Theo đáp án chuẩn'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        * Chấp nhận các cách diễn đạt tương đương hoặc cách viết số đúng bản chất.
                      </div>
                    </div>
                  )}

                  {(q.format === 'essay' || q.format === 'practice') && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="font-semibold text-slate-900 flex items-center justify-between">
                        <span>Biểu điểm và hướng dẫn chấm:</span>
                        <span className="text-[11px] text-indigo-700 font-normal">
                          {q.format === 'practice' ? 'Tiêu chí thực hành máy tính' : 'Tự luận tự do'}
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200 font-sans">
                        {q.essayGuide || 'Chấm điểm linh hoạt dựa trên yêu cầu cần đạt của bài học. Khuyến khích cách giải sáng tạo.'}
                      </p>
                      <div className="text-[11px] text-slate-500 italic">
                        * Lưu ý: Học sinh làm cách khác nếu đúng và lập luận chặt chẽ vẫn cho điểm tối đa theo từng phần.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
