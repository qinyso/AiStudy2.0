import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { themeColors } from '../theme';
// 导入assets中的图片
import m1 from '../assets/m1.jpeg';
import m2 from '../assets/m2.jpeg';
import m3 from '../assets/m3.jpeg';
import m4 from '../assets/m4.jpeg';







// 轮播图组件 - 更具高级感的设计
const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 轮播图片数据
  const images = [
    { src: m1, alt: '病理研究图片1', caption: '肾病病理分析', subtitle: '高精度肾脏切片分析，AI驱动的细胞级精准识别' },
    { src: m2, alt: '病理研究图片2', caption: '脑部病理分析', subtitle: 'AI辅助脑部病变诊断，深度学习提升诊断准确率' },
    { src: m3, alt: '病理研究图片3', caption: '其他病理分析', subtitle: '多部位医学影像智能识别，多模态融合分析系统' },
    { src: m4, alt: '病理研究图片4', caption: '数字化病理研究平台', subtitle: '云端协作与多部位病理数据分析' }
  ];

  // 自动轮播
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 3000); // 延长自动轮播时间至6秒

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


  // 添加CSS动画 - 修改为医疗蓝色系
  useEffect(() => {
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
      document.head.removeChild(style);
    };
  }, []);

  const handleLogin = () => {
    navigate('/enter');
  };

  const handleStartAnalysis = () => {
    navigate('/enter');
  };

  return (
    <div style={{
      minHeight: '100vh',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      height: '100%'
    }}>
      


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
            AI病理分析
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            融合人工智能与病理学，开启多部位精准诊断与研究新时代
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
              多部位精准病理分析解决方案
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.7
            }}>
              我们的系统融合了深度学习和医学影像分析技术，为病理研究人员提供高效、精准的辅助分析工具。
              覆盖肾病病理分析、脑部病理分析和其他病理分析，通过AI算法快速识别病变特征，
              提高分析准确率，缩短研究时间，助力多部位病理精准医疗。
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
              © 2025 AI病理分析 | 精准·智能·创新
            </p>
        </div>
      </div>

     
      
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