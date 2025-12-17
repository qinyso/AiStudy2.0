// 主题配置 - 科技感明亮系
export const themeColors = {
  // 主色调 - 科技感蓝色
  colorPrimary: '#3b82f6',
  
  // 辅助色
  colorSuccess: '#10b981',
  colorWarning: '#f59e0b',
  colorError: '#ef4444',
  colorInfo: '#60a5fa',
  
  // 中性色
  colorTextBase: '#1e293b',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#94a3b8',
  colorTextQuaternary: '#cbd5e1',
  
  // 背景色
  colorBgBase: '#f8fafc',
  colorBgSecondary: '#ffffff',
  colorBgTertiary: '#f1f5f9',
  
  // 边框色
  colorBorder: 'rgba(203, 213, 225, 0.5)',
  colorBorderSecondary: 'rgba(203, 213, 225, 0.3)',
  
  // 渐变色彩 - 科技感蓝色系
  gradientColors: {
    primary: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    secondary: 'linear-gradient(135deg, #60a5fa, #93c5fd)',
    accent: 'linear-gradient(135deg, #2563eb, #3b82f6)'
  },
  
  // 阴影
  boxShadow: {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
    large: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)'
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