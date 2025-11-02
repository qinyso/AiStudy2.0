// 主题配置 - 医疗蓝色系
export const themeColors = {
  // 主色调 - 医疗蓝色系
  colorPrimary: '#0ea5e9',
  
  // 辅助色
  colorSuccess: '#059669',
  colorWarning: '#d97706',
  colorError: '#dc2626',
  colorInfo: '#0284c7',
  
  // 中性色
  colorTextBase: '#ffffff',
  colorTextSecondary: 'rgba(255, 255, 255, 0.8)',
  colorTextTertiary: 'rgba(255, 255, 255, 0.6)',
  colorTextQuaternary: 'rgba(255, 255, 255, 0.4)',
  
  // 背景色
  colorBgBase: '#0f172a',
  colorBgSecondary: '#0c4a6e',
  colorBgTertiary: '#1e3a8a',
  
  // 边框色
  colorBorder: 'rgba(14, 165, 233, 0.2)',
  colorBorderSecondary: 'rgba(14, 165, 233, 0.1)',
  
  // 渐变色彩 - 医疗蓝色系
  gradientColors: {
    primary: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    secondary: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)',
    accent: 'linear-gradient(135deg, #0284c7, #06b6d4)'
  },
  
  // 阴影
  boxShadow: {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
    large: '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -2px rgba(14, 165, 233, 0.05)'
  }
};

// 布局配置
export const layoutConfig = {
  header: {
    height: 64,
    padding: '0 24px'
  },
  content: {
    padding: 24
  },
  footer: {
    height: 64,
    padding: '0 24px'
  },
  sidebar: {
    width: 256
  }
};

// 排版配置
export const typographyConfig = {
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

// 导出默认主题配置
export default themeColors;