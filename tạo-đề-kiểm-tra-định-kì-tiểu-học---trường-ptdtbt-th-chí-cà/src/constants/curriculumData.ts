import { GradeLevel, Subject, ExamType, SchoolConfig } from '../types/exam';

export interface CurriculumTopic {
  strand: string;
  units: {
    name: string;
    learningObjectives: string[];
  }[];
}

export const SUBJECT_LIST: Subject[] = [
  'Toán',
  'Tiếng Việt',
  'Lịch sử và Địa lí',
  'Khoa học',
  'Tin học',
  'Công nghệ',
];

export const EXAM_PERIODS: ExamType[] = [
  'Giữa học kì I',
  'Cuối học kì I',
  'Giữa học kì II',
  'Cuối học kì II (Cuối năm)',
];

export const DEFAULT_HEADER = {
  governingBody: 'UBND XÃ XÍN MẦN',
  schoolName: 'TRƯỜNG PTDTBT TH CHÍ CÀ',
  examTitle: 'ĐỀ KIỂM TRA ĐỊNH KÌ',
  schoolYear: '2026–2027',
  examCode: 'ĐỀ CHÍNH THỨC',
};

// Cấu hình tỷ lệ chuẩn theo khối lớp & môn học
export function getDefaultConfig(subject: Subject, grade: GradeLevel, semester: ExamType): SchoolConfig {
  const isLowerGrade = grade <= 3;
  const optionsCount: 3 | 4 = isLowerGrade ? 3 : 4;

  let tnPoints = 6.0;
  let tlPoints = 4.0;
  let strandRatios: { [key: string]: number } = {};

  if (subject === 'Toán') {
    if (grade === 1) {
      strandRatios = { 'Số và phép tính': 80, 'Hình học và đo lường': 20 };
    } else if (grade === 2 || grade === 3) {
      if (semester === 'Giữa học kì I' || semester === 'Cuối học kì I') {
        strandRatios = { 'Số và phép tính': 70, 'Hình học và đo lường': 30 };
      } else {
        strandRatios = { 'Số và phép tính': 70, 'Hình học và đo lường': 20, 'Một số yếu tố thống kê và xác suất': 10 };
      }
    } else if (grade === 4) {
      if (semester === 'Cuối học kì I') {
        strandRatios = { 'Số và phép tính': 50, 'Hình học và đo lường': 50 };
      } else if (semester === 'Cuối học kì II (Cuối năm)') {
        strandRatios = { 'Số và phép tính': 70, 'Hình học và đo lường': 20, 'Một số yếu tố thống kê và xác suất': 10 };
      } else {
        strandRatios = { 'Số và phép tính': 70, 'Hình học và đo lường': 30 };
      }
    } else if (grade === 5) {
      tnPoints = 5.0;
      tlPoints = 5.0;
      if (semester === 'Giữa học kì I') {
        strandRatios = { 'Số và phép tính': 80, 'Hình học và đo lường': 20 };
      } else if (semester === 'Cuối học kì I') {
        strandRatios = { 'Số và phép tính': 60, 'Hình học và đo lường': 40 };
      } else if (semester === 'Giữa học kì II') {
        strandRatios = { 'Số và phép tính': 50, 'Hình học và đo lường': 50 };
      } else {
        strandRatios = { 'Số và phép tính': 50, 'Hình học và đo lường': 40, 'Một số yếu tố thống kê và xác suất': 10 };
      }
    }
  } else if (subject === 'Tiếng Việt') {
    if (grade === 1) {
      tnPoints = 3.0; // 6 câu TN = 3đ trong phần Đọc hiểu (tổng 10đ bài đọc/viết)
      tlPoints = 7.0;
      strandRatios = { 'Đọc hiểu': 40, 'Kiến thức tiếng Việt và Viết': 60 };
    } else if (grade === 2 || grade === 3) {
      tnPoints = 3.0; // 6 câu TN = 3đ (4 TN văn bản + 2 TN tiếng Việt)
      tlPoints = 7.0; // 3 câu TL = 3đ đọc + viết đoạn 4đ...
      strandRatios = { 'Đọc hiểu văn bản': 40, 'Kiến thức tiếng Việt': 20, 'Viết đoạn văn': 40 };
    } else {
      tnPoints = 4.0; // 8 câu TN (4 TN VB + 4 TN TV) = 4đ
      tlPoints = 6.0; // TL đọc + TL TV
      strandRatios = { 'Đọc hiểu văn bản': 40, 'Kiến thức tiếng Việt': 30, 'Viết': 30 };
    }
  } else if (subject === 'Tin học') {
    if (grade === 3) {
      tnPoints = 6.0;
      tlPoints = 4.0;
      strandRatios = { 'Máy tính và em': 40, 'Mạng máy tính và Internet': 30, 'Ứng dụng tin học': 30 };
    } else if (grade === 4) {
      tnPoints = 6.0;
      tlPoints = 4.0;
      strandRatios = { 'Khám phá máy tính': 30, 'Ứng dụng tin học': 40, 'Giải quyết vấn đề': 30 };
    } else {
      tnPoints = 5.0;
      tlPoints = 5.0;
      strandRatios = { 'Thông tin và giải quyết vấn đề': 40, 'Thực hành ứng dụng': 60 };
    }
  } else {
    // Khoa học, Lịch sử và Địa lí, Công nghệ
    tnPoints = 6.0;
    tlPoints = 4.0;
    strandRatios = { 'Chủ đề trọng tâm 1': 60, 'Chủ đề trọng tâm 2': 40 };
  }

  return {
    id: `config-${subject}-${grade}-${semester}`,
    name: `Cấu hình chuẩn ${subject} Lớp ${grade}`,
    grade,
    subject,
    totalPoints: 10,
    tnPoints,
    tlPoints,
    levelRatios: {
      level1: 50,
      level2: 30,
      level3: 20,
    },
    strandRatios,
    optionsPerMC: optionsCount,
    allowLevel3InMC: false,
    notes: 'Tuân thủ Chương trình GDPT 2018 và quy định khảo thí Trường PTDTBT TH Chí Cà.',
  };
}

