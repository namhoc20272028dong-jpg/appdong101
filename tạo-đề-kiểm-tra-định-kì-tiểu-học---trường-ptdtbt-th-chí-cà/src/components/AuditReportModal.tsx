import React from 'react';
import { AuditReport, autoSortQuestions } from '../services/examValidator';
import { ExamPaper } from '../types/exam';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Wrench, X } from 'lucide-react';
import { generateMatrixFromQuestions, generateSpecsFromQuestions } from '../services/matrixSpecGenerator';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper;
  report: AuditReport;
  onApplyFix: (fixedExam: ExamPaper) => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  exam,
  report,
  onApplyFix,
}) => {
  if (!isOpen) return null;

  const handleAutoFix = () => {
    let questions = [...exam.questions];

    // 1. Sort questions strictly by GDPT 2018 guidelines (TN first: L1 -> L2, then TL: L1 -> L2 -> L3)
    questions = autoSortQuestions(questions);

    // 2. Fix MC Level 3: Convert to Essay or drop to Level 2
    questions = questions.map((q) => {
      if (q.cognitiveLevel === 'Mức 3' && q.format !== 'essay' && q.format !== 'practice') {
        return {
          ...q,
          cognitiveLevel: 'Mức 2' as const,
        };
      }
      return q;
    });

    // 3. Balance points to exact 10.0
    const currentSum = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const target = exam.config.totalPoints || 10;
    if (Math.abs(currentSum - target) > 0.01 && questions.length > 0) {
      const diff = target - currentSum;
      const lastQ = questions[questions.length - 1];
      lastQ.points = Math.round((lastQ.points + diff) * 100) / 100;
    }

    // 4. Regenerate matrix and specifications
    const newMatrix = generateMatrixFromQuestions(questions);
    const newSpecs = generateSpecsFromQuestions(questions);

    onApplyFix({
      ...exam,
      questions,
      matrix: newMatrix,
      specifications: newSpecs,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                report.errors.length === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Báo cáo kiểm định quy chuẩn đề kiểm tra
              </h2>
              <p className="text-xs text-slate-300">
                Thẩm định tự động theo Thông tư 27 - Chương trình GDPT 2018
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Score Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Chỉ số tuân thủ quy chế:</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-2xl font-black ${
                  report.score >= 90
                    ? 'text-emerald-600'
                    : report.score >= 70
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {report.score}/100
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {report.isValid ? '✓ Đủ điều kiện ban hành' : '✕ Cần sửa lỗi bắt buộc'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAutoFix}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-indigo-200" />
            Tự động sửa lỗi & Sắp xếp chuẩn
          </button>
        </div>

        {/* Issues List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Critical Errors */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase text-rose-800 tracking-wider">
                Lỗi bắt buộc sửa ({report.errors.length})
              </h3>
            </div>

            {report.errors.length === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Không có lỗi nghiêm trọng nào. Đề thi đạt chuẩn quy định!</span>
              </div>
            ) : (
              <div className="space-y-2">
                {report.errors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="font-semibold text-rose-900">{err.message}</div>
                    {err.fixSuggestion && (
                      <div className="text-rose-700 font-medium">
                        💡 <strong>Cách xử lí:</strong> {err.fixSuggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase text-amber-800 tracking-wider">
                Cảnh báo khuyến nghị ({report.warnings.length})
              </h3>
            </div>

            {report.warnings.length === 0 ? (
              <div className="p-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs">
                Không có cảnh báo nào. Các tỉ lệ đều nằm trong khoảng lý tưởng.
              </div>
            ) : (
              <div className="space-y-2">
                {report.warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="font-semibold text-amber-900">{warn.message}</div>
                    {warn.fixSuggestion && (
                      <div className="text-amber-800">
                        💡 <em>Gợi ý:</em> {warn.fixSuggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Stats */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 mb-2">Thông số cấu trúc đề hiện tại:</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>• Tổng số câu: <strong className="text-slate-800">{report.stats.totalQuestions} câu</strong></div>
              <div>• Tổng điểm: <strong className="text-slate-800">{report.stats.totalPoints} / 10,0 đ</strong></div>
              <div>• Trắc nghiệm: <strong className="text-slate-800">{report.stats.tnPoints.toFixed(1)} đ</strong></div>
              <div>• Tự luận: <strong className="text-slate-800">{report.stats.tlPoints.toFixed(1)} đ</strong></div>
              <div>• Mức 1 (Biết): <strong className="text-slate-800">{report.stats.level1Points.toFixed(1)} đ</strong></div>
              <div>• Mức 2 (Hiểu): <strong className="text-slate-800">{report.stats.level2Points.toFixed(1)} đ</strong></div>
              <div>• Mức 3 (Vận dụng): <strong className="text-slate-800">{report.stats.level3Points.toFixed(1)} đ</strong></div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            Đóng lại
          </button>
          <button
            onClick={handleAutoFix}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
          >
            Áp dụng chuẩn hóa ngay
          </button>
        </div>
      </div>
    </div>
  );
};
