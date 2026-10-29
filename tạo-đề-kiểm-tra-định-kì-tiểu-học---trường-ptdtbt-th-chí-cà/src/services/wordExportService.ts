import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  HeadingLevel,
} from 'docx';
import { ExamPaper } from '../types/exam';

export async function exportExamToDocx(
  paper: ExamPaper,
  options: {
    includeExam: boolean;
    includeAnswers: boolean;
    includeMatrix: boolean;
    includeSpecs: boolean;
  }
): Promise<Blob> {
  const sections: any[] = [];
  const header = paper.header;
  const questions = paper.questions || [];

  // Helper for font
  const defaultFont = 'Times New Roman';

  // 1. Phân hệ Đề thi (Dành cho học sinh)
  if (options.includeExam) {
    const examChildren: any[] = [];

    // Header table 2 cột: Bên trái cơ quan, bên phải tên kì thi
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: (header.governingBody || 'UBND XÃ XÍN MẦN').toUpperCase(),
                      font: defaultFont,
                      size: 22, // 11pt
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: (header.schoolName || 'TRƯỜNG PTDTBT TH CHÍ CÀ').toUpperCase(),
                      font: defaultFont,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: '-----------------------',
                      font: defaultFont,
                      size: 18,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${header.examTitle || 'ĐỀ KIỂM TRA ĐỊNH KÌ'} ${header.examPeriod?.toUpperCase() || 'CUỐI HỌC KÌ I'}`,
                      font: defaultFont,
                      bold: true,
                      size: 24, // 12pt
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `NĂM HỌC ${header.schoolYear || '2026–2027'}`,
                      font: defaultFont,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `Mã đề: ${header.examCode || 'CHÍNH THỨC'}`,
                      font: defaultFont,
                      italics: true,
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    examChildren.push(headerTable);

    // Dòng Tiêu đề Môn và Thời gian
    examChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 60 },
        children: [
          new TextRun({
            text: `MÔN: ${header.subject.toUpperCase()} – LỚP ${header.grade}`,
            font: defaultFont,
            bold: true,
            size: 28, // 14pt
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `(Thời gian làm bài: ${header.durationMinutes || 40} phút, không kể thời gian giao đề)`,
            font: defaultFont,
            italics: true,
            size: 24, // 12pt
          }),
        ],
      })
    );

    // Khung điền thông tin học sinh & điểm số
    const studentInfoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: 'Họ và tên học sinh: .................................................................',
                      font: defaultFont,
                      size: 24,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: `Lớp: ${header.grade}.....  Trường: PTDTBT TH Chí Cà`,
                      font: defaultFont,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 60, after: 40 },
                  children: [
                    new TextRun({
                      text: 'ĐIỂM SỐ',
                      font: defaultFont,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 60 },
                  children: [
                    new TextRun({
                      text: '............... / 10',
                      font: defaultFont,
                      bold: true,
                      size: 26,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    examChildren.push(studentInfoTable);

    // Phần văn bản đọc hiểu (cho Tiếng Việt nếu có)
    if (paper.readingPassage && paper.readingPassage.content) {
      examChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 80 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: paper.readingPassage.title || 'BÀI ĐỌC HIỂU',
              font: defaultFont,
              bold: true,
              size: 26,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 140 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: paper.readingPassage.content,
              font: defaultFont,
              size: 24,
            }),
          ],
        })
      );
      if (paper.readingPassage.author) {
        examChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: `(Theo ${paper.readingPassage.author})`,
                font: defaultFont,
                italics: true,
                size: 22,
              }),
            ],
          })
        );
      }
    }

    // Câu hỏi đề thi
    examChildren.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'I. PHẦN CÂU HỎI',
            font: defaultFont,
            bold: true,
            size: 26,
          }),
        ],
      })
    );

    questions.forEach((q) => {
      // Đúng quy chuẩn Mục 5.3:
      // Số câu viết ĐẬM
      // Điểm số viết NGHIÊNG, không viết đậm
      // Nội dung câu hỏi viết thường
      const questionParagraph = new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: `Câu ${q.orderNumber} `,
            font: defaultFont,
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: `(${q.points.toString().replace('.', ',')} điểm): `,
            font: defaultFont,
            italics: true,
            bold: false,
            size: 24,
          }),
          new TextRun({
            text: q.content,
            font: defaultFont,
            bold: false,
            size: 24,
          }),
        ],
      });
      examChildren.push(questionParagraph);

      // Các phương án nhiều lựa chọn: Thụt lề khoảng 1cm (~567 dxa)
      if (q.format === 'multiple_choice' && q.options) {
        q.options.forEach((opt) => {
          examChildren.push(
            new Paragraph({
              indent: { left: 567 }, // ~1cm
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `${opt.key}. `,
                  font: defaultFont,
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: opt.text,
                  font: defaultFont,
                  size: 24,
                }),
              ],
            })
          );
        });
      }

      // Đúng - Sai
      if (q.format === 'true_false' && q.trueFalseItems) {
        q.trueFalseItems.forEach((tf, tfIdx) => {
          const letter = String.fromCharCode(97 + tfIdx); // a, b, c, d
          examChildren.push(
            new Paragraph({
              indent: { left: 567 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `${letter}) ${tf.statement}  [    ]`,
                  font: defaultFont,
                  size: 24,
                }),
              ],
            })
          );
        });
      }

      // Nối cột
      if (q.format === 'matching' && q.matchingPairs) {
        q.matchingPairs.forEach((pair) => {
          examChildren.push(
            new Paragraph({
              indent: { left: 567 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: `• Cột A: ${pair.left}  --- Nối với ---  Cột B: ${pair.right}`,
                  font: defaultFont,
                  size: 24,
                }),
              ],
            })
          );
        });
      }

      // Điền khuyết
      if (q.format === 'fill_blank' && q.fillBlankTemplate) {
        examChildren.push(
          new Paragraph({
            indent: { left: 567 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: q.fillBlankTemplate,
                font: defaultFont,
                italics: true,
                size: 24,
              }),
            ],
          })
        );
      }

      // Dành cho tự luận / thực hành: Để dòng kẻ học sinh làm bài
      if (q.format === 'essay' || q.format === 'practice') {
        examChildren.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({
                text: 'Bài làm:',
                font: defaultFont,
                italics: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: '...................................................................................................................................................................',
                font: defaultFont,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: '...................................................................................................................................................................',
                font: defaultFont,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '...................................................................................................................................................................',
                font: defaultFont,
                size: 20,
              }),
            ],
          })
        );
      }
    });

    examChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: '-------------- HẾT --------------',
            font: defaultFont,
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: '(Cán bộ coi kiểm tra không giải thích gì thêm)',
            font: defaultFont,
            italics: true,
            size: 20,
          }),
        ],
      })
    );

    sections.push({
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 }, // Standard A4 (2cm top/bottom, 2.5cm left, 2cm right)
        },
      },
      children: examChildren,
    });
  }

  // 2. Phân hệ Đáp án và Hướng dẫn chấm
  if (options.includeAnswers) {
    const answerChildren: any[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: 'ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM BÀI KIỂM TRA ĐỊNH KÌ',
            font: defaultFont,
            bold: true,
            size: 28,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Môn: ${header.subject} – Lớp ${header.grade} – Năm học: ${header.schoolYear}`,
            font: defaultFont,
            italics: true,
            size: 24,
          }),
        ],
      }),
    ];

    questions.forEach((q) => {
      let ansText = '';
      if (q.format === 'multiple_choice') {
        const correctOpt = q.options?.find((o) => o.isCorrect);
        ansText = correctOpt ? `Đáp án đúng: ${correctOpt.key} (${correctOpt.text})` : 'Chưa thiết lập đáp án';
      } else if (q.format === 'true_false') {
        ansText =
          q.trueFalseItems
            ?.map((tf, i) => `${String.fromCharCode(97 + i)}: ${tf.isTrue ? 'Đúng (Đ)' : 'Sai (S)'}`)
            .join('; ') || '';
      } else if (q.format === 'matching') {
        ansText = q.matchingPairs?.map((m) => `[${m.left}] nối với [${m.right}]`).join(' | ') || '';
      } else if (q.format === 'fill_blank') {
        ansText = `Từ/Số cần điền: ${q.fillBlankAnswers?.join(', ') || 'Theo đáp án chuẩn'}`;
      } else {
        ansText = q.essayGuide || 'Chấm theo thang điểm và yêu cầu cần đạt nêu trong hướng dẫn chi tiết.';
      }

      answerChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: `Câu ${q.orderNumber} `,
              font: defaultFont,
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: `(${q.points.toString().replace('.', ',')} điểm): `,
              font: defaultFont,
              italics: true,
              size: 24,
            }),
            new TextRun({
              text: ansText,
              font: defaultFont,
              size: 24,
            }),
          ],
        })
      );
    });

    sections.push({
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 },
        },
      },
      children: answerChildren,
    });
  }

  // 3. Phân hệ Ma trận đề kiểm tra
  if (options.includeMatrix) {
    const matrixChildren: any[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ THEO THÔNG TƯ 27 - GDPT 2018',
            font: defaultFont,
            bold: true,
            size: 26,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Trường PTDTBT TH Chí Cà – Môn: ${header.subject} Lớp ${header.grade}`,
            font: defaultFont,
            italics: true,
            size: 22,
          }),
        ],
      }),
    ];

    const matrixRows = paper.matrix || [];
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mạch kiến thức / Chủ đề', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 1 (Biết)', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 2 (Hiểu)', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 3 (Vận dụng)', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tổng số câu', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tổng điểm', bold: true, size: 20, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tỉ lệ %', bold: true, size: 20, font: defaultFont })] })] }),
        ],
      }),
      ...matrixRows.map(
        (m, idx) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${m.strand} (${m.unit})`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `TN: ${m.level1TNCount} | TL: ${m.level1TLCount}`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `TN: ${m.level2TNCount} | TL: ${m.level2TLCount}`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `TL: ${m.level3TLCount} (${m.level3TLPoints}đ)`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${m.totalQuestions}`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${m.totalPoints}`, size: 20, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${m.percentage}%`, size: 20, font: defaultFont })] })] }),
            ],
          })
      ),
    ];

    matrixChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );

    sections.push({
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 },
        },
      },
      children: matrixChildren,
    });
  }

  // 4. Phân hệ Bảng đặc tả đề kiểm tra
  if (options.includeSpecs) {
    const specChildren: any[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'BẢNG ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ',
            font: defaultFont,
            bold: true,
            size: 26,
          }),
        ],
      }),
    ];

    const specRows = paper.specifications || [];
    const specTableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Câu', bold: true, size: 18, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mạch kiến thức', bold: true, size: 18, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Yêu cầu cần đạt', bold: true, size: 18, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức độ', bold: true, size: 18, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hình thức', bold: true, size: 18, font: defaultFont })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Điểm', bold: true, size: 18, font: defaultFont })] })] }),
        ],
      }),
      ...specRows.map(
        (sp) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Câu ${sp.questionOrder}`, size: 18, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sp.strand, size: 18, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sp.learningObjective, size: 18, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sp.cognitiveLevel, size: 18, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sp.format, size: 18, font: defaultFont })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${sp.points}đ`, size: 18, font: defaultFont })] })] }),
            ],
          })
      ),
    ];

    specChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: specTableRows,
      })
    );

    sections.push({
      properties: {
        page: {
          margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 },
        },
      },
      children: specChildren,
    });
  }

  const doc = new Document({
    sections,
  });

  return await Packer.toBlob(doc);
}
