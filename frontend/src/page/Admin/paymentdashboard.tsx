import  { useEffect, useState } from "react";
import { Card, Row, Col, Typography } from "antd";
import { Pie, Bar } from "react-chartjs-2"; // ใช้ทั้ง Pie และ Bar Chart
import { GetPayments } from "../../services/https/aut/httpPaymentTicket"; // ฟังก์ชันในการดึงข้อมูลการชำระเงิน
import { PaymentTicket } from "../../interface/Ticketpayment"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const { Title, Text } = Typography;

const PaymentDashboard = () => {// @ts-ignore
  const [payments, setPayments] = useState<PaymentTicket[]>([]); // กำหนดประเภทให้ payments เป็น PaymentTicket[]
  const [totalPayments, setTotalPayments] = useState(0);
  const [successfulPayments, setSuccessfulPayments] = useState(0);
  const [failedPayments, setFailedPayments] = useState(0);

  useEffect(() => {
    // ดึงข้อมูลการชำระเงินจาก API
    const fetchPayments = async () => {
      try {
        const { response, result } = await GetPayments();
        if (response.status === 200) {
          setPayments(result);
          
          // กำหนดประเภทของ payment เป็น PaymentTicket ใน reduce และ filter
          const total = result.reduce((acc: number, payment: PaymentTicket) => acc + payment.Amount, 0);
          const successful = result.filter((payment: PaymentTicket) => payment.PaymentStatus === true).length;
          const failed = result.filter((payment: PaymentTicket) => payment.PaymentStatus === false).length;

          setTotalPayments(total);
          setSuccessfulPayments(successful);
          setFailedPayments(failed);
        }
      } catch (error) {
        console.error("Error fetching payment data", error);
      }
    };

    fetchPayments();
  }, []);

  // ข้อมูลสำหรับ Pie Chart (แสดงสถานะการชำระเงิน)
  const pieData = {
    labels: ["Successful Payments", "Failed Payments"],
    datasets: [
      {
        data: [successfulPayments, failedPayments],
        backgroundColor: ["#52c41a", "#ff4d4f"],
        hoverBackgroundColor: ["#73d13d", "#ff7875"],
      },
    ],
  };

  // ข้อมูลสำหรับ Bar Chart (แสดงยอดรวมการชำระเงิน)
  const barData = {
    labels: ["Total Payments"],
    datasets: [
      {
        label: "Amount",
        data: [totalPayments],
        backgroundColor: "#1890ff",
      },
    ],
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={3}>Payment Dashboard</Title>
        </Col>

        {/* Summary Cards */}

        <Col span={12}>
          <Card title={<span style={{ fontFamily: 'Arial, sans-serif', color: '#52c41a' }}>Successful Payments</span>}>
            <Text>จำนวนการชำระเงินสำเร็จ: {successfulPayments}</Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={<span style={{ fontFamily: 'Arial, sans-serif', color: '#ff4d4f' }}>Unverified payments</span>}>
            <Text>จำนวนการชำระเงินที่ยังไม่ได้ตรวจสอบ: {failedPayments}</Text>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={<span style={{ fontFamily: 'Arial, sans-serif', color: '#1890ff' }}>Total Payments</span>}>
            <Text>ยอดรวมการชำระเงิน: ฿{totalPayments}</Text>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card title="Payment Status">
            <Pie data={pieData} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Total Payments Amount">
            <Bar data={barData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentDashboard;
