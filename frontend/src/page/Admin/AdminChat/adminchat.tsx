import { Button, Form, Input, message, Row, Col, List } from "antd";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
import { ChatInterface } from "../../../interface/IChat";
import { CreateChat, GetChat } from "../../../services/https/art/http_chat";

function AdminChat() {
  const [messageApi, contextHolder] = message.useMessage();
  const [admin_chat, setAdmin_chat] = useState<ChatInterface[]>([]);
  const [darkMode, setDarkMode] = useState(false); // state สำหรับ Dark Mode
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const [form] = Form.useForm();

  const getAdminChat = async () => {
    let res = await GetChat();
    if (res) {
      setAdmin_chat(res);
      console.log(res);
    }
  };

  useEffect(() => {
    getAdminChat();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [admin_chat]);

  const onFinish = async (values: ChatInterface) => {
    let res = await CreateChat(values);
    if (res) {
      messageApi.success("ส่งข้อความสำเร็จ!");
      form.resetFields();
      await getAdminChat();
    } else {
      messageApi.error("เกิดข้อผิดพลาดในการส่งข้อความ!");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode); // สลับโหมดระหว่าง Light และ Dark
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: darkMode ? "#1c1c1c" : "#f9f9f9", // พื้นหลังตามโหมด
        color: darkMode ? "#fff" : "#000", // สีข้อความตามโหมด
        transition: "background-color 0.3s, color 0.3s", // เพิ่มการเคลื่อนไหวให้ลื่นไหล
      }}
    >
      {contextHolder}
      <Row style={{ height: "100vh" }} align="middle" justify="center">
        <Col
          xs={24}
          sm={18}
          md={16}
          lg={14}
          xl={12}
          style={{
            display: "flex",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: darkMode ? "#333" : "#fff", // สีพื้นหลังของกล่องสนทนา
          }}
        >
          <div style={{ flex: 1.5, padding: "30px" }}>
            <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "32px" }}>
              กระดานสนทนา
            </h1>
            <Button
              onClick={toggleDarkMode}
              style={{
                marginBottom: "20px",
                backgroundColor: darkMode ? "#FFA500" : "#333",
                color: "#fff",
                border: "none",
              }}
            >
              {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </Button>
            <div
              ref={chatBoxRef}
              style={{
                maxHeight: "300px",
                overflowY: "scroll",
                marginBottom: "20px",
                border: darkMode ? "1px solid #555" : "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: darkMode ? "#444" : "#fff",
              }}
            >
              {/* <List
                dataSource={admin_chat}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <strong>{item.Employee?.User?.Username}:</strong>
                      <div>{item.massage}</div>
                      <div style={{ fontSize: "0.8em", color: darkMode ? "#bbb" : "gray" }}>
                        {item.TimeSend
                          ? moment(item.TimeSend).format("DD/MM/YYYY HH:mm")
                          : ""}
                      </div>
                    </div>
                  </List.Item>
                )}
              /> */}
              <List
                dataSource={admin_chat}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <strong style={{ color: darkMode ? "#fff" : "#000" }}> {/* ชื่อผู้ใช้งาน */}
                        {item.Employee?.User?.Username}:
                      </strong>
                      <div style={{ color: darkMode ? "#fff" : "#000" }}> {/* ข้อความ */}
                        {item.massage}
                      </div>
                      <div style={{ fontSize: "0.8em", color: darkMode ? "#bbb" : "gray" }}> {/* วันที่ */}
                        {item.TimeSend ? moment(item.TimeSend).format("DD/MM/YYYY HH:mm") : ""}
                      </div>
                    </div>
                  </List.Item>
                )}
              />

            </div>
            <Form name="basic" form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
              <Row gutter={[16, 0]} align={"middle"} justify={"center"}>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  {/* <Form.Item
                    label="ข้อความ"
                    name="massage"
                    rules={[{ required: true, message: "กรุณากรอกข้อความ!" }]}
                  >
                    <Input />
                  </Form.Item> */}
                  <Form.Item
                    label={<span style={{ color: darkMode ? "#fff" : "#000" }}>ข้อความ</span>}
                    name="massage"
                    rules={[
                      { required: true,
                        message: "กรุณากรอกข้อความ!" 
                      },
                      {
                        validator: (_, value) =>
                          value && value.trim() !== ""
                            ? Promise.resolve()
                            : Promise.reject("ไม่สามารถสามารถส่งข้อความที่เป็นค่าเว้นว่างอย่างเดียวได้(Space)!"),
                      },
                    ]}
                  >
                    <Input
                      style={{
                        backgroundColor: darkMode ? "#333" : "#fff",
                        color: darkMode ? "#fff" : "#000",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item>
                    <center>
                      <Button
                        htmlType="submit"
                        style={{
                          backgroundColor: "#FFA500",
                          borderColor: "#FFA500",
                          color: "white",
                          borderRadius: "8px",
                          padding: "10px 20px",
                          fontWeight: "bold",
                        }}
                      >
                        ส่งข้อความ
                      </Button>
                    </center>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AdminChat;
