import { Question, MatrixRow, SpecItem } from '../types/exam';

export function generateMatrixFromQuestions(questions: Question[]): MatrixRow[] {
  const groups: Record<string, {
    strand: string;
    unit: string;
    level1TNCount: number;
    level1TNPoints: number;
    level1TLCount: number;
    level1TLPoints: number;
    level2TNCount: number;
    level2TNPoints: number;
    level2TLCount: number;
    level2TLPoints: number;
    level3TLCount: number;
    level3TLPoints: number;
    totalQuestions: number;
    totalPoints: number;
  }> = {};

  let overallPoints = 0;

  for (const q of questions) {
    const strand = q.strand || 'Mạch kiến thức chung';
    const unit = q.lessonTopic || 'Nội dung trọng tâm';
    const key = `${strand}___${unit}`;
    const pts = Number(q.points) || 0;
    overallPoints += pts;

    if (!groups[key]) {
      groups[key] = {
        strand,
        unit,
        level1TNCount: 0,
        level1TNPoints: 0,
        level1TLCount: 0,
        level1TLPoints: 0,
        level2TNCount: 0,
        level2TNPoints: 0,
        level2TLCount: 0,
        level2TLPoints: 0,
        level3TLCount: 0,
        level3TLPoints: 0,
        totalQuestions: 0,
        totalPoints: 0,
      };
    }

    const item = groups[key];
    item.totalQuestions += 1;
    item.totalPoints += pts;

    const isTN = q.format !== 'essay' && q.format !== 'practice';

    if (q.cognitiveLevel === 'Mức 1') {
      if (isTN) {
        item.level1TNCount += 1;
        item.level1TNPoints += pts;
      } else {
        item.level1TLCount += 1;
        item.level1TLPoints += pts;
      }
    } else if (q.cognitiveLevel === 'Mức 2') {
      if (isTN) {
        item.level2TNCount += 1;
        item.level2TNPoints += pts;
      } else {
        item.level2TLCount += 1;
        item.level2TLPoints += pts;
      }
    } else if (q.cognitiveLevel === 'Mức 3') {
      // Mức 3 chỉ tự luận
      item.level3TLCount += 1;
      item.level3TLPoints += pts;
    }
  }

  const rows: MatrixRow[] = Object.keys(groups).map((k, index) => {
    const val = groups[k];
    const percentage = overallPoints > 0 ? Math.round((val.totalPoints / overallPoints) * 100) : 0;
    return {
      id: `matrix-row-${index + 1}`,
      strand: val.strand,
      unit: val.unit,
      level1TNCount: val.level1TNCount,
      level1TNPoints: val.level1TNPoints,
      level1TLCount: val.level1TLCount,
      level1TLPoints: val.level1TLPoints,
      level2TNCount: val.level2TNCount,
      level2TNPoints: val.level2TNPoints,
      level2TLCount: val.level2TLCount,
      level2TLPoints: val.level2TLPoints,
      level3TLCount: val.level3TLCount,
      level3TLPoints: val.level3TLPoints,
      totalQuestions: val.totalQuestions,
      totalPoints: val.totalPoints,
      percentage,
    };
  });

  return rows;
}

export function generateSpecsFromQuestions(questions: Question[]): SpecItem[] {
  return questions.map((q) => ({
    id: `spec-${q.id || q.orderNumber}`,
    questionOrder: q.orderNumber,
    strand: q.strand || 'Chung',
    unit: q.lessonTopic || 'Nội dung kiến thức',
    learningObjective: q.learningObjective || 'Thực hiện được yêu cầu cần đạt theo chương trình GDPT 2018',
    cognitiveLevel: q.cognitiveLevel,
    format: q.format,
    questionCount: 1,
    points: q.points,
  }));
}
