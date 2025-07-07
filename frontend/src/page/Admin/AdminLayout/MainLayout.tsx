import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Button, Avatar, Modal, Typography, Card, Divider, Space, Row, Col } from 'antd';
import { HomeOutlined, CreditCardOutlined, IdcardOutlined, TeamOutlined, UserOutlined, PoweroffOutlined, OrderedListOutlined, WechatWorkOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import Zoologo from "../../../assets/LogoZooManage.png"
import "./AdminLayout.css"
import { UsersInterface } from '../../../interface/IUser';
import { GetUserById } from '../../../services/https/Garfield/http';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('isLogin');
    localStorage.removeItem('userRole');
    window.location.href = "/login";
  };
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [user, setUser] = useState<UsersInterface | null>(null);
  const [userid, setUserid] = useState<number>(Number(localStorage.getItem("userid")) || 0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const getUser = async () => {
    let res = await GetUserById(Number(userid));
    console.log(res);
    if (res) {
      setUser(res);
    }
  };

  useEffect(() => {
    setUserid(Number(localStorage.getItem("userid")));
    getUser();
  }, []);

  type MenuItem = Required<MenuProps>['items'][number];
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
    } as MenuItem;
  }

  const items: MenuItem[] = [
    getItem('Home', 'dashboard', <HomeOutlined />),
    getItem('User', 'userlist', <UserOutlined />),
    getItem('Add Employee', 'addemployee', <IdcardOutlined />),
    getItem('Employee', 'sub2', <TeamOutlined />, [
      getItem('Admin', 'adminlist'),
      getItem('Zookeeper', 'zookeeperlist'),
      getItem('Veterinarian', 'vetlist'),
      getItem('ZooSale', 'zoosalelist'),
      getItem('VahicleManeger', 'vahimanelist'),
    ]),
    getItem('Payment Confirm', 'paymentconfirm', <CreditCardOutlined />),
    getItem('Promotions', 'promotionlist', <OrderedListOutlined />),
    getItem('Chat', '/admin/admin_chat', <WechatWorkOutlined />,),
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key); // Navigate to the selected route
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ backgroundColor: '#5a7547' }}>
        <img src={Zoologo} alt="Logo" style={{ width: "80%", marginLeft: "10px", marginTop: "15px" }} />
        <></>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={items}
          onClick={handleMenuClick}
          style={{
            backgroundColor: '#5a7547',
          }}
          className="custom-menu"
        />


        {/* <Menu.Item key="logout"
          icon={<PoweroffOutlined />}
          style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}
          onClick={handleLogout}
        >
          {!collapsed && 'Logout'}
        </Menu.Item> */}
      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Avatar
            onClick={showModal}
            style={{
              width: "50px",
              height: "50px",
              marginLeft: "20px",
            }}
            src={user?.Profile ? `http://localhost:8000/${user.Profile}` : undefined}
            icon={!user?.Profile && <UserOutlined />}
            alt="User Profile"
          />
           <p style={{
              marginRight: "1100px",
            }}>{user?.Username}</p>
          <Button
            className="logoutbutton"
            onClick={handleLogout}
            style={{
              width: "10%",
              margin: 4,
              backgroundColor: "#fabb18",
              display: "flex",
              alignItems: "center",
            }}
            icon={<PoweroffOutlined />}
          >
            {!collapsed && "Logout"}
          </Button>
        </Header>

        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: 8,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Modal
          title={<Typography.Title level={3}>User Profile</Typography.Title>}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              if (user) {
                setIsModalVisible(false); // ปิด Modal
                navigate(`/admin/editprofile/${user.ID}`); // เปลี่ยนเส้นทาง
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
    </Layout>
  );
};

export default MainLayout;
