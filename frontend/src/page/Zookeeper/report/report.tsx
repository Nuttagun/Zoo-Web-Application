import { ClipboardPlus, FilePenLine, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  ListReports,
  GetAnimalByHealth,
  DeleteReportByID,
} from "../../../services/https/index";
import { ReportInterface } from "../../../interface/IReport";
import { Button, Modal, message,Image } from "antd";
import { createTheme, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { Link, useNavigate } from "react-router-dom";
import "./report.css";

type SelectableRows = "none" | "single" | "multiple";

const Report = () => {
  const [reports, setReports] = useState<ReportInterface[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [reportCount, setReportCount] = useState<number>(0);

  const columns = [
    {
      name: "ID",
      label: "A.No",
      options: { filter: false },
    },
    {
      name: "Picture",
      label: "Profile",
      options: {
        customBodyRender: (value: string) => (
          <Image
            src={`http://localhost:8000/${value}`}
            style={{ width: "150px", height: "130px", borderRadius: "60%" }}
            alt="profile"
          />
        ),
        filter: false,
      },
    },
    {
      name: "Title",
      label: "Title",
      options: { filter: false },
    },
    {
      name: "Description",
      label: "Description",
      options: { filter: false },
    },
    {
      name: "StatusVet",
      label: "StatusVet",
      options: {
        customBodyRender: (value: any) => (
          <p
            style={{
              backgroundColor: value === "pending" ? "gold" : "green",
              color: "white",
              width: "90px",
              textAlign: "center",
              borderRadius: "15px",
              padding: "5px",
              fontWeight:"bold"
            }}
          >
            {value}
          </p>
        ),
      },
    },
    {
      name: "Manage",
      label: "Manage",
      options: {
        // @ts-ignore
        customBodyRender: (value: unknown, tableMeta: { rowIndex: number }) => {
          const record = reports[tableMeta.rowIndex];
          return (
            <>
              <Button
                onClick={() => navigate(`/zookeeper/report/edit/${record.ID}`)}
                shape="circle"
                icon={<FilePenLine />}
                size={"large"}
              />
              <Button
                onClick={() => showModal(record)}
                style={{ marginLeft: 10 }}
                shape="circle"
                icon={<Trash2 />}
                size={"large"}
                danger
              />
            </>
          );
        },
      },
    },
  ];

  const showModal = (val: ReportInterface) => {
    setModalText(`Are you sure you want to delete "${val.Title}"?`);
    setDeleteId(val.ID);
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      const res = await DeleteReportByID(deleteId);
      if (res) {
        setReports((prevReports) =>
          prevReports.filter((report) => report.ID !== deleteId)
        );
        setReportCount((prevCount) => prevCount - 1);
        setOpen(false);
        messageApi.open({
          type: "success",
          content: "ลบข้อมูลการเเจ้งสัตว์ป่วยสำเร็จ",
        });
      } else {
        throw new Error("ลบข้อมูลการเเจ้งสัตว์ป่วยไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "An error occurred!",
      });
    }
    setConfirmLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const getReports = async () => {
    try {
      const res = await ListReports();
      const sickAnimals = await GetAnimalByHealth();
      console.log(sickAnimals);
      if (res && res.length > 0) {
        const processedData = res.map((report: ReportInterface) => ({
          ID: report.ID,
          Title: report.Title,
          Description: report.Description,
          StatusVet: report.StatusVet,
          Picture: report.Picture,
        }));
        setReports(processedData);
        setReportCount(res.length);
      } else {
        console.error("No data returned from ListReports");
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  const options = {
    selectableRows: "none" as SelectableRows,
    filterType: "checkbox" as const,
    rowsPerPage: 2,
    rowsPerPageOptions: [5, 10, 20, 30],
  };

  const getMuitheme = () =>
    createTheme({
      typography: {
        fontFamily: "cursive",
      },
      palette: {
        mode: "light",
      },
      components: {
        MuiTableCell: {
          styleOverrides: {
            head: {
              padding: "10px 4px",
            },
            body: {
              padding: "7px 15px",
              color: "gray",
            },
          },
        },
      },
    });

  return (
    <div className="bg-slate-700 py-10 min-h-screen grid place-items-center">
      {contextHolder}
      {reports.length === 0 ? (
        <div className="no-data-message">
          <h2>No Data Available</h2>
        </div>
      ) : (
        <div className="w-10/12 max-w-4xl content-container">
          <div style={{ display: "flex" }}>
            <h1 className="header-report-box">
              <ClipboardPlus size={28} style={{ marginRight: "10px" }} />
              Report
            </h1>
            <h1 className="header-count-report-box">
              <ClipboardPlus size={28} style={{ marginRight: "10px" }} />
              Animal Sick : {reportCount}
            </h1>
            <Link to="/zookeeper/create-report">
              <h1 className="header-createreport-box">
                <ClipboardPlus size={20} style={{ marginRight: "10px" }} />
                Create Report
              </h1>
            </Link>
          </div>
          <ThemeProvider theme={getMuitheme}>
            <MUIDataTable
              title={"Report List"}
              data={reports}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>
      )}
      <Modal
        title="Delete Confirmation"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </div>
  );
};

export default Report;
