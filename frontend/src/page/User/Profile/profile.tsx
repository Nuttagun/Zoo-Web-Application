import React, { useState, useEffect } from "react";
import { Modal, Typography, Row, Col, Avatar, Divider, Button, Card, Space, message } from "antd";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interface/IUser";
import { GetUserById } from "../../../services/https/Garfield/http";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const Profile: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState<UsersInterface | null>(null);// @ts-ignore
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();


  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

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
    <>
      <Button type="primary" onClick={showModal} style={{ margin: "20px 0" }}>
        Show User Info
      </Button>

      <Modal
        title={<Title level={3}>User Profile</Title>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="edit" type="primary" onClick={() => user && navigate(`/user/editprofile/${user.ID}`)} style={{backgroundColor:"#fabb18"}} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ffcc33"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fabb18"}>
            Edit Profile
          </Button>,
          <Button key="close" onClick={handleCancel} type="primary" style={{backgroundColor:"#E63946"}}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FF4D4F")} 
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E63946")}>
            Close
          </Button>,
        ]}
      >
        {user ? (
          <Card bordered={false} style={{ textAlign: "center" }}>
            <Avatar size={120} src={user?.Profile ? `http://localhost:8000/${user.Profile}` : undefined} icon={!user?.Profile && <UserOutlined />} />
            <Title level={4} style={{ marginTop: "10px" }}>
              {user.FirstName}
            </Title>
            <Divider />
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Row>
                <Col span={24} style={{ textAlign: "left" }}>
                  <Text>
                    <MailOutlined style={{ marginRight: 8 }} /> {user.Email}
                  </Text>
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ textAlign: "left" }}>
                  <Text>
                    <PhoneOutlined style={{ marginRight: 8 }} /> {user.Phonenumber}
                  </Text>
                </Col>
              </Row>
            </Space>
          </Card>
        ) : (
          <Text>Loading...</Text>
        )}
      </Modal>
    </>
  );
};

export default Profile;
//task

//เพิ่มหน้าโปรไฟล์ทุกๆUserRole

// const showModal = () => setIsModalVisible(true);

//  const [isModalVisible, setIsModalVisible] = useState(false);

//const handleCancel = () => setIsModalVisible(false);

{/* <li className="navItem">
  <button onClick={showModal} className="navLink">Profile</button>
</li> */} //ไปตรงรูปโปรไฟล์แล้วใสfunction showModal ไปเปิดโปรไฟล์

{/* <Modal
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
                      <PhoneOutlined style={{ marginRight: 8 }} /> {user.Phonenumber}
                    </AntText>
                  </Col>
                </Row>
              </Space>
            </Card>
          ) : (
            <AntText>Loading...</AntText>
          )}
        </Modal> */}