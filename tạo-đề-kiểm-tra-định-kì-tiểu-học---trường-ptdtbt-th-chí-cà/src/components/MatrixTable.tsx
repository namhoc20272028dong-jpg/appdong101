import React from 'react';
import { MatrixRow } from '../types/exam';
import { Table, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface MatrixTableProps {
  matrix: MatrixRow[];
  onSyncMatrix: () => void;
  grade: number;
  subject: string;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  matrix,
  onSyncMatrix,
  grade,
  subject,
}) => {
  // Totals calculations
  const totalL1Count = matrix.reduce((sum, r) => sum + r.level1TNCount + r.level1TLCount, 0);
  const totalL1Points = matrix.reduce((sum, r) => sum + r.level1TNPoints + r.level1TLPoints, 0);

  const totalL2Count = matrix.reduce((sum, r) => sum + r.level2TNCount + r.level2TLCount, 0);
  const totalL2Points = matrix.reduce((sum, r) => sum + r.level2TNPoints + r.level2TLPoints, 0);

  const totalL3Count = matrix.reduce((sum, r) => sum + r.level3TLCount, 0);
  const totalL3Points = matrix.reduce((sum, r) => sum + r.level3TLPoints, 0);

  const grandTotalQuestions = matrix.reduce((sum, r) => sum + r.totalQuestions, 0);
  const grandTotalPoints = matrix.reduce((sum, r) => sum + r.totalPoints, 0);

  const l1Percent = grandTotalPoints > 0 ? Math.round((totalL1Points / grandTotalPoints) * 100) : 0;
  const l2Percent = grandTotalPoints > 0 ? Math.round((totalL2Points / grandTotalPoints) * 100) : 0;
  const l3Percent = grandTotalPoints > 0 ? Math.round((totalL3Points / grandTotalPoints) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-600" />
            MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ – {subject.toUpperCase()} LỚP {grade}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ câu hỏi và điểm số theo 3 mức độ nhận thức quy chuẩn Thông tư 27 - GDPT 2018
          </p>
        </div>

        <button
          onClick={onSyncMatrix}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Đồng bộ ma trận từ đề kiểm tra
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/50 border-b border-slate-200">
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Mức 1 (Biết)</div>
          <div className="text-lg font-bold text-blue-700 mt-0.5">
            {totalL1Points.toFixed(1)} đ ({l1Percent}%)
          </div>
          <div className="text-[11px] text-slate-400">{totalL1Count} câu hỏi</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Mức 2 (Hiểu)</div>
          <div className="text-lg font-bold text-indigo-700 mt-0.5">
            {totalL2Points.toFixed(1)} đ ({l2Percent}%)
          </div>
          <div className="text-[11px] text-slate-400">{totalL2Count} câu hỏi</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Mức 3 (Vận dụng)</div>
          <div className="text-lg font-bold text-amber-700 mt-0.5">
            {totalL3Points.toFixed(1)} đ ({l3Percent}%)
          </div>
          <div className="text-[11px] text-slate-400">{totalL3Count} câu tự luận</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Tổng điểm toàn đề</div>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">
            {grandTotalPoints.toFixed(1)} / 10,0 đ
          </div>
          <div className="text-[11px] text-slate-400">Tổng: {grandTotalQuestions} câu</div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 border-collapse">
          <thead className="bg-slate-100 text-slate-800 font-semibold uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th rowSpan={2} className="p-2.5 border border-slate-300 text-center w-12">
                STT
              </th>
              <th rowSpan={2} className="p-2.5 border border-slate-300">
                Mạch kiến thức / Đơn vị nội dung
              </th>
              <th colSpan={2} className="p-2 border border-slate-300 text-center bg-blue-50/70 text-blue-900">
                Mức 1 (Biết)
              </th>
              <th colSpan={2} className="p-2 border border-slate-300 text-center bg-indigo-50/70 text-indigo-900">
                Mức 2 (Hiểu)
              </th>
              <th colSpan={2} className="p-2 border border-slate-300 text-center bg-amber-50/70 text-amber-900">
                Mức 3 (Vận dụng)
              </th>
              <th colSpan={2} className="p-2 border border-slate-300 text-center bg-slate-200/80 text-slate-900">
                Tổng cộng
              </th>
              <th rowSpan={2} className="p-2.5 border border-slate-300 text-center w-16">
                Tỉ lệ %
              </th>
            </tr>
            <tr>
              <th className="p-1.5 border border-slate-300 text-center bg-blue-50/50">TN</th>
              <th className="p-1.5 border border-slate-300 text-center bg-blue-50/50">TL</th>
              <th className="p-1.5 border border-slate-300 text-center bg-indigo-50/50">TN</th>
              <th className="p-1.5 border border-slate-300 text-center bg-indigo-50/50">TL</th>
              <th className="p-1.5 border border-slate-300 text-center bg-amber-50/50">TN (Cấm)</th>
              <th className="p-1.5 border border-slate-300 text-center bg-amber-50/50">TL</th>
              <th className="p-1.5 border border-slate-300 text-center font-bold">Số câu</th>
              <th className="p-1.5 border border-slate-300 text-center font-bold">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-slate-50 transition border-b border-slate-200">
                <td className="p-2 border border-slate-300 text-center font-medium">{idx + 1}</td>
                <td className="p-2 border border-slate-300">
                  <div className="font-semibold text-slate-900">{row.strand}</div>
                  <div className="text-[11px] text-slate-500">{row.unit}</div>
                </td>

                {/* Level 1 */}
                <td className="p-2 border border-slate-300 text-center">
                  {row.level1TNCount > 0 ? (
                    <span className="font-semibold text-blue-700">{row.level1TNCount} ({row.level1TNPoints}đ)</span>
                  ) : '-'}
                </td>
                <td className="p-2 border border-slate-300 text-center">
                  {row.level1TLCount > 0 ? (
                    <span className="font-semibold text-blue-700">{row.level1TLCount} ({row.level1TLPoints}đ)</span>
                  ) : '-'}
                </td>

                {/* Level 2 */}
                <td className="p-2 border border-slate-300 text-center">
                  {row.level2TNCount > 0 ? (
                    <span className="font-semibold text-indigo-700">{row.level2TNCount} ({row.level2TNPoints}đ)</span>
                  ) : '-'}
                </td>
                <td className="p-2 border border-slate-300 text-center">
                  {row.level2TLCount > 0 ? (
                    <span className="font-semibold text-indigo-700">{row.level2TLCount} ({row.level2TLPoints}đ)</span>
                  ) : '-'}
                </td>

                {/* Level 3 */}
                <td className="p-2 border border-slate-300 text-center text-slate-400 bg-slate-50">
                  0 (Không có)
                </td>
                <td className="p-2 border border-slate-300 text-center">
                  {row.level3TLCount > 0 ? (
                    <span className="font-bold text-amber-700">{row.level3TLCount} ({row.level3TLPoints}đ)</span>
                  ) : '-'}
                </td>

                {/* Totals */}
                <td className="p-2 border border-slate-300 text-center font-bold bg-slate-50/70">
                  {row.totalQuestions}
                </td>
                <td className="p-2 border border-slate-300 text-center font-bold text-emerald-700 bg-slate-50/70">
                  {row.totalPoints.toFixed(1)}đ
                </td>
                <td className="p-2 border border-slate-300 text-center font-semibold">
                  {row.percentage}%
                </td>
              </tr>
            ))}

            {/* Grand Total Row */}
            <tr className="bg-slate-200/90 font-bold text-slate-900 border-t-2 border-slate-400">
              <td colSpan={2} className="p-2.5 border border-slate-300 text-center uppercase tracking-wide">
                TỔNG CỘNG TOÀN ĐỀ
              </td>
              <td colSpan={2} className="p-2 border border-slate-300 text-center text-blue-900">
                {totalL1Points.toFixed(1)} điểm ({l1Percent}%)
              </td>
              <td colSpan={2} className="p-2 border border-slate-300 text-center text-indigo-900">
                {totalL2Points.toFixed(1)} điểm ({l2Percent}%)
              </td>
              <td colSpan={2} className="p-2 border border-slate-300 text-center text-amber-900">
                {totalL3Points.toFixed(1)} điểm ({l3Percent}%)
              </td>
              <td className="p-2 border border-slate-300 text-center">{grandTotalQuestions} câu</td>
              <td className="p-2 border border-slate-300 text-center text-emerald-800 text-sm">
                {grandTotalPoints.toFixed(1)} đ
              </td>
              <td className="p-2 border border-slate-300 text-center">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-amber-50/70 border-t border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Lưu ý nghiệp vụ:</strong> Tỉ lệ quy chuẩn GDPT 2018: Mức 1 (khoảng 50%), Mức 2 (khoảng 30%), Mức 3 (khoảng 20%). Không xây dựng câu hỏi trắc nghiệm ở Mức 3.
        </span>
      </div>
    </div>
  );
};
