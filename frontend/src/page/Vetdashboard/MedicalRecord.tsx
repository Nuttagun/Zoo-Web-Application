import React, { useEffect, useState } from "react";
import Sidebar from "../../component/sidebar/sidebarvet"; // ใช้ Sidebar จาก VetDashboard
import { Button, Input, Modal, Table, message, DatePicker, Form, InputNumber } from "antd";
import { deleteMedicalRecordById, getMedicalRecordById, getMedicalRecords, updateMedicalRecordAndTreatmentById } from "../../services/https/kim/ServiceForMedicalRecord";
import { MedicalRecord, Treatment } from "../../interface/IMedicalrecord";
import { ColumnType } from "antd/es/table";
import moment from "moment";
import { DeleteOutlined } from "@ant-design/icons";
import "../VehicleManager/vehicle.css"

const MedicalRecordDashboard: React.FC = () => {
  const [MedicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]); // เก็บข้อมูล medical records
  const [activeMenu, setActiveMenu] = useState("MedicalRecord");  // เปลี่ยนค่า activeMenu
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updatedDiagnosisDate, setUpdatedDiagnosisDate] = useState<moment.Moment | null>(null);
  const [updatedDiagnosis, setUpdatedDiagnosis] = useState("");
  const [updatedSymptoms, setUpdatedSymptoms] = useState("");
  const [updatedTotalCost, setUpdatedTotalCost] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const [treatment, setTreatment] = useState<Treatment[]>([]);



  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const records = await getMedicalRecords(); // ดึงข้อมูลเวชระเบียน
        setMedicalRecords(records); // เก็บข้อมูลที่ดึงมาใน state
      } catch (error) {
        console.error("Error fetching medical records:", error);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลเวชระเบียน");
      }
    };

    fetchMedicalRecords(); // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูล
  }, []);

  const showEditModal = async (record: MedicalRecord) => {
    setEditingRecord(record);
    try {
      // ดึงข้อมูลเวชระเบียนตาม ID ที่จะทำการแก้ไข
      const fetchedRecord = await getMedicalRecordById(record.ID);

      // ตั้งค่า Medical Record
      setUpdatedDiagnosisDate(fetchedRecord.DiagnosisDate ? moment(fetchedRecord.DiagnosisDate) : null);
      setUpdatedDiagnosis(fetchedRecord.Diagnosis);
      setUpdatedSymptoms(fetchedRecord.Symptoms);
      setUpdatedTotalCost(fetchedRecord.TotalCost);

      // ตั้งค่า Treatment (กรณีที่มีข้อมูล)
      if (fetchedRecord.Treatment) {
        setTreatment([fetchedRecord.Treatment]);
      } else {
        setTreatment([{ ID: 0, TreatmentPlan: "" }]); // กรณีไม่มี Treatment ให้ตั้งค่าว่าง
      }

      setIsModalVisible(true);
    } catch (error) {
      message.error("ไม่สามารถดึงข้อมูลเวชระเบียนและแผนการรักษาได้");
    }
  };


  const handleUpdate = async (values: { DiagnosisDate: moment.Moment | null; Diagnosis: string; Symptoms: string; TotalCost: number | undefined; TreatmentPlan: string; }) => {
    if (editingRecord) {
      const updatedData = {
        medicalRecord: {
          ...editingRecord,
          DiagnosisDate: values.DiagnosisDate ? values.DiagnosisDate.toISOString() : undefined,
          Diagnosis: values.Diagnosis,
          Symptoms: values.Symptoms,
          TotalCost: values.TotalCost,
        },
        treatment: {
          TreatmentPlan: values.TreatmentPlan,
        },
      };

      try {
        // เรียกใช้ Service ที่แก้ไขใหม่
        await updateMedicalRecordAndTreatmentById(editingRecord.ID, updatedData);
        message.success("อัปเดตข้อมูลเวชระเบียนและการรักษาเรียบร้อยแล้ว");
        setIsModalVisible(false);

        setTimeout(() => {
          window.location.reload(); // รีเฟรชหน้าทั้งหมด
        }, 2000); // ดีเลย์ 3 วินาที
      } catch (error) {
        console.error("Error updating record:", error);
        message.error("ไม่สามารถอัปเดตข้อมูลเวชระเบียนและการรักษาได้");
      }
    }
  };



  const rowSelection = {
    selectedRowKeys: selectedRecordIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRecordIds(selectedRowKeys as number[]);
    },
  };

  const handleDelete = async () => {
    if (selectedRecordIds.length === 0) {
      message.warning("กรุณาเลือกเวชระเบียนที่ต้องการลบ");
      return;
    }

    try {
      await Promise.all(
        selectedRecordIds.map((id) => deleteMedicalRecordById(id.toString())) // ใช้ service ของคุณ
      );
      message.success("ลบเวชระเบียนเรียบร้อยแล้ว");

      // รีเฟรชหน้าหลังจากลบ
      setTimeout(() => {
        window.location.reload(); // รีเฟรชหน้าทั้งหมด
      }, 2000);
      setSelectedRecordIds([]); // เคลียร์การเลือกเวชระเบียนหลังจากลบ
    } catch (error) {
      message.error("ไม่สามารถลบเวชระเบียนได้");
    }
  };




  // คอลัมน์สำหรับแสดงข้อมูล Medical Records
  const columns: ColumnType<MedicalRecord>[] = [
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
      title: "วันที่วินิจฉัย",
      dataIndex: "DiagnosisDate",
      key: "DiagnosisDate",
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
      render: (date: string) => new Date(date).toLocaleDateString("th-TH")
    },
    {
      title: "การวินิจฉัย",
      dataIndex: "Diagnosis",
      key: "Diagnosis",
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
      title: "อาการ",
      dataIndex: "Symptoms",
      key: "Symptoms",
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
      title: "ค่าใช้จ่ายรวม",
      dataIndex: "TotalCost",
      key: "TotalCost",
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
      render: (cost: number) =>
        cost.toLocaleString("th-TH", { style: "currency", currency: "THB" }),
    },
    {
      title: "แผนการรักษา",
      dataIndex: "Treatment",
      key: "Treatment",
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
      render: (treatment: Treatment) => treatment?.TreatmentPlan || "ไม่มีข้อมูล",
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
      render: (_, record: MedicalRecord) => (
        <Button onClick={() => showEditModal(record)} type="primary">
          แก้ไข
        </Button>
      ),
    },
  ];

  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>
          MEDICALRECORD DASHBOARD
        </h1>
        <Button
          danger={true}
          onClick={handleDelete}
          disabled={selectedRecordIds.length === 0}
          style={{ marginBottom: 20 }}
        >
          <DeleteOutlined />
          ลบเวชระเบียนที่เลือก
        </Button>

        <Table
          columns={columns}
          dataSource={MedicalRecords}
          rowKey="ID"
          bordered
          pagination={{ pageSize: 5, showQuickJumper: true }}
          rowSelection={rowSelection} // Handle row selection
        />

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>ประวัติการรักษาสัตว์</span>}
          open={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => setIsModalVisible(false)}
          okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}
        >
          <Form
            form={form}
            initialValues={{
              DiagnosisDate: updatedDiagnosisDate,
              Diagnosis: updatedDiagnosis,
              Symptoms: updatedSymptoms,
              TotalCost: updatedTotalCost,
              TreatmentPlan: treatment?.[0]?.TreatmentPlan,
            }}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item
              label="วันที่วินิจฉัย"
              name="DiagnosisDate"
              rules={[{ required: true, message: "กรุณากรอกวันที่วินิจฉัย และ ลบวันที่เก่าออกก่อน" }]}
            >
              <DatePicker
                value={updatedDiagnosisDate}
                onChange={(date) => setUpdatedDiagnosisDate(date)}
                style={{ width: "100%", marginBottom: 10 }}
              />
            </Form.Item>

            <Form.Item
              label="การวินิจฉัย"
              name="Diagnosis"
              rules={[
                { required: true, message: "กรุณากรอกการวินิจฉัย" },
                { min: 1, max: 500, message: "การวินิจฉัยต้องมีความยาวระหว่าง 1 ถึง 500 ตัวอักษร" },
              ]}
            >
              <Input
                value={updatedDiagnosis}
                onChange={(e) => setUpdatedDiagnosis(e.target.value)}
                style={{ marginBottom: 10 }}
              />
            </Form.Item>

            <Form.Item
              label="อาการ"
              name="Symptoms"
              rules={[
                { required: true, message: "กรุณากรอกอาการ" },
                { min: 1, max: 500, message: "อาการต้องมีความยาวระหว่าง 1 ถึง 500 ตัวอักษร" },
              ]}
            >
              <Input
                value={updatedSymptoms}
                onChange={(e) => setUpdatedSymptoms(e.target.value)}
                style={{ marginBottom: 10 }}
              />
            </Form.Item>

            <Form.Item
              label="ค่าใช้จ่ายรวม"
              name="TotalCost"
              style={{ width: "460px" }}
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกจำนวนเงินในรูปแบบทศนิยมไม่เกิน 2 ตำแหน่ง",
                },
              ]}
            >
              <InputNumber
                placeholder="กรอกค่าใช้จ่าย"
                min={0} // ป้องกันค่าติดลบ
                step={0.01} // เพิ่มทีละ 0.01
                precision={2} // จำกัดทศนิยมไม่เกิน 2 ตำแหน่ง
                style={{ width: "100%" }}
                onKeyPress={(event) => {
                  // ตรวจสอบการพิมพ์ ให้รับเฉพาะตัวเลขและจุดทศนิยม
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={(value) => {
                  if (value === null || value < 0 || isNaN(value)) {
                    // หากค่าติดลบหรือไม่ใช่ตัวเลข รีเซ็ตเป็นค่าว่าง
                    return null;
                  }
                  return value;
                }}
              />
            </Form.Item>



            <Form.Item
              label="แผนการรักษา"
              name="TreatmentPlan"
              rules={[
                { required: true, message: "กรุณากรอกแผนการรักษา" },
                { min: 1, max: 500, message: "แผนการรักษาต้องมีความยาวระหว่าง 1 ถึง 500 ตัวอักษร" },
              ]}
            >
              <Input
                value={treatment?.[0]?.TreatmentPlan}
                onChange={(e) =>
                  setTreatment([{ ...treatment[0], TreatmentPlan: e.target.value }])
                }
                style={{ marginBottom: 10 }}
              />
            </Form.Item>




          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MedicalRecordDashboard;
