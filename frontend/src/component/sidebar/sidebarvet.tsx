import React, { useEffect, useState } from "react";
import "./sidebarvet.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MediciineTypeLogo from "../../assets/images/logoforvet/MedicineTypeLogo.png";
import Medicine from "../../assets/images/logoforvet/Medicine.png"
import Prescription from "../../assets/images/logoforvet/Prescription.png"
import Medicalrecord from "../../assets/images/logoforvet/Medicalrecord.png"
import Animal from "../../assets/images/logoforvet/Animal.png"
import Report from "../../assets/images/logoforvet/Report.png"
import RIP from "../../assets/images/logoforvet/RIP.png"
import Analysis from "../../assets/images/logoforvet/Analysis.png"
import Logout from "../../assets/images/logoforvet/Logout.png"

import { getUserById } from "../../services/https/index";
import { UsersInterface } from "../../interface/IUser";
import { Avatar, Button, Card, Col, Divider, message, Modal, Row, Space, Typography } from "antd";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";


type SidebarProps = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false); // สถานะสำหรับย่อ/ขยาย
  const [userid, setUserid] = useState<number>(Number(localStorage.getItem("userid")) || 0);
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);





  // อัปเดต activeMenu ตาม URL
  useEffect(() => {
    const path = location.pathname; // เก็บ URL ปัจจุบัน

    if (path === "/vetdashboard" || path === "/vetdashboard/") {
      // กรณีที่อยู่หน้า Overview
      setActiveMenu("AnimalOverview");
    } else if (path.includes("/vetdashboard/medicalrecord")) {
      // กรณีที่อยู่หน้า MedicalRecord
      setActiveMenu("MedicalRecord");
    } else if (path.includes("/vetdashboard/report")) {
      // กรณีที่อยู่หน้า Report
      setActiveMenu("Report");
    } else if (path.includes("/vetdashboard/prescriptions")) {
      // กรณีที่อยู่หน้า Prescriptions
      setActiveMenu("Prescriptions");
    } else if (path.includes("/vetdashboard/animaldied")) {
      // กรณีที่อยู่หน้า Died Animals
      setActiveMenu("DiedAnimals");
    } else if (path.includes("/vetdashbaord/medicinemanage")) {
      setActiveMenu("MedicineManager");
    }
    else if (path.includes("/vetdashboard/analysis")) {
      // กรณีที่อยู่หน้า Analysis
      setActiveMenu("Analysis");
    } else if (path.includes("/vetdashboard/medicinetype")) {
      setActiveMenu("MedicineType");
    }
  }, [location.pathname, setActiveMenu]);


  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("roleName");
    localStorage.removeItem("userid");
    message.success("ออกจากระบบ");

    setTimeout(() => {
      navigate("/login");
    }, 3500);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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



  return (
    <div className={`vet-sidebar ${isCollapsed ? "vet-collapsed" : ""}`}>
      <div className="vet-sidebar-header" style={{ marginBottom: 20 }}>
        <h2>VET DASHBOARD</h2>
        <button onClick={toggleSidebar} className="vet-collapse-button">
          {isCollapsed ? ">" : "<"}
        </button>

      </div>
      <ul className="vet-sidebar-menu">
        <li className={`vet-menu-item ${activeMenu === "AnimalOverview" ? "active" : ""}`} onClick={() => setActiveMenu("AnimalOverview")}>
          <Link to="/vetdashboard">
            <img
              src={Animal}
              alt="Animal"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Animal Overview
          </Link>
        </li>

        <li className={`vet-menu-item ${activeMenu === "MedicalRecord" ? "active" : ""}`} onClick={() => setActiveMenu("MedicalRecord")}>
          <Link to="/vetdashboard/medicalrecord">
            <img
              src={Medicalrecord}
              alt="Medicalrecord"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Medicalrecords
          </Link>
        </li>


        <li className={`vet-menu-item ${activeMenu === "Prescriptions" ? "active" : ""}`} onClick={() => setActiveMenu("Prescriptions")}>
          <Link to="/vetdashboard/prescriptions">
            <img
              src={Prescription}
              alt="Prescription"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Prescriptions
          </Link>
        </li>

        <li className={`vet-menu-item ${activeMenu === "MedicineManager" ? "active" : ""}`} onClick={() => setActiveMenu("MedicineManager")}>
          <Link to="/vetdashboard/medicinemanage">
            <img
              src={Medicine}
              alt="Medicine"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Medicine
          </Link>
        </li>

        <li className={`vet-menu-item ${activeMenu === "MedicineType" ? "active" : ""}`} onClick={() => setActiveMenu("MedicineType")}>
          <Link to="/vetdashboard/medicinetype">
            <img
              src={MediciineTypeLogo}
              alt="Medicine Type"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            MedicineType
          </Link>
        </li>

        <li className={`vet-menu-item ${activeMenu === "Report" ? "active" : ""}`} onClick={() => setActiveMenu("Report")}>
          <Link to="/vetdashboard/report">
            <img
              src={Report}
              alt="Report"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Reports
          </Link>
        </li>

        <li className={`vet-menu-item ${activeMenu === "DiedAnimals" ? "active" : ""}`} onClick={() => setActiveMenu("DiedAnimals")}>
          <Link to="/vetdashboard/animaldied">
            <img
              src={RIP}
              alt="RIP"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Dies Animals
          </Link>
        </li>


        <li className={`vet-menu-item ${activeMenu === "Analysis" ? "active" : ""}`} onClick={() => setActiveMenu("Analysis")}>
          <Link to="/vetdashboard/analysis">
            <img
              src={Analysis}
              alt="Analysis"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Analysis
          </Link>
        </li>

        <li className="vet-menu-item" onClick={handleLogout}>
          <a href="/login">
            <img
              src={Logout}
              alt="Logout"
              className="vet-menu-icon"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Logout
          </a>
        </li>
      </ul>
      <div className="vet-user-info">
        <img
          src={`http://localhost:8000/${user?.Profile}`}
          alt="User Profile"
          className="vet-user-profile-pic"
          onClick={showModal}
        />
        <div className="vet-user-details">
          <h4 className="vet-user-name">{user?.FirstName} {user?.LastName}</h4>
          <p className="vet-user-email">{user?.Email}</p>
        </div>
        {/* หน้าแก้ไขโปรไฟล์ */}
        <Modal
          title={<Typography.Title level={3}>User Profile</Typography.Title>}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              if (user) {
                setIsModalVisible(false); // ปิด Modal
                navigate(`/vetdashboard/editprofile/${user.ID}`); // เปลี่ยนเส้นทาง
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
      </div>

    </div>
  );
};

export default Sidebar;
