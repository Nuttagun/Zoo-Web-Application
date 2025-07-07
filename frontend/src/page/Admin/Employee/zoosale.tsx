import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Col, Row, Divider, Modal, message, } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetUsers, DeleteUserById } from "../../../services/https/Garfield/http";
import { UsersInterface } from "../../../interface/IUser";

function Zoosalelist() {
  const [users, setUsers] = useState<UsersInterface[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | null>(null);// @ts-ignore
  const [messageApi, contextHolder] = message.useMessage(); const [editUser, setEditUser] = useState<UsersInterface | null>(null);// @ts-ignore
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();

  const handleEdit = (user: UsersInterface | undefined) => {
    if (!user) return;
    navigate(`/admin/edit/${user.ID}`, { state: { userID: user.ID } });
  };

  const columns: ColumnsType<UsersInterface> = [
    {
      title: <span className="table-header">ID</span>,
      key: "no",
      render: (_, __, index) => {
        const currentPage = pagination.current || 1;
        const pageSize = pagination.pageSize || 5;
        return currentPage === 1 ? index + 1 : (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: <span className="table-header">Profile</span>,
      dataIndex: "Profile",
      key: "profile",
      render: (_, record) => (
        <img
          src={`http://localhost:8000/${record.Profile}`}
          alt="Profile"
          style={{
            width: "100px", // กำหนดความกว้างคงที่
            height: "100px", // กำหนดความสูงคงที่
            objectFit: "cover", // เพื่อให้รูปไม่ผิดสัดส่วน
            borderRadius: "50%", // ทำให้รูปภาพเป็นวงกลม
          }}
        />
      ),
    },
    { title: "First Name", dataIndex: "FirstName", key: "FirstName" },
    { title: "Last Name", dataIndex: "LastName", key: "LastName" },
    { title: "Username", dataIndex: "Username", key: "Username" },
    { title: "Email", dataIndex: "Email", key: "Email" },
    { title: "Phonenumber", dataIndex: "PhoneNumber", key: "PhoneNumber" },
    {
      title: "Manage",
      key: "manage",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} shape="circle" style={{ marginRight: "8px" }}>✏️</Button>
          <Button
            onClick={() => showModal(record)}
            shape="circle"
            icon={<DeleteOutlined />}
            danger
            style={{ marginRight: "8px" }}
          />
        </>
      ),
    },
  ];

  const getUsers = async () => {
    try {
      const res = await GetUsers();
      console.log("Response from GetUsers:", res); // ตรวจสอบข้อมูลที่ได้
      if (res && Array.isArray(res)) {
        // สมมติว่า UserRoleID = 1 คือ Admin
        const adminUsers = res.filter((user: UsersInterface) => user.UserRoleID === 5);
        setUsers(adminUsers);
      } else {
        console.error("Received data is not an array:", res);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลได้",
      });
    }
  };




  const showModal = (user: UsersInterface) => {
    if (user.ID !== undefined && user.ID !== null) {
      setModalText(`Do you want to delete "${user.Username}"?`);
      setDeleteId(user.ID);
      setOpen(true);
    }
  };

  const handleOk = async () => {
    if (deleteId === null) return;
    setConfirmLoading(true);
    try {
      const res = await DeleteUserById(deleteId);
      if (res) {
        messageApi.open({ type: "success", content: "Deleted successfully" });
        getUsers();
      } else {
        messageApi.open({ type: "error", content: "Deletion failed" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      messageApi.open({ type: "error", content: "Error occurred while deleting" });
    }
    setOpen(false);
    setConfirmLoading(false);
  };


  const handleCancel = () => {
    setOpen(false);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  useEffect(() => {
    console.log("Users data loaded:", users); // ตรวจสอบข้อมูลที่ส่งไปยัง Table
    getUsers();
  }, []);

  return (
    <>
      {contextHolder}
      <Row>
        <Col span={12}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#B25900" }}>Manage Sell Staffs</h2>
        </Col>
      </Row>
      <Divider />
      <Table
        rowKey="ID"
        columns={columns}
        dataSource={users}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: handlePageChange,
        }}
      />
      <Modal
        title="Delete User"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="Delete"
        cancelButtonProps={{
          style: { backgroundColor: "#FF3333", color: "#FFFFFF" },
        }}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  );
}

export default Zoosalelist;
