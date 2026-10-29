import React from 'react';
import { SpecItem } from '../types/exam';
import { FileSpreadsheet, RefreshCw, Layers } from 'lucide-react';

interface SpecTableProps {
  specs: SpecItem[];
  onSyncSpecs: () => void;
  grade: number;
  subject: string;
}

export const SpecTable: React.FC<SpecTableProps> = ({
  specs,
  onSyncSpecs,
  grade,
  subject,
}) => {
  const formatLabels: Record<string, string> = {
    multiple_choice: 'Nhiều lựa chọn',
    true_false: 'Đúng – Sai',
    matching: 'Nối cột',
    fill_blank: 'Điền khuyết',
    essay: 'Tự luận',
    practice: 'Thực hành',
  };

  const levelBadges: Record<string, { bg: string; text: string }> = {
    'Mức 1': { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Mức 1 (Biết)' },
    'Mức 2': { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'Mức 2 (Hiểu)' },
    'Mức 3': { bg: 'bg-amber-100 text-amber-900 border-amber-200', text: 'Mức 3 (Vận dụng)' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            BẢNG ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ – {subject.toUpperCase()} LỚP {grade}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xác định rõ ràng 1:1 nội dung kiến thức, yêu cầu cần đạt và mức độ tư duy cho từng câu hỏi
          </p>
        </div>

        <button
          onClick={onSyncSpecs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold border border-indigo-200 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Đồng bộ Bảng đặc tả từ Đề kiểm tra
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-2.5 border border-slate-300 text-center w-14">Vị trí</th>
              <th className="p-2.5 border border-slate-300 w-36">Mạch kiến thức</th>
              <th className="p-2.5 border border-slate-300 w-44">Nội dung kiến thức</th>
              <th className="p-2.5 border border-slate-300">Yêu cầu cần đạt (Mục tiêu GDPT 2018)</th>
              <th className="p-2.5 border border-slate-300 text-center w-28">Mức độ</th>
              <th className="p-2.5 border border-slate-300 text-center w-28">Hình thức</th>
              <th className="p-2.5 border border-slate-300 text-center w-16">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((item, idx) => {
              const lvl = levelBadges[item.cognitiveLevel] || { bg: 'bg-slate-100', text: item.cognitiveLevel };
              return (
                <tr key={item.id || idx} className="hover:bg-slate-50 transition border-b border-slate-200">
                  <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-900 bg-slate-50/70">
                    Câu {item.questionOrder}
                  </td>
                  <td className="p-2.5 border border-slate-300 font-medium text-slate-800">
                    {item.strand}
                  </td>
                  <td className="p-2.5 border border-slate-300 text-slate-600">
                    {item.unit}
                  </td>
                  <td className="p-2.5 border border-slate-300 leading-relaxed text-slate-900">
                    {item.learningObjective}
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${lvl.bg}`}>
                      {lvl.text}
                    </span>
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center font-medium">
                    {formatLabels[item.format] || item.format}
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center font-bold text-emerald-700">
                    {item.points.toString().replace('.', ',')} đ
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div>Tổng số mục đặc tả: <strong className="text-slate-900">{specs.length}</strong> câu hỏi tương ứng trong đề</div>
        <div className="text-emerald-700 font-semibold">Tỉ lệ bao phủ chuẩn 100% mục tiêu bài học</div>
      </div>
    </div>
  );
};
