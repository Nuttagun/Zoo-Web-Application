import { Button, Modal, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";

const Booked = () => {
  const [modal, contextHolder] = Modal.useModal();

  const paid = () => {
    modal.confirm({
      title: 'การจองสำเร็จ',
      content: 'Bla bla ...',
      okText: <Link to="../paymentticket">Confirm</Link>,
      cancelText: 'Cancel',
    });
  };

  const deleteticket = () => {
    modal.confirm({
      title: 'ยืนยันการลบ',
      okText: 'Confirm',
      cancelText: 'Cancel',
    });
  };

  return (
    <>
    Booked
      <Space>
        <div style={{ position: "fixed", bottom: "5%", right: "50px"}}><Button onClick={paid}>Payment</Button></div>
        <div style={{ position: "fixed", bottom: "5%", left: "50px"}}>
          <Button onClick={deleteticket} icon={<DeleteOutlined />} danger shape="circle" 
          style={{
            padding: 0, 
            width: '40px', 
            height: '40px', 
          }} /></div>
      </Space>
      {contextHolder}
    </>
  );
}

export default Booked;
