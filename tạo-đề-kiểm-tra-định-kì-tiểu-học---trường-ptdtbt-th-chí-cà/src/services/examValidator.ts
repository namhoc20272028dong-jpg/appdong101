import { ExamPaper, ValidationError, Question } from '../types/exam';

export interface AuditReport {
  isValid: boolean;
  score: number; // 0 - 100
  errors: ValidationError[];
  warnings: ValidationError[];
  stats: {
    totalPoints: number;
    totalQuestions: number;
    tnPoints: number;
    tlPoints: number;
    level1Points: number;
    level2Points: number;
    level3Points: number;
    strandBreakdown: Record<string, { points: number; percent: number }>;
  };
}

export function validateExam(paper: ExamPaper): AuditReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const questions = paper.questions || [];
  const config = paper.config;
  const grade = paper.header.grade;

  let totalPoints = 0;
  let tnPoints = 0;
  let tlPoints = 0;
  let level1Points = 0;
  let level2Points = 0;
  let level3Points = 0;
  const strandPointsMap: Record<string, number> = {};

  // Check 1: Empty questions
  if (questions.length === 0) {
    errors.push({
      id: 'err-no-questions',
      type: 'error',
      message: 'Đề kiểm tra chưa có câu hỏi nào.',
      fixSuggestion: 'Vui lòng thêm câu hỏi từ ngân hàng hoặc tạo tự động.',
    });
  }

  // Check sequential order and individual question rules
  let lastOrder = 0;
  let hasEncounteredEssay = false;

  questions.forEach((q, idx) => {
    totalPoints += Number(q.points) || 0;

    // Track points
    if (q.format === 'essay' || q.format === 'practice') {
      tlPoints += Number(q.points) || 0;
      hasEncounteredEssay = true;
    } else {
      tnPoints += Number(q.points) || 0;
      if (hasEncounteredEssay) {
        warnings.push({
          id: `warn-order-tn-after-tl-${q.id}`,
          type: 'warning',
          message: `Câu ${q.orderNumber} là câu trắc nghiệm nhưng lại xếp sau phần tự luận.`,
          fixSuggestion: 'Sắp xếp lại: Đưa toàn bộ câu trắc nghiệm lên trước, tự luận về sau.',
        });
      }
    }

    if (q.cognitiveLevel === 'Mức 1') level1Points += Number(q.points) || 0;
    else if (q.cognitiveLevel === 'Mức 2') level2Points += Number(q.points) || 0;
    else if (q.cognitiveLevel === 'Mức 3') level3Points += Number(q.points) || 0;

    const strand = q.strand || 'Khác';
    strandPointsMap[strand] = (strandPointsMap[strand] || 0) + (Number(q.points) || 0);

    // Continuous numbering
    if (q.orderNumber !== idx + 1) {
      warnings.push({
        id: `warn-seq-${q.id}`,
        type: 'warning',
        message: `Thứ tự Câu ${q.orderNumber} không liên tục (vị trí thứ ${idx + 1}).`,
        fixSuggestion: 'Hệ thống có thể tự động đánh số lại từ Câu 1 đến hết.',
      });
    }

    // Check points > 0
    if (!q.points || q.points <= 0) {
      errors.push({
        id: `err-points-${q.id}`,
        type: 'error',
        message: `Câu ${q.orderNumber} chưa có điểm số hợp lệ (> 0).`,
        fixSuggestion: 'Gán điểm số cụ thể cho câu hỏi (ví dụ: 0,5 hoặc 1,0 điểm).',
      });
    }

    // CRITICAL: Level 3 in Multiple Choice is STRICTLY FORBIDDEN
    if (q.cognitiveLevel === 'Mức 3' && q.format !== 'essay' && q.format !== 'practice') {
      errors.push({
        id: `err-level3-mc-${q.id}`,
        type: 'error',
        message: `Câu ${q.orderNumber} là câu trắc nghiệm ở Mức 3 (Vận dụng) - Vi phạm quy chế GDPT 2018!`,
        fixSuggestion: 'Chuyển câu hỏi này sang hình thức Tự luận hoặc hạ mức độ nhận thức xuống Mức 2 (Hiểu).',
      });
    }

    // Check multiple choice options count by grade
    if (q.format === 'multiple_choice') {
      const options = q.options || [];
      if (grade <= 3) {
        if (options.length !== 3) {
          warnings.push({
            id: `warn-opt-count-${q.id}`,
            type: 'warning',
            message: `Lớp ${grade} quy định câu hỏi nhiều lựa chọn có 3 phương án (A, B, C). Câu ${q.orderNumber} hiện có ${options.length} phương án.`,
            fixSuggestion: 'Điều chỉnh số lượng phương án thành 3 (A, B, C).',
          });
        }
      } else {
        if (options.length !== 4) {
          warnings.push({
            id: `warn-opt-count-${q.id}`,
            type: 'warning',
            message: `Lớp ${grade} quy định câu hỏi nhiều lựa chọn có 4 phương án (A, B, C, D). Câu ${q.orderNumber} hiện có ${options.length} phương án.`,
            fixSuggestion: 'Bổ sung hoặc điều chỉnh số lượng phương án thành 4 (A, B, C, D).',
          });
        }
      }

      // Check has a correct option
      const hasCorrect = options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        errors.push({
          id: `err-no-answer-${q.id}`,
          type: 'error',
          message: `Câu ${q.orderNumber} chưa chọn đáp án đúng!`,
          fixSuggestion: 'Vào chỉnh sửa câu hỏi và tích chọn đáp án đúng cho một phương án.',
        });
      }
    }

    // Check fill-in-blank answers
    if (q.format === 'fill_blank' && (!q.fillBlankAnswers || q.fillBlankAnswers.length === 0)) {
      warnings.push({
        id: `warn-fill-ans-${q.id}`,
        type: 'warning',
        message: `Câu ${q.orderNumber} (Điền khuyết) chưa có từ/số cần điền trong đáp án.`,
        fixSuggestion: 'Nhập từ/số khóa cần điền vào hướng dẫn chấm.',
      });
    }

    // Check essay guide
    if ((q.format === 'essay' || q.format === 'practice') && (!q.essayGuide || q.essayGuide.trim() === '')) {
      warnings.push({
        id: `warn-essay-guide-${q.id}`,
        type: 'warning',
        message: `Câu ${q.orderNumber} (Tự luận) chưa có biểu điểm chi tiết / hướng dẫn chấm.`,
        fixSuggestion: 'Bổ sung hướng dẫn chấm từng bước để giáo viên chấm thi thống nhất.',
      });
    }
  });

  // Check total points
  const expectedTotal = config.totalPoints || 10;
  const roundedTotal = Math.round(totalPoints * 100) / 100;
  if (Math.abs(roundedTotal - expectedTotal) > 0.05) {
    errors.push({
      id: 'err-total-points',
      type: 'error',
      message: `Tổng điểm hiện tại của đề là ${roundedTotal} điểm (Quy định là ${expectedTotal} điểm). Chênh lệch: ${(roundedTotal - expectedTotal).toFixed(2)} điểm.`,
      fixSuggestion: 'Điều chỉnh lại điểm số của các câu hỏi để tổng đạt đúng 10,0 điểm.',
    });
  }

  // Check TN / TL points
  const expectedTN = config.tnPoints;
  const expectedTL = config.tlPoints;
  if (Math.abs(tnPoints - expectedTN) > 0.25) {
    warnings.push({
      id: 'warn-tn-points-ratio',
      type: 'warning',
      message: `Điểm phần Trắc nghiệm là ${tnPoints.toFixed(2)} điểm (Cấu hình chọn: ${expectedTN.toFixed(2)} điểm).`,
      fixSuggestion: `Cân đối lại câu hỏi trắc nghiệm để đạt ${expectedTN} điểm, hoặc điều chỉnh cấu hình trường.`,
    });
  }

  // Check cognitive level ratios (Mức 1 = 50%, Mức 2 = 30%, Mức 3 = 20%)
  if (totalPoints > 0) {
    const p1 = (level1Points / totalPoints) * 100;
    const p2 = (level2Points / totalPoints) * 100;
    const p3 = (level3Points / totalPoints) * 100;

    if (Math.abs(p1 - 50) > 15) {
      warnings.push({
        id: 'warn-level1-ratio',
        type: 'warning',
        message: `Tỉ lệ Mức 1 (Biết) đang là ${p1.toFixed(0)}% (Chuẩn hướng dẫn là 50%).`,
        fixSuggestion: 'Điều chỉnh số lượng hoặc điểm số câu Mức 1 để tiệm cận 50%.',
      });
    }
    if (Math.abs(p2 - 30) > 15) {
      warnings.push({
        id: 'warn-level2-ratio',
        type: 'warning',
        message: `Tỉ lệ Mức 2 (Hiểu) đang là ${p2.toFixed(0)}% (Chuẩn hướng dẫn là 30%).`,
        fixSuggestion: 'Điều chỉnh số lượng hoặc điểm số câu Mức 2 để tiệm cận 30%.',
      });
    }
    if (Math.abs(p3 - 20) > 15) {
      warnings.push({
        id: 'warn-level3-ratio',
        type: 'warning',
        message: `Tỉ lệ Mức 3 (Vận dụng) đang là ${p3.toFixed(0)}% (Chuẩn hướng dẫn là 20%).`,
        fixSuggestion: 'Điều chỉnh bài toán vận dụng Mức 3 để tiệm cận 20% (thường 2,0 điểm).',
      });
    }
  }

  // Check matrix and specification table consistency
  const specs = paper.specifications || [];
  if (specs.length !== questions.length) {
    warnings.push({
      id: 'warn-spec-sync',
      type: 'warning',
      message: `Bảng đặc tả có ${specs.length} mục, trong khi đề thi có ${questions.length} câu hỏi. Chưa đồng bộ hoàn toàn.`,
      fixSuggestion: 'Bấm nút "Tự động đồng bộ Bảng đặc tả từ Đề kiểm tra" để cập nhật chính xác 1:1.',
    });
  }

  // Calculate score (100 minus penalties)
  let score = 100;
  score -= errors.length * 25;
  score -= warnings.length * 5;
  if (score < 0) score = 0;

  const strandBreakdown: Record<string, { points: number; percent: number }> = {};
  for (const [sName, sPts] of Object.entries(strandPointsMap)) {
    strandBreakdown[sName] = {
      points: sPts,
      percent: totalPoints > 0 ? Math.round((sPts / totalPoints) * 100) : 0,
    };
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    stats: {
      totalPoints: roundedTotal,
      totalQuestions: questions.length,
      tnPoints,
      tlPoints,
      level1Points,
      level2Points,
      level3Points,
      strandBreakdown,
    },
  };
}

