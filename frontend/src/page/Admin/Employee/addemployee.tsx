import { Button, Form, Input, message, Row, Col, Upload, DatePicker, Select, Radio, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ImgCrop from "antd-img-crop";
import { GetGender, CreateUserByAdmin, GetUserRole } from "../../../services/https/Garfield/http";
import { Link } from "react-router-dom";  // Import Link
// @ts-ignore
import { UploadFile } from 'antd/es/upload/interface';
import { GendersInterface } from "../../../interface/IGender"
import { UserroleInterface } from "../../../interface/IUserrole"


const AddEmployee: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const navigate = useNavigate();// @ts-ignore
  const [messageApi, contextHolder] = message.useMessage();
  const [genders, setGenders] = useState<GendersInterface[]>([]);
  const [userrole, setUserRole] = useState<UserroleInterface[]>([]);// @ts-ignore
  const [employeeid, setEmployeeid] = useState<number>(Number(localStorage.getItem("employeeid")) || 0);
  const { Option } = Select;

  const getGender = async () => {
    const res = await GetGender();
    if (res) setGenders(res);
  };

  const getUserRole = async () => {
    const res = await GetUserRole();
    if (res) setUserRole(res);
  };

  useEffect(() => {
    getGender();
    getUserRole();
    setEmployeeid(Number(localStorage.getItem("employeeid")));
  }, []);
  
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
      const isFullTime = values.classification === "full-time";
  
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
      formData.append("userRoleID", values.userRoleID.toString());
      formData.append("salary", values.salary.toString());
      formData.append("fullTime", isFullTime ? "true" : "false");
      formData.append("bio", values.bio);
      formData.append("experience", values.experience);
      formData.append("education", values.education);

  
      const response = await CreateUserByAdmin(formData);
  
      if (response) {
        message.success("Employee created successfully!");
        form.resetFields();
        setFileList([]);
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        message.error("Failed to create employee.");
      }
    } catch (error) {
      message.error("An unexpected error occurred.");
      console.error(error);
    }
  };
  
  
  
  
    

  return (<>
    {contextHolder}
    {/* <Row style={{ height: "100vh" }} align="middle" justify="center"> */}
      {/* <Col xs={24} sm={18} md={16} lg={14} xl={12}
        style={{
          display: "flex",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      > */}
        <div style={{ flex: 1.5, padding: "30px", backgroundColor: "#fff" }}>
          <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "32px", color: "#B25900" }}>EMPLOYEE INFORMATION</h1>

            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">

              {/* Upload Profile Image */}
                <center>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item name="profile" style={{display:"flex", justifyContent:"center",alignItems:"center", marginTop:"10px"}} 
                      valuePropName="fileList" 
                      rules={[
                        {
                          required: true,
                          message: "Please upload a picture",
                          validator: () => {
                            return fileList.length > 0
                              ? Promise.resolve()
                              : Promise.reject(new Error("Please upload a picture"));
                          },
                        },
                      ]}>
                      <ImgCrop aspect={1}>
                        <Upload
                          listType="picture-circle"
                          fileList={fileList}
                          onChange={onChange}
                          onPreview={onPreview}
                          beforeUpload={(file) => {
                            setFileList([file]);
                            return false;
                          }}
                          maxCount={1}
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
                    rules={[{required: true,message: "Please input first name!",},]}>
                    <Input />
                  </Form.Item>
                </Col>


                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="Last name"
                    name="last_name"
                    rules={[{required: true,message: "Please input last name!",},]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[{required: true,message: "Please input username!",},]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="ฺBirthdate"
                    name="birthday"
                    rules={[{ required: true, message: "Please input birthday!",},]}>
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    name="genderID"
                    label="Gender"
                    rules={[{ required: true, message: "Please select gender!" }]}
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
                    rules={[{type: "email",message: "Invalid email format!",},{required: true,message: "Please input email!",},]}>
                    <Input />
                  </Form.Item>
                </Col>


                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{required: true,message: "Please input password!",},]}>
                    <Input.Password />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    label="Phone number"               
                    name="phonenumber"
                    rules={[{pattern: /^[0-9]{10}$/,required: true,message: "Please input phone number!",},]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                    <Form.Item
                        label="Bio"               
                        name="bio"
                        rules={[{required: true,message: "Please input Bio!",},]}>
                        <Input.TextArea />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    label="Experience"               
                    name="experience"
                    rules={[{required: true,message: "Please input experience!",},]}>
                    <Input.TextArea />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    label="Education"               
                    name="education"
                    rules={[{required: true,message: "Please input education!",},]}>
                    <Input.TextArea />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    name="userRoleID"
                    label="Position"
                    rules={[{ required: true, message: "Please select position!" }]}
                  >
                    <Select allowClear>
                      {userrole.map((item) => (
                        <Option value={item.ID} key={item.RoleName}>
                          {item.RoleName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    label="Salary"               
                    name="salary"
                    rules={[{required: true,message: "Please input salary!",},]}>
                    <InputNumber 
                        formatter={value => ` ${value} ฿`.replace(new RegExp(/\B(?=(\d{3})+(?!\d))/g), ',')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    label="Classification"               
                    name="fullTime"
                    rules={[{required: true,message: "Please input classification!",},]}>
                    <Radio.Group>
                      <Radio value={true}> Full-time </Radio> {/* ส่งค่า true */}
                      <Radio value={false}> Part-time </Radio> {/* ส่งค่า false */}
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item>
                    <center>
                      <Button type="primary" htmlType="submit" className="signuppage-button" style={{ marginBottom: 20 }}>
                        Submit
                      </Button>
                      <Link to="/admin">
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

      {/* </Col> */}

    {/* </Row> */}

  </>

);

}
//เลื่อนtask

export default AddEmployee;