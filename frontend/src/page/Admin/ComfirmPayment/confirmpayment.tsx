import { useState, useEffect } from 'react';
import { Table, Button, Modal, Checkbox, message, Row, Col, Divider, Typography, Image } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { GetPayments } from '../../../services/https/aut/httpPaymentTicket'; // ฟังก์ชันในการดึงข้อมูล
import { PaymentTicket } from '../../../interface/Ticketpayment';
import { UpdatePaymentStatus } from '../../../services/https/aut/httpPaymentTicket'; // ฟังก์ชันอัปเดตสถานะ

const { Title } = Typography;

const PaymentConfirmation = () => {
  const [paymentData, setPaymentData] = useState<PaymentTicket[]>([]); // ใช้ PaymentTicket interface
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTicket | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchPayments = async () => {
    const { response, result } = await GetPayments(); // เรียกฟังก์ชัน GetPayments ที่สร้างไว้
    if (response.status === 200) {
      console.log("Data payment", result);
      setPaymentData(result); // ตั้งค่า paymentData ด้วยข้อมูลที่ดึงมา
    } else {
      console.log(result.error);
    }
  };

  // ดึงข้อมูลจาก Backend
  useEffect(() => {
    fetchPayments();
  }, []);

  // ฟังก์ชั่นในการยืนยันการจ่ายเงิน
  const handlePaymentConfirm = async (ID: number, currentStatus: boolean) => {
    setConfirmLoading(true);
  
    try {
      // เรียก API เพื่ออัปเดตสถานะการจ่ายเงิน (ส่ง true/false ตามสถานะปัจจุบัน)
      const updatedPayment = await UpdatePaymentStatus(ID, !currentStatus); // สลับสถานะจาก true เป็น false หรือจาก false เป็น true
      console.log("Payment ID:", ID); // เช็คค่า ID
  
      if (updatedPayment) {
        setPaymentData(prevData =>
          prevData.map(item =>
            item.ID === ID ? { ...item, PaymentStatus: !currentStatus } : item // เปลี่ยนสถานะ
          )
        );
        message.success(currentStatus ? 'ยกเลิกการจ่ายเงินสำเร็จ' : 'การจ่ายเงินสำเร็จ');
        setIsModalVisible(false);
      } else {
        message.error('เกิดข้อผิดพลาดในการอัปเดตสถานะการจ่ายเงิน');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error('ไม่สามารถอัปเดตสถานะการจ่ายเงินได้');
    } finally {
      setConfirmLoading(false);
    }
  };
  
  

  // ฟังก์ชั่นในการปิด modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // ฟังก์ชั่นในการแสดง modal เมื่อผู้ใช้คลิกที่รายการการจ่ายเงิน
  const showModal = (payment: PaymentTicket) => {
    setSelectedPayment(payment);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'Amount',
      key: 'Amount',
    },
    {
      title: 'หลักฐานการชำระเงิน',
      dataIndex: 'Path',
      key: 'Path',
      // @ts-ignore
      render: (text: string, record: PaymentTicket) => (
        <Image
          src={`http://localhost:8000/${record.Path}`}
          alt="Payment Slip"
          style={{ width: '100px', height: 'auto', objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'สถานะการจ่ายเงิน',
      key: 'status',
      render: (_: any, record: PaymentTicket) => (
        <Checkbox
          checked={record.PaymentStatus === true}  // ถ้าสถานะเป็น true ให้ทำเครื่องหมาย
          onChange={() => showModal(record)} // แสดง modal เมื่อคลิก
        >
          {record.PaymentStatus === true ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
        </Checkbox>
      ),
    }
    
    
    
  ];

  return (
    <>
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title level={3}>การยืนยันการจ่ายเงิน</Title>
        </Col>
      </Row>

      <Divider />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={paymentData} // แสดงเฉพาะรายการที่ยังไม่ได้จ่าย
        pagination={false}
      />

      <Modal
        title="ยืนยันการจ่ายเงิน"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        {selectedPayment && (
          <>
            <p>จำนวนเงินที่จะจ่าย: {selectedPayment.Amount}</p>
            <p>หลักฐานการชำระเงิน: {selectedPayment.Path}</p>
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={confirmLoading}
                onClick={() => handlePaymentConfirm(selectedPayment.ID, selectedPayment.PaymentStatus)}
              >
                {selectedPayment.PaymentStatus ? 'ยกเลิกการจ่ายเงิน' : 'ยืนยันการจ่ายเงิน'}
              </Button>
            </div>
          </>
        )}
      </Modal>

    </>
  );
};
//task
export default PaymentConfirmation;
