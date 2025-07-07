import { ChevronFirst, ChevronLast, MessageCircle } from "lucide-react";
import { LayoutDashboard, ClipboardPlus, Layers, BookUser, Calendar, PawPrint, Beef, LogOut } from "lucide-react";
import logo from "../../assets/logotest.png";
import { createContext, useContext, useState, ReactNode, FC, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Divider, message, Modal, Row, Space, Typography } from "antd"; 
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import {getUserById } from "../../services/https/index";
import { UsersInterface } from "../../interface/IUser";

type SidebarContextType = {
    expanded: boolean;
};


interface SidebarItemProps {
    icon: ReactNode;
    text: string;
    active?: boolean;
    alert?: boolean;
    to: string;
}

const SidebarContext = createContext<SidebarContextType>({ expanded: true });

const Sidebar: FC = () => {
    const [expanded, setExpanded] = useState<boolean>(true);
    const navigate = useNavigate();
    const [userid, setUserid] = useState<number>(Number(localStorage.getItem("userid")) || 0);
    const [user, setUser] = useState<UsersInterface | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);

    const handleLogout = () => {

        localStorage.removeItem("isLogin");
        localStorage.removeItem("userRole");
        localStorage.clear();


        message.success("ออกจากระบบ");

        setTimeout(() => {
            navigate("/login");
        }, 3500); 
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
        <SidebarContext.Provider value={{ expanded }}>
            <aside className="h-screen">
                <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                    <div className="p-4 pb-2 flex justify-between items-center">
                        <img
                            style={{marginRight:"80px"}}
                            src={logo}
                            className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`}
                            alt="Logo"
                        />
                        <button
                            onClick={() => setExpanded((curr) => !curr)}
                            className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-100"
                        >
                            {expanded ? <ChevronFirst /> : <ChevronLast />}
                        </button>
                    </div>

                    <ul className="flex-1 px-3">
                        <SidebarItem icon={<PawPrint size={20} />} text="Animal" to="/zookeeper" />
                        <SidebarItem icon={<LayoutDashboard size={20} />} text="Habitat" to="/zookeeper/habitat" />
                        <SidebarItem icon={<ClipboardPlus size={20} />} text="Report" to="/zookeeper/report" />
                        <SidebarItem icon={<Calendar size={20} />} text="Calendar" to="/zookeeper/calendar" />
                        <SidebarItem icon={<Layers size={20} />} text="Event" to="/zookeeper/event" />
                        <SidebarItem icon={<BookUser size={20} />} text="Work" to="/zookeeper/work" />
                        <SidebarItem icon={<Beef size={20} />} text="Stock" to="/zookeeper/stock" />
                        <SidebarItem icon={<MessageCircle size={20} />} text="Chat" to="/zookeeper/zookeeper_chat" />
                        <hr className="my-3" />
                        <li
                            onClick={handleLogout}
                            className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors hover:bg-orange-50 text-gray-600"
                        >
                            <LogOut size={20} />
                            <span className={`overflow-hidden transition-all ${expanded ? "ml-3" : "w-0"}`}>Logout</span>
                        </li>
                    </ul>

                    <div className="border-t flex p-3">
                        <img src={`http://localhost:8000/${user?.Profile}`} style={{ width: "50px",height:"50px",borderRadius:"60%" }} onClick={showModal}/>
                        <div
                            className={`flex justify-between items-center overflow-hidden transition-all ${
                                expanded ? "w-90 ml-3" : "w-0"
                            }`}
                        >
                            <div className="leading-4" style={{ marginRight: "15px" }}>
                                <h4 className="font-semibold">{user?.FirstName} {user?.LastName}</h4>
                                <span className="text-xs text-gray-600" style={{marginLeft:"2.5px"}}>{user?.Email}</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>
        {/* หน้าแก้ไขโปรไฟล์ */}
              <Modal
                  title={<Typography.Title level={3}>User Profile</Typography.Title>}
                  visible={isModalVisible}
                  onCancel={handleCancel}
                  footer={[
                    <Button key="edit" type="primary" onClick={() => {
                      if (user) {
                        setIsModalVisible(false); // ปิด Modal
                        navigate(`/zookeeper/editprofile/${user.ID}`); // เปลี่ยนเส้นทาง
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
        </SidebarContext.Provider>
    );
};

const SidebarItem: FC<SidebarItemProps> = ({ icon, text, active = false, alert = false, to }) => {
    const { expanded } = useContext(SidebarContext);

    return (
        <Link to={to}>
            <li
                className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group 
                ${active ? "bg-gradient-to-tr from-orange-200 to-orange-100 text-orange-800" : "hover:bg-orange-50 text-gray-600"}`}
            >
                {icon}
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
                {alert && (
                    <div className={`absolute right-2 w-2 h-2 rounded bg-orange-400 ${expanded ? "" : "top-2"}`}></div>
                )}
                {!expanded && (
                    <div
                        className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-orange-100 text-orange-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
                    >
                        {text}
                    </div>
                )}
            </li>
        </Link>
    );
};

export default Sidebar;
