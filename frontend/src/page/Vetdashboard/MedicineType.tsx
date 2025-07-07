import { useEffect, useState } from "react";
import Sidebar from "../../component/sidebar/sidebarvet";
import Table, { ColumnType } from "antd/es/table";
import { MedicineType } from "../../interface/IMedicalrecord";
import { createMedicineType, deleteMedicineTypeById, getMedicineTypeById, ListMedicineType, updateMedicineTypeByID } from "../../services/https/kim/ServiceForPrescirption";
import { Button, Form, Input, message, Modal } from "antd";
import { DeleteOutlined, PlusSquareOutlined } from "@ant-design/icons";
import "../VehicleManager/vehicle.css"


const MedicineTypePage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("MedicineType")
  const [medicineTypes, setMedicineTypes] = useState<MedicineType[]>([]);
  const [selectedMedicineTypeIds, setSelectedMedicineTypeIds] = useState<number[]>([]);
  const [editingMedicineType, setEditingMedicineType] = useState<MedicineType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [updatedMedicineType, setUpdatedMedicineType] = useState<string>("");
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);


  useEffect(() => {
    const fetchMedicineTypes = async () => {
      try {
        const dataMedicineType = await ListMedicineType();
        console.log("MedicineType", dataMedicineType);
        if (Array.isArray(dataMedicineType)) {
          setMedicineTypes(dataMedicineType);
        } else {
          console.log("Data is not an array");
        }
      } catch (error) {
        console.log("Error fetching medicineType data: ", error);
        message.error("เกิดข้อผิดพลาดในการดึงประเภทยา");
      }
    };
    fetchMedicineTypes();
  }, []);

  const rowSelection = {
    selectedRowKeys: selectedMedicineTypeIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedMedicineTypeIds(selectedRowKeys as number[]);
    },
  };

  const handleDelete = async () => {
    if (selectedMedicineTypeIds.length === 0) {
      message.error("กรุณาเลือกประเภทยาที่ต้องการลบ");
      return;
    }

    try {
      await Promise.all(selectedMedicineTypeIds.map((id) => deleteMedicineTypeById(id.toString())));
      message.success("ลบยาเรียบร้อย");
      const updateMedicineType = await ListMedicineType();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      setMedicineTypes(updateMedicineType);
      setSelectedMedicineTypeIds([]);
    } catch (error) {
      console.log("Error deleting medicine: ", error);
      message.error("เกิดข้อผิดพลาดในการลบประเภทยา");
    }
  };

  const showEditModal = async (medicineType: MedicineType) => {
    setEditingMedicineType(medicineType);
    try {
      const fetchedRecord = await getMedicineTypeById(medicineType.ID);
      console.log("Fetched record:", fetchedRecord);

      updateForm.setFieldsValue({
        MedicineType: fetchedRecord.MedicineType,
      });

      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching record:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    }
  };

  const handleUpdate = async (values: {
    MedicineType: string;
  }) => {
    if (editingMedicineType) {

      const updatedData: MedicineType = {
        ID: editingMedicineType.ID,
        MedicineType: values.MedicineType,
      };

      console.log("Values from form:", values);
      console.log("Data to be updated:", updatedData);

      try {
        const response = await updateMedicineTypeByID(editingMedicineType.ID, updatedData);
        console.log("Update response:", response);
        message.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
        setIsModalVisible(false);

        const newData = await ListMedicineType();
        setMedicineTypes(newData);
      } catch (error) {
        console.error("Error updating record:", error);
        message.error("ไม่สามารถอัปเดตข้อมูลได้");
      }
    }
  };


  const handleAdd = async (values: {
    MedicineType: string;
  }) => {
    try {
      const newMedicineType = {
        MedicineType: values.MedicineType,
      };

      await createMedicineType(newMedicineType);  // ต้องสร้าง function นี้ใน service
      message.success("เพิ่มยาเรียบร้อยแล้ว");
      setIsModalAddVisible(false);
      addForm.resetFields();

      // รีเฟรชข้อมูล
      const updatedMedicineTypes = await ListMedicineType();
      setMedicineTypes(updatedMedicineTypes);
    } catch (error) {
      console.error("Error adding medicine:", error);
      message.error("ไม่สามารถเพิ่มประเภทยาได้");
    }
  };

  const columns: ColumnType<MedicineType>[] = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#9F5255",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
          width: "10%"
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
    },
    {
      title: "ประเภทยา",
      dataIndex: "MedicineType",
      key: "MedicineType",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#9F5255",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "left",
        },
      }),
    },
    {
      title: "แก้ไข",
      key: "edit",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#9F5255",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      render: (_, medicineType: MedicineType) => (
        <Button onClick={() => showEditModal(medicineType)} type="primary">
          แก้ไข
        </Button>
      ),
    },
  ]
  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>MEDICINE TYPE</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            danger={true}
            onClick={handleDelete}
            disabled={selectedMedicineTypeIds.length === 0}
            style={{ marginBottom: 20 }}
          >
            <DeleteOutlined />ลบประเภทยาที่เลือก
          </Button>
          <Button type="primary" onClick={() => setIsModalAddVisible(true)} style={{ backgroundColor: "#FDA50D", borderColor: "#FDA50D" }}><PlusSquareOutlined />เพิ่มประเภทยาตัวใหม่</Button>


        </div>
        <Table
          columns={columns}
          dataSource={medicineTypes}
          rowKey="ID"
          bordered
          pagination={{ pageSize: 5, showQuickJumper: true }}
          rowSelection={rowSelection}
        >

        </Table>

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>แก้ไขประเภทยา</span>}
          open={isModalVisible}
          onOk={() => updateForm.submit()}
          onCancel={() => {
            setIsModalVisible(false);
            updateForm.resetFields();
          }}
          okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}
        >
          <Form
            form={updateForm}
            initialValues={{
              MedicineType: updatedMedicineType,
            }}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item
              label="ประเภทยา"
              name="MedicineType"
              rules={[
                { required: true, message: "กรุณากรอกประเภทยา" },
                { min: 2, message: "ชื่อประเภทยาต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                { max: 100, message: "ชื่อประเภทยาต้องไม่เกิน 100 ตัวอักษร" },
                {
                  validator: (_, value) => {
                    if (medicineTypes.some((type) => type.MedicineType === value)) {
                      return Promise.reject(new Error("ชื่อประเภทยาซ้ำ"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                value={updatedMedicineType}
                onChange={(e) => setUpdatedMedicineType(e.target.value)}
                style={{ marginBottom: 10 }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal title={<span style={{ color: "#895E3C", fontSize: "20px" }}>เพิ่มประเภทยา</span>} open={isModalAddVisible} onOk={() => addForm.submit()} onCancel={() => { setIsModalAddVisible(false); addForm.resetFields(); }} okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }} >
          <Form
            form={addForm}
            onFinish={handleAdd}
            layout="vertical"
          >
            <Form.Item label="ชื่อประเภทยา" name="MedicineType"
              rules={[
                { required: true, message: "กรุณากรอกประเภทยา" },
                { min: 2, message: "ชื่อประเภทยาต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                { max: 100, message: "ชื่อประเภทยาต้องไม่เกิน 100 ตัวอักษร" },
                {
                  validator: (_, value) => {
                    if (medicineTypes.some((type) => type.MedicineType === value)) {
                      return Promise.reject(new Error("ชื่อประเภทยาซ้ำ"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}><Input /></Form.Item>
          </Form>

        </Modal>


      </div>
    </div>

  );

};
export default MedicineTypePage;