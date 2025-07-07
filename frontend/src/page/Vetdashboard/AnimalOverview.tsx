import { useState, useEffect } from "react";
import Sidebar from "../../component/sidebar/sidebarvet";
import { getAllAnimals } from "../../services/https/kim/http";
import { Vetdashboardinterface } from "../../interface/VetDashboard";
import { Input, Select, Table, message, Modal, Button } from "antd";
import { SmileOutlined, FrownOutlined, SearchOutlined, ManOutlined, WomanOutlined } from "@ant-design/icons";
import { ColumnType } from "antd/es/table";
import { getReportsByAnimalID } from "../../services/https/kim/ServiceForMedicalRecord";
import "../VehicleManager/vehicle.css"
import { GetSexs } from "../../services/https";
import { SexsInterface } from "../../interface/ISex";
import { HealthInterface } from "../../interface/IHealth";
import { GetHealths } from "../../services/https/kim/http";

const AnimalOverview = () => {
  const [activeMenu, setActiveMenu] = useState("animals");
  const [animals, setAnimals] = useState<Vetdashboardinterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchName, setSearchName] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [healthFilter, setHealthFilter] = useState("");
  const [sexs, setSexs] = useState<SexsInterface[]>([]);
  const [healths, setHealths] = useState<HealthInterface[]>([]);
  const [reports, setReports] = useState<any[]>([]);  // สำหรับเก็บข้อมูลรายงาน
  const [historyReports, setHistoryReports] = useState<any[]>([]);  // สำหรับเก็บประวัติการรักษา

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const data = await getAllAnimals();
        const filteredAnimals = data.filter((animal) => animal.HealthAnimal?.Status !== "Deceased");
        setAnimals(filteredAnimals);
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

    const getHealth = async () => {
      let res = await GetHealths();
      if (res) {
        setHealths(res);
      }
    };


    fetchAnimals();
    getSex();
    getHealth();
  }, []);

  // ฟังก์ชันดึงข้อมูลรายงานของสัตว์
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
    .filter((animal) => animal.Name?.toLowerCase().includes(searchName.toLowerCase()))
    .filter((animal) => filterSex ? animal.Sex?.Sex === filterSex : true)
    .filter((animal) => healthFilter ? animal.HealthAnimal?.Status === healthFilter : true);

  const handleSearchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  const handleSexFilterChange = (value: string) => {
    setFilterSex(value);
  };

  const handleHealthFilterChange = (value: string) => {
    setHealthFilter(value);
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
      render: (health: any) => {
        const healthStatus = health?.Status;
        return healthStatus === "Normal" ? (
          <SmileOutlined style={{ color: "green", fontSize: "20px" }} />
        ) : healthStatus === "Sick" ? (
          <FrownOutlined style={{ color: "red", fontSize: "20px" }} />
        ) : (
          "ไม่ระบุ"
        );
      },
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
        <h1 style={{ fontWeight: "bolder", color: "#895E3C", fontSize: "30px" }}>ANIMAL OVERVIEW</h1>

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

          <span style={{ marginLeft: "15px", marginRight: "10px", paddingBottom: "2px", fontSize: "15px", fontWeight: "bold" }}>เลือกสุขภาพ:</span>

          <Select
            style={{ marginTop: "9px", marginBottom: "10px", width: "200px" }}
            placeholder="กรองสุขภาพ"
            value={healthFilter}
            onChange={handleHealthFilterChange}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            {healths
              .filter((health) => health.Status !== "Deceased")
              .map((health) => (
                <Select.Option key={health.ID} value={health.Status}>
                  {health.Status}
                </Select.Option>
              ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={currentAnimals.map(animal => ({
            ...animal,
            key: animal.ID, // เพิ่ม key ที่ไม่ซ้ำกัน
          }))}
          loading={loading}
          pagination={{ pageSize: 5, showQuickJumper: true }}
          bordered
        />

        <Modal
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>รายงานการรักษาสัตว์</span>}
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
          title={<span style={{ color: "#895E3C", fontSize: "20px" }}>ประวัติการรักษาสัตว์</span>}
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

export default AnimalOverview;
