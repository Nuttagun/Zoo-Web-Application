import Table, { ColumnType } from "antd/es/table";
import Sidebar from "../../component/sidebar/sidebarvet";
import { useEffect, useState } from "react";
import { Medicine, MedicineType } from "../../interface/IMedicalrecord";
import { getMedicines } from "../../services/https/kim/ServiceForMedicalRecord";
import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Select } from "antd";
import { DeleteOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { deleteMedicineById, getMedicineById, updateMedicineById, ListMedicineType, createMedicine } from "../../services/https/kim/ServiceForPrescirption";
import moment from "moment";
import "../VehicleManager/vehicle.css"

const MedicineManager: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("MedicineManager");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicineIds, setSelectedMedicineIds] = useState<number[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [updateForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [updatedMedicineName, setUpdatedMedicineName] = useState<string>("");
  const [updatedDosage, setUpdatedDosage] = useState<string>("");
  const [updatedPrice, setUpdatedPrice] = useState<number>(0);
  const [updatedStock, setUpdatedStock] = useState<number>(0);
  const [updatedExpiryDate, setUpdatedExpiryDate] = useState<moment.Moment | null>(null);
  const [medicineTypeOptions, setMedicineTypeOptions] = useState<MedicineType[]>([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await getMedicines();
        console.log("Raw Medicine data: ", data);
        if (Array.isArray(data)) {
          setMedicines(data);
        } else {
          setMedicines([]);
          console.log("Data is not an array");
        }
      } catch (error) {
        console.log("Error fetching medicine data: ", error);
        message.error("เกิดข้อผิดพลาดในการดึงยา");
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    const fetchMedicineTypes = async () => {
      try {
        const dataMedicineType = await ListMedicineType();
        console.log("MedicineType", dataMedicineType);
        if (Array.isArray(dataMedicineType)) {
          setMedicineTypeOptions(dataMedicineType);
        } else {
          setMedicineTypeOptions([]);
          console.log("Data is not an array");
        }
      } catch (error) {
        console.log("Error fetching medicineType data: ", error);
        message.error("เกิดข้อผิดพลาดในการดึงประเภทยา");
      }
    };
    fetchMedicineTypes();
  }, []);

  const handleDelete = async () => {
    if (selectedMedicineIds.length === 0) {
      message.error("กรุณาเลือกยาที่ต้องการลบ");
      return;
    }

    try {
      await Promise.all(selectedMedicineIds.map((id) => deleteMedicineById(id.toString())));
      message.success("ลบยาเรียบร้อย");
      const updateMedicine = await getMedicines();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      setMedicines(updateMedicine);
      setSelectedMedicineIds([]);
    } catch (error) {
      console.log("Error deleting medicine: ", error);
      message.error("เกิดข้อผิดพลาดในการลบยา");
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedMedicineIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedMedicineIds(selectedRowKeys as number[]);
    },
  };

  const showEditModal = async (medicine: Medicine) => {
    setEditingMedicine(medicine);
    try {
      const fetchedRecord = await getMedicineById(medicine.ID);
      console.log("Fetched record:", fetchedRecord);

      updateForm.setFieldsValue({
        ExpiryDate: fetchedRecord.ExpiryDate ? moment(fetchedRecord.ExpiryDate) : null,
        MedicineName: fetchedRecord.MedicineName,
        Dosage: fetchedRecord.Dosage,
        Price: fetchedRecord.Price,
        Stock: fetchedRecord.Stock,
        MedicineTypeID: fetchedRecord.MedicineTypeID,
      });

      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching record:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    }
  };

  const handleUpdate = async (values: {
    ExpiryDate: moment.Moment | null;
    MedicineName: string;
    Dosage: string;
    Price: number | undefined;
    Stock: number | undefined;
    MedicineTypeID: number;
  }) => {
    if (editingMedicine) {
      const { MedicineType, ...restEditingMedicine } = editingMedicine;

      const updatedData: Medicine = {
        ...restEditingMedicine,
        ExpiryDate: values.ExpiryDate ? values.ExpiryDate.toISOString() : "",
        MedicineName: values.MedicineName,
        Dosage: values.Dosage,
        Price: values.Price ?? 0,
        Stock: values.Stock ?? 0,
        MedicineTypeID: values.MedicineTypeID,
      };

      console.log("Values from form:", values);
      console.log("Data to be updated:", updatedData);

      try {
        const response = await updateMedicineById(editingMedicine.ID, updatedData);
        console.log("Update response:", response);
        message.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
        setIsModalVisible(false);

        const newData = await getMedicines();
        setMedicines(newData);
      } catch (error) {
        console.error("Error updating record:", error);
        message.error("ไม่สามารถอัปเดตข้อมูลได้");
      }
    }
  };


  const handleAdd = async (values: {
    ExpiryDate: moment.Moment | null;
    MedicineName: string;
    Dosage: string;
    Price: number;
    Stock: number;
    MedicineTypeID: number;
  }) => {
    try {
      const newMedicine = {
        MedicineName: values.MedicineName,
        Dosage: values.Dosage,
        Price: values.Price,
        Stock: values.Stock,
        MedicineTypeID: values.MedicineTypeID,
        ExpiryDate: values.ExpiryDate ? values.ExpiryDate.toISOString() : "",
      };

      await createMedicine(newMedicine);  // ต้องสร้าง function นี้ใน service
      message.success("เพิ่มยาเรียบร้อยแล้ว");
      setIsModalAddVisible(false);
      addForm.resetFields();

      // รีเฟรชข้อมูล
      const updatedMedicines = await getMedicines();
      setMedicines(updatedMedicines);
    } catch (error) {
      console.error("Error adding medicine:", error);
      message.error("ไม่สามารถเพิ่มยาได้");
    }
  };

  const columns: ColumnType<Medicine>[] = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
    },
    {
      title: "ชื่อยา",
      dataIndex: "MedicineName",
      key: "MedicineName",
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
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
      render: (medicineType: MedicineType) => medicineType?.MedicineType || "N/A",
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
    },
    {
      title: "ปริมาณยา",
      dataIndex: "Dosage",
      key: "Dosage",
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
    },
    {
      title: "ราคา (บาท)",
      dataIndex: "Price",
      key: "Price",
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
    },
    {
      title: "จำนวนยาที่เหลือ",
      dataIndex: "Stock",
      key: "Stock",
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
    },
    {
      title: "วันหมดอายุ",
      dataIndex: "ExpiryDate",
      key: "ExpiryDate",
      render: (date: string) => new Date(date).toLocaleDateString("th-TH"),
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
    },
    {
      title: "แก้ไข",
      key: "edit",
      onHeaderCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      onCell: () => ({
        style: {
          textAlign: "center",
        },
      }),
      render: (_, medicine: Medicine) => (
        <Button onClick={() => showEditModal(medicine)} type="primary">
          แก้ไข
        </Button>
      ),
    },
  ];


  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>MEDICINE MANAGE</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            danger={true}
            onClick={handleDelete}
            disabled={selectedMedicineIds.length === 0}
            style={{ marginBottom: 20 }}
          >
            <DeleteOutlined />ลบยาที่เลือก
          </Button>

          <Button type="primary" onClick={() => setIsModalAddVisible(true)} style={{ backgroundColor: "#FDA50D", borderColor: "#FDA50D" }}><PlusSquareOutlined />เพิ่มยาตัวใหม่</Button>
        </div>
        <Table
          columns={columns}
          dataSource={medicines}
          rowKey="ID"
          bordered
          pagination={{ pageSize: 5, showQuickJumper: true }}
          rowSelection={rowSelection}
        />

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>แก้ไขยา</span>}
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
              ExpiryDate: updatedExpiryDate,
              MedicineName: updatedMedicineName,
              Dosage: updatedDosage,
              Price: updatedPrice,
              Stock: updatedStock,
              MedicineTypeID: editingMedicine?.MedicineTypeID,
            }}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item
              label="ชื่อยา"
              name="MedicineName"
              rules={[
                { required: true, message: "กรุณากรอกชื่อยา" },
                { min: 2, message: "ชื่อยาต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                { max: 100, message: "ชื่อยาต้องไม่เกิน 100 ตัวอักษร" },
                {
                  validator: (_, value) => {
                    if (medicines.some(medicine => medicine.MedicineName === value && medicine.ID !== editingMedicine?.ID)) {
                      return Promise.reject(new Error("ชื่อยานี้มีอยู่แล้ว"));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                value={updatedMedicineName}
                onChange={(e) => setUpdatedMedicineName(e.target.value)}
                style={{ marginBottom: 10 }}
              />
            </Form.Item>
            <Form.Item
              label="ปริมาณยา"
              name="Dosage"
              rules={[
                { required: true, message: "กรุณากรอกปริมาณยา" },
                { min: 2, message: "ชื่อปริมาณยาต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                { max: 100, message: "ชื่อปริมาณยาต้องไม่เกิน 100 ตัวอักษร" },
              ]}
            >
              <Input
                value={updatedDosage}
                onChange={(e) => setUpdatedDosage(e.target.value)}
                style={{ marginBottom: 10 }}
              />
            </Form.Item>

            <Form.Item
              label="ราคา (บาท)"
              name="Price"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกจำนวนเงินตามด้วยทศนิยมมากสุด 2 ตำแหน่ง เช่น 100.01 หรือ 100",
                },
              ]}
            >
              <InputNumber
                value={updatedPrice}
                onChange={(value) => setUpdatedPrice(value !== null ? value : 0)}
                style={{ width: "100%", marginBottom: 10 }}
                min={0} // ป้องกันค่าติดลบ
                step={0.01} // การเพิ่มทีละ 0.01
                precision={2} // จำกัดทศนิยมไม่เกิน 2 ตำแหน่ง
                onKeyPress={(event) => {
                  // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="จำนวนยาที่เหลือ"
              name="Stock"
              rules={[
                { required: true, message: "กรุณากรอกตัวเลขเท่านั้น" },
              ]}
            >
              <InputNumber
                value={updatedStock}
                onChange={(value) => setUpdatedStock(value !== null ? value : 0)}
                style={{ width: "100%", marginBottom: 10 }}
                min={0} // ป้องกันค่าติดลบ
                step={1} // การเพิ่มทีละ 1
                precision={0} // ไม่อนุญาตให้มีจุดทศนิยม
                onKeyPress={(event) => {
                  // อนุญาตเฉพาะตัวเลข
                  if (!/^[0-9]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>


            <Form.Item
              label="วันหมดอายุของยา"
              name="ExpiryDate"
              rules={[
                { required: true, message: "กรุณากรอกวันหมดอายุ และ ลบวันที่เก่าออกก่อน" },
                {
                  validator: (_, value) =>
                    value && value.isBefore(moment(), 'day')
                      ? Promise.reject(new Error("วันหมดอายุห้ามต่ำกว่าวันปัจจุบัน"))
                      : Promise.resolve(),
                },
              ]}
            >
              <DatePicker
                value={updatedExpiryDate}
                onChange={(date) => setUpdatedExpiryDate(date)}
                style={{ width: "100%", marginBottom: 10 }}
              />
            </Form.Item>

            <Form.Item
              label="ประเภทยา"
              name="MedicineTypeID"
              rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
            >
              <Select>
                {medicineTypeOptions.map((type) => (
                  <Select.Option key={type.ID} value={type.ID}>
                    {type.MedicineType}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <Modal title={<span style={{ color: "#895E3C", fontSize: "20px" }}>เพิ่มยา</span>} open={isModalAddVisible} onOk={() => addForm.submit()} onCancel={() => { setIsModalAddVisible(false); addForm.resetFields(); }} okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}>
          <Form
            form={addForm}
            onFinish={handleAdd}
            layout="vertical"
          >
            <Form.Item
              label="ชื่อยา"
              name="MedicineName"
              rules={[
                { required: true, message: "กรุณากรอกชื่อยา" },
                { min: 2, message: "ชื่อยาต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                { max: 100, message: "ชื่อยาต้องไม่เกิน 100 ตัวอักษร" },
                {
                  validator: (_, value) => {
                    if (medicines.some(medicine => medicine.MedicineName === value)) {
                      return Promise.reject(new Error("ชื่อยานี้มีอยู่แล้ว"));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="ปริมาณยา"
              name="Dosage"
              rules={[
                { required: true, message: "กรุณาปริมาณยา" },
                { min: 2, message: "ชื่อปริมาณยาต้องมีความยาวอย่างน้อย 2 ตัวอักษร" },
                { max: 100, message: "ชื่อปริมาณยาต้องไม่เกิน 100 ตัวอักษร" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="ราคา (บาท)"
              name="Price"
              rules={[
                { required: true, message: "กรุณากรอกราคา" },
                { type: "number", message: "ราคาต้องเป็นตัวเลข" },
              ]}
            >
              <InputNumber
                placeholder="กรอกราคา (บาท)"
                style={{ width: "100%" }}
                min={0} // ป้องกันค่าติดลบ
                step={0.01} // การเพิ่มทีละ 0.01
                precision={2} // จำกัดทศนิยมไม่เกิน 2 ตำแหน่ง
                onKeyPress={(event) => {
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault(); // ป้องกันการพิมพ์ตัวอักษรหรือสัญลักษณ์แปลกปลอม
                  }
                }}
                onChange={(value) => {
                  if (value === null || value < 0 || isNaN(value)) {
                    // รีเซ็ตเป็นค่าว่างหากค่าติดลบหรือไม่ใช่ตัวเลข
                    return null;
                  }
                  return value;
                }}
              />
            </Form.Item>

            <Form.Item
              label="จำนวนยาที่มี"
              name="Stock"
              rules={[
                { required: true, message: "กรุณากรอกจำนวนยา" },
                { type: "number", message: "จำนวนยาต้องเป็นตัวเลข" },
              ]}
            >
              <InputNumber
                placeholder="กรอกจำนวนยา"
                style={{ width: "100%" }}
                min={0} // ป้องกันค่าติดลบ
                step={1} // การเพิ่มทีละ 1
                precision={0} // ไม่ให้มีทศนิยม
                onKeyPress={(event) => {
                  if (!/^[0-9]$/.test(event.key)) {
                    event.preventDefault(); // ป้องกันการพิมพ์ตัวอักษรหรือสัญลักษณ์แปลกปลอม
                  }
                }}
                onChange={(value) => {
                  if (value === null || value < 0 || isNaN(value)) {
                    // รีเซ็ตเป็นค่าว่างหากค่าติดลบหรือไม่ใช่ตัวเลข
                    return null;
                  }
                  return value;
                }}
              />
            </Form.Item>


            <Form.Item
              label="วันหมดอายุ"
              name="ExpiryDate"
              rules={[
                { required: true, message: "กรุณากรอกวันหมดอายุ" },
                {
                  validator: (_, value) =>
                    value && value.isBefore(moment(), 'day')
                      ? Promise.reject(new Error("วันหมดอายุห้ามต่ำกว่าวันปัจจุบัน"))
                      : Promise.resolve(),
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="ประเภทยา"
              name="MedicineTypeID"
              rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
            >
              <Select>
                {medicineTypeOptions.map((type) => (
                  <Select.Option key={type.ID} value={type.ID}>
                    {type.MedicineType}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </div>
  );
};

export default MedicineManager;
