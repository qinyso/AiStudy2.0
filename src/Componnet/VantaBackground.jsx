import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/src/vanta.net';
import WAVES from 'vanta/src/vanta.waves';
import CLOUDS from 'vanta/src/vanta.clouds';

/**
 * Vanta.js动态背景组件
 * @param {Object} props - 组件属性
 * @param {string} props.effect - 效果类型: 'net' | 'birds' | 'waves' | 'clouds'
 * @param {Object} props.options - 效果配置选项
 * @param {string} props.className - 额外的CSS类名
 */
const VantaBackground = ({ 
  effect = 'net', // 默认使用net效果，避免birds效果的兼容性问题
  options = {}, 
  className = '' 
}) => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    // 根据effect选择对应的Vanta效果
    const effectMap = {
      net: NET,
      waves: WAVES,
      clouds: CLOUDS
    };
    
    // 如果请求的是birds效果，回退到net效果以避免兼容性问题
    const safeEffect = effect === 'birds' ? 'net' : effect;

    const VantaEffect = effectMap[safeEffect] || NET;

    // 创建THREE的包装版本以解决兼容性问题，避免直接修改THREE对象
    const wrappedTHREE = { ...THREE };
    // 确保PlaneBufferGeometry可用（在新版本THREE中已重命名为PlaneGeometry）
    if (!wrappedTHREE.PlaneBufferGeometry && wrappedTHREE.PlaneGeometry) {
      wrappedTHREE.PlaneBufferGeometry = wrappedTHREE.PlaneGeometry;
    }

    // 合并默认配置和自定义配置
    const defaultOptions = {
      el: vantaRef.current,
      THREE: wrappedTHREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00
    };

    // 根据不同效果设置特定的默认配置
    if (effect === 'net') {
      Object.assign(defaultOptions, {
        color: 0x0ea5e9,
        backgroundColor: 0x0f172a,
        points: 15.00,
        maxDistance: 22.00,
        spacing: 15.00
      });
    } else if (effect === 'birds') {
      Object.assign(defaultOptions, {
        backgroundColor: 0x0f172a,
        color1: 0x0ea5e9,
        color2: 0x0284c7,
        wingSpan: 30.00,
        separation: 60.00,
        alignment: 50.00,
        cohesion: 35.00
      });
    } else if (effect === 'waves') {
      Object.assign(defaultOptions, {
        color: 0x0ea5e9,
        backgroundColor: 0x0f172a,
        shininess: 20.00,
        waveHeight: 20.00,
        waveSpeed: 0.30,
        zoom: 0.75
      });
    } else if (effect === 'clouds') {
      Object.assign(defaultOptions, {
        color1: 0x0f172a,
        color2: 0x0c4a6e,
        waveSpeed: 0.75,
        zoom: 0.85
      });
    }

    // 初始化Vanta效果
    vantaEffect.current = VantaEffect({
      ...defaultOptions,
      ...options
    });

    // 组件卸载时清理
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, [effect, options]);

  return (
    <div 
      ref={vantaRef} 
      className={`vanta-container ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0
      }}
    />
  );
};

export default VantaBackground;