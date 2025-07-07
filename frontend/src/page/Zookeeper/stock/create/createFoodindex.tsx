import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  message,
  Row,
  Col,
  Space,
  Card,
  Divider,
  DatePicker,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { useNavigate, Link } from "react-router-dom";
import { CatagoryOfFood, ContainerOfFood, StockOfFood } from "../../../../interface/IStockOfFoodInterface";
import { CreateFood, getAllStocks, GetCatagoryFoods, GetContainerFoods } from "../../../../services/https/kim/ServiceOFStock";
import "../StockFood.css"
const CreateFoodForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [containerFood, setContainerFood] = useState<ContainerOfFood[]>([]);
  const [catagoryFood, setCatagoryFood] = useState<CatagoryOfFood[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();

  const { Option } = Select;

  const onFinish = async (values: any) => {
    const nameRegex = /^[a-zA-Zก-๙\s]+$/;
    if (!nameRegex.test(values.Foodname) || values.Foodname.length > 100) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณากรอกชื่อสัตว์ให้ถูกต้อง");
      return;
    }

    if (values.Quantity < 1 || values.weight > 9999) {
      message.error("ปริมาณอาหารต้องอยู่ในช่วง 1 - 9999");
      return;
    }

    if (fileList.length === 0) {
      message.error("กรุณาอัพโหลดรูปภาพของสัตว์");
      return;
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const isValidImages = fileList.every((file) =>
      validImageTypes.includes(file.type)
    );

    if (!isValidImages) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    console.log(values);
    const formData = new FormData();
    formData.append("Foodname", values.Foodname);
    formData.append("Quantity", values.Quantity);
    formData.append("ExpiryDate", values.ExpiryDate.format("YYYY-MM-DD"));
    formData.append("ContainerOfFoodID", values.ContainerOfFoodID);
    formData.append("CatagoryOfFoodID", values.CatagoryOfFoodID);
    formData.append("EmployeeID", employeeid.toString());
    formData.append("PictureOfFood", fileList[0].originFileObj);

    const response = await CreateFood(formData);

    if (response && response.error) {
      // แจ้งเตือนว่าชื่ออาหารซ้ำ
      message.error(response.error);
    } else if (response) {
      // กรณีสร้างสำเร็จ
      message.success("สร้างข้อมูลการนำเข้าอาหารสัตว์สำเร็จ");
      form.resetFields();
      setFileList([]);
      console.log("create:", response);
      setTimeout(() => {
        navigate("/zookeeper/stock/");
      }, 2000);
    } else {
      // กรณีสร้างไม่สำเร็จ
      message.error("สร้างข้อมูลการนำเข้าอาหารสัตว์ไม่สำเร็จ");
    }

  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลอาหารสัตว์ให้ถูกต้องเเละครบถ้วน");
  };

  const onChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  const getcatagoryfood = async () => {
    let res = await GetCatagoryFoods();
    if (res) {
      setCatagoryFood(res);
    }
  };

  const getcontainerfood = async () => {
    let res = await GetContainerFoods();
    if (res) {
      setContainerFood(res);
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getcatagoryfood();
    getcontainerfood();
  }, []);

  return (
    <Card>
      <h2 className="header-foods-box-create">CREATE FOOD</h2>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ weight: 0.01, height: 1.0 }}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              label="อัปโหลดรูปภาพ"
              name="PictureOfFood"
              valuePropName="fileList"
              rules={[
                {
                  required: true,
                  message: "กรุณาอัพโหลดรูป",
                  validator: () => {
                    return fileList.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("กรุณาอัพโหลดรูป"));
                  },
                },
              ]}
            >
              <ImgCrop rotationSlider>
                <Upload
                  fileList={fileList}
                  onChange={onChange}
                  onPreview={onPreview}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      message.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                      return Upload.LIST_IGNORE;
                    }
                    setFileList([...fileList, file]);
                    return false;
                  }}
                  maxCount={1}
                  multiple={false}
                  listType="picture-card"
                >
                  {fileList.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </Form.Item>
          </Col>


        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={8} md={8} lg={8} style={{ marginRight: "118px" }}>
            <Form.Item
              label="ชื่ออาหารสัตว์"
              name="Foodname"
              style={{ width: "460px" }}
              rules={[
                { required: true, message: "กรุณากรอกชื่ออาหารสัตว์ที่นำเข้า" },
                {
                  max: 99,
                  message: "กรุณากรอกชื่ออาหารสัตว์ไม่เกิน 100 ตัวอักษร",
                },
                {
                  validator: async (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const existingFoods = await getAllStocks();
                    const isDuplicate = Array.isArray(existingFoods) && existingFoods.some(
                      (food: StockOfFood) => food.Foodname === value
                    );
                    if (isDuplicate) {
                      return Promise.reject(new Error("ชื่ออาหารซ้ำ กรุณากรอกชื่อใหม่"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter Food name"
                maxLength={100}
                onKeyPress={(event) => {
                  if (!/^[a-zA-Z]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} >
            <Form.Item
              label="ปริมาณอาหารของสัตว์"
              name="Quantity"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกปริมาณอาหารสัตว์",
                },
                {
                  validator: (_, value) => {
                    if (value === undefined || value <= 9999) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("กรุณาใส่ค่าปริมาณอาหารสัตว์ไม่เกิน 9999")
                    );
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "210px" }}
                placeholder="Enter Food Quantity"
                min={1}
                step={1}
                onKeyPress={(event) => {
                  if (!/^[0-9]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="วันหมดอายุของอาหารสัตว์"
              name="ExpiryDate"
              rules={[
                { required: true, message: "กรุณาเลือกวันหมดอายุของอาหารสัตว์" },
                {
                  validator: (_, value) => {
                    if (!value || value.isAfter(new Date())) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("อาหารหมดอายุกรุณากรอกวันที่ใหม่"));
                  },
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="โกดังเก็บอาหารสัตว์"
              name="ContainerOfFoodID"
              rules={[{ required: true, message: "กรุณาเลือกโกดังเก็บอาหารสัตว์" }]}
            >
              <Select allowClear>
                {containerFood.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.ContainerName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="ประเภทอาหารสัตว์"
              name="CatagoryOfFoodID"
              rules={[{ required: true, message: "กรุณาเลือกประเภทอาหารสัตว์" }]}
            >
              <Select allowClear>
                {catagoryFood.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.StockfoodType}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end">
          <Col>
            <Form.Item>
              <Space>
                <Link to={"/zookeeper/stock/"}>
                  <Button htmlType="button">Cancel</Button>
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  style={{ backgroundColor: "orange" }}
                >
                  CREATE
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

};

export default CreateFoodForm;
