import { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Space, Tabs, message } from "antd";
import { Pie, Bar } from "react-chartjs-2"; // เพิ่ม Bar Chart
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { GetUsers } from "../../services/https/Garfield/http.tsx";
import PaymentDashboard from "./paymentdashboard.tsx"; // นำเข้า PaymentDashboard

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [roleCounts, setRoleCounts] = useState({
    admins: 0,
    users: 0,
    zookeepers: 0,
    vets: 0,
    zoosales: 0,
    vahimanes: 0,
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTabKey, setActiveTabKey] = useState("1"); // state สำหรับเก็บแท็บที่ active

  const getUsersCount = async () => {
    try {
      const res = await GetUsers();
      if (res && Array.isArray(res)) {
        setRoleCounts({
          admins: res.filter((user) => user.UserRoleID === 1).length,
          users: res.filter((user) => user.UserRoleID === 2).length,
          zookeepers: res.filter((user) => user.UserRoleID === 3).length,
          vets: res.filter((user) => user.UserRoleID === 4).length,
          zoosales: res.filter((user) => user.UserRoleID === 5).length,
          vahimanes: res.filter((user) => user.UserRoleID === 6).length,
        });
      } else {
        console.error("Received data is not an array:", res);
      }
    } catch (error) {
      console.error("Error fetching user count:", error);
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
      });
    }
  };

  useEffect(() => {
    getUsersCount();
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  // ข้อมูลสำหรับ Pie Chart
  const pieData = {
    labels: [
      "Admins",
      "Users",
      "Zookeepers",
      "Vets",
      "ZooSales",
      "Vehicle Managers",
    ],
    datasets: [
      {
        data: [
          roleCounts.admins,
          roleCounts.users,
          roleCounts.zookeepers,
          roleCounts.vets,
          roleCounts.zoosales,
          roleCounts.vahimanes,
        ],
        backgroundColor: [
          "#1890ff",
          "#ff4d4f",
          "#faad14",
          "#52c41a",
          "#FF69B4",
          "#722ed1",
        ],
        hoverBackgroundColor: [
          "#40a9ff",
          "#ff7875",
          "#ffc53d",
          "#73d13d",
          "#FF85C0",
          "#9254de",
        ],
      },
    ],
  };

  // ข้อมูลสำหรับ Bar Chart
  const barData = {
    labels: [
      "Admins",
      "Users",
      "Zookeepers",
      "Vets",
      "ZooSales",
      "Vehicle Managers",
    ],
    datasets: [
      {
        label: "User Count",
        data: [
          roleCounts.admins,
          roleCounts.users,
          roleCounts.zookeepers,
          roleCounts.vets,
          roleCounts.zoosales,
          roleCounts.vahimanes,
        ],
        backgroundColor: [
          "#1890ff",
          "#ff4d4f",
          "#faad14",
          "#52c41a",
          "#FF69B4",
          "#722ed1",
        ],
      },
    ],
  };

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space style={{ justifyContent: "space-between", display: "flex" }}>
            <Title level={3} style={{ fontSize: "28px", fontWeight: "bold", color: "#B25900" }}>Dashboard</Title>
          </Space>
        </Col>

        {/* Navigation Tabs */}
        <Col span={24}>
          <Tabs
            defaultActiveKey="1"
            activeKey={activeTabKey}
            onChange={handleTabChange}
          >
            <Tabs.TabPane tab="Home" key="1" />
            <Tabs.TabPane tab="Payment" key="2" />
            <Tabs.TabPane tab="Team" key="3" />
          </Tabs>
        </Col>

        {/* Content based on active tab */}
        {activeTabKey === "1" && (
          <Row gutter={[16, 16]}>
            {/* Summary Cards */}
            {Object.keys(roleCounts).map((key, index) => (
              <Col span={6} style={{ marginTop: index >= 4 ? "16px" : 0 }} key={key}>
                <Card>
                  <Title
                    level={2}
                    style={{ color: pieData.datasets[0].backgroundColor[index] }}
                  >
                    {roleCounts[key as keyof typeof roleCounts]}
                  </Title>
                  <Text>{key.replace(/^\w/, (c) => c.toUpperCase())}</Text>
                </Card>
              </Col>
            ))}

          </Row>
        )}

        {activeTabKey === "2" && <PaymentDashboard />} {/* แสดง PaymentDashboard เมื่อเลือกแท็บ "Payment" */}

        {/* Chart Section */}
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col span={12}>
            <Card title="User Distribution">
              <Pie data={pieData} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="User Distribution">
              <Bar data={barData} />
            </Card>
          </Col>
        </Row>
      </Row>
      </div>
  );
};
//task
export default AdminDashboard;
