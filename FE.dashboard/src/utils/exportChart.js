// src/utils/exportChart.js

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun } from "docx";

// 차트를 캡처하여 PDF로 저장하는 함수
export const saveChartAsPDF = async (chartRef, title) => {
  try {
    const input = chartRef.current;
    if (input) {
      const canvas = await html2canvas(input, { useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${title}.pdf`);
    }
  } catch (error) {
    console.error("Failed to save chart as PDF:", error);
    alert("Failed to save chart as PDF.");
  }
};

// 차트를 캡처하여 Word로 저장하는 함수
export const saveChartAsWord = async (chartRef, title) => {
  try {
    const input = chartRef.current;
    if (input) {
      const canvas = await html2canvas(input, { useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // 이미지 데이터를 Blob으로 변환
      const response = await fetch(imgData);
      const imgBlob = await response.blob();

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imgBlob,
                    transformation: {
                      width: canvas.width * 0.75, // Word 문서에 맞게 크기 조정
                      height: canvas.height * 0.75,
                    },
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${title}.docx`);
    }
  } catch (error) {
    console.error("Failed to save chart as Word:", error);
    alert("Failed to save chart as Word.");
  }
};
