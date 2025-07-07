import React, { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar/sidebarvet"; // Use Sidebar from VetDashboard
import { Table, message, Popover, Modal, Button } from "antd"; // Import Popover and ColumnType for showing medicines list
import { FaPills } from "react-icons/fa"; // Use FaPills icon
import { ListPrescriptions } from "../../services/https/kim/ServiceForPrescirption"; // Import ListPrescriptions service
import { Prescription, Medicine } from "../../interface/IMedicalrecord"; // Prescription interface
import { ColumnType } from "antd/es/table";
import { deletePrescriptionById } from "../../services/https/kim/ServiceForPrescirption";
import { PrinterIcon } from "lucide-react";
import { DeleteOutlined } from "@ant-design/icons";
import "../VehicleManager/vehicle.css"

const PrescriptionDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]); // Store prescription data
  const [activeMenu, setActiveMenu] = useState("Prescriptions"); // Active menu for Sidebar
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPrescriptionIds, setSelectedPrescriptionIds] = useState<number[]>([]);


  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await ListPrescriptions();
        console.log('Raw API response:', data); // ดูข้อมูลที่ได้จาก API
        if (Array.isArray(data)) {
          setPrescriptions(data);
        } else {
          setPrescriptions([]);
          console.warn('API did not return an array:', data);
        }
      } catch (error) {
        console.error('API Error:', error);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูลใบสั่งยา");
      }
    };

    fetchPrescriptions();
  }, []);

  const showModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedPrescription(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedPrescription(null);
  };

  const rowSelection = {
    selectedRowKeys: selectedPrescriptionIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedPrescriptionIds(selectedRowKeys as number[]);
    },
  };

  const handleDelete = async () => {
    if (selectedPrescriptionIds.length === 0) {
      message.warning("กรุณาเลือกเวชระเบียนที่ต้องการลบ");
      return;
    }

    try {
      await Promise.all(
        selectedPrescriptionIds.map((id) => deletePrescriptionById(id.toString())) // Use your service
      );
      message.success("ลบเวชระเบียนเรียบร้อยแล้ว");
      const updatedPrescriptions = await ListPrescriptions(); // Fetch updated prescriptions data
      setTimeout(() => {
        window.location.reload(); // รีเฟรชหน้าทั้งหมด
      }, 500);
      setPrescriptions(updatedPrescriptions); // Update state with new data
      setSelectedPrescriptionIds([]); // Clear selected IDs after delete
    } catch (error) {
      message.error("ไม่สามารถลบเวชระเบียนได้");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (selectedPrescription) {
      const printContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4CAF50;">รายละเอียดใบสั่งยา</h2>
            <p><strong>ID:</strong> ${selectedPrescription.ID}</p>
            <p><strong>ความถี่:</strong> ${selectedPrescription.Frequency}</p>
            <p><strong>ระยะเวลา:</strong> ${selectedPrescription.Duration}</p>
            <p><strong>วันที่เริ่มต้น:</strong> ${new Date(selectedPrescription.StartDate).toLocaleDateString("th-TH")}</p>
            <p><strong>วันที่สิ้นสุด:</strong> ${new Date(selectedPrescription.EndDate).toLocaleDateString("th-TH")}</p>
            <p><strong>หมายเหตุ:</strong> ${selectedPrescription.Note}</p>
            <p><strong>ยา:</strong></p>
            <ul>
              ${selectedPrescription.Medicines.map(medicine => `
                <li>${medicine.MedicineName} (${medicine.Dosage}) <span style="color: #D20103;">วันหมดอายุ: ${new Date(medicine.ExpiryDate).toLocaleDateString("th-TH")}</span></li>
              `).join('')}
            </ul>
          </div>
        `;
      printWindow?.document.write(printContent);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  // Columns to display prescription data in the table
  const columns: ColumnType<Prescription>[] = [
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
      title: "ความถี่",
      dataIndex: "Frequency",
      key: "Frequency",
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
      title: "ระยะเวลา",
      dataIndex: "Duration",
      key: "Duration",
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
      title: "วันที่เริ่มต้น",
      dataIndex: "StartDate",
      key: "StartDate",
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
      title: "วันที่สิ้นสุด",
      dataIndex: "EndDate",
      key: "EndDate",
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
      title: "หมายเหตุ",
      dataIndex: "Note",
      key: "Note",
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
      title: "ยา",
      dataIndex: "Medicines",
      key: "Medicines",
      render: (medicines: Medicine[]) => (
        <Popover
          content={
            <ul>
              {medicines.map((medicine) => (
                <li key={medicine.ID}>
                  {medicine.MedicineName} ({medicine.Dosage})
                </li>
              ))}
            </ul>
          }
          title="List of Medicines"
          trigger="click"
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FaPills style={{ cursor: 'pointer', fontSize: '20px' }} />
          </div>
        </Popover>
      ),
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#9F5255",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      })
    },
    {
      title: "Actions",
      key: "actions",
      render: (_text, record) => (
        <Button type="primary" onClick={() => showModal(record)}>
          ดูรายละเอียด
        </Button>
      ),
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
  ];

  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>
          PRESCRIPTION DASHBOARD
        </h1>
        <Button
          danger={true}
          onClick={handleDelete}
          disabled={selectedPrescriptionIds.length === 0}
          style={{ marginBottom: 20 }}>
          <DeleteOutlined />ลบใบสั่งยาที่เลือก
        </Button>

        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="ID" // Unique key for each row
          bordered
          pagination={{ pageSize: 5, showQuickJumper: true }}
          rowSelection={rowSelection}
        />


        <Modal
          title={<h2 style={{ color: "#AB5739" }}>รายละเอียดใบสั่งยา</h2>}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{ style: { backgroundColor: "#895E3C", borderColor: "#895E3C" } }}
        >
          {selectedPrescription && (
            <div>
              <p><strong>:</strong> {selectedPrescription.ID}</p>
              <p><strong>ความถี่:</strong> {selectedPrescription.Frequency}</p>
              <p><strong>ระยะเวลา:</strong> {selectedPrescription.Duration}</p>
              <p>
                <strong>วันที่เริ่มต้น:</strong>{" "}
                {new Date(selectedPrescription.StartDate).toLocaleDateString("th-TH")}
              </p>
              <p>
                <strong>วันที่สิ้นสุด:</strong>{" "}
                {new Date(selectedPrescription.EndDate).toLocaleDateString("th-TH")}
              </p>
              <p><strong>หมายเหตุ:</strong> {selectedPrescription.Note}</p>
              <p><strong>ยา:</strong></p>
              <ul>
                {selectedPrescription.Medicines.map((medicine) => (
                  <li key={medicine.ID} style={{ marginBottom: "10px" }}>
                    {medicine.MedicineName} ({medicine.Dosage}){" "}
                    <span style={{ color: "#D20103" }}>
                      วันหมดอายุ: {new Date(medicine.ExpiryDate).toLocaleDateString("th-TH")}
                    </span>
                  </li>
                ))}
              </ul>
              <Button type="primary" onClick={handlePrint} style={{ backgroundColor: "#895E3C", borderColor: "#895E3C" }}><PrinterIcon /></Button>
            </div>
          )}
        </Modal>


      </div>
    </div>
  );
};

export default PrescriptionDashboard;

