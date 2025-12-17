import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Space } from 'antd';
import { 
  PhoneOutlined, 
  LockOutlined, 
  SendOutlined,
  InfoCircleOutlined,
  WechatOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import axiosInstance from '../utils/axiosInstance';
import VantaBackground from '../Componnet/VantaBackground';

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const primaryColor = '#0ea5e9';
  
  // CSS动画效果
  useEffect(() => {
    
    // 添加CSS动画 - 医疗蓝色系
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


  
  // 倒计时效果
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 调用后端注册API
      const response = await axiosInstance.post('/api/register', {
        username: values.username,
        password: values.password,
        email: values.email,
        full_name: values.username
      });
      
      console.log('注册成功响应:', response.data);
      
      // 注册成功后立即登录
      const loginResponse = await axiosInstance.post('/api/login', {
        username: values.username,
        password: values.password
      });
      
      console.log('登录成功响应:', loginResponse.data);
      
      // 存储登录信息 - 根据API文档，正确使用data字段下的数据
      if (loginResponse.data && loginResponse.data.data) {
        localStorage.setItem('token', loginResponse.data.data.token);
        localStorage.setItem('userInfo', JSON.stringify({
          user_id: loginResponse.data.data.user_info?.id || '',
          username: loginResponse.data.data.user_info?.username || values.username
        }));
      } else {
        throw new Error('登录响应格式错误');
      }
      
      message.success('注册成功！正在进入系统...');
      
      // 延迟一小段时间确保消息显示后再跳转
      setTimeout(() => {
        navigate('/AIchat');
      }, 1000);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.detail || '注册失败，请稍后重试');
      } else if (error.request) {
        message.error('网络连接失败，请检查您的网络');
      } else {
        message.error('注册失败，请稍后重试');
      }
      console.error('注册错误:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const onFinishFailed = (errorInfo) => {
    console.log('注册表单验证失败:', errorInfo);
  };
  
  const handleGetCode = () => {
    // 验证手机号格式
    const phone = form.getFieldValue('phone');
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.error('请输入正确的手机号');
      return;
    }
    
    // 开始倒计时
    setCountdown(60);
    // 模拟发送验证码
    message.success('验证码已发送');
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

      {/* 主容器 - 左右两栏布局 */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 左侧宣传区域 */}
        <div style={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '40px',
            width: '100%',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(14, 165, 233, 0.3)',
            animation: 'fadeIn 0.8s ease-out',
            position: 'relative',
            zIndex: 10
          }}>
            <h2 style={{
              color: primaryColor,
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '20px',
              textShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
            }}>
              开启智能病理分析体验
            </h2>
            
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              lineHeight: 1.6,
              marginBottom: '30px'
            }}>
              注册即免费赠送10000+病理样本分析
            </p>
            
            {/* 功能特点列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${primaryColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <InfoCircleOutlined style={{ color: primaryColor, fontSize: '18px' }} />
                </div>
                <div>
                  <h3 style={{ color: '#334155', fontWeight: 600, margin: '0 0 4px 0' }}>精准病理诊断</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>AI辅助识别病变特征，提高诊断准确率</p>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${primaryColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <InfoCircleOutlined style={{ color: primaryColor, fontSize: '18px' }} />
                </div>
                <div>
                  <h3 style={{ color: '#334155', fontWeight: 600, margin: '0 0 4px 0' }}>智能分析系统</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>快速处理病理图像，自动生成分析报告</p>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${primaryColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <InfoCircleOutlined style={{ color: primaryColor, fontSize: '18px' }} />
                </div>
                <div>
                  <h3 style={{ color: '#334155', fontWeight: 600, margin: '0 0 4px 0' }}>全流程管理</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>从样本上传到报告生成的完整解决方案</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧注册表单 */}
        <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '40px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(14, 165, 233, 0.3)',
            animation: 'fadeIn 0.8s ease-out',
            position: 'relative',
            zIndex: 10
          }}>
          {/* 标题区域 */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              color: primaryColor,
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '8px',
              textShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
            }}>
              AI肾病研究平台
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              margin: 0
            }}>
              使用手机号登录/注册
            </p>
          </div>

          {/* 注册表单 */}
          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{
              agree: false
            }}
          >
            {/* 手机号输入 */}
            <Form.Item
              name="username"
              label={
                <span style={{
                  color: '#334155',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  用户名
                </span>
              }
              rules={[
                {
                  required: true,
                  message: '请输入用户名'
                },
                {
                  min: 3,
                  max: 20,
                  message: '用户名长度应在3-20个字符之间'
                },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: '用户名只能包含字母、数字和下划线'
                }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: primaryColor }} />}
                placeholder="请输入用户名"
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
            
            {/* 邮箱输入 */}
            <Form.Item
              name="email"
              label={
                <span style={{
                  color: '#334155',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  邮箱
                </span>
              }
              rules={[
                {
                  required: true,
                  message: '请输入邮箱',
                  type: 'email'
                }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: primaryColor }} />}
                placeholder="请输入邮箱"
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

            {/* 密码输入 */}
            <Form.Item
              name="password"
              label={
                <span style={{
                  color: '#334155',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  设置密码
                </span>
              }
              rules={[
                {
                  required: true,
                  message: '请设置密码'
                },
                {
                  min: 6,
                  max: 20,
                  message: '密码长度应在6-20个字符之间'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: primaryColor }} />}
                placeholder="请设置6-20位密码"
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

            {/* 同意协议 */}
            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意用户协议'))
                }
              ]}
            >
              <Checkbox style={{
                color: '#64748b',
                '& .antCheckboxInner': {
                  borderRadius: '4px',
                  '&:checked': {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }
                }
              }}>
                同意
                <a href="#" style={{ color: primaryColor, margin: '0 4px' }}>《用户协议》</a>
                及
                <a href="#" style={{ color: primaryColor, margin: '0 4px' }}>《隐私政策》</a>
              </Checkbox>
            </Form.Item>

            {/* 注册按钮 */}
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
                进入AI肾病研究平台
              </Button>
            </Form.Item>

            {/* 其他登录方式 */}
            <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span style={{ margin: '0 16px', fontSize: '14px', color: '#64748b' }}>
                  其他登录方式
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <Button
                  icon={<WechatOutlined />}
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    backgroundColor: 'rgba(15, 23, 42, 0.1)',
                    color: '#07c160',
                    '&:hover': {
                      borderColor: '#07c160',
                      backgroundColor: 'rgba(7, 193, 96, 0.1)'
                    }
                  }}
                />
              </div>
            </div>

            {/* 底部提示 */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                已有账号？
                <Link to="/enter" style={{ color: primaryColor, marginLeft: '4px', fontWeight: 500 }}>
                  立即登录
                </Link>
              </span>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;