import React, { useState } from 'react';
import { Subject, GradeLevel, SchoolConfig } from '../types/exam';
import { SUBJECT_LIST } from '../constants/curriculumData';
import { Sliders, Shield, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

interface ConfigManagerProps {
  currentConfig: SchoolConfig;
  onUpdateConfig: (newConfig: SchoolConfig) => void;
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({
  currentConfig,
  onUpdateConfig,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(currentConfig.subject);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(currentConfig.grade);
  const [tnPoints, setTnPoints] = useState<number>(currentConfig.tnPoints);
  const [tlPoints, setTlPoints] = useState<number>(currentConfig.tlPoints);
  const [l1Percent, setL1Percent] = useState<number>(currentConfig.levelRatios.level1);
  const [l2Percent, setL2Percent] = useState<number>(currentConfig.levelRatios.level2);
  const [l3Percent, setL3Percent] = useState<number>(currentConfig.levelRatios.level3);
  const [isSaved, setIsSaved] = useState(false);

  const handleApplyPreset = (type: '60_40' | '70_30' | '50_50') => {
    if (type === '60_40') {
      setTnPoints(6.0);
      setTlPoints(4.0);
    } else if (type === '70_30') {
      setTnPoints(7.0);
      setTlPoints(3.0);
    } else if (type === '50_50') {
      setTnPoints(5.0);
      setTlPoints(5.0);
    }
  };

  const handleSave = () => {
    const updated: SchoolConfig = {
      ...currentConfig,
      subject: selectedSubject,
      grade: selectedGrade,
      tnPoints,
      tlPoints,
      levelRatios: {
        level1: l1Percent,
        level2: l2Percent,
        level3: l3Percent,
      },
      optionsPerMC: selectedGrade <= 3 ? 3 : 4,
    };
    onUpdateConfig(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            QUẢN LÝ CẤU HÌNH KHẢO THÍ CHUYÊN MÔN
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập tỉ lệ điểm, mức độ nhận thức và cấu trúc đề thi Trường PTDTBT TH Chí Cà
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Đã lưu cấu hình khảo thí thành công!
          </div>
        )}
      </div>

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Preset Selector */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Chọn nhanh cấu hình trường học
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleApplyPreset('60_40')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                tnPoints === 6.0 && tlPoints === 4.0
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Chuẩn 60% – 40%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Trắc nghiệm 6,0đ / Tự luận 4,0đ</div>
              <div className="text-[10px] text-blue-700 font-semibold mt-1">Khuyên dùng Lớp 1, 2, 3, 4</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('70_30')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                tnPoints === 7.0 && tlPoints === 3.0
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Phương án 70% – 30%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Trắc nghiệm 7,0đ / Tự luận 3,0đ</div>
              <div className="text-[10px] text-slate-600 font-semibold mt-1">Khảo sát kiến thức diện rộng</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('50_50')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                tnPoints === 5.0 && tlPoints === 5.0
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Phương án 50% – 50%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Trắc nghiệm 5,0đ / Tự luận 5,0đ</div>
              <div className="text-[10px] text-indigo-700 font-semibold mt-1">Chuẩn Lớp 5 & Tin học</div>
            </button>
          </div>
        </div>

        {/* Detailed Points & Levels Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Phân bổ điểm số (Tổng = 10,0đ)
            </h3>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Điểm Trắc nghiệm:</label>
              <input
                type="number"
                step="0.5"
                value={tnPoints}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTnPoints(val);
                  setTlPoints(Math.max(0, 10 - val));
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Điểm Tự luận / Thực hành:</label>
              <input
                type="number"
                step="0.5"
                value={tlPoints}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTlPoints(val);
                  setTnPoints(Math.max(0, 10 - val));
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Tỉ lệ Mức độ nhận thức (Chuẩn 50% - 30% - 20%)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Mức 1 (Biết) %:</label>
                <input
                  type="number"
                  value={l1Percent}
                  onChange={(e) => setL1Percent(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Mức 2 (Hiểu) %:</label>
                <input
                  type="number"
                  value={l2Percent}
                  onChange={(e) => setL2Percent(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Mức 3 (Vận dụng) %:</label>
                <input
                  type="number"
                  value={l3Percent}
                  onChange={(e) => setL3Percent(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-[11px] text-blue-900">
              Tổng tỉ lệ: {l1Percent + l2Percent + l3Percent}%{' '}
              {l1Percent + l2Percent + l3Percent === 100 ? '✓ Hợp lệ' : '✕ Phải đúng 100%'}
            </div>
          </div>
        </div>

        {/* Special Rules Reminder */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Các quy tắc bắt buộc của hệ thống:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Tuyệt đối không tạo câu trắc nghiệm ở Mức 3 (Vận dụng).</strong> Mức 3 chỉ dành cho câu hỏi tự luận hoặc thực hành.</li>
            <li>Lớp 1, 2, 3: Câu hỏi nhiều lựa chọn luôn có <strong>3 phương án (A, B, C)</strong>.</li>
            <li>Lớp 4, 5: Câu hỏi nhiều lựa chọn luôn có <strong>4 phương án (A, B, C, D)</strong>.</li>
            <li>Đánh số liên tục từ Câu 1 đến hết đề, không chèn tiêu đề "Trắc nghiệm" / "Tự luận" ở đề Toán.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition cursor-pointer"
          >
            Lưu và áp dụng cấu hình này
          </button>
        </div>
      </div>
    </div>
  );
};
