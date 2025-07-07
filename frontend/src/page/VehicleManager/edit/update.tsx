
import { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, InputNumber, Select, Upload, message, Row, Col } from "antd";
import { UpdateVehicle, GetVehicleById, getAllVehicleTypes, getAllVehicleStatus, getAllVehicleColors, GetVehicle } from "../../../services/https/mj";
import { useParams, useNavigate, Link } from "react-router-dom";
import { VehicleInterface } from "../../../interface/IVehicle";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { VehicleTypeInterface } from "../../../interface/IVehicleType";
import { VehicleStatusInterface } from "../../../interface/IVehicleStatus";
import { VehicleColorInterface } from "../../../interface/IVehicleColor";
import ImgCrop from "antd-img-crop";
import moment from "moment";
import dayjs from 'dayjs';

const Update = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [vehicleData, setVehicleData] = useState<VehicleInterface | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [vehicletype, setVehicletype] = useState<VehicleTypeInterface[]>([]);
  const [vehiclestatus, setVehiclestatus] = useState<VehicleStatusInterface[]>([]);
  const [vehicleColor, setVehiclecolor] = useState<VehicleColorInterface[]>([]);
  const [existingVehicles, setExistingVehicles] = useState<string[]>([]);

  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  console.log(contextHolder, employeeid)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await GetVehicle();
        if (res) {
          setExistingVehicles(res.map((vehicle: any) => vehicle.Name.toLowerCase())); 
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  const GetVehicleType = async () => {
    let res = await getAllVehicleTypes();
    if (res) {
      setVehicletype(res);
    }
  };

  const GetVehicleColor = async () => {
    let res = await getAllVehicleColors();
    if (res) {
      setVehiclecolor(res);
    }
  };

  const GetVehicleStatus = async () => {
    let res = await getAllVehicleStatus();
    if (res) {
      setVehiclestatus(res);
    }
  };

  const { Option } = Select;

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลให้ถูกต้องเเละครบถ้วน");
  };

  const getVehicleById = async () => {
    try {
      if (id) {
        const res = await GetVehicleById(Number(id));
        console.log("Fetched vehicle data:", res);
        if (res) {
          console.log(res);
          setVehicleData(res);
          form.setFieldsValue({
            Name: res.Name,
            Price: res.Price,
            ReceivedDate: moment(res.ReceivedDate),
            Status: res.VehicleStatus?.VehicleStatus,
            Color: res.VehicleColorID,
            Description: res.Description,
            Type: res.VehicleTypeID,
            EmployeeID: res.EmployeeID,
          });
          if (res.Picture) {
            setFileList([
              {
                uid: "-1",
                name: res.Picture,
                status: "done",
                url: `http://localhost:8000/${res.Picture}`,
              },
            ]);
          }
        } else {
          console.error("No vehicle data found");
        }
      } else {
        messageApi.open({
          type: "error",
          content: "Invalid vehicle ID",
        });
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      messageApi.open({
        type: "error",
        content: "Failed to fetch vehicle data",
      });
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    GetVehicleType();
    getVehicleById();
    GetVehicleStatus();
    GetVehicleColor();
  }, [id]);

  const onChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
    console.log("Updated fileList:", newFileList);
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


  const onFinish = async (values: any) => {
    const vehicleName = values.Name.trim().toLowerCase();

    if (!vehicleData) {
      messageApi.open({
        type: "error",
        content: "Vehicle data n ot loaded properly.",
      });
      return;
    }

    if (vehicleName !== vehicleData.Name?.toLowerCase() && existingVehicles.includes(vehicleName)) {
      message.error("ชื่อรถนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น");
      return;
    }

    if (values.Price && values.Price > 500) {
      messageApi.open({
        type: "error",
        content: "กรุณากรอกราคาไม่เกิน 500 บาท",
      });
      return;
    }

    if (values.ReceivedDate && moment(values.ReceivedDate).isAfter(moment())) {
      messageApi.open({
        type: "error",
        content: "วันที่ได้รับรถต้องไม่เกินวันที่ปัจจุบัน",
      });
      return;
    }

    if (!values.Type) {
      messageApi.open({
        type: "error",
        content: "กรุณาเลือกประเภทของรถ",
      });
      return;
    }

    if (!values.Status) {
      messageApi.open({
        type: "error",
        content: "กรุณาเลือกสถานะของรถ",
      });
      return;
    }

    if (fileList.length === 0) {
      messageApi.open({
        type: "error",
        content: "กรุณาอัปโหลดรูปภาพของรถ",
      });
      return;
    }

    values.ID = vehicleData.ID;
    const file = fileList.length > 0 ? fileList[0].originFileObj : null;
    if (values.ReceivedDate) {
      values.ReceivedDate = values.ReceivedDate.format("YYYY-MM-DD");
    }

    try {
      const res = await UpdateVehicle(values, file);
      if (res) {
        message.success("เเก้ไขข้อมูลรถสำเร็จ");
        setTimeout(() => {
          navigate("/vehiclemanager");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating vehicle data:", error);
      messageApi.open({
        type: "error",
        content: "Failed to update vehicle data",
      });
    }
  };

  if (!vehicleData) {
    return <div>Loading...</div>;
  }

  const handleCancel = () => {
    form.resetFields();
  };


  return (
    <div>
      <div
        style={{
          fontWeight: "bold",
          fontSize: "24px",
          color: "#895E3C",
          fontFamily: '"Poppins", sans-serif',
          marginBottom: "30px",
        }}
      >
        Edit Vehicle : {vehicleData.Name}
      </div>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 900, margin: "0 auto" }}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={50}>
          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  อัปโหลดรูปภาพ
                </span>
              }
              name="picture"
              valuePropName="fileList"
              rules={[
                {
                  required: true,
                  message: "กรุณาอัปโหลดรูปภาพ",
                  validator: () => {
                    return fileList.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please upload a photo."));
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
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  สถานะ
                </span>
              }
              name="Status"
              rules={[
                { required: true, message: "กรุณาเลือกสถานะรถ" },
              ]}
            >
              <Select allowClear>
                {vehiclestatus.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.VehicleStatus}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  ชื่อ
                </span>
              }
              name="Name"
              rules={[
                { required: true, message: "กรุณากรอกชื่อรถ" },
              ]}
            >
              <Input
                placeholder="Enter vehicle name"
                maxLength={20}
                onKeyPress={(event) => {
                  const input = event.target as HTMLInputElement;
                  if (!/^([BG]\d*)?$/.test(input.value + event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  สี
                </span>
              }
              name="Color"
              rules={[
                { required: true, message: "กรุณาเลือกสีรถ" },
              ]}
            >
              <Select allowClear>
                {vehicleColor.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.Name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  ประเภท
                </span>
              }
              name="Type"
              rules={[
                { required: true, message: "กรุณาเลือกประเภทรถ" },
              ]}
            >
              <Select allowClear>
                {vehicletype.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.VehicleType}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  ราคาเช่า
                </span>
              }
              name="Price"
              rules={[
                { required: true, message: "กรุณากรอกราคาเช่ารถ" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value <= 500.00) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("กรุณากรอกค่าเช่ารถไม่เกิน 500.00 บาท"));
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter vehicle price"
                min={10}
                precision={2}
                step={0.5}
                onKeyPress={(event) => {
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  คำอธิบาย
                </span>
              }
              name="Description"
              rules={[
                { required: true, message: "กรุณากรอกคำอธิบายรถ" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter vehicle description"
                maxLength={100}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#895E3C",
                  }}
                >
                  วันที่ได้รับรถ
                </span>
              }
              name="ReceivedDate"
              rules={[
                { required: true, message: "กรุณากรอกวันที่ได้รับรถ" },
              ]}
            >
              <DatePicker 
                style={{ width: "100%" }} 
                disabledDate={(current) => {
                  const currentDate = dayjs();
                  const isAfterToday = current.isAfter(currentDate.startOf('day')); 
                  return isAfterToday;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" style={{ marginTop: "5px" }}>
          <Col>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "300px",
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "140px",
                  borderRadius: "30px",
                  backgroundColor: "#895E3C",
                  border: "none",
                }}
                icon={<SaveOutlined />}
              >
                บันทึก
              </Button>
              <Link to="/vehiclemanager">
                <Button
                  onClick={handleCancel}
                  style={{
                    width: "140px",
                    borderRadius: "30px",
                    backgroundColor: "#D32F2F",
                    color: "#fff",
                    marginLeft: "15px",
                  }}
                  icon={<CloseOutlined />}
                >
                  ยกเลิก
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
export default Update;