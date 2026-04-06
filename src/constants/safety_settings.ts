import { HarmBlockThreshold, HarmCategory } from "@google/genai";

export const HARM_CATEGORIES: { [key in HarmCategory]: string } = {
  [HarmCategory.HARM_CATEGORY_UNSPECIFIED]: "Không xác định",
  [HarmCategory.HARM_CATEGORY_HARASSMENT]: "Quấy rối",
  [HarmCategory.HARM_CATEGORY_HATE_SPEECH]: "Lời nói hận thù",
  [HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT]: "Nội dung khiêu dâm",
  [HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT]: "Nội dung nguy hiểm",
  [HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY]:
    "Tính toàn vẹn dân sự (Không dùng - đã gộp vào hate speech)",
  [HarmCategory.HARM_CATEGORY_IMAGE_HARASSMENT]:
    "Hình ảnh quấy rối (Không dùng - dành riêng cho tạo ảnh của gemini)",
  [HarmCategory.HARM_CATEGORY_IMAGE_HATE]:
    "Hình ảnh hận thù (Không dùng - dành riêng cho tạo ảnh của gemini)",
  [HarmCategory.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT]:
    "Hình ảnh nội dung nguy hiểm (Không dùng - dành riêng cho tạo ảnh của gemini)",
  [HarmCategory.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT]:
    "Hình ảnh khiêu dâm (Không dùng - dành riêng cho tạo ảnh của gemini)",
  [HarmCategory.HARM_CATEGORY_JAILBREAK]: "Jailbreak (Không dùng - gemini chưa hỗ trợ)",
};

export const HARM_BLOCK_THRESHOLDS: { [key in HarmBlockThreshold]: string } = {
  [HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED]: "Không xác định",
  [HarmBlockThreshold.BLOCK_NONE]: "Không chặn",
  [HarmBlockThreshold.BLOCK_ONLY_HIGH]: "Chỉ chặn mức cao",
  [HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE]: "Chặn mức trung bình trở lên",
  [HarmBlockThreshold.BLOCK_LOW_AND_ABOVE]: "Chặn mức thấp trở lên",
  [HarmBlockThreshold.OFF]: "Tắt",
};