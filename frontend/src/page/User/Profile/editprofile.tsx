import { useEffect, useState } from "react";
import { Button, Form, Input, Upload, message, Row, Col, DatePicker, Select, Card } from "antd";
import ImgCrop from "antd-img-crop";  // ไม่ใช้ `rotate` prop
import { GetGender, GetUserById, UpdateUserbyId } from "../../../services/https/Garfield/http";
import { useParams, useNavigate,} from "react-router-dom";
import { CloseOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interface/IUser";
import { GendersInterface } from "../../../interface/IGender";
import dayjs from "dayjs";

const EditProfile = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [gender, setGender] = useState<GendersInterface[]>([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { Option } = Select;
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    values.ID = user?.ID;
    if (values.BirthDay) {
      values.BirthDay = dayjs(values.BirthDay).format("YYYY-MM-DD");
    }
    console.log("Values to be submitted:", values);

    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file && !validImageTypes.includes(file.type)) {
      message.error("ไม่สามารถสร้างข้อมูลได้ กรุณาอัพโหลดเฉพาะไฟล์รูปภาพ");
      return;
    }

    console.log("Values to be submitted:", values);

    let res = await UpdateUserbyId(values, file);

    if (res) {
      messageApi.open({
        type: "success",
        content: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
      });
    
      setTimeout(() => {
        // ตรวจสอบ Role และเปลี่ยนเส้นทางตาม Role
        if (user?.UserRoleID === 1) {
          navigate("/admin");
        } else if (user?.UserRoleID === 2) {
          navigate("/user");
        } else if (user?.UserRoleID === 3) {
          navigate("/zookeeper");
        } else if (user?.UserRoleID === 4) {
          navigate("/vetdashboard");
        } else if (user?.UserRoleID === 5) {
          navigate("/zoosale");
        } else {
          navigate("/vehiclemanager"); // เส้นทางเริ่มต้นหากไม่มี Role ตรงกับที่กำหนด
        }
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ",
      });
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

  const getGender = async () => {
    let res = await GetGender();
    if (res) {
      setGender(res);
    }
  };

  const getUserById = async () => {
    let res = await GetUserById(Number(id));
    console.log(res)
    if (res) {
      setUser(res);
      form.setFieldsValue({
        Username: res.Username,
        Password: res.Password,
        Email: res.Email,
        FirstName: res.FirstName,
        LastName: res.LastName,
        BirthDay: res.BirthDay ? dayjs(res.BirthDay) : null,
        Phonenumber: res.Phonenumber,
        GenderID: res.GenderID,
      });
      if (res.Profile) {
        setFileList([
          {
            uid: "-1",
            name: res.Profile,
            status: "done",
            url: `http://localhost:8000/${res.Profile}`,
          },
        ]);
      }
    }
  };

  useEffect(() => {
    getGender();
    getUserById();
  }, []);

  return (
    <div>
      <Card bordered={true}
        style={{
          maxWidth: 960,
          margin: "20px auto",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "32px", marginBottom: "30px" }}>Edit Profile {user ? user.Username : ""}</h1>

        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          {contextHolder}
          <Col span={24} style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <Form.Item
            label="อัปโหลดรูปภาพ"
            name="Profile"
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
          </Col>
          <Row gutter={50}>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="Username"
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Password" name="password">
                <Input.Password placeholder="Enter password (if updating)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="Email"
                rules={[{ required: true, message: "กรุณากรอกอีเมล" }, { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="FirstName"
                rules={[{ required: true, message: "กรุณากรอกชื่อจริง" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="LastName"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="BirthDay" name="BirthDay">
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="Phonenumber"
                rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์" }, { pattern: /^[0-9]{10}$/, message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)" }]}
              >
                <Input placeholder="Enter phone number" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="GenderID"
                rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
              >
                <Select allowClear>
                  {gender.map((item) => (
                    <Option key={item.ID} value={item.ID}>
                      {item.Gender}
                    </Option>
                  ))}
                </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} justify="end">
          <Col>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save
            </Button>
          </Col>
          <Col>
              <Button icon={<CloseOutlined />}
              onClick={() => {
                if (user?.UserRoleID === 1) {
                  navigate("/admin");
                } else if (user?.UserRoleID === 2) {
                  navigate("/user");
                } else if (user?.UserRoleID === 3) {
                  navigate("/zookeeper");
                } else if (user?.UserRoleID === 4) {
                  navigate("/vetdashboard");
                } else if (user?.UserRoleID === 5) {
                  navigate("/zoosale");
                } else {
                  navigate("/vehiclemanager"); // Default route
                }
              }}>
                Cancel
              </Button>
          </Col>
        </Row>
      </Form>
    </Card>
    </div >
  );
};

export default EditProfile;
