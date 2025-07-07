import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  message,
  Card,
  Divider,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { CreateReport, ListAnimal } from "../../../../services/https";
import { AnimalsInterface } from "../../../../interface/IAnimal";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";

const CreateReportForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [animals, setAnimals] = useState<AnimalsInterface[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const { Option } = Select;
  const navigate = useNavigate();
  const { TextArea } = Input;

  const onFinish = async (values: any) => {
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const isValidImages = fileList.every((file) =>
      validImageTypes.includes(file.type)
    );

    if (!isValidImages) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    if (fileList.length === 0) {
      message.error("Please upload a picture");
      return;
    }

    const formData = new FormData();
    const currentDate = dayjs().format("YYYY-MM-DD");

    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("reportDate", currentDate);
    formData.append("statusVet", "pending");
    formData.append("animalID", values.animalID);
    formData.append("employeeID", employeeid.toString());
    formData.append("picture", fileList[0].originFileObj);

    try {
      const response = await CreateReport(formData);

      if (response) {
        message.success("เเจ้งข้อมูลสัตว์ป่วยเเก่สัตวเเพทย์สำเร็จ");
        form.resetFields();
        setFileList([]);
        setTimeout(() => {
          navigate("/zookeeper/report");
        }, 2000);
      } else {
        message.error("เเจ้งข้อมูลสัตว์ป่วยเเก่สัตวเเพทย์ไม่สำเร็จ");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการสร้างรายงาน");
      console.error("Error creating report:", error);
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลให้ถูกต้องเเละครบถ้วน");
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

  const getAnimal = async () => {
    let res = await ListAnimal();
    if (res) {
      setAnimals(res);
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getAnimal();
  }, []);

  return (
    <Card style={{ margin: 0, padding: "20px", minHeight: "100vh" }}>
      <h2 className="header-report-box-create">CREATE REPORT</h2>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item
              label="อัปโหลดรูปภาพ"
              name="picture"
              valuePropName="fileList"
              rules={[
                {
                  required: true,
                  message: "กรุณาอัปโหลดรูป",
                  validator: () => {
                    return fileList.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("กรุณาอัปโหลดรูป"));
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
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </ImgCrop>
            </Form.Item>
          </Col>

          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item
              label="เรื่องที่จะเเจ้ง"
              name="title"
              rules={[
                { required: true, message: "กรุณากรอกเรื่องที่จะเเจ้ง" },
                {
                  max: 99,
                  message: "กรุณากรอกชื่อกรงสัตว์ไม่เกิน 100 ตัวอักษร",
                },
              ]}
            >
              <Input placeholder="Enter report title" />
            </Form.Item>

            <Form.Item
              label="รายละเอียด"
              name="description"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
            >
              <TextArea rows={4} placeholder="Enter report description" />
            </Form.Item>

            <Form.Item
              label="สัตว์ที่ป่วย"
              name="animalID"
              rules={[{ required: true, message: "กรุณาเลือกสัตวืที่ป่วย" }]}
            >
              <Select allowClear>
                {animals.map((item) => (
                  <Option value={item.ID} key={item.Name}>
                    {item.Name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end">
          <Col>
            <Space>
              <Link to={"/zookeeper/report"}>
                <Button htmlType="button">Cancel</Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "orange" }}
                icon={<PlusOutlined />}
              >
                CREATE
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default CreateReportForm;
