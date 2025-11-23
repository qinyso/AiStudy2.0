import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { themeColors } from '../theme';
// 导入assets中的图片
import m1 from '../assets/m1.jpeg';
import m2 from '../assets/m2.jpeg';
import m3 from '../assets/m3.jpeg';
import m4 from '../assets/m4.jpeg';

// 导航菜单项 - AI肾病智能研究相关
const navItems = ['研究概述', '病理分析', '诊断案例', '技术支持', '关于我们'];

// 3D立方体组件 - 改为医疗蓝色调
const Cube = ({ size = 100, color = '#0ea5e9', x = 0, y = 0, rotation = 0 }) => {
  return (
    <div 
      className="cube"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
        transform: `rotateY(${rotation}deg) rotateX(${rotation * 0.5}deg)`,
        animation: 'rotateCube 15s infinite linear',
        opacity: 0.8
      }}
    >
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        opacity: 0.8,
        transform: 'translateZ(50px)',
        boxShadow: `0 0 20px ${color}`
      }} />
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        opacity: 0.8,
        transform: 'rotateY(90deg) translateZ(50px)',
        boxShadow: `0 0 20px ${color}`
      }} />
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        opacity: 0.8,
        transform: 'rotateY(180deg) translateZ(50px)',
        boxShadow: `0 0 20px ${color}`
      }} />
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: color,
        opacity: 0.8,
        transform: 'rotateY(-90deg) translateZ(50px)',
        boxShadow: `0 0 20px ${color}`
      }} />
    </div>
  );
};

// 显微镜图形组件 - 替换VR头盔
const Microscope = ({ size = 150, x = 0, y = 0 }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        opacity: 0.9,
        zIndex: 2
      }}
    >
      {/* 显微镜底座 */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        height: '15%',
        borderRadius: '5px',
        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        boxShadow: '0 0 15px rgba(14, 165, 233, 0.6)'
      }} />
      {/* 显微镜支柱 */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '10%',
        height: '70%',
        background: 'linear-gradient(180deg, #0ea5e9, #0284c7)',
        boxShadow: '0 0 15px rgba(14, 165, 233, 0.6)'
      }} />
      {/* 显微镜臂 */}
      <div style={{
        position: 'absolute',
        bottom: '60%',
        left: '50%',
        width: '50%',
        height: '8%',
        borderRadius: '8px 0 0 8px',
        background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
        boxShadow: '0 0 15px rgba(14, 165, 233, 0.6)'
      }} />
      {/* 显微镜镜头 */}
      <div style={{
        position: 'absolute',
        bottom: '35%',
        left: '25%',
        width: '15%',
        height: '20%',
        borderRadius: '50% 50% 0 0',
        background: 'linear-gradient(180deg, #0ea5e9, #0284c7)',
        boxShadow: '0 0 15px rgba(14, 165, 233, 0.6)'
      }} />
      {/* 显微镜载玻片 */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '22%',
        width: '20%',
        height: '3%',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
        border: '1px solid rgba(255,255,255,0.5)'
      }} />
    </div>
  );
};

// 病理分析设备图形组件 - 替换数字设备
const PathologyDevice = ({ size = 100, x = 0, y = 0 }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size * 1.4,
        transform: 'translate(-50%, -50%)',
        zIndex: 3
      }}
    >
      {/* 设备外壳 */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '15px',
        background: 'linear-gradient(135deg, #0c4a6e, #1e40af)',
        border: '2px solid rgba(14, 165, 233, 0.2)',
        boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)'
      }} />
      {/* 屏幕 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '70%',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        border: '1px solid rgba(14, 165, 233, 0.3)'
      }} />
      {/* 屏幕内容 - 数字文本 */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: size * 0.15,
        fontWeight: 'bold',
        color: '#0ea5e9',
        textShadow: '0 0 10px rgba(14, 165, 233, 0.8)',
        textAlign: 'center'
      }}>
        AI肾病<br/>分析系统
      </div>
    </div>
  );
};

