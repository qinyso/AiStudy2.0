import React, { useEffect, useRef, useState } from 'react'
import { Input, Button, Space, Avatar, Typography, message } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons'
import './AIchat.css'
import axios from 'axios'
const { TextArea } = Input
const { Text } = Typography

const AIchat = () => {
  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: '您好!我是AI病理辅助诊断助手。请问您有什么需要帮助的吗?我可以为您解答病理分析相关的问题。',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // 创建粒子背景效果 - 与首页一致的医疗蓝色系
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // 粒子类 - 医疗蓝色系
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

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 模拟AI回复
  const getAIResponse = async (userMessage) =>{
  try{
    const response=await axios.post ('https://api.dify.ai/v1/chat-messages',
     {
        inputs: {},
        query:userMessage,
        response_mode:'blocking',
        user:'user-'+Date.now().toString().substr(-6)
      },
      {
        headers:{
          'content-type':'application/json',
          'Authorization':'Bearer app-YOEh7tCdTLim1yASHLrSshxL'
        },
        timeout:10000,
      }      
    );
    // 从answer字段提取回                 
    let content = response.data.answer || response.data.content || response.data.choices?.[0]?.message?.content;
      
      // 从answer字段的</think>标记后提取中文部分
      if (content) {
        // 处理</think>标记
        if (content.includes('</think>')) {
          // 使用字符串方法提取</think>后的内容
          const index = content.indexOf('</think>');
          if (index !== -1) {
            // 提取</think>后的所有内容
            content = content.substring(index + 3).trim();
          }
        }
        
        // 移除可能的hink>前缀
        if (content.startsWith('hink>')) {
          content = content.substring(5).trim();
        }
        
        // 移除星号符号
        if (content.includes('*')) {
          content = content.replace(/\*/g, '').trim();
        }
        
        // 更全面的格式清理，移除任何可能的标签或标记
        content = content.replace(/^\s*<[^>]+>\s*/, '').trim();
      }
    
    
    
    return content || '抱歉，我无法理解您的问题。请尝试使用更清晰的方式描述您的需求。'
  }catch(error){
    console.error('获取AI回复失败:', error)
     if (error.response) {
      // 服务器返回了错误响应
      return `请求失败: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return '网络连接失败，请检查您的网络设置。';
    } else {
      // 请求配置出错                        
      return '请求配置错误，请稍后再试。';
    }
  }
    
  }


  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)
    
    try {
      const responseContent = await getAIResponse(inputValue);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: '抱歉，我无法处理您的请求。请稍后再试。',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false)
    }
  }

  // 处理Enter键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      color: '#ffffff',
      padding: '24px',
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
      
      {/* 标题 */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: 0,
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(14, 165, 233, 0.3)'
        }}>AI肾病分析助手</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '10px' }}>智能对话 · 精准分析 · 辅助诊断</p>
      </div>
      
      {/* 主要聊天区域 */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10,
        maxWidth: '1200px', 
        margin: '0 auto',
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(14, 165, 233, 0.3)'
      }}>
        
        {/* 聊天消息列表 */}
        <div style={{ 
          flex: 1,
          padding: '30px',
          overflowY: 'auto',
          backgroundColor: 'rgba(15, 23, 42, 0.7)'
        }}>
          {messages.map(message => (
            <div 
              key={message.id}
              style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {message.type === 'ai' && (
                <Avatar 
                  icon={<RobotOutlined />} 
                  style={{ 
                    backgroundColor: 'rgba(14, 165, 233, 0.8)',
                    marginRight: '12px',
                    boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)'
                  }} 
                />
              )}
              
              <div style={{
                  maxWidth: '70%',
                  backgroundColor: message.type === 'user' 
                    ? 'rgba(14, 165, 233, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: message.type === 'user' 
                    ? '20px 20px 0 20px' 
                    : '20px 20px 20px 0',
                  padding: '16px 20px',
                  border: message.type === 'user' 
                    ? '1px solid rgba(14, 165, 233, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: message.type === 'user' 
                    ? '0 4px 15px rgba(14, 165, 233, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}>
                <div style={{ color: '#ffffff', lineHeight: 1.6 }}>
                  {message.content}
                </div>
                <div style={{
                  marginTop: '8px',
                  textAlign: 'right'
                }}>
                  <Text style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {message.timestamp}
                  </Text>
                </div>
              </div>
              
              {message.type === 'user' && (
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    marginLeft: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }} 
                />
              )}
            </div>
          ))}
          
          {/* AI正在输入提示 */}
          {isLoading && (
            <div style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start'
            }}>
              <Avatar 
                icon={<RobotOutlined />} 
                style={{ 
                  backgroundColor: 'rgba(14, 165, 233, 0.8)',
                  marginRight: '12px',
                  boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)'
                }} 
              />
              <div style={{
                maxWidth: '70%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px 20px 20px 0',
                padding: '16px 20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', animation: 'blink 1.4s infinite' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', animation: 'blink 1.4s infinite 0.2s' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', animation: 'blink 1.4s infinite 0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 输入区域 */}
        <div style={{ 
          padding: '24px 30px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderTop: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: '0 0 20px 20px'
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleKeyPress}
              placeholder="请输入您的问题..."
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(14, 165, 233, 0.5)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '1rem',
                resize: 'none',
                minHeight: '80px',
                maxHeight: '200px',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  icon={<FileTextOutlined />}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(14, 165, 233, 0.5)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(14, 165, 233, 0.2)'
                    }
                  }}
                  disabled
                >
                  上传图片
                </Button>
                
                <Button
                  icon={<InfoCircleOutlined />}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(14, 165, 233, 0.5)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(14, 165, 233, 0.2)'
                    }
                  }}
                  onClick={() => message.info('这是一个AI肾病辅助诊断助手，可以回答您关于肾病分析的问题。')}
                >
                  帮助
                </Button>
              </div>
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={isLoading}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(14, 165, 233, 0.6)',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                发送
              </Button>
            </div>
          </Space>
        </div>
      </div>
      
      {/* 添加动画样式 */}
      <style>{`
        @keyframes blink {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default AIchat