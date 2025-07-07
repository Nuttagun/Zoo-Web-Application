import { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar/sidebarvet";
import { getAllAnimals } from "../../services/https/kim/http";
import { Vetdashboardinterface } from "../../interface/VetDashboard";
import { Button, Input, Modal, Select, Table, message } from "antd";
import { ManOutlined, SearchOutlined, WomanOutlined } from "@ant-design/icons";
import { FaSkull } from "react-icons/fa";
import { ColumnType } from "antd/es/table";
import "../VehicleManager/vehicle.css"
import { getReportsByAnimalID } from "../../services/https/kim/ServiceForMedicalRecord";
import { GetSexs } from "../../services/https";
import { SexsInterface } from "../../interface/ISex";


const AnimalDied = () => {
  const [activeMenu, setActiveMenu] = useState("animalsdied");
  const [animals, setAnimals] = useState<Vetdashboardinterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sexs, setSexs] = useState<SexsInterface[]>([]);
  const [searchName, setSearchName] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [reports, setReports] = useState<any[]>([]);  // สำหรับเก็บข้อมูลรายงาน
  const [historyReports, setHistoryReports] = useState<any[]>([]);  // สำหรับเก็บประวัติการรักษา

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const data = await getAllAnimals();
        setAnimals(data);
      } catch (error) {
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    const getSex = async () => {
      let res = await GetSexs();
      if (res) {
        setSexs(res);
      }
    };

    fetchAnimals();
    getSex();
  }, []);

  const handleViewReports = async (animalID: number) => {
    try {
      const data = await getReportsByAnimalID(animalID);
      console.log("ข้อมูลที่ได้รับจาก API:", data); // ตรวจสอบข้อมูล

      if (data.length === 0) {
        // ถ้าข้อมูลที่ได้รับเป็นค่าว่าง
        message.warning("ไม่มีรายงานสำหรับสัตว์ตัวนี้");
        return; // หยุดการทำงานฟังก์ชันที่เหลือ
      }

      setReports(data); // อัปเดต state ถ้ามีข้อมูล
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
    }
  };

  const handleViewHistory = (medicalRecord: any) => {
    console.log('MedicalRecord:', medicalRecord);  // ตรวจสอบข้อมูลที่ได้รับ
    if (medicalRecord) {
      setHistoryReports([medicalRecord]); // แสดงประวัติการรักษา
    } else {
      message.warning("ไม่พบประวัติการรักษา");
    }
  };


  const currentAnimals = animals
    .filter((animal) => {
      return animal.Name?.toLowerCase().includes(searchName.toLowerCase());
    })
    .filter((animal) => animal.HealthAnimal?.Status === "Deceased") // ฟิลเตอร์เฉพาะสัตว์ที่ตาย
    .filter((animal) => filterSex ? animal.Sex?.Sex === filterSex : true)


  const handleSearchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  const handleSexFilterChange = (value: string) => {
    setFilterSex(value);
  };

  const columns: ColumnType<Vetdashboardinterface>[] = [
    {
      title: "ภาพสัตว์",
      dataIndex: "Picture",
      key: "Picture",
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
      render: (path: string) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={`http://localhost:8000/${path}`}
            alt="animal"
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
      title: "ชื่อสัตว์",
      dataIndex: "Name",
      key: "Name",
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
      title: "น้ำหนัก (kg)",
      dataIndex: "Weight",
      key: "Weight",
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
      title: "สุขภาพ",
      dataIndex: "HealthAnimal",
      key: "HealthAnimal",
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
      render: (_health: string) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <FaSkull style={{ color: "gray", fontSize: "20px" }} /> {/* ใช้สีเทาแสดงสถานะตาย */}
        </div>
      ),
    },
    {
      title: "เพศ",
      dataIndex: "Sex",
      key: "Sex",
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
      render: (sex: any) =>
        sex?.Sex === "Male" ? (
          <ManOutlined style={{ color: "#2EABFF", fontSize: "20px" }} />
        ) : sex?.Sex === "Female" ? (
          <WomanOutlined style={{ color: "#CC6CE7", fontSize: "20px" }} />
        ) : (
          "ไม่ระบุ"
        ),
    },
    {
      title: "วันเกิด",
      dataIndex: "BirthDay",
      key: "BirthDay",
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
      render: (text: string) => new Date(text).toLocaleDateString("th-TH"),
    },
    {
      title: "คำอธิบาย",
      dataIndex: "Description",
      key: "Description",
      ellipsis: true,
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
      title: "รายงาน",
      key: "action",
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
      render: (_, record) => (
        <div>
          <Button type="primary" onClick={() => record.ID !== undefined && handleViewReports(record.ID)}>ดูรายงาน</Button>
        </div>
      ),
    }
  ];

  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>DECEASED ANIMALS</h1>

        <div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
          <Input
            style={{ marginRight: "20px", width: "300px" }}
            placeholder="ค้นหาชื่อสัตว์"
            value={searchName}
            onChange={handleSearchNameChange}
            prefix={<SearchOutlined />}
          />

          <span style={{ marginRight: "10px", paddingBottom: "2px", fontSize: "15px", fontWeight: "bold" }}>เลือกเพศ:</span>

          <Select
            style={{ marginTop: "9px", marginBottom: "10px", width: "200px", display: "flex", alignItems: "center" }}
            placeholder="กรองเพศ"
            value={filterSex}
            onChange={handleSexFilterChange}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            {sexs.map((sex) => (
              <Select.Option key={sex.ID} value={sex.Sex}>
                {sex.Sex}
              </Select.Option>
            ))}
          </Select>

        </div>

        {/* แสดงข้อมูลสัตว์ที่ตาย */}
        <Table
          columns={columns}
          dataSource={currentAnimals.map(animal => ({
            ...animal,
            key: animal.ID, // เพิ่ม key ที่ไม่ซ้ำกัน
          }))}
          loading={loading}
          bordered
          pagination={{ pageSize: 5, showQuickJumper: true }}
        />

        <Modal
          title={<span style={{ color: '#895E3C', fontWeight: 'bold' }}>รายงานการรักษาสัตว์</span>}
          open={reports.length > 0}
          onCancel={() => setReports([])}
          width={1000}
          footer={null}
        >
          <Table
            columns={[
              {
                title: "วันที่", dataIndex: "ReportDate", key: "ReportDate"
                , onHeaderCell: () => ({
                  style: {
                    textAlign: "center",
                  },
                }),
                onCell: () => ({
                  style: {
                    textAlign: "center",
                  },
                }),
                render: (text: string) => new Date(text).toLocaleDateString("th-TH")
              },
              {
                title: "ชื่อรายงาน", dataIndex: "Title", key: "Title"
                , onHeaderCell: () => ({
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
                title: "รายละเอียด", dataIndex: "Description", key: "Description"
                , onHeaderCell: () => ({
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
                title: "สถานะรายงาน", dataIndex: "StatusVet", key: "StatusVet"
                , onHeaderCell: () => ({
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
                title: "ประวัติการรักษา",
                key: "history",
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
                render: (_, record) => (
                  <Button type="primary" onClick={() => handleViewHistory(record.Medicalrecord)}>
                    ดูประวัติการรักษา
                  </Button>
                ),
              }

            ]}
            dataSource={reports.map(report => ({
              ...report,
              key: report.ID || report.ReportDate, // เพิ่ม key ที่ไม่ซ้ำ
            }))}
            pagination={false}
          />
        </Modal>

        <Modal
          title={<span style={{ color: '#895E3C', fontWeight: 'bold' }}>ประวัติการรักษาสัตว์</span>}
          open={historyReports && historyReports.length > 0}  // ตรวจสอบว่า historyReports มีข้อมูล
          onCancel={() => setHistoryReports([])}
          footer={null}
          width={900}
        >
          <Table
            columns={[
              {
                title: "วันที่วินิจฉัย", dataIndex: "DiagnosisDate", key: "DiagnosisDate", render: (text: string) => new Date(text).toLocaleDateString("th-TH"), onHeaderCell: () => ({
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
                title: "วินิจฉัย", dataIndex: "Diagnosis", key: "Diagnosis", onHeaderCell: () => ({
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
                title: "อาการ", dataIndex: "Symptoms", key: "Symptoms", onHeaderCell: () => ({
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
                title: "ค่าใช้จ่าย", dataIndex: "TotalCost", key: "TotalCost", onHeaderCell: () => ({
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
            ]}
            dataSource={historyReports.map(history => ({
              ...history,
              key: history.ID || history.DiagnosisDate, // เพิ่ม key ที่ไม่ซ้ำ
            }))}
            pagination={false}
          />
        </Modal>

      </div>
    </div>
  );
};

export default AnimalDied;
