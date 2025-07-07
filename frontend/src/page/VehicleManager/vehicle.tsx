
import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, Modal, message, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetVehicle, DeleteVehicleByID, getAllVehicleTypes, getAllVehicleStatus } from "../../services/https/mj";
import { VehicleInterface } from "../../interface/IVehicle";
import { Link, useNavigate } from "react-router-dom";
import { VehicleTypeInterface } from "../../interface/IVehicleType";
import { VehicleStatusInterface } from "../../interface/IVehicleStatus";
import dayjs from "dayjs";
import "./vehicle.css";


const { Option } = Select;
 
function Vehicle() {
  const columns: ColumnsType<VehicleInterface> = [
    {
      title: <span className="table-header">ลำดับ</span>,
      key: "no",
      // @ts-ignore
      render: (text, record, index) => {
        const currentPage = pagination.current || 1;
        const pageSize = pagination.pageSize || 5;
        return currentPage === 1 ? index + 1 : (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: <span className="table-header">รูปภาพ</span>,
      dataIndex: "Profile",
      key: "Name",
      width: "15%",
      render: ( // @ts-ignore
      text, record) => (
        <img
          src={`http://localhost:8000/${record.Picture}`}
          className="w3-left w3-circle w3-margin-right"
          width="50%"
          alt="Profile"
        />
      ),
    },
    {
      title: <span className="table-header">ชื่อ</span>,
      dataIndex: "Name",
      key: "name",
    },
    {
      title: <span className="table-header">สี</span>,
      dataIndex: "VehicleColor",
      key: "vehicleColor",
      render: (vehicleColor) => <>{vehicleColor?.Name || "N/A"}</>,
    },
    {
      title: <span className="table-header">ประเภท</span>,
      dataIndex: "VehicleType",
      key: "vehicleType",
      render: (vehicleType) => <>{vehicleType?.VehicleType || "N/A"}</>,
    },
    {
      title: <span className="table-header">คำอธิบาย</span>,
      dataIndex: "Description",
      key: "description",
    },
    {
      title: <span className="table-header">ราคา</span>,
      dataIndex: "Price",
      key: "price",
    },
    {
      title: <span className="table-header">วันที่ได้รับรถ</span>,
      dataIndex: "ReceivedDate",
      key: "receivedDate",
      render: (record) => <p>{dayjs(record).format("dddd DD MMM YYYY")}</p>,
    },
    {
      title: <span className="table-header">สถานะ</span>,
      dataIndex: "VehicleStatus",
      key: "vehicleStatus",
      render: (vehicleStatus) => <>{vehicleStatus?.VehicleStatus || "N/A"}</>,
    },
    {
      title: <span className="table-header">จัดการ</span>,
      dataIndex: "Manage",
      key: "manage",
      render: (// @ts-ignore
        text, record) => (
        <>
          <Button 
            onClick={() => navigate(`/vehiclemanager/vehicles/edit/${record.ID}`)}
            shape="circle"
            icon={<EditOutlined />}
            size={"large"} />
          <Button
            onClick={() => showModal(record)}
            style={{ marginLeft: 10 }}
            shape="circle"
            icon={<DeleteOutlined />}
            size={"large"}
            danger
          />
        </>
      ),
    },
    {
      title: <span className="table-header">พนักงาน</span>,
      dataIndex: "Employee",
      key: "employee",
      render: (employee) => (
        <>
          {employee?.User?.FirstName ? `${employee.User.FirstName} ${employee.User.LastName}` : "N/A"}
        </>
      ),
    },
  ];

  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [filteredVehicles, setFilteredVehicles] = useState<VehicleInterface[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 3 });
  const [vehicletype, setVehicletype] = useState<VehicleTypeInterface[]>([]);
  const [vehiclestatus, setVehiclestatus] = useState<VehicleStatusInterface[]>([]);


  const getVehicles = async () => {
    try {
      const res = await GetVehicle();
      console.log(res)
      if (res && Array.isArray(res)) {
        setVehicles(res);
        setFilteredVehicles(res);
      } else {
        console.error("Error: Received data is not an array");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลได้",
      });
    }
  };

  const GetVehicleType = async () => {
    let res = await getAllVehicleTypes();
    if (res) {
      setVehicletype(res);
    }
  };

  const GetVehicleStatus = async () => {
    let res = await getAllVehicleStatus();
    if (res) {
      setVehiclestatus(res);
    }
  };

  const handleFilterType = (value: string | null) => {
    setSelectedType(value);
    applyFilters(value, selectedStatus);
  };

  const handleFilterStatus = (value: string | null) => {
    setSelectedStatus(value);
    applyFilters(selectedType, value);
  };

  const applyFilters = (type: string | null, status: string | null) => {
    let filtered = vehicles;

    if (type) {
      filtered = filtered.filter((v) => v.VehicleType?.ID === Number(type));
    }

    if (status) {
      filtered = filtered.filter((v) => v.VehicleStatus?.ID === Number(status));
    }

    setFilteredVehicles(filtered);
  };

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState<String>();
  const [deleteId, setDeleteId] = useState<Number>();

  const getUsers = async () => {
    try {
      const res = await GetVehicle();
      if (res && Array.isArray(res)) {
        setVehicles(res);
      } else {
        console.error("Received data is not an array:", res);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลได้",
      });
    }
  };

  const showModal = (val: VehicleInterface) => {
    setModalText(`Do you want to delete the vehicle "${val.Name}" ?`);
    setDeleteId(val.ID);
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    let res = await DeleteVehicleByID(deleteId);
    if (res) {
      setOpen(false);
      messageApi.open({
        type: "success",
        content: "ลบข้อมูลสำเร็จ",
      });
      getVehicles();
    } else {
      setOpen(false);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาด !",
      });
    }
    setConfirmLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
    });
  };

  useEffect(() => {
    getUsers();
    getVehicles();
    GetVehicleType();
    GetVehicleStatus();
  }, []);

  return (
    <>
      {contextHolder}
      <Row>
        <Col span={12}>
        <div style={{ display: "flex"}}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#B25900', marginRight: "15px" }}>Manage Vehicle</h2>
            <span
              style={{
                marginLeft: "8px",
                backgroundColor: "#FED400",
                color: "#000",
                fontWeight: "bold",
                fontSize: "25px",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #B25900",
                
              }}
            >
              {filteredVehicles.length}
            </span>
          </div>
        </Col>
        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space>
            <Link to="/vehiclemanager/create-vehicle">
              <Button 
                type="primary" 
                icon={<PlusOutlined/>}
                style={{ backgroundColor: '#FED400', borderColor: '#FED400', color: '#000000', borderRadius: '30px', boxShadow: "0px 0px 10px 2px rgba(0, 0, 0, 0.2)" }}
                size="large"
              >
                Add Vehicle
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>
      <Divider />

      <Space style={{ marginBottom: 10, width: "100%" }} direction="vertical">
        <Row style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space style={{ display: "flex", gap: "16px" }}>
            <Col flex="none">
              <span>Type : </span>
              <Select
                style={{ width: 150 }}
                placeholder="Choose Type"
                onChange={handleFilterType}
                allowClear
              >
                {vehicletype.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.VehicleType}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col flex="none">
              <span>Status : </span>
              <Select
                style={{ width: 150 }}
                placeholder="Choose Status"
                onChange={handleFilterStatus}
                allowClear
              >
                {vehiclestatus.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.VehicleStatus}
                  </Option>
                ))}
              </Select>
            </Col>
          </Space>
        </Row>
      </Space>
      
      <div>
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={filteredVehicles}
          scroll={{ x: "100%" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            onChange: handlePageChange,
          }}
        />
      </div>
      <Modal
        title={<span><DeleteOutlined /> Delete?</span>}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="Delete"
        width={450} 
        bodyStyle={{ padding: '30px' }} 
        style={{ top: 200 }} 
        okButtonProps={{
          style: { backgroundColor: '#FFFFFF', borderColor: '#FF3333', color: '#FF3333', borderRadius: '50px' }, 
        }}
        cancelButtonProps={{
          style: { backgroundColor: '#FF3333', borderColor: '#FFFFFF', color: '#FFFFFF', borderRadius: '50px' }, 
        }}
      >
        <p style={{ color: '#000000', fontWeight: 'bold', fontSize: '15px' }}>{modalText}</p>
      </Modal>
    </>
  );
}
export default Vehicle;