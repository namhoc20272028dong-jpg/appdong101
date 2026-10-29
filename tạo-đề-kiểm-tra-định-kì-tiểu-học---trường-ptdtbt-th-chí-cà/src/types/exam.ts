export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type Subject = 
  | 'Toán'
  | 'Tiếng Việt'
  | 'Lịch sử và Địa lí'
  | 'Khoa học'
  | 'Tin học'
  | 'Công nghệ';

export type ExamType = 
  | 'Giữa học kì I'
  | 'Cuối học kì I'
  | 'Giữa học kì II'
  | 'Cuối học kì II (Cuối năm)';

export type CognitiveLevel = 'Mức 1' | 'Mức 2' | 'Mức 3';

export type QuestionFormat = 
  | 'multiple_choice' // Nhiều lựa chọn (3 options for G1-3, 4 options for G4-5)
  | 'true_false'       // Đúng - sai
  | 'matching'         // Nối cột
  | 'fill_blank'       // Điền khuyết
  | 'essay'            // Tự luận
  | 'practice';        // Thực hành (Tin học)

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect?: boolean;
}

export interface MatchingPair {
  left: string;
  right: string;
  leftId: string;
  rightId: string;
}

export interface TrueFalseItem {
  statement: string;
  isTrue: boolean;
}

export interface Question {
  id: string;
  code?: string;
  orderNumber: number; // Continuous 1..N
  subject: Subject;
  grade: GradeLevel;
  semester: ExamType;
  strand: string; // Mạch kiến thức / Chủ đề
  lessonTopic: string; // Tên bài học / Đơn vị kiến thức
  cognitiveLevel: CognitiveLevel;
  format: QuestionFormat;
  points: number;
  content: string; // Nội dung câu hỏi
  readingPassage?: string; // Đoạn văn bản đọc hiểu (cho Tiếng Việt)
  imageUrl?: string; // Hình minh họa
  hasGridBackground?: boolean; // Lưới ô vuông trong Toán
  options?: QuestionOption[]; // Dành cho nhiều lựa chọn
  trueFalseItems?: TrueFalseItem[]; // Dành cho đúng - sai
  matchingPairs?: MatchingPair[]; // Dành cho nối cột
  fillBlankTemplate?: string; // "Lan có [blank1] quả táo, cho bạn [blank2] quả..."
  fillBlankAnswers?: string[];
  essayGuide?: string; // Hướng dẫn chấm tự luận / các bước giải
  learningObjective: string; // Yêu cầu cần đạt
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatrixRow {
  id: string;
  strand: string; // Mạch kiến thức / Chủ đề
  unit: string;   // Nội dung, đơn vị kiến thức
  
  // Mức 1: Biết
  level1TNCount: number;
  level1TNPoints: number;
  level1TLCount: number;
  level1TLPoints: number;
  
  // Mức 2: Hiểu
  level2TNCount: number;
  level2TNPoints: number;
  level2TLCount: number;
  level2TLPoints: number;

  // Mức 3: Vận dụng (Chỉ tự luận!)
  level3TLCount: number;
  level3TLPoints: number;

  totalQuestions: number;
  totalPoints: number;
  percentage: number;
}

export interface SpecItem {
  id: string;
  questionOrder: number; // Vị trí trong đề
  strand: string;        // Mạch kiến thức
  unit: string;          // Nội dung kiến thức
  learningObjective: string; // Yêu cầu cần đạt
  cognitiveLevel: CognitiveLevel;
  format: QuestionFormat;
  questionCount: number;
  points: number;
}

export interface ExamHeaderInfo {
  governingBody: string; // UBND XÃ XÍN MẦN
  schoolName: string;    // TRƯỜNG PTDTBT TH CHÍ CÀ
  examTitle: string;     // ĐỀ KIỂM TRA ĐỊNH KÌ
  examPeriod: ExamType;
  schoolYear: string;    // 2026–2027
  subject: Subject;
  grade: GradeLevel;
  durationMinutes: number; // 40, 60...
  examCode?: string;     // Mã đề (101, 102...)
  note?: string;         // (Thời gian: ... phút, không kể thời gian giao đề)
  studentClassLabel?: string;
  studentNameLabel?: string;
}

export interface SchoolConfig {
  id: string;
  name: string;
  grade: GradeLevel;
  subject: Subject;
  totalPoints: number; // Default 10
  tnPoints: number;    // e.g., 6.0
  tlPoints: number;    // e.g., 4.0
  levelRatios: {
    level1: number; // 50%
    level2: number; // 30%
    level3: number; // 20%
  };
  strandRatios: { [strand: string]: number };
  optionsPerMC: 3 | 4; // 3 for 1-3, 4 for 4-5
  allowLevel3InMC: false; // Strictly false
  notes?: string;
}

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
  fixSuggestion?: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  header: ExamHeaderInfo;
  config: SchoolConfig;
  readingPassage?: {
    title: string;
    content: string;
    author?: string;
    wordCount?: number;
  };
  questions: Question[];
  matrix: MatrixRow[];
  specifications: SpecItem[];
  rubricNotes?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'audited' | 'approved';
  tags?: string[];
}
