import { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, InputNumber, Select, Upload, Row, Col, message } from "antd";
import { CreateVehicle, getAllVehicleTypes, getAllVehicleColors, GetVehicle } from "../../../services/https/mj";
import { useNavigate, Link } from "react-router-dom";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { VehicleTypeInterface } from "../../../interface/IVehicleType";
import { VehicleColorInterface } from "../../../interface/IVehicleColor";
import ImgCrop from "antd-img-crop";
import dayjs from 'dayjs';

interface VehicleFormValues {
  Name: string;
  "Price for rent": number;
  "Received Date": moment.Moment;
  Color: string;
  Description: string;
  Type: string;
  Employee: string;
}

const Create = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();
  const [vehicletype, setVehicletype] = useState<VehicleTypeInterface[]>([]);
  const [vehicleColor, setVehiclecolor] = useState<VehicleColorInterface[]>([]);
  const [existingVehicles, setExistingVehicles] = useState<string[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );

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

  const onChange = ({ fileList: newFileList }: any) => {
    console.log("Updated File List:", newFileList);
    setFileList(newFileList);
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลให้ถูกต้องเเละครบถ้วน");
  };

  const { Option } = Select;

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

  const onFinish = async (values: VehicleFormValues) => {
    console.log("Form Values:", values['Received Date']);
    console.log("File List:", fileList);

    const vehicleName = values.Name.trim().toLowerCase();

    const formData = new FormData();
    formData.append("name", values.Name);
    formData.append("price", values["Price for rent"].toString());
    formData.append('receivedDate', values['Received Date'].format('YYYY-MM-DD'));
    formData.append("vehicleColorID", values.Color.toString());
    formData.append("description", values.Description);
    formData.append("vehicleTypeID", values.Type);
    formData.append("Status", "1");
    formData.append("employeeID", employeeid.toString());

    if (existingVehicles.includes(vehicleName)) {
      message.error("ชื่อรถนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น");
      return;
    }
    if (!values.Name || values.Name.trim() === "") {
      message.error("กรุณากรอกชื่อรถ");
      return;
    }
    if (values.Name.length > 20) {
      message.error("ชื่อรถต้องไม่เกิน 20 ตัวอักษร");
      return;
    }

    if (!values.Color) {
      message.error("กรุณาเลือกสีของยานพาหนะ");
      return;
    }

    if (!values.Description || values.Description.trim() === "") {
      message.error("กรุณากรอกคำอธิบายรถ");
      return;
    }
    if (values.Description.length > 100) {
      message.error("คำอธิบายรถต้องไม่เกิน 100 ตัวอักษร");
      return;
    }

    if (!values['Received Date']) {
      message.error("กรุณาเลือกวันที่รับรถ");
      return;
    }

    if (fileList.length === 0) {
      message.error("กรุณาอัปโหลดรูปภาพ");
      return;
    }

    if (values["Price for rent"] > 500) {
      message.error("ค่าเช่ารถต้องไม่เกิน 500.00 บาท");
      return;
    }


    if (fileList.length > 0) {
      formData.append("picture", fileList[0].originFileObj);
    } else {
      alert("กรุณาอัปโหลดรูปภาพ");
      return;
    }

    if (!values.Type) {
      alert("กรุณาเลือกประเภทของยานพาหนะ");
      return;
    }
    console.log("Selected ColorID:", values);
    console.log("Form Data ก่อนส่ง:", {
      Name: values.Name,
      Price: values["Price for rent"],
      ReceivedDate: values["Received Date"],
      ColorID: values.Color,
      Description: values.Description,
      TypeID: values.Type,
    });


    try {
      const response = await CreateVehicle(formData);
      console.log(response)
      if (response) {
        message.success("สร้างข้อมูลรถสำเร็จ");
        console.log("Vehicle created successfully", response);
        setTimeout(() => {
          navigate("/vehiclemanager");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
      alert("There was an error creating the vehicle. Please try again.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
  };

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

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    GetVehicleType();
    GetVehicleColor();
  }, []);

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
        Add Information
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
                      : Promise.reject(new Error("กรุณาอัปโหลดรูปภาพ"));
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
                    setFileList([file]);
                    return false;
                  }}
                  maxCount={1}
                  multiple={false}
                  listType="picture-card"
                >
                  {fileList.length === 0 && (
                    <div>
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </Form.Item>
          </Col>
          <Col></Col>

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
              style={{
                borderRadius: "10px",
              }}
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
              style={{
                borderRadius: "10px",
              }}
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
              style={{
                borderRadius: "30px",
              }}
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
              name="Price for rent"
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
              style={{
                borderRadius: "10px",
              }}
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
              label={<span style={{ fontWeight: "bold", fontSize: "16px", color: "#895E3C", }}>คำอธิบาย</span>}
              name="Description"
              rules={[
                { required: true, message: "กรุณากรอกคำอธิบายรถ" },
              ]}
              style={{
                borderRadius: "10px",
              }}
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
              label={<span style={{ fontWeight: 'bold', fontSize: '16px', color: '#895E3C' }}>วันที่ได้รับรถ</span>}
              name="Received Date"
              rules={[{ required: true, message: 'กรุณาเลือกวันที่รับรถ' }]}
              style={{
                borderRadius: '10px',
              }}
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
            <Link to="/vehiclemanager">
              <Button
                type="default"
                onClick={handleCancel}
                style={{
                  borderRadius: "10px",
                  color: "#B25900",
                  borderColor: "#B25900",
                  fontSize: "16px",
                  fontFamily: '"Poppins", sans-serif',
                  height: "45px",
                  marginRight: "10px",
                }}
                icon={<CloseOutlined />}
              >
                ยกเลิก
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#B25900",
                borderColor: "#B25900",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "16px",
                fontFamily: '"Poppins", sans-serif',
                height: "45px",
              }}
              icon={<SaveOutlined />}
            >
              บันทึก
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
export default Create; 