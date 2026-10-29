import React, { useState } from 'react';
import { ExamPaper, GradeLevel, Subject } from '../types/exam';
import { createExamVariant } from '../services/examGenerator';
import {
  FileText,
  Copy,
  Shuffle,
  Trash2,
  Download,
  Eye,
  Calendar,
  Layers,
  Search,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import { exportExamToDocx } from '../services/wordExportService';
import { SUBJECT_LIST } from '../constants/curriculumData';

interface SavedExamsListProps {
  exams: ExamPaper[];
  currentExamId: string | null;
  onSelectExam: (exam: ExamPaper) => void;
  onDuplicateExam: (exam: ExamPaper) => void;
  onAddExamVariant: (newVariant: ExamPaper) => void;
  onDeleteExam: (id: string) => void;
  onNewExamClick: () => void;
}

export const SavedExamsList: React.FC<SavedExamsListProps> = ({
  exams,
  currentExamId,
  onSelectExam,
  onDuplicateExam,
  onAddExamVariant,
  onDeleteExam,
  onNewExamClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');

  const filtered = exams.filter((e) => {
    if (filterSubject !== 'all' && e.header.subject !== filterSubject) return false;
    if (filterGrade !== 'all' && e.header.grade !== filterGrade) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const titleMatch = e.title.toLowerCase().includes(term);
      const schoolMatch = e.header.schoolName.toLowerCase().includes(term);
      return titleMatch || schoolMatch;
    }
    return true;
  });

  const handleQuickDownloadDocx = async (exam: ExamPaper, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await exportExamToDocx(exam, {
        includeExam: true,
        includeAnswers: true,
        includeMatrix: true,
        includeSpecs: true,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `De_Kiem_Tra_${exam.header.subject}_Lop${exam.header.grade}_ChiCa.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải tệp!');
    }
  };

  const handleCreateVariant = (exam: ExamPaper, e: React.MouseEvent) => {
    e.stopPropagation();
    const codes = ['102', '103', '104', '201', '202'];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    const variant = createExamVariant(exam, randomCode);
    onAddExamVariant(variant);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đề, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value as any)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          >
            <option value="all">Tất cả môn học</option>
            {SUBJECT_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value={1}>Lớp 1</option>
            <option value={2}>Lớp 2</option>
            <option value={3}>Lớp 3</option>
            <option value={4}>Lớp 4</option>
            <option value={5}>Lớp 5</option>
          </select>
        </div>

        <button
          onClick={onNewExamClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Tạo đề kiểm tra mới
        </button>
      </div>

      {/* Grid of Saved Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((exam) => {
          const isSelected = exam.id === currentExamId;
          return (
            <div
              key={exam.id}
              onClick={() => onSelectExam(exam)}
              className={`p-4 rounded-xl border transition cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-400/20'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded border border-blue-200">
                    {exam.header.subject} – Lớp {exam.header.grade}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Mã đề: {exam.header.examCode || '101'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {exam.header.schoolName} • {exam.header.examPeriod}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    Số câu: <strong>{exam.questions.length} câu</strong>
                  </div>
                  <div>
                    Tổng điểm: <strong>{exam.config.totalPoints} đ</strong>
                  </div>
                  <div>
                    Thời gian: <strong>{exam.header.durationMinutes} phút</strong>
                  </div>
                  <div>
                    Năm học: <strong>{exam.header.schoolYear}</strong>
                  </div>
                </div>
              </div>

              {/* Tags & Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleQuickDownloadDocx(exam, e)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                    title="Tải nhanh hồ sơ Word (.docx)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleCreateVariant(exam, e)}
                    className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition"
                    title="Tạo mã đề tương đương (Xáo trộn trắc nghiệm)"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateExam(exam);
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                    title="Sao chép đề kiểm tra này"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Đang chọn
                    </span>
                  )}
                  {exams.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xóa đề "${exam.title}"?`)) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                      title="Xóa đề"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900">
        📌 <strong>Dữ liệu mẫu kiểm thử GDPT 2018:</strong> Hệ thống đã cài đặt sẵn các bộ đề mẫu minh họa chuẩn cho Toán 1, Toán 4, Tiếng Việt 3 và Tin học 4 theo chương trình thực tế tại trường PTDTBT TH Chí Cà. Dữ liệu này phục vụ khảo sát chuyên môn và kiểm tra hành chính.
      </div>
    </div>
  );
};
