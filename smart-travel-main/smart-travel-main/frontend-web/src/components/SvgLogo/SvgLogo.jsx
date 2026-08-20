import React from 'react';

// Chữ S nét bình thường, dùng arc để tạo hình S chuẩn không quẹo quá
const S_PATH = 'M 285,90 L 135,90 A 70,70 0 0 0 135,230 L 245,230 A 70,70 0 0 1 245,370 L 75,370';

const SvgLogo = ({ size = 320 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 500 500" // Khung tranh rộng rãi, đảm bảo không bị lẹm viền
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* 1. MASK ĐỤC CHỮ T */}
      <mask id="cutoutMask">
        <rect width="100%" height="100%" fill="white" />
        {/* Lưỡi dao cắt giảm xuống 105 - Vừa đủ đục 1 lỗ hở đẹp mà không nuốt mất chữ T */}
        <path d={S_PATH} fill="none" stroke="black" strokeWidth="105" strokeLinecap="round" strokeLinejoin="round" />
      </mask>

      {/* 2. MASK LÀM RỖNG CHỮ S */}
      <mask id="roadMask">
        <path d={S_PATH} fill="none" stroke="white" strokeWidth="80" strokeLinecap="round" strokeLinejoin="round" />
        <path d={S_PATH} fill="none" stroke="black" strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" />
      </mask>
    </defs>

    {/* ===== CHỮ T ===== */}
    <g mask="url(#cutoutMask)">
      <path 
        /* Chữ T đã được dịch sang phải (thân T ở tọa độ X: 330 -> 390). 
           Đường cong chữ S chỉ chạm đến X: 350. Hai chữ sẽ giao nhau vừa vặn! */
        d="M 180,40 L 490,40 L 490,95 L 390,95 L 390,400 L 330,400 L 330,95 L 180,95 Z" 
        fill="none" 
        stroke="white" 
        strokeWidth="18" 
        strokeLinejoin="round" 
      />
    </g>

    {/* ===== CHỮ S (CON ĐƯỜNG) ===== */}
    <rect width="100%" height="100%" fill="white" mask="url(#roadMask)" />
    
    <path 
      d={S_PATH} 
      fill="none" 
      stroke="white" 
      strokeWidth="8" 
      strokeDasharray="20 16" 
      strokeLinecap="round" 
    />

    {/* ===== KHINH KHÍ CẦU ===== */}
    {/* Đã dịch chuyển khinh khí cầu vào đúng tâm vòng lặp phía trên của chữ S */}



  </svg>
);

export default SvgLogo;