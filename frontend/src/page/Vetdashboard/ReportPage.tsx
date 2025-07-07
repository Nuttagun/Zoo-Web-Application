import { useEffect, useState } from "react";
import { Medicine, ReportInterface, PrescriptionSend, TreatmentSend, MedicalRecord } from "../../interface/IMedicalrecord"; // Report interface
import { createMedicalRecordFromReport, getMedicalRecordByReportID, getMedicines, ListReports } from "../../services/https/kim/ServiceForMedicalRecord";
import { Button, message, Modal, Table, Form, Input, DatePicker, InputNumber, Select } from "antd";
import Sidebar from "../../component/sidebar/sidebarvet";
import { ClockCircleOutlined, CheckCircleOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { FaBriefcaseMedical, FaNotesMedical, FaPills } from "react-icons/fa";
import { updateMedicineById } from "../../services/https/kim/ServiceForPrescirption";
import "../VehicleManager/vehicle.css"
import { ColumnsType } from "antd/es/table";


const ReportPage: React.FC = () => {
  const [reports, setReports] = useState<ReportInterface[]>([]); // Store report data
  const [activeMenu, setActiveMenu] = useState("Reports"); // Active menu for Sidebar
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reportID, setReportID] = useState<number | undefined>();
  const [formattedMedicines, setFormattedMedicines] = useState<{ label: string; value: number }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionSend | null>(null);
  const [treatmentData, setTreatmentData] = useState<TreatmentSend | null>(null);
  const [prescriptionForm] = Form.useForm();
  const [treatmentForm] = Form.useForm();
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportInterface[]>([]);
  // @ts-ignore
  const [statusFilter, setStausFilter] = useState<string>("All");
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [isViewMedicalRecordModalOpen, setIsViewMedicalRecordModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportInterface | null>(null);
  const [medical, setMedicalRecord] = useState<MedicalRecord[]>([]);

  const handleCreateMedicalRecordClick = (reportID: number) => {
    setReportID(reportID);
    setIsModalOpen(true);
  };

  const handleSavePrescription = () => {
    prescriptionForm.validateFields().then((values) => {
      console.log("Form values:", values);
      const prescriptionData: PrescriptionSend = {
        Frequency: values.Frequency,
        Duration: values.Duration,
        StartDate: values.StartDate,
        EndDate: values.EndDate,
        Note: values.Note,
        Medicines: selectedMedicines.map(med => med.ID)
      };

      setPrescriptionData(prescriptionData);
      message.success("บันทึกใบสั่งยาเรียบร้อย");
      console.log("Prescription Data:", prescriptionData);
      setIsPrescriptionModalOpen(false);
    }).catch((error) => {
      console.error("Validation Error:", error);
      message.error("กรุณากรอกข้อมูลให้ครบถ้วนและตรงตามเงื่อนไข");
    });
  };

  const handleSaveTreatmentPlan = () => {
    treatmentForm.validateFields().then((values) => {
      const treatmentData = {
        TreatmentPlan: values.TreatmentPlan,
      };

      setTreatmentData(treatmentData); // Save to state
      console.log("Treatment Data:", treatmentData); // Log the data
      message.success("บันทึกแผนการรักษาเรียบร้อย");
      setIsTreatmentModalOpen(false);
    })
      .catch((errorInfo) => {
        // errorInfo contains validation errors
        console.error("Validation Error:", errorInfo);
        message.error("กรุณากรอกข้อมูลให้ครบถ้วนหรือตรงตามเงื่อนไข");
      });
  };



  useEffect(() => {
    const fetchReports = async () => {
      try {
        const dataReport = await ListReports(); // Fetch reports data
        setReports(dataReport); // Store fetched data in state
        console.log("data:", dataReport);
        setFilteredReports(dataReport);
      } catch (error: any) {
        console.error("Error fetching reports:", error);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
      }
    };

    const fetchMedicines = async () => {
      try {
        const dataMedicine = await getMedicines();
        // แปลงข้อมูลให้เหมาะสมกับ Select
        const formattedMedicines = dataMedicine.map((med: Medicine) => ({
          label: med.MedicineName, // ใช้ชื่อยาเป็นตัวแสดงผล
          value: med.ID, // ใช้ ID เป็นค่าที่ส่งออกเมื่อเลือก
        }));
        setFormattedMedicines(formattedMedicines); // อัปเดต formattedMedicines สำหรับ Select
        setMedicines(dataMedicine); // เก็บข้อมูลเต็มของยา
        console.log("Formatted Medicines:", formattedMedicines); // ตรวจสอบข้อมูล
      } catch (error: any) {
        console.error("Error fetching medicines:", error);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลยา");
      }
    };


    fetchReports();
    fetchMedicines(); // Call the function to fetch data
  }, []);

  const handleStatusChange = (value: string) => {
    setStausFilter(value);
    if (value === "") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter((report) => report.StatusVet === value);
      setFilteredReports(filtered);
    }
  }

  const handleCreateMedicalRecord = async (values: any) => {
    const employeeID = localStorage.getItem("employeeid");
    if (!employeeID) {
      message.error("ไม่พบ EmployeeID ใน localStorage");
      return;
    }
    if (!reportID) {
      message.error("ReportID ไม่ถูกต้อง");
      return;
    }
    if (!treatmentData || !treatmentData.TreatmentPlan) {
      message.error("กรุณาเพิ่มแผนการรักษาก่อนสร้าง Medical Record");
      return;
    }

    const formatEmployeeID = parseInt(employeeID);
    const formattedReportId = reportID.toString();
    const prescription = prescriptionData;
    const treatment = treatmentData;

    const requestData = {
      ReportID: reportID,
      MedicalRecord: {
        DiagnosisDate: values.DiagnosisDate,
        Diagnosis: values.Diagnosis || "",
        Symptoms: values.Symptoms || "",
        RecordDate: values.RecordDate,
        TotalCost: parseFloat(values.TotalCost) || 0,
        EmployeeID: formatEmployeeID,
        ReportID: reportID,
        TreatmentID: null,
      },
      Treatment: {
        TreatmentPlan: treatment?.TreatmentPlan || "",
      },
      Prescription: prescription?.Frequency ? {
        Frequency: prescription.Frequency || "",
        Duration: prescription.Duration || "",
        StartDate: prescription.StartDate || null,
        EndDate: prescription.EndDate || null,
        Note: prescription.Note || "",
        EmployeeID: employeeID,
      } : null,
      MedicineIDs: prescription?.Medicines || [],
    };


    try {
      // @ts-ignore
      const response = await createMedicalRecordFromReport(formattedReportId, requestData);

      // Update medicine stock after successful medical record creation
      if (prescription?.Medicines && prescription.Medicines.length > 0) {
        await Promise.all(prescription.Medicines.map(medicineId => updateMedicineStock(medicineId)));
        message.success("บันทึกข้อมูลการรักษาและอัพเดตสต็อกยาสำเร็จ!");
      } else {
        message.success("บันทึกข้อมูลการรักษาสำเร็จ!");
      }

      setIsModalOpen(false);
      setTimeout(() => {
        window.location.reload(); // รีเฟรชหน้าทั้งหมด
      }, 2000);
      form.resetFields();
      prescriptionForm.resetFields();
      treatmentForm.resetFields();
      setPrescriptionData(null);
      setTreatmentData(null);

      // Refresh medicines data
      const updatedMedicines = await getMedicines();
      setMedicines(updatedMedicines);

    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error("Error during POST:", error);
    }
  };

  const updateMedicineStock = async (medicineId: number) => {
    try {
      const medicine = medicines.find(m => m.ID === medicineId);
      if (medicine && medicine.Stock > 0) {
        const updatedMedicine = {
          ...medicine,
          Stock: medicine.Stock - 1
        };
        await updateMedicineById(medicineId, updatedMedicine);
      }
    } catch (error) {
      console.error(`Error updating stock for medicine ${medicineId}:`, error);
      throw error;
    }
  };




  const handleMedicineChange = (value: number[]) => {
    const selectedMedicines = medicines.filter(med => value.includes(med.ID));
    setSelectedMedicines(selectedMedicines); // เก็บยาที่เลือก 
    console.log("Selected Medicines:", selectedMedicines);
  };

  const handleViewReports = (reportID: number) => {
    const report = reports.find((r) => r.ID === reportID);
    if (report) {
      setSelectedReport(report); // เก็บข้อมูลรีพอร์ตที่เลือก
      setIsViewReportModalOpen(true); // เปิด Modal
    } else {
      message.error("ไม่พบข้อมูลรีพอร์ต");
    }
  };

  const handleViewMedicalRecord = async (reportID: number) => {
    try {
      const response: any = await getMedicalRecordByReportID(reportID); // ดึงข้อมูล
      console.log("Fetched response:", response);

      // ดึงเฉพาะข้อมูลใน `data`
      const medicalRecord = response.data || [];

      if (Array.isArray(medicalRecord) && medicalRecord.length > 0) {
        setMedicalRecord(medicalRecord); // เก็บข้อมูลลง State
        setIsViewMedicalRecordModalOpen(true); // เปิด Modal
      } else {
        message.error("ไม่พบข้อมูลประวัติการรักษา");
      }
    } catch (error) {
      console.error("Error fetching medical record:", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการรักษา");
    }
  };





  const columnsReport: ColumnsType<ReportInterface> = [
    {
      title: "ภาพสัตว์ที่ป่วย",
      dataIndex: "Picture",
      key: "Picture",
      align: "center",
      render: (path: string) => (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <img
            src={`http://localhost:8000/${path}`}
            alt="Picture"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </div>
      ),
    },
    {
      title: "ชื่อรีพอร์ต",
      dataIndex: "Title",
      key: "Title",
      align: "center",
    },
    {
      title: "คำอธิบาย",
      dataIndex: "Description",
      key: "Description",
      align: "center",
    },
    {
      title: "Report Date",
      dataIndex: "ReportDate",
      key: "ReportDate",
      align: "center",
      render: (date: string) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "Status Vet",
      dataIndex: "StatusVet",
      key: "StatusVet",
      align: "center",
      render: (status: string) => (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          {status === "Success" ? (
            <CheckCircleOutlined style={{ color: "green", fontSize: "20px" }} />
          ) : (
            <ClockCircleOutlined style={{ color: "red", fontSize: "20px" }} />
          )}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_: any, record: ReportInterface) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {record.StatusVet === "Success" ? (
            <Button
              onClick={() => record.ID !== undefined && handleViewMedicalRecord(record.ID)}
              shape="circle"
              icon={<FaNotesMedical />}
              size="large"
            />
          ) : (
            <Button
              onClick={() => record.ID !== undefined && handleCreateMedicalRecordClick(record.ID)}
              shape="circle"
              icon={<FaBriefcaseMedical />}
              size="large"
            />
          )}
        </div>
      ),
    },
    {
      title: "รายงาน",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            onClick={() => record.ID !== undefined && handleViewReports(record.ID)}
          >
            ดูรายละเอียด
          </Button>
        </div>
      ),
    }

  ];

  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>
          REPORT DASHBOARD
        </h1>
        <br />
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ marginRight: "10px", fontSize: "15px" }}>เลือกสถานะรีพอร์ต:</span>
          <Select
            style={{ marginTop: "9px", marginBottom: "10px", width: "200px", display: "flex", alignItems: "center" }}
            placeholder="กรองประเภท"
            defaultValue="ทุกประเภท"
            onChange={handleStatusChange}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            <Select.Option value="Success">
              <CheckCircleOutlined style={{ color: "green", fontSize: "10px", marginRight: "8px" }} />
              รีพอร์ตสำเร็จ
            </Select.Option>
            <Select.Option value="pending">
              <ClockCircleOutlined style={{ color: "red", fontSize: "10px", marginRight: "8px" }} />
              รีพอร์ตยังไม่สำเร็จ
            </Select.Option>

          </Select>
        </div>

        <Table rowKey="ID" dataSource={filteredReports} columns={columnsReport} pagination={{ pageSize: 5, showQuickJumper: true }} bordered locale={{ emptyText: "ไม่มี Report" }} />

        <Modal title={<span style={{ color: '#895E3C', fontWeight: 'bold' }}>สร้าง Medical Record</span>} open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}>
          <Form form={form} layout="vertical" onFinish={(values) => handleCreateMedicalRecord(values)}>

            <Form.Item label="การวินิจฉัย" name="Diagnosis"
              rules={[{ required: true, message: "กรุณากรอกการวินิจฉัย" }, { min: 1, max: 500, message: "การวินิจฉัยต้องมีความยาวระหว่าง 1 ถึง 500 ตัวอักษร" },]}><Input placeholder="การวินิจฉัย" />
            </Form.Item>

            <Form.Item label="อาการ" name="Symptoms"
              rules={[{ required: true, message: "กรุณากรอกอาการ" }, { min: 1, max: 500, message: "อาการต้องมีความยาวระหว่าง 1 ถึง 500 ตัวอักษร" },]}><Input placeholder="อาการ" />
            </Form.Item>

            <Form.Item label="วันที่วินิจฉัย" name="DiagnosisDate"
              rules={[{ required: true, message: "กรุณากรอกวันที่วินิจฉัย" }]}>
              <DatePicker onChange={(date) => { form.setFieldsValue({ DiagnosisDate: date }); }} />
            </Form.Item>

            <Form.Item
              label="จำนวนเงินทั้งหมด"
              name="TotalCost"
              style={{ width: "460px" }}
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกจำนวนเงินในรูปแบบทศนิยมไม่เกิน 2 ตำแหน่ง"
                },
              ]}
            >
              <InputNumber
                placeholder="Enter amount"
                maxLength={100}
                min={0} // ป้องกันค่าติดลบ
                step={0.01} // การเพิ่มทีละ 0.01
                precision={2} // จำกัดทศนิยมไม่เกิน 2 ตำแหน่ง
                style={{ width: "100%" }}
                onKeyPress={(event) => {
                  // ป้องกันการพิมพ์ตัวอักษรหรืออักขระที่ไม่ใช่ตัวเลขและทศนิยม
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>





            <Button type="primary" icon={<FaPills />} style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", color: "#fff", marginRight: "10px" }} onClick={() => setIsPrescriptionModalOpen(true)}>เปิดใบสั่งยา</Button>
            <Button type="primary" icon={<MedicineBoxOutlined />} style={{ backgroundColor: "#4998FF", borderColor: "#4998FF", color: "#fff" }} onClick={() => setIsTreatmentModalOpen(true)}>เปิดแผนการรักษา</Button>
          </Form>
        </Modal>

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>.ใบสั่งยา</span>} open={isPrescriptionModalOpen} onCancel={() => setIsPrescriptionModalOpen(false)} onOk={handleSavePrescription} okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}>
          <Form form={prescriptionForm} layout="vertical">
            <Form.Item label="ยา" name="Medicines"
              rules={[{ required: true, message: "กรุณาเลือกยา" }]}>
              <Select
                mode="multiple"
                options={formattedMedicines}
                placeholder="เลือกยา"
                onChange={handleMedicineChange}
              />
            </Form.Item>
            <Form.Item label="ความถี่ในการให้ยา" name="Frequency"
              rules={[{ required: true, message: "กรุณากรอกความถี่ในการให้ยา" }, { min: 1, max: 100, message: "ความถี่ต้องมีความยาวระหว่าง 1 ถึง 100 ตัวอักษร" },]}>
              <Input />
            </Form.Item>

            <Form.Item label="ระยะเวลา" name="Duration"
              rules={[{ required: true, message: "กรุณากรอกระยะเวลา" }, { min: 1, max: 100, message: "ระยะเวลาต้องมีความยาวระหว่าง 1 ถึง 100 ตัวอักษร" },]}>
              <Input />
            </Form.Item>

            <Form.Item label="วันที่เริ่มใช้ยา" name="StartDate" rules={[{ required: true, message: "กรุณากรอกวันที่เริ่มใช้ยา" }]}>
              <DatePicker onChange={(date) => form.setFieldsValue({ StartDate: date?.format("YYYY-MM-DD HH:mm:ss+00:00") })} />
            </Form.Item>

            <Form.Item label="วันที่สิ้นสุดการใช้ยา" name="EndDate" rules={[{ required: true, message: "กรุณากรอกวันที่สิ้นสุดการใช้ยา" }, ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('StartDate') <= value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('วันที่สิ้นสุดการใช้ยาต้องไม่น้อยกว่าวันที่เริ่มใช้ยา'));
              },
            })]}>
              <DatePicker onChange={(date) => form.setFieldsValue({ EndDate: date?.format("YYYY-MM-DD HH:mm:ss+00:00") })} />
            </Form.Item>


            <Form.Item label="หมายเหตุ" name="Note" rules={[
              { required: true, message: "กรุณากรอกหมายเหตุ" },
              { max: 500, message: "หมายเหตุต้องไม่เกิน 500 ตัวอักษร" },]}>
              <Input.TextArea />
            </Form.Item>

            {selectedMedicines.map((med) => (
              <div key={med.ID} style={{ marginBottom: '10px' }}>
                <strong>ชื่อยา: </strong> {med.MedicineName} <br />
                <strong>ปริมาณยา: </strong> {med.Dosage} <br />
                <strong>วันหมดอายุ: </strong> {new Date(med.ExpiryDate).toLocaleDateString("th-TH", {
                  weekday: "long", // ชื่อวัน (เช่น จันทร์, อังคาร)
                  year: "numeric", // ปี (เช่น 2565)
                  month: "long", // เดือน (เช่น มกราคม, กุมภาพันธ์)
                  day: "numeric", // วัน (เช่น 3)
                })} <br />
                <strong>ประเภทยา: </strong> {med.MedicineType?.MedicineType} <br />
                <strong>จำนวนคงเหลือ: </strong> {med.Stock} <br />
                <strong>ราคา: </strong> {med.Price} บาท <br />
                <span>---------------------</span>
              </div>
            ))}
          </Form>
        </Modal>

        <Modal title={<span style={{ color: "#895E3C", fontSize: "20px" }}>แผนการรักษา</span>} open={isTreatmentModalOpen} onCancel={() => setIsTreatmentModalOpen(false)} onOk={handleSaveTreatmentPlan} okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}>
          <Form form={treatmentForm} layout="vertical">
            <Form.Item label="แผนการรักษา" name="TreatmentPlan" rules={[
              { required: true, message: "กรุณากรอกแผนการรักษา" },
              { min: 1, max: 500, message: "แผนการรักษาต้องมีความยาวระหว่าง 1 ถึง 500 ตัวอักษร" },]} >
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>รายละเอียดรีพอ์ต</span>}
          open={isViewReportModalOpen}
          onCancel={() => setIsViewReportModalOpen(false)}
          footer={[
          ]}
        >
          {selectedReport ? (
            <div>
              {selectedReport.Picture && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <img
                    src={`http://localhost:8000/${selectedReport.Picture}`}
                    alt="ภาพรีพอร์ต"
                    style={{ width: "100%", maxWidth: "100px", borderRadius: "8px", display: "block", margin: "0 auto" }}
                  />
                </div>
              )}
              <p><strong>ชื่อรีพอร์ต:</strong> {selectedReport.Title}</p>
              <p><strong>คำอธิบาย:</strong> {selectedReport.Description}</p>
              <p><strong>วันที่รายงาน:</strong> {selectedReport.ReportDate ? new Date(selectedReport.ReportDate).toLocaleDateString("th-TH") : "N/A"}</p>
              <p><strong>สถานะ:</strong> {selectedReport.StatusVet}</p>
              <p style={{ color: "red" }}><strong>รีพอร์ตได้รับมาจาก:</strong> {selectedReport.Employee?.User?.FirstName}</p>

            </div>
          ) : (
            <p>ไม่พบข้อมูลรีพอร์ต</p>
          )}
        </Modal>

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>รายละเอียดประวัติการรักษา</span>}
          open={isViewMedicalRecordModalOpen}
          onCancel={() => setIsViewMedicalRecordModalOpen(false)}
          footer={null}
        >
          {medical.length > 0 ? (
            medical.map((record) => (
              <div
                key={record.ID}
                style={{
                  marginBottom: "20px",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "10px",
                }}
              >
                <h3 style={{fontWeight:"bold"}}>Medical Record ID: {record.ID}</h3>
                <p>
                  <strong>วันที่วินิจฉัย :</strong>{" "}
                  {new Date(record.DiagnosisDate).toLocaleDateString("th-TH")}
                </p>
                <p>
                  <strong>การวินิจฉัย :</strong> {record.Diagnosis}
                </p>
                <p>
                  <strong>อาการ :</strong> {record.Symptoms}
                </p>
                <p>
                  <strong>ค่าใช้จ่ายทั้งหมด :</strong> ฿{record.TotalCost.toFixed(2)}
                </p>
                <p>
                  <strong>Role :</strong> {record.Employee?.User?.Username}
                </p>
                <p>
                  <strong>ชื่อสัตวแพทย์ :</strong> {record.Employee?.User?.FirstName}
                </p>
                <p>
                  <strong>แผนการรักษา:</strong> {record.Treatment?.TreatmentPlan || "ไม่มีแผนการรักษา"}
                </p>
                <div>
                  <strong>ใบสั่งยา:</strong>{" "}
                  {record.Prescription ? (
                    <div style={{ marginTop: "10px" }}>
                      <p>
                        <strong>เริ่มต้น:</strong> {new Date(record.Prescription.StartDate).toLocaleDateString("th-TH")}
                      </p>
                      <p>
                        <strong>สิ้นสุด:</strong> {new Date(record.Prescription.EndDate).toLocaleDateString("th-TH")}
                      </p>
                      <p>
                        <strong>ความถี่:</strong> {record.Prescription.Frequency}
                      </p>
                      <p>
                        <strong>ระยะเวลา:</strong> {record.Prescription.Duration}
                      </p>
                      <p>
                        <strong>หมายเหตุ:</strong> {record.Prescription.Note || "ไม่มีหมายเหตุ"}
                      </p>
                      <p>
                        <strong>ยาที่กำหนด:</strong>{" "}
                        {record.Prescription.Medicines && record.Prescription.Medicines.length > 0
                          ? record.Prescription.Medicines.map((medicine) => medicine.MedicineName).join(", ")
                          : "ไม่มีข้อมูลยา"}
                      </p>
                    </div>
                  ) : (
                    <p>ไม่มีใบสั่งยา</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>ไม่พบข้อมูลประวัติการรักษา</p>
          )}
        </Modal>


      </div>
    </div>
  );
};

export default ReportPage; // Export the component

