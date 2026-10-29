import {
  ExamPaper,
  GradeLevel,
  Subject,
  ExamType,
  Question,
  QuestionOption,
} from '../types/exam';
import { getDefaultConfig, CURRICULUM_DATA, DEFAULT_HEADER } from '../constants/curriculumData';
import { generateMatrixFromQuestions, generateSpecsFromQuestions } from './matrixSpecGenerator';
import { INITIAL_QUESTION_BANK } from '../constants/initialQuestionBank';
import { autoSortQuestions } from './examValidator';

export interface ExamGenerationParams {
  subject: Subject;
  grade: GradeLevel;
  semester: ExamType;
  schoolYear: string;
  governingBody: string;
  schoolName: string;
  durationMinutes: number;
  totalPoints: number;
  selectedStrands: string[];
  configPreset: 'standard' | 'school_custom_60_40' | 'school_custom_70_30' | 'school_grade5_50_50';
  teacherNote?: string;
  sourceDocText?: string;
}

export function generateExamPaper(params: ExamGenerationParams): ExamPaper {
  const config = getDefaultConfig(params.subject, params.grade, params.semester);

  // Apply custom preset if selected
  if (params.configPreset === 'school_custom_70_30') {
    config.tnPoints = 7.0;
    config.tlPoints = 3.0;
  } else if (params.configPreset === 'school_grade5_50_50' || (params.grade === 5 && params.subject === 'Toán')) {
    config.tnPoints = 5.0;
    config.tlPoints = 5.0;
  }

  // Find curriculum topics for this subject & grade
  const topics = CURRICULUM_DATA[params.subject]?.[params.grade] || [];
  const relevantTopics = topics.filter(t => 
    params.selectedStrands.length === 0 || params.selectedStrands.includes(t.strand)
  );

  // Pick suitable questions from bank or generate dynamically
  let chosenQuestions: Question[] = [];

  // Match from question bank
  const bankMatches = INITIAL_QUESTION_BANK.filter(
    q => q.subject === params.subject && q.grade === params.grade
  );

  if (bankMatches.length >= 8) {
    chosenQuestions = [...bankMatches];
  } else {
    // Generate questions according to GDPT 2018 matrix specifications
    chosenQuestions = synthesizeStandardQuestions(params, config);
  }

  // Ensure options count matches grade (3 for G1-3, 4 for G4-5)
  chosenQuestions = chosenQuestions.map(q => {
    if (q.format === 'multiple_choice' && q.options) {
      if (params.grade <= 3 && q.options.length > 3) {
        return { ...q, options: q.options.slice(0, 3) };
      } else if (params.grade >= 4 && q.options.length < 4) {
        const extraKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
        const existingKeys = q.options.map(o => o.key);
        const missingKey = extraKeys.find(k => !existingKeys.includes(k)) || 'D';
        return {
          ...q,
          options: [
            ...q.options,
            { key: missingKey, text: 'Phương án mở rộng phù hợp' }
          ]
        };
      }
    }
    return q;
  });

  // Strict auto-sort: Trắc nghiệm (Mức 1 -> Mức 2, Multiple choice -> True/False -> Matching -> Fill-blank) -> Tự luận (Mức 1 -> 2 -> 3)
  chosenQuestions = autoSortQuestions(chosenQuestions);

  // Balance points to exact 10.0 points
  chosenQuestions = balancePoints(chosenQuestions, config.totalPoints);

  const matrix = generateMatrixFromQuestions(chosenQuestions);
  const specifications = generateSpecsFromQuestions(chosenQuestions);

  const newId = `exam-${Date.now()}`;
  return {
    id: newId,
    title: `ĐỀ KIỂM TRA ĐỊNH KÌ ${params.semester.toUpperCase()} - MÔN ${params.subject.toUpperCase()} LỚP ${params.grade}`,
    header: {
      governingBody: params.governingBody || DEFAULT_HEADER.governingBody,
      schoolName: params.schoolName || DEFAULT_HEADER.schoolName,
      examTitle: DEFAULT_HEADER.examTitle,
      examPeriod: params.semester,
      schoolYear: params.schoolYear || DEFAULT_HEADER.schoolYear,
      subject: params.subject,
      grade: params.grade,
      durationMinutes: params.durationMinutes || (params.subject === 'Toán' ? 40 : 50),
      examCode: '101',
      note: params.teacherNote,
    },
    config,
    questions: chosenQuestions,
    matrix,
    specifications,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    tags: ['Tạo mới', `${params.subject} Lớp ${params.grade}`, params.semester],
  };
}

