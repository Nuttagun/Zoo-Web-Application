import { Pencil } from "lucide-react";
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
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { useNavigate, useParams, Link } from "react-router-dom";
import { StockOfFood, ContainerOfFood, CatagoryOfFood } from "../../../../interface/IStockOfFoodInterface";
import { useEffect, useState } from "react";
import { getAllStocks, GetCatagoryFoods, GetContainerFoods, GetFoodById, UpdateFood } from "../../../../services/https/kim/ServiceOFStock";


const UpdateFoodForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [catagoryFood, setCatagoryFood] = useState<CatagoryOfFood[]>([]);
  const [foods, setFoods] = useState<StockOfFood | null>(null);
  const [containerFood, setContainerFood] = useState<ContainerOfFood[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();
  const { Option } = Select;
  let { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    values.ID = foods?.ID;
    values.EmployeeID = employeeid;
    if (values.ExpiryDate) {
      values.ExpiryDate = dayjs(values.ExpiryDate).format("YYYY-MM-DD");
    }
    console.log("Values to be submitted:", values);

    if (values.Quantity < 1 || values.weight > 9999) {
      message.error("ปริมาณอาหารต้องอยู่ในช่วง 1 - 9999");
      return;
    }

    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !validImageTypes.includes(file.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    console.log("Values to be submitted:", values);

    let res = await UpdateFood(values, file);

    if (res) {
      messageApi.open({
        type: "success",
        content: "เเก้ไขข้อมูลสัตว์สำเร็จ",
      });
      setTimeout(() => {
        navigate("/zookeeper/stock/");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "เเก้ไขข้อมูลอาหารไม่สำเร็จ",
      });
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลอาหารให้ถูกต้องเเละครบถ้วน");
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

  const getFoodById = async () => {
    let res = await GetFoodById(Number(id));
    console.log(res)
    if (res) {
      setFoods(res);
      form.setFieldsValue({
        Foodname: res.Foodname,
        Quantity: res.Quantity,
        ExpiryDate: dayjs(res.ExpiryDate),
        ContainerOfFoodID: res.ContainerOfFood?.ID,
        Employee: res.Employee?.ID,
        CatagoryOfFoodID: res.CatagoryOfFood?.ID,

      });
      if (res.PictureOfFood) {
        setFileList([
          {
            uid: "-1",
            name: res.PictureOfFood,
            status: "done",
            url: `http://localhost:8000/${res.PictureOfFood}`,
          },
        ]);
      }
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getcatagoryfood();
    getcontainerfood();
    getFoodById();
  }, []);


  return (
    <Card>
      {contextHolder}
      <h2 className="header-animals-box-edit">EDIT FOOD</h2>
      <Divider />
      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
        {/* รูปภาพ */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="อัปโหลดรูปภาพ"
              name="PictureOfFood"
              valuePropName="PictureOfFood"
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
                    const isLt2M = file.size / 1024 / 1024 < 2;

                    if (!isImage) {
                      message.error("กรุณาอัปโหลดไฟล์รูปภาพที่ถูกต้อง");
                      return Upload.LIST_IGNORE;
                    }
                    if (!isLt2M) {
                      message.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB");
                      return Upload.LIST_IGNORE;
                    }

                    setFileList([file]);
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

        {/* ข้อมูลอาหาร */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item
              label="ปริมาณอาหาร"
              name="Quantity"
              rules={[
                { required: true, message: "กรุณากรอกปริมาณอาหาร" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value <= 9999) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("กรุณาใส่ปริมาณอาหารไม่เกิน 9999"));
                  },
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* รายละเอียดเพิ่มเติม */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item
              label="ประเภทอาหารสัตว์"
              name="CatagoryOfFoodID"
              rules={[{ required: true, message: "กรุณาเลือกประเภทอาหารของสัตว์" }]}
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

        {/* โกดังเก็บอาหาร */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="โกดังเก็บอาหารของสัตว์"
              name="ContainerOfFoodID"
              rules={[{ required: true, message: "กรุณากรอกโกดังเก็บอาหารสัตว์" }]}
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
        </Row>

        {/* ปุ่ม */}
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
                  icon={<Pencil style={{ width: "18px" }} />}
                  style={{ backgroundColor: "orange" }}
                >
                  SAVE
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>

  );
};
export default UpdateFoodForm;