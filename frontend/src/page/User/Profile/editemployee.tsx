import { useEffect, useState } from "react";
import { Button, Form, Input, message, Row, Col, Card, InputNumber, Radio } from "antd";
import { GetEmployee2ById, UpdateUserAndEmployee } from "../../../services/https/Garfield/http";
import { useNavigate, useLocation, } from "react-router-dom";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { UsersInterface } from "../../../interface/IUser";
import { EmployeeInterface } from "../../../interface/IEmployee";


const EditEmployee = () => {
  const [form] = Form.useForm();
  const [user] = useState<UsersInterface | null>(null);
  const [, setEmployee] = useState<EmployeeInterface | null>(null);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { state } = useLocation(); // ดึง state จาก navigate
  const userIDD = state?.userID; // รับ userID จาก state
  console.log("state", userIDD);

  const onFinish = async (values: any) => {
    values.ID = userIDD; // ใช้ค่า userID ที่ได้รับ
    const res = await UpdateUserAndEmployee(values);
    if (res) {
      messageApi.open({
        type: "success",
        content: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ",
      });
    }
  };


  const getEmployeeById = async () => {
    try {
      if (userIDD) {
        const userRes = await GetEmployee2ById(Number(userIDD)); // ใช้ userID เพื่อดึงข้อมูล
        console.log("getemployee2", userRes);

        if (userRes) {
          setEmployee(userRes);
          form.setFieldsValue({
            Salary: userRes.Salary,
            Bio: userRes.Bio,
            Experience: userRes.Experience,
            Education: userRes.Education,
            FullTime: userRes.FullTime,
          });
        } else {
          messageApi.open({
            type: "error",
            content: "ไม่พบข้อมูลผู้ใช้",
          });
        }
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่มี ID ผู้ใช้",
        });
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      });
    }
  };

  useEffect(() => {
    getEmployeeById();
  }, [userIDD]); // ใช้ userID เป็น dependency

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
          <Row gutter={50}>
          <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item label="Bio" name="Bio">
                <Input.TextArea />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item label="Experience" name="Experience" >
                <Input.TextArea />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item label="Education" name="Education" >
                <Input.TextArea />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="Salary"
                name="Salary"
              >
                <InputNumber
                  formatter={(value) => ` ${value} ฿`.replace(new RegExp(/\B(?=(\d{3})+(?!\d))/g), ",")}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item label="Classification" name="FullTime">
                <Radio.Group>
                  <Radio value={true}>Full-time</Radio>
                  <Radio value={false}>Part-time</Radio>
                </Radio.Group>
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
                  navigate("/admin");
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

export default EditEmployee;