function synthesizeStandardQuestions(params: ExamGenerationParams, config: any): Question[] {
  const result: Question[] = [];
  const isLower = params.grade <= 3;
  const optCount = isLower ? 3 : 4;

  const topics = CURRICULUM_DATA[params.subject]?.[params.grade] || [
    { strand: 'Kiến thức trọng tâm', units: [{ name: 'Nội dung cốt lõi', learningObjectives: ['Nắm vững kiến thức'] }] }
  ];

  const mainStrand = topics[0]?.strand || 'Số và phép tính';
  const subStrand = topics[1]?.strand || 'Hình học và đo lường';

  // 1. Mức 1: Multiple choice 1 (0.5đ or 1.0đ)
  result.push({
    id: `syn-${Date.now()}-1`,
    orderNumber: 1,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: mainStrand,
    lessonTopic: topics[0]?.units[0]?.name || 'Kiến thức cơ bản',
    cognitiveLevel: 'Mức 1',
    format: 'multiple_choice',
    points: 1.0,
    content: params.subject === 'Toán'
      ? (params.grade === 1 ? 'Số gồm 1 chục và 5 đơn vị viết là:' : `Kết quả của phép tính cơ bản trong chương trình Toán ${params.grade}:`)
      : `Khái niệm hoặc kiến thức cơ bản trong bài học ${params.subject} lớp ${params.grade}:`,
    options: isLower
      ? [
          { key: 'A', text: '15', isCorrect: true },
          { key: 'B', text: '51' },
          { key: 'C', text: '10' },
        ]
      : [
          { key: 'A', text: 'Phương án thứ nhất', isCorrect: true },
          { key: 'B', text: 'Phương án thứ hai' },
          { key: 'C', text: 'Phương án thứ ba' },
          { key: 'D', text: 'Phương án thứ tư' },
        ],
    learningObjective: 'Nhận biết kiến thức cốt lõi mức 1',
  });

  // 2. Mức 1: Multiple choice 2
  result.push({
    id: `syn-${Date.now()}-2`,
    orderNumber: 2,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: subStrand,
    lessonTopic: topics[1]?.units[0]?.name || 'Nội dung hình học / đo lường',
    cognitiveLevel: 'Mức 1',
    format: 'multiple_choice',
    points: 1.0,
    content: params.subject === 'Toán'
      ? `Đơn vị đo hoặc hình học cơ bản theo yêu cầu cần đạt lớp ${params.grade}:`
      : `Đặc điểm nhận biết đúng trong chương trình ${params.subject} lớp ${params.grade}:`,
    options: isLower
      ? [
          { key: 'A', text: 'Đáp án sai' },
          { key: 'B', text: 'Đáp án đúng theo chuẩn kiến thức', isCorrect: true },
          { key: 'C', text: 'Đáp án chưa chính xác' },
        ]
      : [
          { key: 'A', text: 'Lựa chọn A' },
          { key: 'B', text: 'Lựa chọn B (Chính xác)', isCorrect: true },
          { key: 'C', text: 'Lựa chọn C' },
          { key: 'D', text: 'Lựa chọn D' },
        ],
    learningObjective: 'Nhận biết đơn vị đo và hình dạng hình học',
  });

  // 3. Mức 1: True / False
  result.push({
    id: `syn-${Date.now()}-3`,
    orderNumber: 3,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: mainStrand,
    lessonTopic: 'Quy tắc và tính chất',
    cognitiveLevel: 'Mức 1',
    format: 'true_false',
    points: 1.0,
    content: 'Đánh dấu Đ vào ý đúng, S vào ý sai trong các nhận định sau:',
    trueFalseItems: [
      { statement: 'Nhận định 1 đúng với quy tắc đã học trong sách giáo khoa', isTrue: true },
      { statement: 'Nhận định 2 áp dụng sai quy tắc tính toán hoặc khái niệm', isTrue: false },
      { statement: 'Nhận định 3 thể hiện đúng mối quan hệ giữa các đơn vị', isTrue: true },
      { statement: 'Nhận định 4 đảo ngược bản chất của sự việc', isTrue: false },
    ],
    learningObjective: 'Phân biệt đúng sai các nhận định kiến thức đã học',
  });

  // 4. Mức 1: Matching (Nối cột)
  result.push({
    id: `syn-${Date.now()}-4`,
    orderNumber: 4,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: mainStrand,
    lessonTopic: 'Ghép nối tương ứng',
    cognitiveLevel: 'Mức 1',
    format: 'matching',
    points: 1.0,
    content: 'Nối nội dung ở Cột A với nội dung thích hợp ở Cột B:',
    matchingPairs: [
      { leftId: '1', left: 'Ý nghĩa 1', rightId: 'a', right: 'Khái niệm tương ứng 1' },
      { leftId: '2', left: 'Ý nghĩa 2', rightId: 'b', right: 'Khái niệm tương ứng 2' },
      { leftId: '3', left: 'Ý nghĩa 3', rightId: 'c', right: 'Khái niệm tương ứng 3' },
      { leftId: '4', left: 'Ý nghĩa 4', rightId: 'd', right: 'Khái niệm tương ứng 4' },
    ],
    learningObjective: 'Nối các cặp dữ liệu tương ứng',
  });

  // 5. Mức 2: Multiple choice (Hiểu)
  result.push({
    id: `syn-${Date.now()}-5`,
    orderNumber: 5,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: mainStrand,
    lessonTopic: 'Phân tích và tính toán',
    cognitiveLevel: 'Mức 2',
    format: 'multiple_choice',
    points: 1.0,
    content: `Bài tập yêu cầu hiểu bản chất và thực hiện thao tác so sánh hoặc suy luận (${params.subject} ${params.grade}):`,
    options: isLower
      ? [
          { key: 'A', text: 'Kết quả suy luận A' },
          { key: 'B', text: 'Kết quả suy luận B (Chính xác)', isCorrect: true },
          { key: 'C', text: 'Kết quả suy luận C' },
        ]
      : [
          { key: 'A', text: 'Phương án A' },
          { key: 'B', text: 'Phương án B' },
          { key: 'C', text: 'Phương án C (Chính xác)', isCorrect: true },
          { key: 'D', text: 'Phương án D' },
        ],
    learningObjective: 'Hiểu bản chất và vận dụng tính chất đã học',
  });

  // 6. Mức 2: Fill-in-the-blank
  result.push({
    id: `syn-${Date.now()}-6`,
    orderNumber: 6,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: subStrand,
    lessonTopic: 'Điền số liệu hoặc từ ngữ thích hợp',
    cognitiveLevel: 'Mức 2',
    format: 'fill_blank',
    points: 1.0,
    content: 'Điền từ ngữ hoặc số thích hợp vào chỗ trống:',
    fillBlankTemplate: 'Quy tắc thực hiện: Bước đầu tiên là [  chuẩn bị  ], bước tiếp theo là [  thực hiện  ].',
    fillBlankAnswers: ['chuẩn bị', 'thực hiện'],
    learningObjective: 'Điền thuật ngữ hoặc số liệu chính xác',
  });

  // 7. Mức 1: Tự luận (Biết)
  result.push({
    id: `syn-${Date.now()}-7`,
    orderNumber: 7,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: mainStrand,
    lessonTopic: 'Thực hiện thao tác tính toán trực tiếp',
    cognitiveLevel: 'Mức 1',
    format: 'essay',
    points: 1.0,
    content: params.subject === 'Toán'
      ? 'Đặt tính rồi tính các phép tính đã học trong học kì.'
      : 'Nêu lại định nghĩa hoặc ghi nhớ trọng tâm của bài học.',
    essayGuide: 'Thực hiện đúng mỗi ý được 0,5 điểm. Trình bày sạch đẹp.',
    learningObjective: 'Trình bày lời giải hoặc câu trả lời theo khuôn mẫu',
  });

  // 8. Mức 2: Tự luận (Hiểu)
  result.push({
    id: `syn-${Date.now()}-8`,
    orderNumber: 8,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: subStrand,
    lessonTopic: 'Giải quyết bài toán 1-2 bước tính',
    cognitiveLevel: 'Mức 2',
    format: 'essay',
    points: 1.0,
    content: 'Bài toán yêu cầu thực hiện hai bước tính hoặc giải thích nguyên nhân của hiện tượng.',
    essayGuide: 'Bước 1: Tính đúng đại lượng trung gian (0,5đ). Bước 2: Tính đúng kết quả cuối cùng (0,5đ).',
    learningObjective: 'Giải quyết nhiệm vụ đòi hỏi hiểu mối quan hệ giữa các thành phần',
  });

  // 9. Mức 3: Tự luận Vận dụng (1.0đ)
  result.push({
    id: `syn-${Date.now()}-9`,
    orderNumber: 9,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: mainStrand,
    lessonTopic: 'Bài toán vận dụng thực tế địa phương',
    cognitiveLevel: 'Mức 3',
    format: 'essay',
    points: 1.0,
    content: `Vận dụng thực tế: Tại xã Chí Cà, bà con triển khai mô hình sản xuất nông nghiệp mới. Em hãy giải quyết bài toán tính toán năng suất hoặc kế hoạch thu hoạch phù hợp.`,
    essayGuide: 'Lập luận chặt chẽ (0,5đ). Phép tính và đáp số chính xác (0,5đ).',
    learningObjective: 'Vận dụng kiến thức giải quyết tình huống thực tiễn địa phương',
  });

  // 10. Mức 3: Tự luận Vận dụng nâng cao (1.0đ)
  result.push({
    id: `syn-${Date.now()}-10`,
    orderNumber: 10,
    subject: params.subject,
    grade: params.grade,
    semester: params.semester,
    strand: subStrand,
    lessonTopic: 'Vận dụng linh hoạt kiến thức',
    cognitiveLevel: 'Mức 3',
    format: 'essay',
    points: 1.0,
    content: 'Tìm giá trị hoặc giải bài toán có kết hợp giữa hình học, đo lường và tính toán thực tế.',
    essayGuide: 'Nêu cách làm sáng tạo (0,5đ). Tính toán ra kết quả đúng (0,5đ).',
    learningObjective: 'Vận dụng tổng hợp các kiến thức đã học',
  });

  return result;
}

