import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import VantaBackground from '../../Componnet/VantaBackground';

const Enter = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const primaryColor = '#0ea5e9';
  
  // 添加CSS动画 - 医疗蓝色系
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.5); }
        50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.8); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/login', {
        username: values.username,
        password: values.password,
      });
      
      console.log('登录成功响应:', response.data);
      
      // 存储登录信息 - 统一与Register.jsx的处理逻辑
      if (response.data && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('userInfo', JSON.stringify({
          user_id: response.data.data.user_info?.id || '',
          username: response.data.data.user_info?.username || values.username
        }));
      } else {
        // 兼容旧的响应格式
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify({
          user_id: response.data.user_info?.id || '',
          username: response.data.user_info?.username || values.username
        }));
      }
      
      message.success('登录成功！正在进入系统...');
      
      // 添加短暂延迟确保消息显示后再跳转
      setTimeout(() => {
        navigate('/AIchat');
      }, 1000);

    } catch (error) {
      if (error.response) {
        message.error(error.response.data.detail || '登录失败，请检查账号密码');
      } else if (error.request) {
        message.error('网络连接失败，请检查您的网络');
      } else {
        message.error('登录失败，请稍后重试');
      }
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const onFinishFailed = (errorInfo) => {
    console.log('登录表单验证失败:', errorInfo);
  };

  return (
    <div style={{
      color: '#ffffff',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      height: '100%',
      minHeight: 'calc(100vh - 64px)' // 减去TopBar的高度
    }}>
      {/* 装饰性元素 - 左侧 */}
      <div style={{
        position: 'absolute',
        left: '10%',
        top: '30%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.8
      }} />
      
      {/* 装饰性元素 - 右侧 */}
      <div style={{
        position: 'absolute',
        right: '15%',
        bottom: '20%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, transparent 70%)',
        animation: 'float 7s ease-in-out infinite reverse',
        opacity: 0.7
      }} />

      {/* 登录表单容器 */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(14, 165, 233, 0.3)',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.8s ease-out',
        backdropFilter: 'blur(10px)'
      }}>
        {/* 标题区域 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          position: 'relative'
        }}>
          <h1 style={{
            color: primaryColor,
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
          }}>
            登录到 AI肾病研究
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: 0
          }}>
            欢迎回来，请登录您的账号
          </p>
        </div>

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            remember: true
          }}
        >
          <Form.Item
            name="username"
            label={
              <span style={{
                color: '#334155',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                用户名/手机号/邮箱
              </span>
            }
            rules={[
              {
                required: true,
                message: '请输入您的账号',
                whitespace: true
              }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: primaryColor }} />}
              placeholder="请输入账号"
              style={{
                height: '44px',
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                fontSize: '15px',
                '&:focus': {
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 2px rgba(14, 165, 233, 0.2)`
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span style={{
                color: '#334155',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                密码
              </span>
            }
            rules={[
              {
                required: true,
                message: '请输入密码'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: primaryColor }} />}
              placeholder="请输入密码"
              visibilityToggle={{
                visible: passwordVisible,
                onVisibleChange: setPasswordVisible
              }}
              style={{
                height: '44px',
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                fontSize: '15px',
                '&:focus': {
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 2px rgba(14, 165, 233, 0.2)`
                }
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '24px' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{
                color: '#64748b',
                '& ': {
                  borderRadius: '4px',
                  '&:checked': {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }
                }
              }}>
                记住我
              </Checkbox>
            </Form.Item>
            <Link
              to="/forgot-password"
              style={{
                float: 'right',
                color: primaryColor,
                fontSize: '14px',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#0284c7'
                }
              }}
            >
              忘记密码？
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                background: `linear-gradient(90deg, ${primaryColor}, #0284c7)`,
                border: 'none',
                boxShadow: `0 4px 12px rgba(14, 165, 233, 0.4)`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: `linear-gradient(90deg, #0284c7, #0c4a6e)`,
                  boxShadow: `0 6px 16px rgba(14, 165, 233, 0.6)`,
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              登录
            </Button>
          </Form.Item>

          {/* 其他登录方式 */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              marginBottom: '16px',
              position: 'relative',
              '&::before, &::after': {
                content: '',
                position: 'absolute',
                top: '50%',
                width: '35%',
                height: '1px',
                backgroundColor: '#e2e8f0'
              },
              '&::before': {
                left: 0
              },
              '&::after': {
                right: 0
              }
            }}>
              其他登录方式
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <Button
                icon={<PhoneOutlined />}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  color: primaryColor,
                  border: 'none',
                  '&:hover': {
                    backgroundColor: `rgba(14, 165, 233, 0.2)`,
                    transform: 'translateY(-2px)'
                  }
                }}
              />
              <Button
                icon={<MailOutlined />}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  color: primaryColor,
                  border: 'none',
                  '&:hover': {
                    backgroundColor: `rgba(14, 165, 233, 0.2)`,
                    transform: 'translateY(-2px)'
                  }
                }}
              />
            </div>
          </div>

          {/* 注册链接 */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            还没有账号？
            <Link
              to="/register"
              style={{
                color: primaryColor,
                fontWeight: 600,
                marginLeft: '4px',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#0284c7'
                }
              }}
            >
              立即注册
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Enter;