// Hàm sắp xếp câu hỏi tự động chuẩn theo Mục 5.1 của tài liệu:
// 1. Trắc nghiệm trước, Tự luận sau.
// 2. Trong Trắc nghiệm: Mức 1 trước, sau đó Mức 2.
// 3. Trong mỗi mức: Nhiều lựa chọn -> Đúng sai -> Nối cột -> Điền khuyết.
// 4. Tự luận: Mức 1 (Biết) -> Mức 2 (Hiểu) -> Mức 3 (Vận dụng).
export function autoSortQuestions(questions: Question[]): Question[] {
  const formatRankTN: Record<string, number> = {
    multiple_choice: 1,
    true_false: 2,
    matching: 3,
    fill_blank: 4,
  };

  const levelRank: Record<string, number> = {
    'Mức 1': 1,
    'Mức 2': 2,
    'Mức 3': 3,
  };

  const sorted = [...questions].sort((a, b) => {
    const isATn = a.format !== 'essay' && a.format !== 'practice';
    const isBTn = b.format !== 'essay' && b.format !== 'practice';

    // Trắc nghiệm xếp trước Tự luận
    if (isATn && !isBTn) return -1;
    if (!isATn && isBTn) return 1;

    if (isATn && isBTn) {
      // Cả hai là trắc nghiệm: Mức 1 trước, Mức 2 sau
      const lvlA = levelRank[a.cognitiveLevel] || 1;
      const lvlB = levelRank[b.cognitiveLevel] || 1;
      if (lvlA !== lvlB) return lvlA - lvlB;

      // Trong cùng mức độ: nhiều lựa chọn -> đúng sai -> nối cột -> điền khuyết
      const fmtA = formatRankTN[a.format] || 99;
      const fmtB = formatRankTN[b.format] || 99;
      return fmtA - fmtB;
    } else {
      // Cả hai là tự luận: Mức 1 -> Mức 2 -> Mức 3
      const lvlA = levelRank[a.cognitiveLevel] || 1;
      const lvlB = levelRank[b.cognitiveLevel] || 1;
      return lvlA - lvlB;
    }
  });

  // Đánh số câu liên tục từ Câu 1 đến hết đề
  return sorted.map((q, idx) => ({
    ...q,
    orderNumber: idx + 1,
  }));
}
