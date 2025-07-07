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
  DatePicker,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import {
  CreateAnimal,
  GetSexs,
  GetBehaviorals,
  GetBiological,
  ListHabitatAvalibleforAnimal,
  GetStatusAnimal,
} from "../../../../services/https/index";
import { SexsInterface } from "../../../../interface/ISex";
import { BehavioralInterface } from "../../../../interface/IBehavioral";
import { BiologicalInterface } from "../../../../interface/IBiological";
import { HabitatInterface } from "../../../../interface/IHabitat";
import { HealthAnimalInterface } from "../../../../interface/IStatusAnimal";
import { useNavigate, Link } from "react-router-dom";
import "../animal.css";
const CreateAnimalForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [sexs, setSexs] = useState<SexsInterface[]>([]);
  const [behaviorals, setBehaviorals] = useState<BehavioralInterface[]>([]);
  const [biologicals, setBiologicals] = useState<BiologicalInterface[]>([]);
  const [habitats, setHabitats] = useState<HabitatInterface[]>([]);
  const [statusanimal, setStatusAnimal] = useState<HealthAnimalInterface[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();

  const { Option } = Select;

  const onFinish = async (values: any) => {
    const nameRegex = /^[a-zA-Zก-๙\s]+$/;
    if (!nameRegex.test(values.name) || values.name.length > 100) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณากรอกชื่อสัตว์ให้ถูกต้อง");
      return;
    }

    if (values.weight < 0.01 || values.weight > 9999.99) {
      message.error("น้ำหนักต้องอยู่ในช่วง 0.01 - 9999.99 kg.");
      return;
    }
    if (values.height < 0.01 || values.height > 9999.99) {
      message.error("ส่วนสูงต้องอยู่ในช่วง 0.01 - 9999.99 cm.");
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
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("weight", values.weight);
    formData.append("height", values.height);
    formData.append("birthDay", values.birthDay.format("YYYY-MM-DD"));
    formData.append("birthplace", values.birthplace);
    formData.append("health", values.health);
    formData.append("note", values.note);
    formData.append("sexID", values.sexID);
    formData.append("biologicalID", values.biologicalID);
    formData.append("behavioralID", values.behavioralID);
    formData.append("employeeID", employeeid.toString());
    formData.append("habitatID", values.habitatID);
    formData.append("picture", fileList[0].originFileObj);

    const response = await CreateAnimal(formData);

    if (response) {
      message.success("สร้างข้อมูลการนำเข้าสัตว์สำเร็จ");
      form.resetFields();
      setFileList([]);
      setTimeout(() => {
        navigate("/zookeeper");
      }, 2000);
    } else {
      message.error("สร้างข้อมูลการนำเข้าสัตว์ไม่สำเร็จ");
    }
  };

  const onFinishFailed = () => {
    message.warning("กรุณากรอกข้อมูลสัตว์ให้ถูกต้องเเละครบถ้วน");
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

  const getSex = async () => {
    let res = await GetSexs();
    if (res) {
      setSexs(res);
    }
  };

  const getBiological = async () => {
    let res = await GetBiological();
    if (res) {
      setBiologicals(res);
    }
  };

  const getBehavioral = async () => {
    let res = await GetBehaviorals();
    if (res) {
      setBehaviorals(res);
    }
  };

  const getHabitat = async () => {
    let res = await ListHabitatAvalibleforAnimal();
    console.log(res);
    if (res) {
      setHabitats(res);
    }
  };

  const getStatusAnimal = async () => {
    let res = await GetStatusAnimal();
    console.log(res);
    if (res) {
      setStatusAnimal(res);
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
    getSex();
    getBiological();
    getBehavioral();
    getHabitat();
    getStatusAnimal();
  }, []);

  return (
    <Card>
      <h2 className="header-animals-box-create">CREATE ANIMAL</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ weight: 0.01, height: 1.0 }}
      >
        <Row gutter={[16, 0]}>
          <Form.Item
            label="อัปโหลดรูปภาพ"
            name="picture"
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

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              label="ชื่อสัตว์ที่นำเข้า"
              name="name"
              style={{ width: "460px" }}
              rules={[
                { required: true, message: "กรุณากรอกชื่อสัตว์ที่นำเข้า" },
                {
                  max: 99,
                  message: "กรุณากรอกชื่อสัตว์ไม่เกิน 100 ตัวอักษร",
                },
              ]}
            >
              <Input
                placeholder="Enter animal name"
                maxLength={100}
                onKeyPress={(event) => {
                  if (!/^[a-zA-Zก-๙\s]$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>

            <Row gutter={[16, 0]}>
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={8}
                style={{ marginRight: "118px" }}
              >
                <Form.Item
                  label="น้ำหนักของสัตว์"
                  name="weight"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกน้ำหนัก",
                    },
                    {
                      validator: (_, value) => {
                        if (value === undefined || value <= 9999.99) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("กรุณาใส่ค่าน้ำหนักไม่เกิน 9999.99 kg.")
                        );
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "210px" }}
                    placeholder="Enter animal weight"
                    min={0.01}
                    precision={2}
                    step={0.01}
                    defaultValue={0.01}
                    onKeyPress={(event) => {
                      if (!/^[0-9.]$/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={8}>
                <Form.Item
                  label="ส่วนสูงของสัตว์"
                  name="height"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกส่วนสูง",
                    },
                    {
                      validator: (_, value) => {
                        if (value === undefined || value <= 9999.99) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("กรุณาใส่ค่าส่วนสูงไม่เกิน 9999.99 cm.")
                        );
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "210px" }}
                    placeholder="Enter animal height"
                    min={0.01}
                    precision={2}
                    step={0.01}
                    defaultValue={1.0}
                    onKeyPress={(event) => {
                      if (!/^[0-9.]$/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              label="รายระเอียด"
              name="description"
              style={{ marginLeft: "80px", width: "585px" }}
              rules={[{ required: true, message: "กรุณากรอกกรอกรายระเอียด" }]}
            >
              <Input.TextArea rows={5} placeholder="Enter animal description" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="วันเกิดของสัตว์"
              name="birthDay"
              rules={[{ required: true, message: "กรุณาเลือกวันเกิดของสัตว์" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="ถิ่นกำเนิดของสัตว์"
              name="birthplace"
              rules={[
                { required: true, message: "กรุณากรอกถิ่นกำเนิดของสัตว์" },
              ]}
            >
              <Input placeholder="Enter animal birthplace" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="สุขภาพของสัตว์"
              name="health"
              rules={[
                { required: true, message: "กรุณาเลือกสถานะสุขภาพของสัตว์" },
              ]}
            >
              <Select allowClear>
                {statusanimal.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.Status}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item label="หมายเหตุ" name="note">
              <Input placeholder="Enter any additional notes" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="เพศของสัตว์"
              name="sexID"
              rules={[{ required: true, message: "กรุณาเลือกเพศของสัตว์" }]}
            >
              <Select allowClear>
                {sexs.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.Sex}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="ข้อมูลเชิงชีวิภาพ"
              name="biologicalID"
              rules={[
                {
                  required: true,
                  message: "กรุณาเลือกข้อมูลเชิงชีวภาพของสัตว์",
                },
              ]}
            >
              <Select allowClear>
                {biologicals.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.Biological}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="พฤติกรรมของสัตว์"
              name="behavioralID"
              rules={[
                { required: true, message: "กรุณาเลือกพฤติกรรมของสัตว์" },
              ]}
            >
              <Select allowClear>
                {behaviorals.map((item) => (
                  <Option key={item.ID} value={item.ID}>
                    {item.Behavioral}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="ที่อยู่อาศัยของสัตว์"
              name="habitatID"
              rules={[
                { required: true, message: "กรุณาเลือกที่อยู่อาศัยของสัตว์" },
              ]}
            >
              <Select allowClear>
                {habitats.map((item) => (
                  <Option key={item.ID} value={item.ID}>
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
                <Link to={"/zookeeper"}>
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

export default CreateAnimalForm;
