import React from 'react';
import { School, Award, FileText, CheckCircle2 } from 'lucide-react';
import { ExamPaper } from '../types/exam';

interface HeaderProps {
  currentExam: ExamPaper | null;
  onOpenAudit: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentExam, onOpenAudit, onOpenExport }) => {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center shadow-inner text-amber-300">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
                  UBND XÃ XÍN MẦN
                </span>
                <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> GDPT 2018 Tiểu học
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                APP TẠO ĐỀ KIỂM TRA ĐỊNH KÌ – TRƯỜNG PTDTBT TH CHÍ CÀ
              </h1>
              <p className="text-xs text-slate-300">
                Hệ thống chuẩn hóa Ma trận, Bảng đặc tả, Ngân hàng câu hỏi Lớp 1–5 & Xuất Word/PDF A4
              </p>
            </div>
          </div>

          {/* Quick Actions & Current Exam Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentExam && (
              <div className="bg-blue-950/70 border border-blue-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200">
                <div className="text-[11px] text-blue-300">Đề đang làm việc:</div>
                <div className="font-semibold text-white truncate max-w-[220px]">
                  {currentExam.header.subject} Lớp {currentExam.header.grade} ({currentExam.header.examPeriod})
                </div>
              </div>
            )}

            <button
              onClick={onOpenAudit}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs shadow transition active:scale-95 cursor-pointer"
              title="Kiểm tra tính hợp lệ của đề"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Kiểm định quy chuẩn</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow transition active:scale-95 cursor-pointer"
              title="Xuất tệp Word (.docx) và in ấn"
            >
              <FileText className="w-4 h-4 text-slate-900" />
              <span>Xuất Word & In A4</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
