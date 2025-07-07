import React, { useEffect, useState } from "react";
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
  DatePicker,
  Select,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import {
  GetSexs,
  GetBehaviorals,
  GetBiological,
  ListHabitatAvalibleforAnimal,
  GetAnimalById,
  UpdateAnimal,
  GetStatusAnimal,
} from "../../../../services/https";
import { SexsInterface } from "../../../../interface/ISex";
import { BehavioralInterface } from "../../../../interface/IBehavioral";
import { BiologicalInterface } from "../../../../interface/IBiological";
import { HabitatInterface } from "../../../../interface/IHabitat";
import { AnimalsInterface } from "../../../../interface/IAnimal";
import { HealthAnimalInterface } from "../../../../interface/IStatusAnimal";
import { useNavigate, useParams, Link } from "react-router-dom";

const UpdateAnimalForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [sexs, setSexs] = useState<SexsInterface[]>([]);
  const [animals, setAnimals] = useState<AnimalsInterface | null>(null);
  const [behaviorals, setBehaviorals] = useState<BehavioralInterface[]>([]);
  const [biologicals, setBiologicals] = useState<BiologicalInterface[]>([]);
  const [habitats, setHabitats] = useState<HabitatInterface[]>([]);
  const [statusanimal, setStatusAnimal] = useState<HealthAnimalInterface[]>([]);
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const navigate = useNavigate();
  const { Option } = Select;
  let { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    values.ID = animals?.ID;
    values.EmployeeID = employeeid;
    if (values.BirthDay) {
      values.BirthDay = dayjs(values.BirthDay).format("YYYY-MM-DD");
    }
    console.log("Values to be submitted:", values);

    if (values.weight < 0.01 || values.weight > 9999.99) {
      message.error("น้ำหนักต้องอยู่ในช่วง 0.01 - 9999.99 kg.");
      return;
    }

    if (values.height < 0.01 || values.height > 9999.99) {
      message.error("ส่วนสูงต้องอยู่ในช่วง 0.01 - 9999.99 cm.");
      return;
    }

    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !validImageTypes.includes(file.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    console.log("Values to be submitted:", values);

    let res = await UpdateAnimal(values, file);

    if (res) {
      messageApi.open({
        type: "success",
        content: "เเก้ไขข้อมูลสัตว์สำเร็จ",
      });
      setTimeout(() => {
        navigate("/zookeeper");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "เเก้ไขข้อมูลสัตว์ไม่สำเร็จ",
      });
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

  const getAnimalById = async () => {
    let res = await GetAnimalById(Number(id));
    console.log(res)
    if (res) {
      setAnimals(res);
      form.setFieldsValue({
        Name: res.Name,
        Weight: res.Weight,
        Height: res.Height,
        Description: res.Description,
        Birthplace: res.Birthplace,
        BirthDay: dayjs(res.BirthDay),
        Health: res.HealthAnimal?.ID,
        Note: res.Note,
        SexID: res.Sex?.ID,
        BiologicalID: res.Biological?.ID,
        BehavioralID: res.Behavioral?.ID,
        HabitatID: res.Habitat?.ID,
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
    getSex();
    getBiological();
    getBehavioral();
    getHabitat();
    getAnimalById();
    getStatusAnimal();
  }, []);

  return (
    <Card>
      {contextHolder}
      <h2 className="header-animals-box-edit">EDIT ANIMAL</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
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

          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              label="ชื่อสัตว์ที่นำเข้า"
              name="Name"
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
                  if (!/^[a-zA-Z ]$/.test(event.key)) {
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
                  name="Weight"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกน้ำหนักของสัตว์",
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
                    placeholder="Enter animal weight"
                    min={0.01}
                    step={0.01}
                    defaultValue={0.01}
                    precision={2}
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
                  name="Height"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกส่วนสูงของสัตว์",
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
                    min={1.0}
                    step={0.01}
                    defaultValue={1.0}
                    precision={2}
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
              name="Description"
              style={{ marginLeft: "80px", width: "580px" }}
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
              name="BirthDay"
              rules={[{ required: true, message: "กรุณาเลือกวันเกิดของสัตว์" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="ถิ่นกำเนิดของสัตว์"
              name="Birthplace"
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
              name="Health"
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
            <Form.Item
              label="หมายเหตุ"
              name="Note"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกหมายเหตุที่เเก้ไขข้อมูลสัตว์",
                },
              ]}
            >
              <Input placeholder="Enter any additional notes" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12}>
            <Form.Item
              label="เพศของสัตว์"
              name="SexID"
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
              name="BiologicalID"
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
              name="BehavioralID"
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
              name="HabitatID"
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

export default UpdateAnimalForm;
