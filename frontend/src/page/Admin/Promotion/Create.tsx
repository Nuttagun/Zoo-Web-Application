import { Button, Form, Input, message, Row, Col, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DatePicker } from "antd";
import { Select } from "antd";
import { ConditionInterface, PromotionCategoryInterface, PromotionInterface, PromotionStatusInterface } from "../../../interface/IPromotion";
import { CreatePromotion, GetCondition, GetPromotionCategory, GetPromotionStatus } from "../../../services/https/art/http";
import moment from "moment";

const { Option } = Select;

function CreatePromotionPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [promotion_condition, setPromotion_Condition] = useState<ConditionInterface[]>([]);
  const [promotion_category, setPromotion_Category] = useState<PromotionCategoryInterface[]>([]);
  const [promotion_Status, setPromotion_Status] = useState<PromotionStatusInterface[]>([]);

  const getPromotionStatus = async () => {
    let res = await GetPromotionStatus();
    if (res) {
      setPromotion_Status(res);
    }
  };
  const getPromotionCategory = async () => {
    let res = await GetPromotionCategory();
    if (res) {
      setPromotion_Category(res);
    }
  };
  const getPromotionCondition = async () => {
    let res = await GetCondition();
    if (res) {
      setPromotion_Condition(res);
    }
  };

  useEffect(() => {
    getPromotionStatus();
    getPromotionCategory();
    getPromotionCondition();
  }, []);

  const handleCancel = () => {
    messageApi.info("กำลังกลับไปที่รายการโปรโมชั่น...");
    setTimeout(() => navigate("/admin/promotionlist"), 2000);
  };

  const onFinish = async (values: PromotionInterface) => {
    let res = await CreatePromotion(values);
    if (res) {
      messageApi.success("สร้างโปรโมชั่นสำเร็จ!");
      // navigate("/admin/promotionlist");
      setTimeout(() => navigate("/admin/promotionlist"), 2000);
    } else {
      messageApi.error("เกิดข้อผิดพลาดในการสร้างโปรโมชั่น");
    }
  };

  return (
    <>
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
            <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "32px" }}>สร้างข้อมูลโปรโมชั่น</h1>

            <Form name="basic" layout="vertical" onFinish={onFinish} autoComplete="off">
              <Row gutter={[16, 0]} align={"middle"} justify={"center"}>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="ชื่อโปรโมชั่น"
                    name="PromotionName"
                    rules={[
                      {
                        required: true,
                        message: "โปรดกรอกชื่อโปโมชั่น!",
                      },
                      {
                        validator: (_, value) =>
                          value && value.trim() !== ""
                            ? Promise.resolve()
                            : Promise.reject("โปรดกรอกชื่อโปรโมชั่น ชื่อโปนโมชั่นไม่สามารถเว้นว่างได้(Space)!"),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="Description"
                    name="Description"
                    rules={[]}>
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="จำนวนครั้งการใช้งาน"
                    name="NumberPromotionUse"
                    rules={[
                      {
                        required: true,
                        message: "โปรดกรอกจำนวนครังของโปรโมชั่นที่สามารถใช้ได้(ขั้นต่ำ 1)!",
                      },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="ลดราคา"
                    name="Discount"
                    rules={[
                      {
                        required: true,
                        message: "โปรดกรอกจำนวนลดราคา!",
                      },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null) {
                            return Promise.resolve();
                          }
                          if (value >= 0 && value <= 100) {
                            return Promise.resolve();
                          }
                          return Promise.reject("โปรดกรอกเลขจำนวนที่ทศนิยมหรือไม่มีก็ได้ และต้องมีค่าระหว่าง 0 ถึง 100!");
                        },
                      },
                    ]}
                  >
                    <InputNumber min={0} max={100} step={0.01} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="วันที่เริ่มสร้างโปรโมชั่น"
                    name="StartDate"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      defaultValue={moment()}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="วันหมดอายุโปรโมชั่น"
                    name="EndDate"
                    dependencies={['StartDate']}
                    rules={[
                      { required: true, message: "โปรดเลือกวันหมดอายุ!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const startDate = getFieldValue('StartDate');
                          if (!value || !startDate || value.isAfter(startDate)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('วันหมดอายุต้องเป็นวันหลังจากวันที่ส้ราง!')
                          );
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="วันที่จะมางาน"
                    name="VisitDate"
                    rules={[]}>
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    label="วันหมดเวลา"
                    name="EndVisitDate"
                    dependencies={['VisitDate']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const visitDate = getFieldValue('VisitDate');
                          if (!value || (visitDate && value.isAfter(visitDate))) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('วันหมดเวลาต้องเป็นวันที่หลังจากวันที่จะมางาน!')
                          );
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    name="ConditionID"
                    label="เลือกเงื่อนไข"
                    rules={[]}
                  >
                    <Select allowClear>
                      {promotion_condition.map((item) => (
                        <Option value={item.ID} key={item.ConName}>
                          {item.ConName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    name="PromotionStatusID"
                    label="เลือกสถานะ"
                    rules={[{ required: true, message: "โปรดเลือกสถานะโปรโมชั่น!" }]}
                  >
                    <Select allowClear>
                      {promotion_Status.map((item) => (
                        <Option value={item.ID} key={item.SName}>
                          {item.SName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                  <Form.Item
                    name="PromotionCategoryID"
                    label="ระบุหมวดหมู่"
                  >
                    <Select allowClear>
                      {promotion_category.map((item) => (
                        <Option value={item.ID} key={item.CName}>
                          {item.CName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item>
                    <center>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="create-button"
                        style={{
                          backgroundColor: "#FFA500",
                          borderColor: "#FFA500",
                          color: "white",
                          borderRadius: "8px",
                          padding: "10px 20px",
                          fontWeight: "bold",
                        }}
                      >
                        สร้างข้อมูล
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleCancel}
                        style={{
                          backgroundColor: "#FFA500",
                          borderColor: "#FFA500",
                          color: "white",
                          borderRadius: "8px",
                          padding: "10px 20px",
                          fontWeight: "bold",
                          marginLeft: 20,
                        }}
                      >
                        ยกเลิก
                      </Button>
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

export default CreatePromotionPages;
