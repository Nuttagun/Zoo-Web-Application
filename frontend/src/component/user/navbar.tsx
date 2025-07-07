import { useEffect, useState } from 'react';
import './navbar.css';
import { AiFillCloseCircle } from 'react-icons/ai';
import { TbGridDots } from 'react-icons/tb';
import Logo from "../../assets/logotest.png";
import { Avatar, Button, Card, Col, Divider, message, Modal, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { UsersInterface } from "../../interface/IUser";
import { GetUserById } from '../../services/https/Garfield/http';
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";

// ใช้ Ant Typography
const { Title: AntTitle, Text: AntText } = Typography;

const Navbar = () => {
  const [active, setActive] = useState('navBar');
  const navigate = useNavigate();
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // @ts-ignore
  const [loading, setLoading] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const showNav = () => {
    setActive('navBar activeNavbar');
  };

  const removeNav = () => {
    setActive('navBar');
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userRole");
    localStorage.clear();

    message.success("ออกจากระบบ");

    setTimeout(() => {
      navigate("/login");
    }, 3500);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userIdString = localStorage.getItem("userid"); // ดึงค่า 'userid' จาก localStorage
      if (!userIdString) {
        message.error("User ID not found in localStorage. Please log in again.");
        setLoading(false);
        return;
      }

      const userId = Number(userIdString); // แปลงเป็น number
      if (isNaN(userId)) {
        message.error("Invalid User ID. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const userData = await GetUserById(userId); // ใช้ userId ที่ได้
        if (userData) {
          setUser(userData); // กำหนดค่าผู้ใช้
          console.log(userData)
        } else {
          message.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("An error occurred while fetching user data.");
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <section className='navBarSection'>
      <header className="header flex">
        <div className="logoDiv">
          <a href="/" className="logo flex">
            <h1><img src={Logo} style={{ width: "120px", height: "50px" }} /></h1>
          </a>
        </div>

        <div className={active}>
          <ul onClick={removeNav} className="navLists flex">
            <li className="navItem">
              <a href="/" className="navLink">Home</a>
            </li>
            <li className="navItem">
              <a href="/#event" className="navLink">Event</a>
            </li>
            <li className="navItem">
              <a href="/#animal" className="navLink">Animal</a>
            </li>
            <li className="navItem">
              <a href="/#Map" className="navLink">Map</a>
            </li>
            <li className="navItem">
              <button onClick={showModal} className="navLink">Profile</button>
            </li>
            <li className="navItem">
              <a href="/user/myticket" className="navLink">My TICKET</a>
            </li>
            <li className="navItem" onClick={handleLogout}>
              <a className="navLink">Logout</a>
            </li>
            <button className="btn">
              <a href="/#booking">BOOK NOW</a>
            </button>
            <Avatar
              onClick={showModal}
              style={{ width: "50px", height: "50px", marginLeft: "20px", marginRight: "-100px" }}
              src={user?.Profile ? `http://localhost:8000/${user.Profile}` : undefined}
              icon={!user?.Profile && <UserOutlined />}
              alt="User Profile"
            />
          </ul>
          <div onClick={removeNav} className="closeNavbar">
            <AiFillCloseCircle className='icon' />
          </div>
        </div>

        <div onClick={showNav} className="toggleNavbar">
          <TbGridDots className='icon' />
        </div>
        <Modal
          title={<AntTitle level={3}>User Profile</AntTitle>}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="edit" type="primary" onClick={() => user && navigate(`/user/editprofile/${user.ID}`)} style={{ backgroundColor: "#fabb18" }}
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
              <AntTitle level={4} style={{ marginTop: "10px" }}>
                {user.FirstName}
              </AntTitle>
              <Divider />
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Row>
                  <Col span={24} style={{ textAlign: "left" }}>
                    <AntText>
                      <MailOutlined style={{ marginRight: 8 }} /> {user.Email}
                    </AntText>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} style={{ textAlign: "left" }}>
                    <AntText>
                      <PhoneOutlined style={{ marginRight: 8 }} /> {user.PhoneNumber}
                    </AntText>
                  </Col>
                </Row>
              </Space>
            </Card>
          ) : (
            <AntText>Loading...</AntText>
          )}
        </Modal>
      </header>
    </section>
  );
};

export default Navbar;