// 轮播图组件 - 更具高级感的设计
const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 轮播图片数据
  const images = [
    { src: m1, alt: '肾病研究图片1', caption: '高精度肾脏切片分析', subtitle: 'AI驱动的细胞级精准识别' },
    { src: m2, alt: '肾病研究图片2', caption: 'AI辅助肾病诊断', subtitle: '深度学习提升诊断准确率' },
    { src: m3, alt: '肾病研究图片3', caption: '肾脏医学影像智能识别', subtitle: '多模态融合分析系统' },
    { src: m4, alt: '肾病研究图片4', caption: '数字化肾病研究平台', subtitle: '云端协作与数据分析' }
  ];

  // 自动轮播
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 6000); // 延长自动轮播时间至6秒

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 处理鼠标移动 - 视差效果
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 20; // 最大移动20px
    const y = ((e.clientY - top) / height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  // 切换到下一张
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 600); // 延长过渡时间
  };

  // 切换到上一张
  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 600); // 延长过渡时间
  };

  // 切换到指定索引
  const goToSlide = (index) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 600);
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1000px',
        height: '550px',
        margin: '80px auto 60px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(14, 165, 233, 0.5)',
        border: '1px solid rgba(14, 165, 233, 0.4)',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        transform: 'perspective(1000px) rotateX(0deg)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(1deg) translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.45), 0 0 80px rgba(14, 165, 233, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) translateY(0)';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(14, 165, 233, 0.5)';
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      {/* 高级装饰边框 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.3) 50%, rgba(14, 165, 233, 0.1) 100%)',
        pointerEvents: 'none',
        zIndex: 25,
        border: '1px solid rgba(14, 165, 233, 0.2)',
        boxShadow: 'inset 0 0 50px rgba(14, 165, 233, 0.1)'
      }} />
      {/* 轮播图片 */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        {images.map((image, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentIndex ? 1 : 0,
              transform: index === currentIndex ? 'translateX(0)' : 
                         index > currentIndex ? 'translateX(100%)' : 'translateX(-100%)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              zIndex: index === currentIndex ? 10 : 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* 图片容器 */}
            <div style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src={image.src}
                alt={image.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'brightness(1.1) contrast(1.05) saturate(1.1)'
                }}
              />
              {/* 渐变遮罩 */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '50%',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent)',
                pointerEvents: 'none'
          }} />
            
            {/* 光效叠加层 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            </div>
            
            {/* 图片标题区域 - 更高级的设计 */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '40px 50px 30px',
              backgroundColor: 'transparent',
              borderTop: '1px solid rgba(14, 165, 233, 0.2)',
              transform: `translateY(${mousePosition.y * 0.2}px)`,
              transition: 'transform 0.1s ease-out'
            }}>
              {/* 标题装饰元素 */}
              <div style={{
                width: '60px',
                height: '4px',
                background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
                marginBottom: '15px',
                borderRadius: '2px',
                boxShadow: '0 0 15px rgba(14, 165, 233, 0.6)'
              }} />
              
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '2rem',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '0.5px',
                textShadow: '0 2px 15px rgba(0, 0, 0, 0.6), 0 0 10px rgba(14, 165, 233, 0.3)',
                fontFamily: 'Arial, sans-serif'
              }}>
                {image.caption}
              </h3>
              
              <p style={{
                margin: 0,
                fontSize: '1.1rem',
                color: 'rgba(165, 243, 252, 0.8)',
                letterSpacing: '0.3px',
                textShadow: '0 1px 5px rgba(0, 0, 0, 0.5)',
                fontWeight: '300'
              }}>
                {image.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 左右控制按钮 - 简单样式 */}
      <button
        onClick={goToPrev}
        style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          color: '#ffffff',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          background: 'none',
          border: 'none',
          padding: '10px',
          outline: 'none'
        }}
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        onClick={goToNext}
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          color: '#ffffff',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          background: 'none',
          border: 'none',
          padding: '10px',
          outline: 'none'
        }}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* 指示器 - 高级设计 */}
        <div style={{
          position: 'absolute',
          bottom: '130px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '15px',
          zIndex: 20,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          padding: '8px 20px',
          borderRadius: '30px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(14, 165, 233, 0.3)'
        }}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: currentIndex === index ? '40px' : '10px',
              height: '8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: currentIndex === index 
                ? 'rgba(14, 165, 233, 1)' 
                : 'rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: currentIndex === index 
                ? '0 0 15px rgba(14, 165, 233, 1), inset 0 0 5px rgba(255, 255, 255, 0.5)' 
                : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (index !== currentIndex) {
                e.currentTarget.backgroundColor = 'rgba(14, 165, 233, 0.5)';
                e.currentTarget.width = '20px';
              }
            }}
            onMouseLeave={(e) => {
              if (index !== currentIndex) {
                e.currentTarget.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.width = '10px';
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* 高级装饰性辉光效果 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 80%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 5,
          animation: 'pulseGlow 4s infinite alternate'
        }} />
        
        {/* 顶部装饰光效 */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '200%',
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.2) 0%, transparent 50%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 处理窗口大小变化
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // 添加CSS动画 - 修改为医疗蓝色系
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes rotateCube {
        from { transform: rotateY(0deg) rotateX(0deg); }
        to { transform: rotateY(360deg) rotateX(360deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.5); }
        50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.8); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(1.05); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      document.head.removeChild(style);
    };
  }, []);

  // 创建粒子背景效果 - 修改为医疗蓝色系
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // 粒子类 - 修改为医疗蓝色系
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        // 随机选择医疗蓝色系颜色
        const colors = [
          `rgba(14, 165, 233, ${Math.random() * 0.4 + 0.1})`,
          `rgba(2, 132, 199, ${Math.random() * 0.4 + 0.1})`,
          `rgba(8, 145, 178, ${Math.random() * 0.4 + 0.1})`
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // 添加辉光效果
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      connect(particles) {
        particles.forEach(particle => {
          const dx = this.x - particle.x;
          const dy = this.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.2 * (1 - distance / 80)})`;
            ctx.lineWidth = 0.5 * (1 - distance / 80);
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
          }
        });
      }
    }

    // 创建粒子
    const particles = [];
    const particleCount = 120;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
        particle.connect(particles);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animate);
    };
  }, [dimensions]);

  const handleLogin = () => {
    navigate('/enter');
  };

  const handleStartAnalysis = () => {
    navigate('/enter');
  };

  return (
    <div style={{
      minHeight: '100vh',
      // 修改为医疗蓝色系渐变
      background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0f172a 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(2, 132, 199, 0.2) 0%, transparent 40%)',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
     

      {/* 粒子背景canvas */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />

      {/* 3D装饰元素 - 医疗蓝色系 */}
      <Cube size={60} color="rgba(14, 165, 233, 0.6)" x={15} y={15} rotation={30} />
      
      <Cube size={50} color="rgba(8, 145, 178, 0.6)" x={20} y={80} rotation={60} />
     
      
      {/* 显微镜图形 - 主要视觉元素 */}
      <Microscope size={180} x={85} y={30} />
      
      {/* 病理分析设备图形 */}
      <PathologyDevice size={120} x={75} y={65} />

      {/* 中央内容区域 */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '150px 20px 100px'
      }}>
        {/* 主要标题部分 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ffffff, #a5f3fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(14, 165, 233, 0.3)',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            AI肾病智能研究
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            融合人工智能与肾病学，开启精准诊断与研究新时代
          </p>
        </div>

        
        
        {/* 中间内容区 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '80px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '800px',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#ffffff',
              opacity: 0.9
            }}>
              精准肾病分析解决方案
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.7
            }}>
              我们的系统融合了深度学习和医学影像分析技术，为肾病研究人员提供高效、精准的辅助分析工具。
              通过AI算法快速识别肾脏病变特征，提高分析准确率，缩短研究时间，助力肾病精准医疗。
            </p>
          </div>

          {/* 开始按钮 - 设计成更具科技感的样式 */}
          <Button
            type="primary"
            size="large"
            onClick={handleStartAnalysis}
            style={{
              padding: '18px 50px',
              fontSize: '1.25rem',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none',
              boxShadow: '0 5px 20px rgba(14, 165, 233, 0.5), 0 0 30px rgba(14, 165, 233, 0.3)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontWeight: '700',
              animation: 'pulseGlow 2s infinite alternate',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            开始分析
          </Button>
        </div>

        {/* 轮播图区域 - 移到开始分析按钮下方 */}
        <ImageCarousel />
        
        {/* 底部版权信息 */}
        <div style={{
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.9rem'
            }}>
              © 2025 AI肾病智能研究 | 精准·智能·创新
            </p>
        </div>
      </div>

      {/* 装饰性光线效果 - 医疗蓝色系 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '80%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'rotate(45deg)',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-20%',
        width: '80%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'rotate(-45deg)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default Home;