import React, { useEffect, useState } from "react";
import {
  Modal as AntModal,
  Button,
  Form,
  Input,
  Switch,
  message,
  Table,
  Image,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import {
  CreateWork,
  CreateFoodRequisition,
  CreateFoodRequisitionDetail,
  GetAllStockFood,
  ReduceStockFoodQuantity,
} from "../../../../services/https/index";
import { StockOfFood } from "../../../../interface/IStockOfFoodInterface";
import { FoodRequisitionDetail } from "../../../../interface/IFoodRequisitionDetail";
import { ReduceStockFoodQuantityInput } from "../../../../interface/IFoodRequisitionDetail";
import { FoodRequisition } from "../../../../interface/IFoodRequisition";

interface WorkModalProps {
  isVisible: boolean;
  habitatID: number | null;
  onClose: () => void;
}


const Modal_work: React.FC<WorkModalProps> = ({
  isVisible,
  habitatID,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [feedEnabled, setFeedEnabled] = useState(false);
  const [foodStocks, setFoodStocks] = useState<StockOfFood[]>([]);
  const [loadingFoodStocks, setLoadingFoodStocks] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [employeeid, setEmployeeid] = useState<number>(0);



  useEffect(() => {
    const idFromStorage = Number(localStorage.getItem("employeeid")) || 0;
    setEmployeeid(idFromStorage);

    if (!isVisible) {
      form.resetFields();
      setFeedEnabled(false);
      setFoodStocks([]);
      setSelectedQuantities({});
    } else {
      console.log("Modal opened with Habitat ID:", habitatID);
    }
  }, [isVisible]);

  const handleFeedSwitch = async (checked: boolean) => {
    setFeedEnabled(checked);
    if (checked) {
      setLoadingFoodStocks(true);
      try {
        const foodData = await GetAllStockFood();
        if (foodData) {
          setFoodStocks(foodData);
        } else {
          message.error("Failed to fetch food stocks.");
        }
      } catch (error) {
        message.error("Error fetching food stocks.");
      } finally {
        setLoadingFoodStocks(false);
      }
    } else {
      setFoodStocks([]);
    }
  };

  const handleQuantityChange = (
    id: number,
    delta: number,
    maxQuantity: number
  ) => {
    setSelectedQuantities((prev) => {
      const newQuantities = { ...prev };
      const currentQuantity = newQuantities[id] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);

      if (newQuantity > maxQuantity) {
        message.error("Quantity exceeds available stock.");
        return prev;
      }

      newQuantities[id] = newQuantity;
      return newQuantities;
    });
  };

  const handleSubmit = async (values: any) => {
  setLoading(true);
  try {
    const currentDate = dayjs().format("YYYY-MM-DD");

    if (!values.feed && !values.cleaning) {
      message.warning("กรุณาเลือกอย่างน้อย 1 ตัวเลือก: ให้อาหารสัตว์หรือทำความสะอาดกรงสัตว์");
      setLoading(false);
      return;
    }

    const hasSelectedFood = Object.values(selectedQuantities).some(
      (quantity) => quantity > 0
    );

    if (values.feed && !hasSelectedFood) {
      message.warning("กรุณาเลือกอาหารที่จะให้สัตว์รับประทาน");
      setLoading(false);
      return;
    }

    const { note, ...workPayload } = values;
    const payload = {
      ...workPayload,
      finish_date: currentDate,
      habitat_id: habitatID,
      employee_id: employeeid.toString(),
    };

    console.log("Payload for work creation:", payload);

    const createdWork = await CreateWork(payload);

    console.log("Response from CreateWork API:", createdWork);

    if (createdWork && createdWork.data) {
      const workID = createdWork?.data?.ID;
      console.log("Work created with ID:", workID);

      message.success("บันทึกข้อมูลการทำงานสำเร็จ");

      if (values.feed) {
        const foodRequisitionPayload: FoodRequisition = {
          Note: note || "No note provided",
          RequisitionDate: currentDate,
          WorkID: workID,
          Work: {
            Employee: {
              User: {
                FirstName: "Default FirstName",
                LastName: "Default LastName",
                Email: "default@example.com",
              },
            },
            Habitat: {
              Name: "Default Habitat",
            },
          },
          Details: [],
        };        
        
        console.log("Payload for food requisition:", foodRequisitionPayload);

        const createdFoodRequisition = await CreateFoodRequisition(
          foodRequisitionPayload
        );
        const foodRequisitionID = createdFoodRequisition?.data?.ID;

        if (foodRequisitionID) {
          for (const stockID in selectedQuantities) {
            const quantity = selectedQuantities[parseInt(stockID, 10)];
            if (quantity > 0) {
              const foodRequisitionDetailPayload: FoodRequisitionDetail = {
                Quantity: quantity,
                FoodRequisitionID: foodRequisitionID,
                StockOfFoodID: parseInt(stockID, 10),
              };

              console.log("Payload for food requisition detail:", foodRequisitionDetailPayload);

              await CreateFoodRequisitionDetail(foodRequisitionDetailPayload);

              const reduceInput: ReduceStockFoodQuantityInput = {
                reduce_amount: quantity,
              };
              console.log("Payload for reducing stock:", reduceInput);

              await ReduceStockFoodQuantity(parseInt(stockID, 10), reduceInput);
            }
          }
        } else {
          message.error("สร้างข้อมูลใบเบิกอาหารไม่สำเร็จ");
        }
      }

      form.resetFields();
      onClose();
    } else {
      message.error("สร้างข้อมูลงานสำเร็จไม่สำเร็จโปรดลองใหม่อีกครั้ง");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};


  const foodStockColumns = [
    {
      title: "Picture",
      dataIndex: "PictureOfFood",
      key: "PictureOfFood",
      render: (picture: string) => (
        <Image
          src={`http://localhost:8000/${picture}`}
          width={50}
          height={50}
          alt="Food"
          style={{ borderRadius: "5px" }}
        />
      ),
    },
    {
      title: "Food Name",
      dataIndex: "Foodname",
      key: "Foodname",
    },
    {
      title: "Available Quantity",
      dataIndex: "Quantity",
      key: "Quantity",
    },
    {
      title: "Category of Food",
      dataIndex: ["CatagoryOfFood", "StockfoodType"],
      key: "CatagoryOfFood",
    },
    {
      title: "Select Quantity",
      key: "SelectQuantity",
      render: (_: any, record: StockOfFood) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            onClick={() => handleQuantityChange(record.ID, -1, record.Quantity)}
            disabled={(selectedQuantities[record.ID] || 0) === 0}
          >
            -
          </Button>
          <span>{selectedQuantities[record.ID] || 0}</span>
          <Button
            onClick={() => handleQuantityChange(record.ID, 1, record.Quantity)}
            disabled={(selectedQuantities[record.ID] || 0) >= record.Quantity}
          >
            +
          </Button>
        </div>
      ),
    },
  ];

  const onFinishFailed = () => {
        message.warning("กรุณากรอกระบุหมายเหตุในการเบิกอาหารสัตว์");
      };

  return (
    <AntModal
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      title="Create Work"
      width="80%"
      height="90%"
      style={{ top: "10px" }}
    >
      <div className="modal-content">
        {habitatID ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            initialValues={{
              feed: false,
              cleaning: false,
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col span={12}>
                <Form.Item
                  name="feed"
                  label="ให้อาหารสัตว์"
                  valuePropName="checked"
                  tooltip="Check if feeding is part of this work"
                >
                  <Switch onChange={handleFeedSwitch} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cleaning"
                  label="ทำความสะอาดกรงสัตว์"
                  valuePropName="checked"
                  tooltip="Check if cleaning is part of this work"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            {feedEnabled && (
              <>
                <Form.Item
                  name="note"
                  label="หมายเหตุ"
                  rules={[
                    { required: true, message: "กรุณาระบุหมายเหตุทุกครั้งเมื่อต้องการเบิกอาหาร" },
                  ]}
                >
                  <Input placeholder="Enter a note for the food requisition" />
                </Form.Item>
                <div style={{ marginBottom: 0 }}>
                  <Table
                    columns={foodStockColumns}
                    dataSource={foodStocks}
                    loading={loadingFoodStocks}
                    rowKey="ID"
                    pagination={{ pageSize: 2 }}
                  />
                </div>
              </>
            )}
            <Row justify="end">
              <Form.Item>
                <Button
                  style={{ marginRight: 8 }}
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </Form.Item>
            </Row>
          </Form>
        ) : (
          <p>No Habitat selected</p>
        )}
      </div>
    </AntModal>
  );
};

export default Modal_work;
