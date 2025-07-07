import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllAnimals } from "../../services/https/kim/http"; // ใช้ API ของคุณในการดึงข้อมูลสัตว์
import { message } from "antd";
import Sidebar from "../../component/sidebar/sidebarvet";
import "./Analysis.css";
const AnalysisPage: React.FC = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  // @ts-ignore
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState("Analysis");

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

    fetchAnimals();
  }, []);

  // คำนวณจำนวนสัตว์ตามสถานะสุขภาพ
  const healthCounts = animals.reduce(
    (counts, animal) => {
      if (animal.HealthAnimal?.Status === "Normal") {
        counts.normal += 1;
      } else if (animal.HealthAnimal?.Status === "Sick") {
        counts.sick += 1;
      } else if (animal.HealthAnimal?.Status === "Deceased") {
        counts.deceased += 1;
      }
      return counts;
    },
    { normal: 0, sick: 0, deceased: 0 }
  );

  // คำนวณจำนวนสัตว์ตามเพศ
  const sexCounts = animals
    .filter((animal) => animal.HealthAnimal?.Status !== "Deceased")
    .reduce((counts: { [key: string]: number }, animal) => {
      const sexName = animal.Sex?.Sex || "ไม่ระบุ";
      counts[sexName] = (counts[sexName] || 0) + 1;
      return counts;
    }, {});

  // คำนวณจำนวนสัตว์ตามชนิดทางชีวภาพ
  const biologicalCounts = animals.reduce((counts: { [key: string]: number }, animal) => {
    const bioName = animal.Biological?.Biological || 'ไม่ระบุ';
    counts[bioName] = (counts[bioName] || 0) + 1;
    return counts;
  }, {});

  // ข้อมูลสำหรับกราฟวงกลมสถานะสุขภาพ
  const healthData = [
    { name: "ปกติ", value: healthCounts.normal },
    { name: "ป่วย", value: healthCounts.sick },
    { name: "ตาย", value: healthCounts.deceased },
  ];

  // ข้อมูลสำหรับกราฟวงกลมเพศ
  const sexData = Object.entries(sexCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="vet-dashboard-container ">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="vet-content">
        <div className="vet-content-dashboard-analysis">
          <div className="Vet-Analysis-header">
            <h1 style={{ textAlign: "center", width: "100%" }}>ANIMAL ANALYSIS</h1>
          </div>

          <div className="Vet-Analysis-chart-grid">
            {/* กราฟสถานะสุขภาพ */}
            <div className="Vet-Analysis-chart-container">
              <h2>สถานะสุขภาพสัตว์</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#01BC01" />
                    <Cell fill="#BE0000" />
                    <Cell fill="#9701BC" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* กราฟเพศสัตว์ */}
            <div className="Vet-Analysis-chart-container">
              <h2>สัดส่วนเพศของสัตว์</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sexData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {sexData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* สรุปข้อมูลทางชีวภาพ */}
          <div className="Vet-Analysis-bio-summary">
            <h2>สรุปข้อมูลชนิดทางชีวภาพ</h2>
            <div className="Vet-Analysis-bio-grid">
              {Object.entries(biologicalCounts).map(([name, count]) => (
                <div key={name} className="Vet-Analysis-bio-card">
                  <h3>{name}</h3>
                  <strong>{count} ตัว</strong>
                </div>
              ))}
            </div>
          </div>

          {/* สถิติโดยรวม */}
          <div className="Vet-Analysis-stats-grid">
            <div className="Vet-Analysis-stat-card total">
              <p>จำนวนสัตว์ทั้งหมด</p>
              <strong>{animals.length} ตัว</strong>
            </div>
            <div className="Vet-Analysis-stat-card normal">
              <p>สัตว์ที่มีสุขภาพปกติ</p>
              <strong>{healthCounts.normal} ตัว</strong>
            </div>
            <div className="Vet-Analysis-stat-card sick">
              <p>สัตว์ที่กำลังป่วย</p>
              <strong>{healthCounts.sick} ตัว</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
