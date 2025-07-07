import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Upload,
  Card,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { CreateEvent, ListAnimal, GetZones } from "../../../../services/https";
import { ZoneInterface } from "../../../../interface/IZone";
import { AnimalsInterface } from "../../../../interface/IAnimal";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import "../event.css";
const { TextArea } = Input;

const CreateEventForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const [animals, setAnimals] = useState<AnimalsInterface[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();
  const { Option } = Select;

  const handleDateSelect = (date: any) => {
    if (date) {
      console.log("Selected Date:", date.toISOString());
    }
  };

  const onFinish = async (values: any) => {
    if (values.title.length > 100) {
      message.error("ชื่ออีเว้นต้องไม่เกิน 100 ตัวอักษร");
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

    if (fileList.length === 0) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัปโหลดรูปภาพ");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("startDate", values.startDate.format("YYYY-MM-DD"));
    formData.append("endDate", values.endDate.format("YYYY-MM-DD"));
    formData.append("zoneID", values.zoneID);
    formData.append("animalID", values.animalID);
    formData.append("employeeID", employeeid.toString());
    formData.append("picture", fileList[0].originFileObj);

    console.log(1);

    const response = await CreateEvent(formData);

    if (response) {
      message.success("สร้างข้อมูลอีเว้นสำเร็จ");
      form.resetFields();
      setFileList([]);
      setTimeout(() => {
        navigate("/zookeeper/event");
      }, 2000);
    } else {
      message.error("สร้างข้อมูลอีเว้นไม่สำเร็จ");
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลอีเว้นให้ถูกต้องเเละครบถ้วน");
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

  const getZone = async () => {
    let res = await GetZones();
    if (res) {
      setZones(res);
    }
  };

  const getAnimal = async () => {
    let res = await ListAnimal();
    if (res) {
      setAnimals(res);
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getZone();
    getAnimal();
  }, []);

  return (
    <Card style={{ margin: 0, padding: "10px", minHeight: "100vh" }}>
      <h2 className="header-event-box-create">CREATE EVENT</h2>
      <Form
        form={form}
        name="basic"
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Form.Item
                label="อัปโหลดรูปภาพ"
                name="picture"
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
            </div>
          </Col>

          <Col span={12}>
            <Form.Item
              label="ชื่องานอีเว้น"
              name="title"
              rules={[
                { required: true, message: "กรุณากรอกชื่องานอีเว้น" },
                {
                  max: 99,
                  message: "กรุณากรอกชื่ออีเว้นไม่เกิน 100 ตัวอักษร",
                },
              ]}
            >
              <Input
                style={{ width: "100%" }}
                placeholder="Enter event title"
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="รายละเอียด"
              name="description"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
            >
              <TextArea
                rows={4}
                style={{ width: "100%" }}
                placeholder="Enter event description"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="วันเริ่มงานอีเว้น"
              name="startDate"
              rules={[
                { required: true, message: "กรุณาเลือกวันเริ่มงานอีเว้น" },
              ]}
            >
              <DatePicker
                onChange={handleDateSelect}
                style={{ width: "100%", marginBottom: "16px" }}
                disabledDate={(current) => {
                  return current && current < dayjs().startOf("day");
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="สิ้นสุดงานอีเว้น"
              name="endDate"
              dependencies={["startDate"]}
              rules={[
                { required: true, message: "กรุณาเลือกวันสิ้นสุดงานอีเว้น" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate");
                    if (!value || !startDate || value.isAfter(startDate)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "กรุณาเลือกวันสิ้นสุดงานอีเว้นที่มากกว่าวันเริ่มงานอีเว้น"
                      )
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                onChange={handleDateSelect}
                style={{ width: "100%", marginBottom: "16px" }}
                disabledDate={(current) => {
                  return current && current < dayjs().startOf("day");
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              label="โซน"
              name="zoneID"
              rules={[{ required: true, message: "กรุณาเลือกโซนจัดงานอีเว้น" }]}
            >
              <Select allowClear>
                {zones.map((item) => (
                  <Option value={item.ID} key={item.Zone}>
                    {item.Zone}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="สัตว์"
              name="animalID"
              rules={[
                {
                  required: true,
                  message: "กรุณาเลือกสัตว์ที่เกี่ยวข้องกับงานอีเว้น",
                },
              ]}
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
            <Form.Item>
              <Space>
                <Link to={"/zookeeper/event"}>
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

export default CreateEventForm;
