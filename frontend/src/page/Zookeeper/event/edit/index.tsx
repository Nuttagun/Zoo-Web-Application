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
import { Pencil } from "lucide-react";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  GetEventById,
  UpdateEvent,
  ListAnimal,
  GetZones,
} from "../../../../services/https";
import { ZoneInterface } from "../../../../interface/IZone";
import { AnimalsInterface } from "../../../../interface/IAnimal";
import { EventsInterface } from "../../../../interface/IEvent";
import { useNavigate, useParams } from "react-router-dom";
import "../event.css";

const { TextArea } = Input;

const EditEventForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const [animals, setAnimals] = useState<AnimalsInterface[]>([]);
  const [events, setEvents] = useState<EventsInterface | null>(null);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();
  let { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { Option } = Select;

  const onFinish = async (values: any) => {
    values.ID = events?.ID;
    values.EmployeeID = employeeid;
    if (values.startDate) {
      values.startDate = dayjs(values.startDate).format("YYYY-MM-DD");
    }
    if (values.endDate) {
      values.endDate = dayjs(values.endDate).format("YYYY-MM-DD");
    }

    if (values.title > 100) {
      message.error("ชื่ออีเว้นต้องไม่เกิน 100 ตัวอักษร");
      return;
    }

    console.log(1)

    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !validImageTypes.includes(file.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    console.log("Values to be submitted:", values);

    let res = await UpdateEvent(values, file);

    if (res) {
      messageApi.open({
        type: "success",
        content: "เเก้ไขข้อมูลอีเว้นสำเร็จ",
      });
      setTimeout(() => {
        navigate("/zookeeper/event");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "เเก้ไขข้อมูลอีเว้นไม่สำเร็จ",
      });
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

  const fetchZones = async () => {
    const res = await GetZones();
    if (res) setZones(res);
  };

  const fetchAnimals = async () => {
    const res = await ListAnimal();
    if (res) setAnimals(res);
  };

  const fetchEventById = async () => {
    const res = await GetEventById(Number(id));
    if (res) {
      setEvents(res);
      form.setFieldsValue({
        title: res.Title,
        description: res.Description,
        startDate: dayjs(res.StartDate),
        endDate: dayjs(res.EndDate),
        zoneID: res.ZoneID,
        animalID: res.AnimalID,
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

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    fetchZones();
    fetchAnimals();
    fetchEventById();
  }, []);

  return (
    <Card style={{ margin: 0, padding: "10px", minHeight: "100vh" }}>
      {contextHolder}
      <h2 className="header-event-box-edit">EDIT EVENT</h2>
      <Form
        form={form}
        layout="vertical"
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
                    validator: () =>
                      fileList.length > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error("กรุณาอัปโหลดรูป")),
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
              <Input placeholder="Enter event title" maxLength={100} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="รายละเอียด"
              name="description"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
            >
              <TextArea rows={4} placeholder="Enter event description" />
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
              <DatePicker style={{ width: "100%" }} />
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
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="โซน"
              name="zoneID"
              rules={[{ required: true, message: "กรุณาเลือกโซนจัดงานอีเว้น" }]}
            >
              <Select allowClear>
                {zones.map((zone) => (
                  <Option value={zone.ID} key={zone.ID}>
                    {zone.Zone}
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
                {animals.map((animal) => (
                  <Option value={animal.ID} key={animal.ID}>
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
                <Button
                  onClick={() => navigate("/zookeeper/event")}
                  type="default"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ backgroundColor: "orange" }}
                  icon={<Pencil style={{ width: "18px" }} />}
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

export default EditEventForm;