function balancePoints(questions: Question[], targetTotal: number): Question[] {
  let currentTotal = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
  if (Math.abs(currentTotal - targetTotal) < 0.01) return questions;

  const diff = targetTotal - currentTotal;
  // Adjust essay questions first (Mức 3 or Mức 2 essay)
  const essayQuestions = questions.filter(q => q.format === 'essay' || q.format === 'practice');
  if (essayQuestions.length > 0) {
    const lastEssay = essayQuestions[essayQuestions.length - 1];
    lastEssay.points = Math.round((lastEssay.points + diff) * 100) / 100;
  }
  return questions;
}

// Hàm xáo trộn câu hỏi tạo mã đề tương đương (Mã 102, 103, 104)
export function createExamVariant(baseExam: ExamPaper, newCode: string): ExamPaper {
  const tnQuestions = baseExam.questions.filter(q => q.format !== 'essay' && q.format !== 'practice');
  const tlQuestions = baseExam.questions.filter(q => q.format === 'essay' || q.format === 'practice');

  // Shuffle options inside TN questions
  const shuffledTN = tnQuestions.map(q => {
    if (q.format === 'multiple_choice' && q.options) {
      const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
      // Re-assign keys A, B, C, D
      const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      const reKeyed = shuffledOpts.map((opt, idx) => ({
        ...opt,
        key: keys[idx],
      }));
      return { ...q, options: reKeyed };
    }
    return q;
  });

  // Re-combine and auto sort
  const reOrdered = autoSortQuestions([...shuffledTN, ...tlQuestions]);
  const newMatrix = generateMatrixFromQuestions(reOrdered);
  const newSpecs = generateSpecsFromQuestions(reOrdered);

  return {
    ...baseExam,
    id: `exam-${Date.now()}-${newCode}`,
    title: `${baseExam.title} (MÃ ĐỀ: ${newCode})`,
    header: {
      ...baseExam.header,
      examCode: newCode,
    },
    questions: reOrdered,
    matrix: newMatrix,
    specifications: newSpecs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    tags: [...(baseExam.tags || []), `Mã đề ${newCode}`],
  };
}