// Bảng mạch kiến thức GDPT 2018 theo từng môn & lớp
export const CURRICULUM_DATA: Record<Subject, Record<number, CurriculumTopic[]>> = {
  'Toán': {
    1: [
      {
        strand: 'Số và phép tính',
        units: [
          { name: 'Các số trong phạm vi 10, 20, 100', learningObjectives: ['Nhận biết, đọc, viết, đếm và so sánh các số', 'Xác định số liền trước, số liền sau'] },
          { name: 'Phép cộng, phép trừ trong phạm vi 10, 20, 100', learningObjectives: ['Thực hiện tính nhẩm và đặt tính', 'Vận dụng giải bài toán thêm, bớt thực tế'] },
        ]
      },
      {
        strand: 'Hình học và đo lường',
        units: [
          { name: 'Hình phẳng (hình vuông, tròn, tam giác, chữ nhật)', learningObjectives: ['Nhận dạng hình phẳng từ vật thật', 'Vẽ và ghép hình'] },
          { name: 'Đo lường (xăng-ti-mét, xem đồng hồ, ngày trong tuần)', learningObjectives: ['Đọc số đo độ dài bằng cm', 'Xem giờ đúng trên đồng hồ kim'] },
        ]
      }
    ],
    2: [
      {
        strand: 'Số và phép tính',
        units: [
          { name: 'Phép cộng, trừ có nhớ trong phạm vi 100 và số đến 1000', learningObjectives: ['Thực hiện phép tính cộng, trừ có nhớ', 'Tính giá trị biểu thức đơn giản'] },
          { name: 'Phép nhân và phép chia (bảng nhân, chia 2 và 5)', learningObjectives: ['Thuộc bảng nhân 2, 5 và bảng chia tương ứng', 'Giải bài toán có một bước tính'] },
        ]
      },
      {
        strand: 'Hình học và đo lường',
        units: [
          { name: 'Điểm, đoạn thẳng, đường gấp khúc, khối lập phương, khối trụ', learningObjectives: ['Tính độ dài đường gấp khúc', 'Nhận diện hình khối cơ bản'] },
          { name: 'Đơn vị đo dm, m, km, kg, lít, ngày - giờ, tháng', learningObjectives: ['Thực hiện chuyển đổi đơn vị đo quen thuộc', 'Giải bài toán thực tế đo lường'] },
        ]
      },
      {
        strand: 'Một số yếu tố thống kê và xác suất',
        units: [
          { name: 'Thu thập, phân loại, kiểm đếm số liệu', learningObjectives: ['Đọc biểu đồ tranh đơn giản', 'Nhận biết biến cố chắc chắn, có thể, không thể'] },
        ]
      }
    ],
    3: [
      {
        strand: 'Số và phép tính',
        units: [
          { name: 'Các số đến 10 000, 100 000 và phép tính 4 phép', learningObjectives: ['Nhận biết hàng và lớp, làm tròn số', 'Nhân số có nhiều chữ số với số có một chữ số', 'Chia số có nhiều chữ số cho số có một chữ số'] },
          { name: 'Tính giá trị biểu thức và tìm thành phần chưa biết', learningObjectives: ['Quy tắc thứ tự thực hiện các phép tính trong biểu thức', 'Giải bài toán bằng hai bước tính'] },
        ]
      },
      {
        strand: 'Hình học và đo lường',
        units: [
          { name: 'Góc vuông, góc không vuông, tâm, bán kính hình tròn', learningObjectives: ['Dùng ê ke kiểm tra góc vuông', 'Tính chu vi hình chữ nhật, hình vuông'] },
          { name: 'Diện tích hình chữ nhật, hình vuông, gam, ml, tiền Việt Nam', learningObjectives: ['Tính diện tích theo công thức đã học', 'Thực hành giải bài toán mua bán thực tế'] },
        ]
      },
      {
        strand: 'Một số yếu tố thống kê và xác suất',
        units: [
          { name: 'Bảng số liệu thống kê và khả năng xảy ra của một sự kiện', learningObjectives: ['Đọc bảng thống kê hai cột', 'Mô tả khả năng xảy ra của sự kiện ngẫu nhiên'] },
        ]
      }
    ],
    4: [
      {
        strand: 'Số và phép tính',
        units: [
          { name: 'Số tự nhiên, lớp triệu, nhân chia với số có hai chữ số', learningObjectives: ['Đọc, viết, so sánh số tự nhiên đến lớp triệu', 'Tính nhẩm, tính viết và ước lượng kết quả'] },
          { name: 'Phân số, các phép tính với phân số', learningObjectives: ['Rút gọn, quy đồng và thực hiện 4 phép tính phân số', 'Tìm phân số của một số'] },
        ]
      },
      {
        strand: 'Hình học và đo lường',
        units: [
          { name: 'Góc nhọn, góc tù, góc bẹt; hai đường thẳng vuông góc, song song', learningObjectives: ['Nhận biết quan hệ song song, vuông góc bằng thước ê ke', 'Tính chu vi, diện tích hình bình hành, hình thoi'] },
          { name: 'Yến, tạ, tấn, giây, thế kỉ, đề-xi-mét vuông, mét vuông', learningObjectives: ['Đổi đơn vị đo khối lượng và diện tích', 'Tính toán thời gian và mốc lịch sử theo thế kỉ'] },
        ]
      },
      {
        strand: 'Một số yếu tố thống kê và xác suất',
        units: [
          { name: 'Dãy số liệu, biểu đồ cột, số trung bình cộng', learningObjectives: ['Tìm số trung bình cộng của nhiều số', 'Vẽ và nhận xét biểu đồ cột đơn giản'] },
        ]
      }
    ],
    5: [
      {
        strand: 'Số và phép tính',
        units: [
          { name: 'Số thập phân, các phép tính cộng trừ nhân chia số thập phân', learningObjectives: ['Đọc, viết, làm tròn và so sánh số thập phân', 'Thực hiện thành thạo 4 phép tính với số thập phân'] },
          { name: 'Tỉ số phần trăm và toán về chuyển động đều', learningObjectives: ['Giải 3 bài toán cơ bản về tỉ số phần trăm', 'Vận dụng công thức vận tốc, quãng đường, thời gian (s = v x t)'] },
        ]
      },
      {
        strand: 'Hình học và đo lường',
        units: [
          { name: 'Hình tam giác, hình thang, hình tròn (chu vi & diện tích)', learningObjectives: ['Tính diện tích tam giác, hình thang, hình tròn', 'Tính chu vi hình tròn'] },
          { name: 'Hình hộp chữ nhật, hình lập phương (diện tích xung quanh & thể tích)', learningObjectives: ['Tính diện tích toàn phần và thể tích hình hộp chữ nhật', 'Đổi đơn vị đo thể tích xăng-ti-mét khối, đề-xi-mét khối, mét khối'] },
        ]
      },
      {
        strand: 'Một số yếu tố thống kê và xác suất',
        units: [
          { name: 'Biểu đồ hình quạt tròn và xác suất thực nghiệm', learningObjectives: ['Đọc và xử lý thông tin trên biểu đồ hình quạt tròn', 'Dự đoán kết quả theo tỉ lệ phần trăm'] },
        ]
      }
    ]
  },
  'Tiếng Việt': {
    1: [
      {
        strand: 'Đọc hiểu',
        units: [
          { name: 'Đọc hiểu văn bản truyện/thơ ngắn (90-130 chữ)', learningObjectives: ['Nhận biết các nhân vật, chi tiết nổi bật trong bài', 'Trả lời các câu hỏi Ai? Cái gì? Làm gì?'] }
        ]
      },
      {
        strand: 'Kiến thức tiếng Việt và Viết',
        units: [
          { name: 'Quy tắc chính tả, điền âm/vần (c/k, g/gh, ng/ngh)', learningObjectives: ['Phân biệt đúng các cặp âm vần dễ lẫn', 'Nghe - viết chính xác đoạn văn ngắn'] }
        ]
      }
    ],
    2: [
      {
        strand: 'Đọc hiểu văn bản',
        units: [
          { name: 'Đọc hiểu văn bản truyện, thơ, văn bản thông tin (180-200 chữ)', learningObjectives: ['Tìm thông tin trực tiếp trong bài đọc', 'Hiểu bài học hoặc ý nghĩa của câu chuyện'] }
        ]
      },
      {
        strand: 'Kiến thức tiếng Việt',
        units: [
          { name: 'Từ chỉ sự vật, hoạt động, đặc điểm; dấu câu (chấm, phẩy, chấm hỏi)', learningObjectives: ['Nhận diện và đặt câu với từ ngữ theo chủ điểm', 'Sử dụng dấu câu phù hợp ngữ cảnh'] }
        ]
      },
      {
        strand: 'Viết đoạn văn',
        units: [
          { name: 'Viết đoạn văn ngắn 3-4 câu theo gợi ý', learningObjectives: ['Viết câu đủ chủ ngữ vị ngữ', 'Kể hoặc tả về người thân, bạn bè, đồ vật quen thuộc'] }
        ]
      }
    ],
    3: [
      {
        strand: 'Đọc hiểu văn bản',
        units: [
          { name: 'Đọc hiểu văn bản văn học và thông tin (200-250 chữ)', learningObjectives: ['Tóm tắt ý chính của đoạn văn', 'Rút ra thông điệp hoặc cảm xúc của tác giả'] }
        ]
      },
      {
        strand: 'Kiến thức tiếng Việt',
        units: [
          { name: 'Biện pháp tu từ so sánh, nhân hóa; mở rộng vốn từ', learningObjectives: ['Phát hiện hình ảnh so sánh, nhân hóa', 'Biết đặt câu có hình ảnh so sánh sinh động'] }
        ]
      },
      {
        strand: 'Viết',
        units: [
          { name: 'Viết đoạn văn nêu tình cảm, cảm xúc hoặc thuật lại sự việc', learningObjectives: ['Bố cục đoạn văn mạch lạc, có mở đoạn, thân đoạn, kết đoạn'] }
        ]
      }
    ],
    4: [
      {
        strand: 'Đọc hiểu văn bản',
        units: [
          { name: 'Đọc hiểu tác phẩm truyện, kịch, văn bản miêu tả (280-330 chữ)', learningObjectives: ['Xác định chủ đề, tư tưởng, nghệ thuật của tác phẩm', 'Đánh giá hành vi, phẩm chất của nhân vật'] }
        ]
      },
      {
        strand: 'Kiến thức tiếng Việt',
        units: [
          { name: 'Danh từ, động từ, tính từ; câu đơn, vị ngữ, chủ ngữ', learningObjectives: ['Phân loại từ loại chính xác trong ngữ cảnh', 'Xác định thành phần nòng cốt của câu'] }
        ]
      },
      {
        strand: 'Viết',
        units: [
          { name: 'Viết bài văn miêu tả (cây cối, con vật) hoặc văn kể chuyện', learningObjectives: ['Bài văn đủ 3 phần: Mở bài, Thân bài, Kết bài; dùng từ gợi tả'] }
        ]
      }
    ],
    5: [
      {
        strand: 'Đọc hiểu văn bản',
        units: [
          { name: 'Đọc hiểu văn bản truyện, thơ, văn bản thông tin nâng cao (300-350 chữ)', learningObjectives: ['Phân tích mối quan hệ giữa các chi tiết trong văn bản', 'Liên hệ thực tế bản thân và thông điệp nhân văn'] }
        ]
      },
      {
        strand: 'Kiến thức tiếng Việt',
        units: [
          { name: 'Từ đồng nghĩa, trái nghĩa, từ nhiều nghĩa; câu ghép', learningObjectives: ['Phân biệt nghĩa gốc và nghĩa chuyển của từ', 'Đặt câu ghép dùng các cặp quan hệ từ chính xác'] }
        ]
      },
      {
        strand: 'Viết',
        units: [
          { name: 'Viết bài văn tả người, tả cảnh hoặc bài văn thuyết minh/tranh luận', learningObjectives: ['Lập dàn ý chi tiết, phát triển ý mạch lạc, giọng văn truyền cảm'] }
        ]
      }
    ]
  },
  'Lịch sử và Địa lí': {
    4: [
      {
        strand: 'Lịch sử',
        units: [
          { name: 'Buổi đầu dựng nước và giữ nước (Văn Lang, Âu Lạc)', learningObjectives: ['Nêu được thời gian và đóng góp của các vua Hùng, An Dương Vương', 'Nhận diện di tích đền Hùng, thành Cổ Loa'] },
          { name: 'Hơn một nghìn năm đấu tranh giành độc lập', learningObjectives: ['Kể tóm tắt khởi nghĩa Hai Bà Trưng, chiến thắng Bạch Đằng của Ngô Quyền'] }
        ]
      },
      {
        strand: 'Địa lí',
        units: [
          { name: 'Vùng Trung du và miền núi Bắc Bộ (đặc điểm tự nhiên, con người)', learningObjectives: ['Chỉ trên bản đồ vị trí địa lí, địa hình dãy Hoàng Liên Sơn, sông Hồng', 'Nêu nét văn hóa đặc trưng các dân tộc vùng cao (Tày, Nùng, H\'Mông)'] },
          { name: 'Vùng Đồng bằng Bắc Bộ', learningObjectives: ['Nêu đặc điểm sông ngòi, đê điều, sản xuất lúa nước và làng nghề truyền thống'] }
        ]
      }
    ],
    5: [
      {
        strand: 'Lịch sử',
        units: [
          { name: 'Nước Việt Nam từ 1858 đến 1945 và Cách mạng Tháng Tám', learningObjectives: ['Nêu ý nghĩa ngày 2/9/1945 Bác Hồ đọc Tuyên ngôn Độc lập', 'Trình bày chiến dịch Điện Biên Phủ 1954 lừng lẫy năm châu'] },
          { name: 'Xây dựng và bảo vệ Tổ quốc xã hội chủ nghĩa', learningObjectives: ['Đại thắng mùa xuân 1975, thành tựu đổi mới đất nước'] }
        ]
      },
      {
        strand: 'Địa lí',
        units: [
          { name: 'Địa lí tự nhiên Việt Nam (vị trí, khí hậu, tài nguyên biển đảo)', learningObjectives: ['Khẳng định chủ quyền quần đảo Hoàng Sa, Trường Sa', 'Nêu thế mạnh nông nghiệp và du lịch nước ta'] },
          { name: 'Các châu lục trên thế giới (Châu Á, Châu Âu, Châu Phi, Châu Mỹ)', learningObjectives: ['So sánh đặc điểm tự nhiên và kinh tế các châu lục'] }
        ]
      }
    ]
  },
  'Khoa học': {
    4: [
      {
        strand: 'Chất',
        units: [
          { name: 'Nước, không khí và ánh sáng', learningObjectives: ['Nêu các thể của nước và vòng tuần hoàn của nước trong tự nhiên', 'Thí nghiệm chứng minh vai trò của không khí và sự truyền ánh sáng'] }
        ]
      },
      {
        strand: 'Sinh vật và môi trường',
        units: [
          { name: 'Sự trao đổi chất ở thực vật và động vật', learningObjectives: ['Mô tả chuỗi thức ăn trong tự nhiên', 'Biện pháp bảo vệ nguồn nước và môi trường sống'] }
        ]
      }
    ],
    5: [
      {
        strand: 'Năng lượng',
        units: [
          { name: 'Năng lượng mặt trời, gió, nước chảy và điện', learningObjectives: ['Nêu ứng dụng của năng lượng sạch', 'Thực hành các quy tắc an toàn và tiết kiệm điện trong gia đình'] }
        ]
      },
      {
        strand: 'Con người và sức khỏe',
        units: [
          { name: 'Sự sinh sản và phát triển ở người, phòng tránh bệnh tật', learningObjectives: ['Phòng tránh tai nạn đuối nước, tai nạn giao thông', 'Chế độ dinh dưỡng cân bằng và lối sống lành mạnh'] }
        ]
      }
    ]
  },
  'Tin học': {
    3: [
      {
        strand: 'Máy tính và em',
        units: [
          { name: 'Các bộ phận cơ bản của máy tính, thao tác với chuột và bàn phím', learningObjectives: ['Phân biệt chuột, bàn phím, màn hình, thân máy', 'Cầm chuột đúng cách và gõ phím đúng hàng cơ sở'] }
        ]
      },
      {
        strand: 'Ứng dụng tin học',
        units: [
          { name: 'Vẽ hình đơn giản với phần mềm đồ họa (Paint)', learningObjectives: ['Sử dụng công cụ bút vẽ, tẩy, chọn màu, lưu tệp hình ảnh'] }
        ]
      }
    ],
    4: [
      {
        strand: 'Khám phá máy tính và mạng',
        units: [
          { name: 'Tệp và thư mục; tìm kiếm thông tin an toàn trên Internet', learningObjectives: ['Tạo, đổi tên và xóa thư mục khoa học', 'Sử dụng từ khóa tìm kiếm trên Google/trình duyệt'] }
        ]
      },
      {
        strand: 'Ứng dụng soạn thảo văn bản',
        units: [
          { name: 'Gõ tiếng Việt kiểu Telex/Vni, chèn ảnh, lưu văn bản', learningObjectives: ['Gõ đúng dấu tiếng Việt', 'Căn lề, đổi font chữ và cỡ chữ trong văn bản'] }
        ]
      }
    ],
    5: [
      {
        strand: 'Thông tin và giải quyết vấn đề',
        units: [
          { name: 'Trình chiếu đa phương tiện (PowerPoint) và Thuật toán đơn giản', learningObjectives: ['Tạo bài thuyết trình 3-4 trang có hiệu ứng', 'Mô tả thuật toán dạng sơ đồ khối hoặc các bước tuần tự'] }
        ]
      },
      {
        strand: 'Lập trình trực quan (Scratch)',
        units: [
          { name: 'Tạo nhân vật, câu lệnh lặp và di chuyển', learningObjectives: ['Lập trình nhân vật di chuyển và phát âm thanh khi bấm cờ xanh'] }
        ]
      }
    ]
  },
  'Công nghệ': {
    3: [
      {
        strand: 'Công nghệ và đời sống',
        units: [
          { name: 'Tự nhiên và công nghệ, sử dụng quạt điện, đèn bàn an toàn', learningObjectives: ['Phân biệt sản phẩm tự nhiên và công nghệ', 'Sử dụng đồ dùng điện gia đình an toàn'] }
        ]
      },
      {
        strand: 'Thủ công kĩ thuật',
        units: [
          { name: 'Làm đồ dùng học tập bằng giấy, bìa', learningObjectives: ['Gấp, cắt, dán thước kẻ hoặc hộp bút đơn giản'] }
        ]
      }
    ],
    4: [
      {
        strand: 'Công nghệ và đời sống',
        units: [
          { name: 'Hoa và cây cảnh trong đời sống, trồng cây trong chậu', learningObjectives: ['Nêu lợi ích của hoa, cây cảnh', 'Thực hành các bước trồng và chăm sóc cây cảnh trong chậu'] }
        ]
      },
      {
        strand: 'Thủ công kĩ thuật',
        units: [
          { name: 'Lắp ghép mô hình kĩ thuật (bập bênh, xe tải)', learningObjectives: ['Chọn đúng chi tiết và lắp ghép đúng quy trình'] }
        ]
      }
    ],
    5: [
      {
        strand: 'Công nghệ và đời sống',
        units: [
          { name: 'Công nghệ trong gia đình, an toàn với các thiết bị sinh nhiệt', learningObjectives: ['Sử dụng nồi cơm điện, bàn là đúng hướng dẫn', 'Phòng tránh bỏng và chập cháy điện'] }
        ]
      },
      {
        strand: 'Thiết kế kĩ thuật',
        units: [
          { name: 'Thiết kế sản phẩm đồ chơi đơn giản (xe chạy bằng dây chun)', learningObjectives: ['Phác thảo bản vẽ và lắp ráp hoàn thiện đồ chơi'] }
        ]
      }
    ]
  }
};
