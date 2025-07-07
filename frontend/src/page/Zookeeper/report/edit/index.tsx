import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Form,
  Input,
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
import {
  GetReportById,
  UpdateReport,
  ListAnimal,
} from "../../../../services/https";
import { AnimalsInterface } from "../../../../interface/IAnimal";
import { ReportInterface } from "../../../../interface/IReport";
import { useNavigate, useParams, Link } from "react-router-dom";

const UpdateReportForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [animals, setAnimals] = useState<AnimalsInterface[]>([]);
  const [report, setReport] = useState<ReportInterface | null>(null);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();
  let { id } = useParams();
  console.log(id);
  const [messageApi, contextHolder] = message.useMessage();

  const { Option } = Select;

  const onFinish = async (values: any) => {
    values.ID = report?.ID;
    values.EmployeeID = employeeid;

    if (!values.StatusVet) {
      values.StatusVet = report?.StatusVet;
    }

    if (values.ReportDate) {
      values.ReportDate = dayjs(values.ReportDate).format("YYYY-MM-DD");
    }

    console.log("Values to be submitted:", values);

    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !validImageTypes.includes(file.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    let res = await UpdateReport(values.ID, values, file);

    if (res) {
      messageApi.open({
        type: "success",
        content: "เเก้ไขข้อมูลสัตว์ป่วยเเก่สัตวเเพทย์สำเร็จ",
      });
      setTimeout(() => {
        navigate("/zookeeper/report");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "เเก้ไขข้อมูลสัตว์ป่วยเเก่สัตวเเพทย์ไม่สำเร็จ",
      });
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

  const getReportById = async () => {
    const res = await GetReportById(Number(id));
    console.log(res);
    if (res) {
      setReport(res);
      form.setFieldsValue({
        Title: res.Title,
        Description: res.Description,
        ReportDate: dayjs(res.ReportDate),
        StatusVet: res.StatusVet,
        AnimalID: res.AnimalID,
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
    }
  };

  const getAnimals = async () => {
    const res = await ListAnimal();
    if (res) {
      setAnimals(res);
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getReportById();
    getAnimals();
  }, []);

  return (
    <Card style={{ margin: 0, padding: "20px", minHeight: "100vh" }}>
      {contextHolder}
      <h2 className="header-report-box-edit">EDIT REPORT</h2>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={[16, 0]}>
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

          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item
              label="เรื่องที่จะเเจ้ง"
              name="Title"
              rules={[
                { required: true, message: "กรุณากรอกเรื่องที่จะเเจ้ง" },
                {
                  max: 99,
                  message: "กรุณากรอกชื่อกรงสัตว์ไม่เกิน 100 ตัวอักษร",
                },
              ]}
            >
              <Input placeholder="Enter report title" maxLength={100} />
            </Form.Item>

            <Form.Item
              label="รายละเอียด"
              name="Description"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกรายละเอียด",
                },
              ]}
            >
              <Input.TextArea rows={5} placeholder="Enter report description" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="วันที่เเจ้งสัตว์ป่วย"
              name="ReportDate"
              rules={[
                { required: true, message: "กรุณาเลือกวันที่เเจ้งสัตว์ป่วย" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="สัตว์ที่ป่วย"
              name="AnimalID"
              rules={[{ required: true, message: "กรุณาเลือกสัตวืที่ป่วย" }]}
            >
              <Select allowClear>
                {animals.map((animal) => (
                  <Option key={animal.ID} value={animal.ID}>
                    {animal.Name}
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
                <Link to={"/zookeeper/report"}>
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

export default UpdateReportForm;
