import { Upload, Button, Card, Statistic, Row, Col, Divider, Typography, message, Input, Tag } from 'antd';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

import './Get.css';
import axios from 'axios';
import { themeColors } from '../../theme';

const { Title, Paragraph, Text } = Typography;
const { TextArea} = Input;

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000'
})
const Get = () => {

  const { colorPrimary, colorBgContainer, colorText } = themeColors;
 
  
  const [TextAreaValue, setTextAreaValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // 添加页面加载动画效果
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  

  const handleTextAreaChange = (e) => {
      setTextAreaValue(e.target.value);
    };
  
  
  const handleTagClick = (tag) => {
    setTextAreaValue(tag);
  };

  const handleSearch = () => {
    if (TextAreaValue.trim()) {
      setIsSearching(true);
      setSearchError(null);
      
      // 准备请求数据，与Python接口的QueryRequest模型匹配
      const requestData = {
        field_of_interest: TextAreaValue,
        deepseek_api_key: 'sk-9b6cdeb495a241a28fba5ee3342b0155',
        qwen_api_key: '',
        max_docs: 5  
      };
      
      // 发送POST请求到Python接口的multiplepapers端点
      api.post('/multiplepapers', requestData)
        .then(res => {
          console.log('搜索结果:', res.data);
          // 格式化结果以适应前端展示
          const formattedResults = [{
            title: '搜索结果摘要',
            abstract: res.data.final_summary || '暂无摘要信息',
            authors: '系统生成'
          }];
          setSearchResults(formattedResults);
        })
        .catch(err => {
          console.error('搜索出错:', err);
          setSearchError('搜索失败，请确保Python服务已启动并稍后重试');
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1128 0%, #1e293b 50%, #334155 100%)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.15) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.1) 0%, transparent 70%)',
      color: '#e2e8f0',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.8s ease',
      opacity: isLoaded ? 1 : 0,
      transform: isLoaded ? 'translateY(0)' : 'translateY(20px)'
    }}>

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
      <Title level={2} style={{ 
        color: 'white', 
        marginBottom: '16px', 
        textAlign: 'center',
        textShadow: '0 0 15px rgba(56, 189, 248, 0.5)',
        fontWeight: '700'
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
         
          AI赋能智慧学术
        </span>
      </Title>
      
      <Paragraph style={{ 
        marginBottom: '32px', 
        color: '#94a3b8', 
        textAlign: 'center',
        fontSize: '16px'
      }}>
        智能检索最新学术论文资源，助力科研创新
      </Paragraph>

      
      <Card style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        marginBottom: '24px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(56, 189, 248, 0.15)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)'
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
          
          {/* 搜索框标题 */}
          <Title level={4} style={{ 
            color: 'white',
            marginBottom: '24px',
            fontWeight: '600',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 0 8px rgba(56, 189, 248, 0.3)'
          }}>
            智能论文检索
          </Title>
          
          {/* 搜索框主体 */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
            
          }}>
            {/* 科技感装饰边框 */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(167, 139, 250, 0.5))',
              zIndex: -1,
              filter: 'blur(10px)',
              opacity: 0.5
            }}></div>
            
            <TextArea
              rows={4}
              placeholder="输入论文关键词"
              size="large"
              value={TextAreaValue}
              onChange={handleTextAreaChange}
              style={{
                borderRadius: '10px',
                overflow: 'auto',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderColor: 'rgba(56, 189, 248, 0.5)',
                color: 'white',
                minHeight: '120px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                '&::placeholder': {
                  color: 'white',
                  opacity: 0.8
                },
                '&:focus': {
                  borderColor: '#38bdf8',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
                }
              }}
            />
            <Button 
              type="primary" 
              icon={<ArrowRightOutlined />}
              size="large"
              onClick={() => handleSearch()}
              style={{ 
                backgroundColor: '#38bdf8',
                borderColor: '#38bdf8',
                padding: '0 24px',
                height: '48px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: '#25b4f7',
                  borderColor: '#25b4f7',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(56, 189, 248, 0.4)'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  transform: 'rotate(45deg)',
                  animation: 'shine 2s infinite'
                }
              }}
            >
              智能搜索
            </Button>
            
            {/* 热门搜索标签 */}
            <div style={{
              marginTop: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                marginRight: '8px',
                fontWeight: '500',
                
              }}>
                热门搜索:
              </Text>
              {['人工智能', '医学影像', '深度学习', '神经网络', '自然语言处理', '数据挖掘','智能制造','航空航天','计算机视觉','机器学习'].map((tag) => (
                <Tag
                  key={tag}
                  onClick={() =>handleTagClick(tag)}
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    color: '#93c5fd',
                    padding: '6px 16px',
                    borderRadius: '18px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 189, 248, 0.25)',
                      borderColor: '#38bdf8',
                      color: '#bfdbfe',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                    }
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
          
          {/* 科技感装饰线条 */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.7), transparent)',
            opacity: 0.8,
            boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)'
          }}></div>
          
          {/* 科技感网格背景 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3,
            pointerEvents: 'none'
          }}></div>
        </div>
      </Card>

      {/* 搜索结果展示区域 */}
      {isSearching || searchResults.length > 0 || searchError || (TextAreaValue && !isLoaded) ? (
        <Card style={{
          marginTop: '24px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 10px rgba(56, 189, 248, 0.1)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ padding: '24px' }}>
            {/* 搜索结果标题 */}
            {TextAreaValue && (
              <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
                搜索结果: "{TextAreaValue}"
              </Title>
            )}
            
            {/* 加载状态 */}
            {isSearching ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                <Spin size="large" tip="正在搜索..." style={{ color: '#38bdf8' }} />
              </div>
            ) : (
              /* 搜索结果列表 */
              <> 
                {searchError ? (
                  <div style={{ textAlign: 'center', color: '#f87171', padding: '40px 0' }}>
                    {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {searchResults.map((paper, index) => (
                      <Card 
                        key={index} 
                        style={{ 
                          marginBottom: '16px', 
                          backgroundColor: 'rgba(30, 41, 59, 0.8)',
                          borderColor: 'rgba(56, 189, 248, 0.2)',
                          color: 'white'
                        }}
                      >
                        <Title level={5} style={{ color: '#38bdf8', marginBottom: '8px' }}>
                          {paper.title || '无标题'}
                        </Title>
                        <Paragraph style={{ color: '#cbd5e1', marginBottom: '8px' }}>
                          {paper.abstract || '无摘要信息'}
                        </Paragraph>
                        {paper.authors && (
                          <Text style={{ color: '#94a3b8' }}>
                            作者: {paper.authors}
                          </Text>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : TextAreaValue ? (
                  <Empty 
                    description="暂无搜索结果"
                    style={{ color: '#94a3b8' }}
                  />
                ) : null}
              </>
            )}
          </div>
        </Card>
      ) : null}

      <Card style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 10px rgba(56, 189, 248, 0.1)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        textAlign: 'center',
        padding: '24px'
      }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
         <Title level={1} style={{ color: 'white', marginBottom: '24px' ,textShadow: '0 0 15px rgba(56, 189, 248, 0.5)'}}>热门领域</Title>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <Card 
            title={<span style={{ color: 'white' }}>人工智能应用</span>} 
            bordered={false} 
            style={{   background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(167, 139, 250, 0.5))',borderRadius: '8px',color: 'white' }}
          >
            <Paragraph style={{ color: 'white' }}>探索人工智能在各个行业的创新应用，包括自然语言处理、计算机视觉、机器学习等方向的最新研究成果和实践案例。</Paragraph>
          </Card>
          
          <Card 
            title={<span style={{ color: 'white' }}>数据科学与分析</span>} 
            bordered={false} 
            style={{   background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(167, 139, 250, 0.5))',borderRadius: '8px',color: 'white' }}
          >
            <Paragraph style={{ color: 'white' }}>专注于大数据分析、数据可视化、预测建模等技术，帮助企业和组织从海量数据中挖掘价值，支持决策优化。</Paragraph>
          </Card>
          
          <Card 
            title={<span style={{ color: 'white' }}>云计算与分布式系统</span>} 
            bordered={false} 
            style={{  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(167, 139, 250, 0.5))', borderRadius: '8px',color: 'white' }}
          >
            <Paragraph style={{ color: 'white' }}>研究云计算架构、容器技术、微服务设计等，构建高性能、高可用、可伸缩的现代分布式系统解决方案。</Paragraph>
          </Card>
        </div>
      </div>
       
      </Card>
    </div>
  );
};

// 添加动画关键帧定义
const style = document.createElement('style');
style.textContent = `
  @keyframes shine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }
`;
document.head.appendChild(style);

export default Get;