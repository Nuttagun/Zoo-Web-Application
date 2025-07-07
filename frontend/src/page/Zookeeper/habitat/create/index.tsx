import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  message,
  InputNumber,
  Card,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { CreateHabitat, GetZones } from "../../../../services/https";
import { ZoneInterface } from "../../../../interface/IZone";
import { useNavigate, Link } from "react-router-dom";

const CreateHabitatForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const { Option } = Select;
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();

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

    if (values.name.length > 100) {
      message.error("ชื่อกรงสัตว์ไม่สามารถเกิน 100 ตัวอักษร");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("size", values.size);
    formData.append("capacity", values.capacity);
    formData.append("zoneID", values.zoneID);
    formData.append("employeeID", employeeid.toString());
    formData.append("picture", fileList[0].originFileObj);
    console.log(fileList[0].originFileObj)
    const response = await CreateHabitat(formData);

    if (response) {
      message.success("สร้างข้อมูลที่อยู่อาศัยของสัตว์สำเร็จ");
      form.resetFields();
      setFileList([]);
      setTimeout(() => {
        navigate("/zookeeper/habitat");
      }, 2000);
    } else {
      message.error("สร้างข้อมูลที่อยู่อาศัยของสัตว์ไม่สำเร็จ");
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลที่อยู่อาศัยให้ถูกต้องเเละครบถ้วน");
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

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getZone();
  }, []);

  return (
    <Card style={{ margin: 0, padding: "20px", minHeight: "100vh" }}>

      <h2 className="header-habitat-box-create">CREATE HABITAT</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ size: 1.0, capacity: 1.0 }}
      >
        <Row gutter={[16, 16]}>
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
                      if (!isImage) {
                        message.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                        return Upload.LIST_IGNORE;
                      }
                      setFileList([...fileList, file]);
                      return false;
                    }}
                    maxCount={1}
                    multiple={false}
                    listType="picture-circle"
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

          <Col xs={24} sm={8} md={8} lg={12}>
            <Form.Item
              label="ชื่อกรงสัตว์"
              name="name"
              rules={[
                { required: true, message: "กรุณากรอกชื่อกรงสัตว์" },
                {
                  max: 99,
                  message: "กรุณากรอกชื่อกรงสัตว์ไม่เกิน 100 ตัวอักษร",
                },
              ]}
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
              name="size"
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
              name="capacity"
              rules={[
                { required: true, message: "กรุณากรอกความจุของสัตว์" },
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
              name="zoneID"
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
            <Space>
              <Link to={"/zookeeper/habitat"}>
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

export default CreateHabitatForm;
