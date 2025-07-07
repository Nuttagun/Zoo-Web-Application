import { useEffect, useState } from "react";
import { type StockOfFood } from "../../../interface/IStockOfFoodInterface";
import { Image } from "antd";
import { Button, Modal, message } from "antd";
import { createTheme, ThemeProvider } from "@mui/material";

import { BadgePlus, FilePenLine, Trash2, Beef, Salad } from "lucide-react";
import { DeleteFoodByID, getAllStocks } from "../../../services/https/kim/ServiceOFStock";
import MUIDataTable from "mui-datatables";
import { useNavigate } from "react-router-dom";
type SelectableRows = "none" | "single" | "multiple";
import "./StockFood.css"
//success task
const StockOfFood = () => {
  const [foods, setFoods] = useState<StockOfFood[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [foodCount, setFoodCount] = useState<number>(0);
  const [modalText, setModalText] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const getFoods = async () => {
    console.log("Fetching food data...");
    try {
      const res = await getAllStocks();
      console.log("ListFood response:", res);

      if (res && res.length > 0) {
        const processedData = res.map((food: StockOfFood) => ({
          ID: food.ID,
          Foodname: food.Foodname,
          Quantity: food.Quantity,
          ExpiryDate: food.ExpiryDate,
          PictureOfFood: food.PictureOfFood,
          ContainerName: food.ContainerOfFood?.ContainerName,
          StockfoodType: food.CatagoryOfFood?.StockfoodType,
          Descroption: food.CatagoryOfFood?.Description,
        }));
        setFoods(processedData);
        setFoodCount(res.length);
        console.log("Processed food Data:", processedData);
      } else {
        console.error("No data returned from ListFood");
      }
    } catch (error) {
      console.error("Error fetching food data:", error);
    }
  };

  const showModal = (val: StockOfFood) => {
    setModalText(`Are you sure you want to delete "${val.Foodname}"?`);
    setDeleteId(val.ID);
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    console.log("Attempting to delete foood with ID:", deleteId);

    try {
      const res = await DeleteFoodByID(deleteId);
      if (res) {
        setOpen(false);
        messageApi.open({
          type: "success",
          content: "ลบข้อมูลอาหารสำเร็จ",
        });
        getFoods();
      } else {
        throw new Error("ลบข้อมูลอาหารไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "An error occurred!",
      });
    }
    setConfirmLoading(false);
  };



  useEffect(() => {
    getFoods();
  }, []);

  const options = {
    selectableRows: "none" as SelectableRows,
    filterType: "checkbox" as const,
    rowsPerPage: 2,
    rowsPerPageOptions: [2, 5, 10, 20, 30],
  };

  const handleCancel = () => {
    setOpen(false);
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

  const column = [
    {
      name: "ID",
      label: "A.No",
      options: { filter: false },
    },
    {
      name: "PictureOfFood",
      label: "Picture",
      options: {
        customBodyRender: (value: string) => (
          <Image
            src={`http://localhost:8000/${value}`}
            style={{ width: "150px", height: "130px", borderRadius: "60%" }}
            alt="Picture"
          />
        ),
        filter: false,
      },
    },
    {
      name: "Foodname",
      label: "Name",
      options: { filter: false },
    },
    {
      name: "Quantity",
      label: "Quantity",
      options: { filter: false },
    },
    {
      name: "ExpiryDate",
      label: "วันหมดอายุ",
      options: {
        customBodyRender: (value: string) => {
          const expiryDate = new Date(value);
          const currentDate = new Date();
          const isExpired = expiryDate < currentDate;
          return isExpired ? (
            <span style={{ color: "red" }}>หมดอายุ</span>
          ) : (
            expiryDate.toLocaleDateString("th-TH")
          );
        },
        filter: false,
      },
    },
    {
      name: "StockfoodType",
      label: "ประเภทอาหาร",
      options: { filter: false },
    },
    {
      name: "ContainerName",
      label: "โกดังเก็บอาหาร",
      options: { filter: false },
    },
    {
      name: "Manage",
      label: "Manage",
      options: {
        customBodyRender: (value: unknown, tableMeta: { rowIndex: number }) => {
          console.log(value);
          const record = foods[tableMeta.rowIndex];
          return (
            <>
              <Button
                onClick={() => navigate(`/zookeeper/stock/edit/${record.ID}`)}
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

  return foods.length === 0 ? (
    <div className="bg-slate-700 py-10 min-h-screen grid place-items-center">
      <div className="text-center text-white">
        <h1>Not Data Available</h1>
      </div>
    </div>

  ) : (
    <div className="bg-slate-700 py-10 min-h-screen grid place-items-center">
      {contextHolder}
      <div className="w-10/12 max-w-4xl contentStock-container">
        <div style={{ display: "flex" }}>
          <h1 className="header-foods-box">
            <Beef size={28} style={{ marginRight: "10px" }} />
            Food
          </h1>
          <h1 className="header-total-foods-box">
            <Salad size={28} style={{ marginRight: "10px" }} />
            Total Food: {foodCount}
          </h1>
          <h1 className="header-foods-box-create" onClick={() => navigate("/zookeeper/createfood")}>
            <BadgePlus size={20} style={{ marginRight: "10px" }} />
            Create Food
          </h1>
        </div>
        <ThemeProvider theme={getMuitheme}>
          <MUIDataTable
            title={"Foods List"}
            data={foods}
            columns={column}
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

export default StockOfFood;