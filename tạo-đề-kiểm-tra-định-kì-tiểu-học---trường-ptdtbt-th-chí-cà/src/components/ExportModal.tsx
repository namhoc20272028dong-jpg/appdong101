import React, { useState } from 'react';
import { ExamPaper } from '../types/exam';
import { exportExamToDocx } from '../services/wordExportService';
import { Download, FileText, Printer, CheckCircle, X, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exam,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = async (
    type: 'exam_only' | 'answers_only' | 'matrix_only' | 'specs_only' | 'full_dossier'
  ) => {
    try {
      setIsExporting(true);
      setDownloadSuccess(null);

      const options = {
        includeExam: type === 'exam_only' || type === 'full_dossier',
        includeAnswers: type === 'answers_only' || type === 'full_dossier',
        includeMatrix: type === 'matrix_only' || type === 'full_dossier',
        includeSpecs: type === 'specs_only' || type === 'full_dossier',
      };

      const blob = await exportExamToDocx(exam, options);
      const safeSubject = exam.header.subject.replace(/\s+/g, '_');
      const safeGrade = exam.header.grade;
      const typeLabel =
        type === 'exam_only'
          ? 'De_Kiem_Tra'
          : type === 'answers_only'
          ? 'Dap_An_Huong_Dan_Cham'
          : type === 'matrix_only'
          ? 'Ma_Tran_De'
          : type === 'specs_only'
          ? 'Bang_Dac_Ta'
          : 'Bo_Ho_So_Kiem_Tra_Day_Du';

      const filename = `${typeLabel}_${safeSubject}_Lop${safeGrade}_ChiCa.docx`;
      triggerDownload(blob, filename);

      setDownloadSuccess(`Đã tạo và tải xuống thành công tệp: ${filename}`);
    } catch (err) {
      console.error('Lỗi xuất tệp Word:', err);
      alert('Có lỗi xảy ra khi tạo tệp Word (.docx). Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Xuất tài liệu Word & In ấn A4</h2>
              <p className="text-xs text-blue-200">
                Định dạng chuẩn văn bản hành chính trường học (Times New Roman, A4)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          <div>
            <span className="font-bold text-slate-800 block mb-2">
              1. Tải tệp Microsoft Word (.docx):
            </span>
            <div className="space-y-2">
              <button
                disabled={isExporting}
                onClick={() => handleExportDocx('full_dossier')}
                className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-semibold border border-indigo-200 rounded-xl flex items-center justify-between transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div className="text-left">
                    <div>Trọn bộ hồ sơ kiểm tra đầy đủ (Khuyên dùng)</div>
                    <div className="text-[11px] font-normal text-indigo-700">
                      Bao gồm: Đề thi + Đáp án biểu điểm + Ma trận + Bảng đặc tả
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-md font-bold">
                  Tải .docx
                </span>
              </button>

              <button
                disabled={isExporting}
                onClick={() => handleExportDocx('exam_only')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Chỉ xuất bản Đề kiểm tra (Dành cho học sinh làm bài)</span>
                </div>
                <span className="text-[11px] text-slate-600 underline">Tải .docx</span>
              </button>

              <button
                disabled={isExporting}
                onClick={() => handleExportDocx('answers_only')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Chỉ xuất Đáp án & Hướng dẫn chấm chi tiết</span>
                </div>
                <span className="text-[11px] text-slate-600 underline">Tải .docx</span>
              </button>

              <button
                disabled={isExporting}
                onClick={() => handleExportDocx('matrix_only')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Chỉ xuất Ma trận đề kiểm tra (Bảng thống kê mức độ)</span>
                </div>
                <span className="text-[11px] text-slate-600 underline">Tải .docx</span>
              </button>

              <button
                disabled={isExporting}
                onClick={() => handleExportDocx('specs_only')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Chỉ xuất Bảng đặc tả câu hỏi đề kiểm tra</span>
                </div>
                <span className="text-[11px] text-slate-600 underline">Tải .docx</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 block mb-2">2. In trực tiếp / Xuất PDF:</span>
            <button
              onClick={handlePrint}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Mở hộp thoại In ấn / Lưu thành tệp PDF
            </button>
          </div>

          {isExporting && (
            <div className="flex items-center justify-center gap-2 text-indigo-700 font-medium py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang biên dịch tài liệu Microsoft Word...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
