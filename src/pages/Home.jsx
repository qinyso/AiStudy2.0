import React from 'react'
import{Upload,Button,Card,Typography,Row,Col} from 'antd';
import { themeColors } from '../theme';
const {Title,Paragraph,Text} = Typography;
import { UploadOutlined } from '@ant-design/icons';
const Home = () => {
  return (
    <>
      <Title level={2} style={{color: themeColors.colorText}}>医学影像分析与报告</Title>
      <Paragraph style={{color:'#94a3b8' }}>点击确定后将对上传医学影像（JPG/PNG），点击确定后将对肾脏组织进行分割，并生成所示报告展示。</Paragraph>
      <Card style={{backgroundColor: '#334155', color: '#94a3b8',
        borderColor: '#334155',
        marginBottom: '24px'}}>
      <Row gutter={[16, 16]}>
        <Col xm={24} md={12}>
          <Card style={{   backgroundColor: '#1e293b', 
        borderColor: '#334155',
        marginBottom: '24px',border: `3px dotted ${themeColors.colorBorder}`, height: '400px',marginBottom: '0px',width:'30vw' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              position: 'relative'
            }}>
              <Text style={{color:themeColors.colorText}}> 点击或拖拽图片到此处上传<br />
                支持JPG/PNG，建议不超过10MB</Text> 
              </div>
          </Card>
          <Upload
                action="#"
                listType="picture" 
                style={{  }}
              >
                <Button type="primary" icon={<UploadOutlined />} style={{width:'30vw'}}>
                  选择图片
                </Button>
              </Upload>
        </Col>
        
        <Col xm={24} md={12}>
          <Card style={{ backgroundColor: themeColors.colorBgContainer, border: `1px solid ${themeColors.colorBorder}`, height: '400px' ,width:'30vw'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <img alt="示例医学影像" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          </Card>
        </Col>
      </Row>
      </Card>
    </>
  )
}
export default Home;
