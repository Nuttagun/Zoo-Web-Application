import React, { useEffect, useState } from 'react';
import { Layout, Menu, Breadcrumb, theme, Dropdown, message, Modal, Typography, Button, Card, Avatar, Divider, Space, Row, Col } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { CarOutlined, MailOutlined, PhoneOutlined, PoweroffOutlined, UserOutlined } from '@ant-design/icons';
import logo from "../../assets/LogoZooManage.png";
import { getUserById } from "../../services/https/index";
import { UsersInterface } from "../../interface/IUser";

const { Header, Content } = Layout;

const TopBar: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('vehicle');
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [userid, setUserid] = useState<number>(Number(localStorage.getItem("userid")) || 0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userRole");
    localStorage.clear();

    message.success("ออกจากระบบ");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const getUser = async () => {
    let res = await getUserById(userid.toString());
    console.log(res);
    if (res) {
      setUser(res);
    }
  };

  useEffect(() => {
    setUserid(Number(localStorage.getItem("userid")));
    getUser();
  }, []);

  const items1 = [
    {
      key: 'vehicle',
      label: (
        <Link to="/vehiclemanager" style={{ marginLeft: '30px', fontSize: '16px' }}>
          <CarOutlined style={{ marginRight: 8 }} />
          Vehicle
        </Link>
      ),
      style: selectedKey === 'vehicle' ? { color: '#ffcc00' } : {}
    }, 
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="login">
        <li
          onClick={handleLogout}
        >
          <PoweroffOutlined style={{ marginRight: 8 }} />
          Log Out
        </li>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#B25900',
        }}
      >

        <img src={logo} className="logo" alt="Course Logo" style={{ width: '50px', height: 'auto' }} />

        <Menu
          mode="horizontal"
          items={items1}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: '#B25900',
            borderRadius: '12px',
            color: '#fff',
            marginLeft: '20px',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center', 
            marginLeft: 'auto', 
          }}
        >
          <button style={{ color: '#F9F9FA', fontSize: '16px', marginRight: '10px' }} onClick={showModal}>
            {user?.FirstName} {user?.LastName}
          </button>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
              <img
                src={`http://localhost:8000/${user?.Profile}`}
                style={{
                  width: '45px',
                  height: '45px', 
                  borderRadius: '50%', 
                  border: '3px solid #ffffff',
                  objectFit: 'cover', 
                }}
                alt="User Profile"
              />
            </a>
          </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: '0 48px', paddingBottom: '24px' }}>
        <Breadcrumb style={{ margin: '16px 0' }} />
        <Layout
          style={{
            padding: '24px',
            background: colorBgContainer,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Content>

      {/* หน้าแก้ไขโปรไฟล์ */}
      <Modal
          title={<Typography.Title level={3}>User Profile</Typography.Title>}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              if (user) {
                setIsModalVisible(false); // ปิด Modal
                navigate(`/vehiclemanager/editprofile/${user.ID}`); // เปลี่ยนเส้นทาง
              }
            }} style={{ backgroundColor: "#fabb18" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ffcc33"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fabb18"}>
              Edit Profile
            </Button>,
            <Button key="close" onClick={handleCancel} type="primary" style={{ backgroundColor: "#E63946" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FF4D4F")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E63946")}>
              Close
            </Button>,
          ]}
        >
          {user ? (
            <Card bordered={false} style={{ textAlign: "center" }}>
              <Avatar size={120} src={user?.Profile ? `http://localhost:8000/${user.Profile}` : undefined} icon={!user?.Profile && <UserOutlined />} />
              <Typography.Title level={4} style={{ marginTop: "10px" }}>
                {user.FirstName}
              </Typography.Title>
              <Divider />
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Row>
                  <Col span={24} style={{ textAlign: "left" }}>
                    <Typography.Text>
                      <MailOutlined style={{ marginRight: 8 }} /> {user.Email}
                    </Typography.Text>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} style={{ textAlign: "left" }}>
                    <Typography.Text>
                      <PhoneOutlined style={{ marginRight: 8 }} /> {user.PhoneNumber}
                    </Typography.Text>
                  </Col>
                </Row>
              </Space>
            </Card>
          ) : (
            <Typography.Text>Loading...</Typography.Text>
          )}
        </Modal>
    </Layout>
  );
};

export default TopBar;