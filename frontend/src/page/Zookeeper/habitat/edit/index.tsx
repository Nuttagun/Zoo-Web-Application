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
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetHabitatById,
  UpdateHabitat,
  GetZones,
} from "../../../../services/https";
import { HabitatInterface } from "../../../../interface/IHabitat";
import ImgCrop from "antd-img-crop";
import { ZoneInterface } from "../../../../interface/IZone";
import { Pencil } from "lucide-react";
const { Option } = Select;
const EditHabitatForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [habitat, setHabitat] = useState<HabitatInterface | null>(null);
  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();
  let { id } = useParams();

  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    values.ID = habitat?.ID;
    values.EmployeeID = employeeid;

    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !validImageTypes.includes(file.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    if (fileList.length === 0) {
      message.error("กรุณาอัพโหลดรูปภาพของที่อยู่อาศัยของสัตว์");
      return;
    }


    if (values.size < 1.0 || values.size > 9999.99) {
      message.error("กรุณากรอกขนาดกรงสัตว์ระหว่าง 1.00 - 9999.99 ตร.ว.");
      return;
    }

    if (values.capacity < 1 || values.capacity > 10) {
      message.error("กรุณากรอกความจุของสัตว์ระหว่าง 1 - 10 ตัว");
      return;
    }

    if (values.name > 100) {
      message.error("ชื่อกรงสัตว์ไม่สามารถเกิน 100 ตัวอักษร");
      return;
    }

    let res = await UpdateHabitat(values, file);

    if (res) {
      messageApi.open({
        type: "success",
        content: "เเก้ไขข้อมูลที่อยู่อาศัยของสัตว์สำเร็จ",
      });
      setTimeout(() => {
        navigate("/zookeeper/habitat");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "เเก้ไขข้อมูลที่อยู่อาศัยของสัตว์ไม่สำเร็จ",
      });
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลที่อยู่อาศัยให้ถูกต้องเเละครบถ้วน");
  };

  const getZone = async () => {
    let res = await GetZones();
    if (res) {
      setZones(res);
    }
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

  const getHabitatById = async () => {
    let res = await GetHabitatById(Number(id));
    if (res) {
      setHabitat(res);
      form.setFieldsValue({
        Name: res.Name,
        Size: res.Size,
        Capacity: res.Capacity,
        ZoneID: res.ZoneID,
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
    getHabitatById();
    getZone();
  }, []);

  return (
    <Card style={{ margin: 0, padding: "20px", minHeight: "100vh" }}>
      {contextHolder}
      <h2 className="header-habitat-box-edit">EDIT HABITAT</h2>
      <Divider />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ size: 1.0, capacity: 1.0 }}
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
                    listType="picture-circle"
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

          <Col xs={24} sm={8} md={8} lg={12}>
            <Form.Item
              label="ชื่อกรงสัตว์"
              name="Name"
              rules={[{ required: true, message: "กรุณากรอกชื่อกรงสัตว์" }]}
            >
              <Input
                placeholder="Enter habitat name"
                maxLength={100}
                onKeyPress={(event) => {
                  if (!/^[a-zA-Z0-9 ]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={12}>
            <Form.Item
              label="ขนาดกรงสัตว์"
              name="Size"
              rules={[
                { required: true, message: "กรุณากรอกขนาดกรงสัตว์" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value <= 9999.99) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("กรุณาใส่ค่าขนาดไม่เกิน 9999.99 ตร.ว.")
                    );
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter habitat size"
                min={1.0}
                precision={2}
                step={1.0}
                defaultValue={1.0}
                onKeyPress={(event) => {
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={12}>
            <Form.Item
              label="ความจุของสัตว์"
              name="Capacity"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกความจุของสัตว์",
                },
                {
                  validator: (_, value) => {
                    if (value === undefined || value <= 10) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("กรุณาใส่ค่าความจุไม่เกิน 10 ตัว")
                    );
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter capacity"
                min={1}
                step={1}
                defaultValue={1}
                onKeyPress={(event) => {
                  if (!/^[0-9.]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8} lg={12}>
            <Form.Item
              label="โซน"
              name="ZoneID"
              rules={[{ required: true, message: "กรุณาเลือกโซนของกรงสัตว์" }]}
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
        </Row>

        <Row justify="end">
          <Col>
            <Form.Item>
              <Space>
                <Button
                  htmlType="button"
                  onClick={() => navigate("/zookeeper/habitat")}
                >
                  Cancel
                </Button>
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

export default EditHabitatForm;
