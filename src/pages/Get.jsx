import { Upload, Button, Card, Statistic, Row, Col, Divider, Typography, message, Input } from 'antd';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { themeColors } from '../theme';
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const Get = () => {
  // 从主题配置中获取主色调
  const { colorPrimary, colorBgContainer, colorText } = themeColors;
 
  
  


  return (
    <div style={{
      minHeight: '100vh',
      // 黑色为主的渐变蓝色科技感背景
      background: 'linear-gradient(135deg, #05070a 0%, #0a1128 50%, #0f172a 100%)',
      // 添加科技感光效
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(11, 88, 252, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(11, 88, 252, 0.1) 0%, transparent 60%)',
      color: '#e2e8f0',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 科技感装饰线条 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(11, 88, 252, 0.3) 50%, transparent 100%)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '90%',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(11, 88, 252, 0.3) 50%, transparent 100%)'
      }}></div>
      <Title level={2} style={{ color: 'white', marginBottom: '32px', textAlign: 'center' }}>
   AI赋能智慧学术
      </Title>
      
      <Paragraph style={{ marginBottom: '24px', color: '#94a3b8' ,textAlign: 'center' }}>
       搜索最新论文资源
      </Paragraph>

      
      <Card style={{ 
        backgroundColor: colorBgContainer,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: '24px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }}>
        <div style={{
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '300px'
        }}>
          {/* 科技感背景效果 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            
            pointerEvents: 'none'
          }}></div>
          
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(11, 88, 252, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          
          {/* 搜索框标题 */}
          <Title level={4} style={{ 
            color: colorText,
            marginBottom: '24px',
            fontWeight: '500',
            position: 'relative',
            zIndex: 1
          }}>
            智能论文检索
          </Title>
          
          {/* 搜索框主体 */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
            zIndex: 1
          }}>
            <Search
              placeholder="输入关键词搜索论文..."
              enterButton={
                <Button 
                  type="primary" 
                  icon={<ArrowRightOutlined />}
                  style={{ 
                    backgroundColor: colorPrimary,
                    borderColor: colorPrimary,
                    padding: '0 24px',
                    height: '48px',
                    borderRadius: '8px'
                  }}
                >
                  搜索
                </Button>
              }
              size="large"
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                '& .ant-input-search-input': {
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: colorText,
                  height: '48px',
                  fontSize: '16px',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)'
                  }
                },
                '& .ant-input-search-button': {
                  height: '48px'
                }
              }}
            />
            
            {/* 热门搜索标签 */}
            <div style={{
              marginTop: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', marginRight: '8px' }}>
                热门搜索:
              </Text>
              {['人工智能', '医学影像', '深度学习', '神经网络', '自然语言处理'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: 'rgba(11, 88, 252, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: '1px solid rgba(11, 88, 252, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(11, 88, 252, 0.2)',
                      borderColor: 'rgba(11, 88, 252, 0.4)'
                    }
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* 科技感装饰线条 */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(11, 88, 252, 0.5), transparent)',
            opacity: 0.6
          }}></div>
        </div>
      </Card>

   
      <Card style={{ 
        backgroundColor: '#1e293b', 
        borderColor: '#334155'
      }}>
       
      </Card>
    </div>
  );
};

export default Get;