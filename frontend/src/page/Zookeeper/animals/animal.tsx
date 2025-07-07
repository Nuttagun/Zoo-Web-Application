import { PawPrint,BadgePlus,Gitlab ,FilePenLine,Trash2} from "lucide-react";
import "./animal.css";
import { Button, Modal, message,Image } from "antd";
import { createTheme, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ListAnimal, DeleteAnimalByID } from "../../../services/https"; 
import { AnimalsInterface } from "../../../interface/IAnimal";

type SelectableRows = "none" | "single" | "multiple";

const Animal = () => {
  const [animals, setAnimals] = useState<AnimalsInterface[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState<string>("");
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [animalCount, setAnimalCount] = useState<number>(0);

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
            style={{ width: "150px", height:"130px",borderRadius: "60%" }}
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
      name: "Weight",
      label: "Weight",
      options: { filter: false },
    },
    {
      name: "Height",
      label: "Height",
      options: { filter: false },
    },    
    {
      name: "habitat",
      label: "Habitat",
      options: { filter: false },
    },
    {
      name: "health",
      label: "Healthy",
      options: {
        customBodyRender: (value: any) => (
          <p
            style={{
              backgroundColor: value === "Normal" ? "green" :  value === "Sick" ? "red" : "purple",
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
      name: "gender",
      label: "Gender",
      options: {
        customBodyRender: (value: any) => (
          <p
            style={{
              backgroundColor: value === "Male" ? "#3b82f6" : "#ec4899",
              color: "white",
              width: "70px",
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
        customBodyRender: (value: unknown, tableMeta: { rowIndex: number }) => {
          console.log(value);
          const record = animals[tableMeta.rowIndex];
          return (
            <>
              <Button
                onClick={() => navigate(`animals/edit/${record.ID}`)}
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

  const showModal = (val: AnimalsInterface) => {
    setModalText(`Are you sure you want to delete "${val.Name}"?`);
    setDeleteId(val.ID);
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    console.log("Attempting to delete animal with ID:", deleteId);

    try {
      const res = await DeleteAnimalByID(deleteId);
      if (res) {
        setOpen(false);
        messageApi.open({
          type: "success",
          content: "ลบข้อมูลสัตว์สำเร็จ",
        });
        getAnimals();
      } else {
        throw new Error("ลบข้อมูลสัตว์ไม่สำเร็จ");
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

  const getAnimals = async () => {
    console.log("Fetching animal data...");
    try {
      const res = await ListAnimal();
      console.log("ListAnimal response:", res);

      if (res && res.length > 0) {
        const processedData = res.map((animal: AnimalsInterface) => ({
          ID: animal.ID,
          Name: animal.Name,
          Weight: animal.Weight,
          Height: animal.Height,
          Picture: animal.Picture,
          gender:animal.Sex?.Sex,
          habitat:animal.Habitat?.Name,
          health:animal.HealthAnimal?.Status,
        }));
        setAnimals(processedData);
        setAnimalCount(res.length); 
        console.log("Processed Animals Data:", processedData);
      } else {
        console.error("No data returned from ListAnimal");
      }
    } catch (error) {
      console.error("Error fetching animal data:", error);
    }
  };

  useEffect(() => {
    getAnimals();
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

    return animals.length === 0 ? (
      <div className="bg-slate-700 py-10 min-h-screen grid place-items-center">
        <div className="text-center text-white">
          <h1>Not Data Available</h1>
        </div>
      </div>
    ) : (
      <div className="bg-slate-700 py-10 min-h-screen grid place-items-center">
        {contextHolder}
        <div className="w-10/12 max-w-4xl content-container">
          <div style={{ display: "flex" }}>
            <h1 className="header-animals-box">
              <PawPrint size={28} style={{ marginRight: "10px" }} />
              Animal
            </h1>
            <h1 className="header-population-animals-box">
              <Gitlab size={28} style={{ marginRight: "10px" }} />
              Population : {animalCount}
            </h1>
            <Link to="/zookeeper/create-animal">
              <h1 className="header-create-animals-box">
                <BadgePlus size={20} style={{ marginRight: "10px" }} />
                Create Animal
              </h1>
            </Link>
          </div>
          <ThemeProvider theme={getMuitheme}>
            <MUIDataTable
              title={"Animals List"}
              data={animals}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>
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

export default Animal;
