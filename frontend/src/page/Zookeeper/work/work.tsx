import { useEffect, useState } from "react";
import { Tent, BookUser, NotebookPen,ScrollText  } from "lucide-react";
import "./work.css";
import { Button, message, Tooltip,Image } from "antd";
import { createTheme, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { ListHabitat } from "../../../services/https";
import { HabitatInterface } from "../../../interface/IHabitat";
import Modal_work from "./modal/modal_work";
import { Link } from "react-router-dom";

type SelectableRows = "none" | "single" | "multiple";

const Work = () => {
  const [habitats, setHabitats] = useState<HabitatInterface[]>([]);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [selectedHabitatID, setSelectedHabitatID] = useState<number | null>(
    null
  );
  const [habitatCount, setHabitatCount] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage();
  console.log(messageApi);
  const theme = createTheme({
    typography: {
      fontFamily: "cursive",
    },
    palette: {
      mode: "light",
    },
  });

  const columns = [
    {
      name: "ID",
      label: "A.No",
      options: { filter: false },
    },
    {
      name: "Picture",
      label: "Picture",
      options: {
        customBodyRender: (value: string) => (
          <Image
            src={`http://localhost:8000/${value || "default-image.jpg"}`}
            style={{ width: "150px", height: "130px", borderRadius: "60%" }}
            alt="profile"
          />
        ),
        filter: false,
      },
    },
    {
      name: "Name",
      label: "Name",
      options: { filter: false },
    },
    {
      name: "Capacity",
      label: "Capacity",
      options: { filter: false },
    },
    {
      name: "Zone",
      label: "Zone",
      options: {
        customBodyRender: (value: string | { Zone?: string } | undefined) => {
          if (typeof value === "string") {
            return <span>{value}</span>;
          }

          if (value && typeof value === "object" && "Zone" in value) {
            const zone = value["Zone"];
            if (typeof zone === "string") {
              return (
                <span
                  style={{
                    backgroundColor:
                    value["Zone"] === "Rainforest"
                        ? "hsl(85, 100%, 25%)"
                        : value["Zone"] === "Oceanarium"
                        ? "hsl(200, 70%, 50%)"
                        : "gold",
                    color: "white",
                    width: "100px",
                    textAlign: "center",
                    borderRadius: "15px",
                    padding: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {zone}
                </span>
              );
            }
          }

          return <span>Unknown</span>;
        },
      },
    },
    {
      name: "Manage",
      label: "Manage",
      options: {
        customBodyRender: (value: unknown, tableMeta: { rowIndex: number }) => {
          console.log(value);
          const record = habitats[tableMeta.rowIndex];
          return (
            <div style={{ marginLeft: "30px" }}>
              <Tooltip title="work" open={true}>
                <Button
                  onClick={() => {
                    setSelectedHabitatID(record.ID!);
                    setIsWorkModalVisible(true);
                  }}
                  shape="circle"
                  icon={<NotebookPen />}
                  size="large"
                />
              </Tooltip>
            </div>
          );
        },
      },
    },
  ];

  const handleCancelWorkModal = () => {
    setIsWorkModalVisible(false);
    setSelectedHabitatID(null);
  };

  const getHabitats = async () => {
    try {
      const res = await ListHabitat();
      if (res && res.length > 0) {
        setHabitats(res);
        console.log(res);
        setHabitatCount(res.length);
      } else {
        console.error("No data returned from ListHabitat");
      }
    } catch (error) {
      console.error("Error fetching habitat data:", error);
    }
  };

  useEffect(() => {
    getHabitats();
  }, []);

  const options = {
    selectableRows: "none" as SelectableRows,
    filterType: "checkbox" as const,
    rowsPerPage: 2,
    rowsPerPageOptions: [5, 10, 20, 30],
  };

  return (
    <div className="bg-slate-700 py-10 min-h-screen grid place-items-center">
      {contextHolder}
      {habitats.length > 0 ? (
        <div className="w-10/12 max-w-4xl content-container" style={{ margin: 0, padding: "10px", minHeight: "95vh" }}>
          <div style={{ display: "flex",marginBottom:"40px"}}>
            <h1 className="header-work-box">
              <BookUser size={24} style={{ marginRight: "10px" }} />
              Work
            </h1>
            <h1 className="header-work-box-total">
              <Tent size={28} style={{ marginRight: "10px" }} />
              Total Habitat : {habitatCount}
            </h1>
            <Link to="/zookeeper/detail"><h1 className="header-population-habitats-box-scription">
            <ScrollText size={28} style={{ marginRight: "10px" }} />
              Scription Detail
            </h1></Link>
          </div>
          <ThemeProvider theme={theme}>
            <MUIDataTable
              title={"Work with Habitat List"}
              data={habitats}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>
      ) : (
        <div className="no-data-message">
          <h2>No Data Available</h2>
        </div>
      )}
      <Modal_work
        isVisible={isWorkModalVisible}
        habitatID={selectedHabitatID}
        onClose={handleCancelWorkModal}
      />
    </div>
  );
};

export default Work;
