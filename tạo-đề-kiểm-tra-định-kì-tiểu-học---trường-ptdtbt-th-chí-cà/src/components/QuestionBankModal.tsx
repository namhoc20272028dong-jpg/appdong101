import React, { useState } from 'react';
import { Question, Subject, GradeLevel, CognitiveLevel, QuestionFormat } from '../types/exam';
import { Database, Search, Filter, Plus, Trash2, Edit2, Check, ArrowRight, X } from 'lucide-react';
import { SUBJECT_LIST } from '../constants/curriculumData';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankQuestions: Question[];
  onAddQuestionToBank: (q: Question) => void;
  onDeleteQuestionFromBank: (id: string) => void;
  onInsertToExam?: (q: Question) => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  bankQuestions,
  onAddQuestionToBank,
  onDeleteQuestionFromBank,
  onInsertToExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CognitiveLevel | 'all'>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New question form state
  const [newSubject, setNewSubject] = useState<Subject>('Toán');
  const [newGrade, setNewGrade] = useState<GradeLevel>(1);
  const [newLevel, setNewLevel] = useState<CognitiveLevel>('Mức 1');
  const [newFormat, setNewFormat] = useState<QuestionFormat>('multiple_choice');
  const [newPoints, setNewPoints] = useState<number>(0.5);
  const [newContent, setNewContent] = useState('');
  const [newLearningObjective, setNewLearningObjective] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('Phương án A\nPhương án B\nPhương án C');
  const [newEssayGuide, setNewEssayGuide] = useState('');

  if (!isOpen) return null;

  const filtered = bankQuestions.filter((q) => {
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
    if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;
    if (selectedLevel !== 'all' && q.cognitiveLevel !== selectedLevel) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const contentMatch = q.content.toLowerCase().includes(term);
      const topicMatch = q.lessonTopic.toLowerCase().includes(term);
      const strandMatch = q.strand.toLowerCase().includes(term);
      return contentMatch || topicMatch || strandMatch;
    }
    return true;
  });

  const handleSaveNewQuestion = () => {
    if (!newContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const lines = newOptionsText.split('\n').filter((l) => l.trim().length > 0);
    const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const options = lines.map((line, idx) => ({
      key: keys[idx] || 'A',
      text: line.trim(),
      isCorrect: idx === 0, // default first correct
    }));

    const q: Question = {
      id: `qb-custom-${Date.now()}`,
      code: `CH-${Date.now().toString().slice(-4)}`,
      orderNumber: 1,
      subject: newSubject,
      grade: newGrade,
      semester: 'Cuối học kì I',
      strand: 'Kiến thức trọng tâm',
      lessonTopic: 'Chủ đề bổ sung',
      cognitiveLevel: newLevel,
      format: newFormat,
      points: Number(newPoints) || 0.5,
      content: newContent,
      options: newFormat === 'multiple_choice' ? options : undefined,
      essayGuide: newEssayGuide,
      learningObjective: newLearningObjective || 'Thực hiện yêu cầu cần đạt theo chương trình',
      source: 'Giáo viên tự biên soạn - Trường PTDTBT TH Chí Cà',
      createdAt: new Date().toISOString(),
    };

    onAddQuestionToBank(q);
    setIsAddingNew(false);
    setNewContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ngân hàng câu hỏi GDPT 2018</h2>
              <p className="text-xs text-blue-200">
                Kho câu hỏi được phân loại theo môn, khối lớp và 3 mức độ nhận thức
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

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo nội dung, bài học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">Tất cả môn học</option>
              {SUBJECT_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value={1}>Lớp 1</option>
              <option value={2}>Lớp 2</option>
              <option value={3}>Lớp 3</option>
              <option value={4}>Lớp 4</option>
              <option value={5}>Lớp 5</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="Mức 1">Mức 1 (Biết)</option>
              <option value="Mức 2">Mức 2 (Hiểu)</option>
              <option value="Mức 3">Mức 3 (Vận dụng)</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAddingNew ? 'Ẩn form thêm câu' : 'Thêm câu hỏi mới'}
          </button>
        </div>

        {/* Add Question Drawer Form */}
        {isAddingNew && (
          <div className="p-4 bg-indigo-50/70 border-b border-indigo-200 text-xs space-y-3">
            <div className="font-bold text-indigo-950 flex items-center justify-between">
              <span>Biên soạn câu hỏi mới vào ngân hàng</span>
              <span className="text-[11px] text-indigo-700 font-normal">
                Tuân thủ quy chuẩn số phương án theo khối lớp
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Môn học</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                >
                  {SUBJECT_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Khối lớp</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(Number(e.target.value) as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value={1}>Lớp 1 (3 phương án)</option>
                  <option value={2}>Lớp 2 (3 phương án)</option>
                  <option value={3}>Lớp 3 (3 phương án)</option>
                  <option value={4}>Lớp 4 (4 phương án)</option>
                  <option value={5}>Lớp 5 (4 phương án)</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Mức độ nhận thức</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="Mức 1">Mức 1 (Biết)</option>
                  <option value="Mức 2">Mức 2 (Hiểu)</option>
                  <option value="Mức 3">Mức 3 (Vận dụng - Chỉ tự luận)</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Hình thức</label>
                <select
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="multiple_choice">Nhiều lựa chọn</option>
                  <option value="true_false">Đúng - Sai</option>
                  <option value="matching">Nối cột</option>
                  <option value="fill_blank">Điền khuyết</option>
                  <option value="essay">Tự luận</option>
                  <option value="practice">Thực hành</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">Nội dung câu hỏi</label>
              <textarea
                rows={2}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
              />
            </div>

            {newFormat === 'multiple_choice' ? (
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Các phương án lựa chọn (Mỗi dòng 1 phương án, dòng đầu tiên là đáp án đúng):
                </label>
                <textarea
                  rows={3}
                  value={newOptionsText}
                  onChange={(e) => setNewOptionsText(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Hướng dẫn chấm / Đáp án tự luận:
                </label>
                <textarea
                  rows={2}
                  value={newEssayGuide}
                  onChange={(e) => setNewEssayGuide(e.target.value)}
                  placeholder="Nêu các bước giải và phân bổ điểm..."
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewQuestion}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
              >
                Lưu vào ngân hàng
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filtered.map((q) => (
              <div
                key={q.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {q.subject} Lớp {q.grade}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        q.cognitiveLevel === 'Mức 1'
                          ? 'bg-blue-100 text-blue-800'
                          : q.cognitiveLevel === 'Mức 2'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {q.cognitiveLevel}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {q.format === 'multiple_choice' ? 'Trắc nghiệm' : q.format} • {q.points} điểm
                    </span>
                  </div>

                  <p className="font-medium text-slate-800 leading-relaxed">{q.content}</p>

                  {q.format === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pl-2 border-l-2 border-slate-200">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className={opt.isCorrect ? 'text-emerald-700 font-bold' : ''}
                        >
                          {opt.key}. {opt.text} {opt.isCorrect && '✓'}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Chủ đề: {q.strand} – {q.lessonTopic}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {onInsertToExam && (
                    <button
                      onClick={() => onInsertToExam(q)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Chèn câu này vào đề thi đang mở"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm vào đề
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteQuestionFromBank(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Xóa câu hỏi này khỏi ngân hàng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>Tổng số câu hỏi trong ngân hàng: <strong className="text-slate-800">{bankQuestions.length}</strong></div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
