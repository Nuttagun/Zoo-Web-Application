import {Button,Form,Input,message,Row,Col,Upload} from "antd";

import { useNavigate } from "react-router-dom";

import { CreateUser } from "../../services/https/Garfield/http";

//import { UsersInterface } from "../../interface/IUser";

import { GendersInterface } from "../../interface/IGender";

import { GetGender } from "../../services/https/Garfield/http"

import { Link } from "react-router-dom";

import ImgCrop from "antd-img-crop"; // สำหรับครอบรูป

import { PlusOutlined } from "@ant-design/icons"; // ไอคอนสำหรับอัปโหลด
// @ts-ignore
import type { UploadProps } from "antd";

import { useState, useEffect } from "react";
// @ts-ignore
import { UploadFile } from 'antd/es/upload/interface'; // เพิ่มการ import type สำหรับ UploadFile 

import { DatePicker } from "antd";

import { Select } from "antd";

const { Option } = Select;

function SignUpPages() {
  const [form] = Form.useForm();
  const navigate = useNavigate();// @ts-ignore
  const [messageApi, contextHolder] = message.useMessage();
  // เก็บไฟล์รูปโปรไฟล์ที่อัปโหลด
  const [fileList, setFileList] = useState<any[]>([]);
  const [genders, setGenders] = useState<GendersInterface[]>([]);
  
  const onChange = ({ fileList: newFileList }: any) => {
    console.log("Updated File List:", newFileList);
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

  const onFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error("Please upload a picture");
      return;
    }
  
    const formattedBirthday = values.birthday
      ? values.birthday.format("YYYY-MM-DD")  // แปลงวันเกิดเป็นรูปแบบ 'YYYY-MM-DD'
      : null;
  
    if (!formattedBirthday) {
      message.error("Please select a valid birthday!");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("email", values.email);
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);
      formData.append("birthday", formattedBirthday);  // ส่งค่า birthday ที่แปลงแล้ว
      formData.append("phonenumber", values.phonenumber);
      formData.append("genderID", values.genderID.toString());
      formData.append("profile", fileList[0].originFileObj);

      const response = await CreateUser(formData);
      if (response) {
        message.success("User created successfully!");
        form.resetFields();
        setFileList([]);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        message.error("Failed to create user.");
      }
    } catch (error) {
      message.error("An unexpected error occurred.");
      console.error(error);
    }
  };

  const getGender = async () => {
    let res = await GetGender();
    if (res) {
      setGenders(res);
    }
  };

  useEffect(() => {
    getGender();
  }, []);

  return (<>
      {contextHolder}
      <Row style={{ height: "100vh" }} align="middle" justify="center">
        <Col xs={24} sm={18} md={16} lg={14} xl={12}
          style={{
            display: "flex",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1.5, padding: "30px", backgroundColor: "#fff" }}>
            <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "32px" }}>SIGN UP</h1>

              <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">

                {/* Upload Profile Image */}
                <center>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item name="profile">
                        <ImgCrop aspect={1}>
                          <Upload
                            listType="picture-circle"
                            fileList={fileList}
                            onChange={onChange}
                            onPreview={onPreview}
                            beforeUpload={() => false} // ไม่อัปโหลดทันที
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
                </center>

                <Row gutter={[16, 0]} align={"middle"} justify={"center"}>

                  <Col xs={24} sm={24} md={24} lg={14} xl={12}>
                    <Form.Item
                      label="First name"
                      name="first_name"
                      rules={[{required: true,message: "Please input your first name!",},]}>
                      <Input />
                    </Form.Item>
                  </Col>


                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="Last name"
                      name="last_name"
                      rules={[{required: true,message: "Please input your last name!",},]}>
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{required: true,message: "Please input your username!",},]}>
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="ฺBirthdate"
                      name="birthday"
                      rules={[{ required: true, message: "Please input your birthday!",},]}>
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                    <Form.Item
                      name="genderID"
                      label="Gender"
                      rules={[{ required: true, message: "Please select your gender!" }]}
                    >
                      <Select allowClear>
                        {genders.map((item) => (
                          <Option value={item.ID} key={item.Gender}>
                            {item.Gender}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{type: "email",message: "Invalid email format!",},{required: true,message: "Please input your email!",},]}>
                      <Input />
                    </Form.Item>
                  </Col>


                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[{required: true,message: "Please input your password!",},]}>
                      <Input.Password />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                    <Form.Item
                      label="Phone number"               
                      name="phonenumber"
                      rules={[{pattern: /^[0-9]{10}$/,required: true,message: "Please input your phone number!",},]}>
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item>
                      <center>
                        <Button type="primary" htmlType="submit" className="signuppage-button" style={{ marginBottom: 20 }}>
                          Sign up
                        </Button>
                        <Link to="/">
                          <Button type="primary" htmlType="submit" className="cancel-button" style={{ marginBottom: 20, marginLeft: 20 }}>
                            Cancel
                          </Button>
                        </Link>
                      </center>
                    </Form.Item>
                  </Col>

                </Row>

              </Form>

          </div>

        </Col>

      </Row>

    </>

  );

}


export default SignUpPages;