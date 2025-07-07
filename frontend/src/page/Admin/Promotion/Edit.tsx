import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Form, Input, Button, message, InputNumber, DatePicker, Select, Row, Col } from "antd";
import { GetCondition, GetPromotionByID, GetPromotionCategory, GetPromotionStatus, UpdatePromotion } from "../../../services/https/art/http";
import moment from "moment";
import { ConditionInterface, PromotionCategoryInterface, PromotionStatusInterface } from "../../../interface/IPromotion";

const { Option } = Select;

function EditPromotion() {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [promotion_condition, setPromotion_Condition] = useState<ConditionInterface[]>([]);
    const [promotion_category, setPromotion_Category] = useState<PromotionCategoryInterface[]>([]);
    const [promotion_Status, setPromotion_Status] = useState<PromotionStatusInterface[]>([]);

    const getPromotionStatus = async () => {
        let res = await GetPromotionStatus();
        if (res) {
            setPromotion_Status(res);
            console.log(res);
        }
    };
    const getPromotionCategory = async () => {
        let res = await GetPromotionCategory();
        if (res) {
            setPromotion_Category(res);
            console.log(res);
        }
    };
    const getPromotionCondition = async () => {
        let res = await GetCondition();
        if (res) {
            setPromotion_Condition(res);
            console.log(res);
        }
    };

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const res = await GetPromotionByID(String(id))
                if (res) {
                    const formattedData = {
                        ...res,
                        StartDate: res.StartDate ? moment(res.StartDate) : null,
                        EndDate: res.EndDate ? moment(res.EndDate) : null,
                        VisitDate: res.VisitDate ? moment(res.VisitDate) : null,
                        EndVisitDate: res.EndVisitDate ? moment(res.EndVisitDate) : null,
                    };
                    form.setFieldsValue(formattedData);
                }
            } catch (error) {
                message.error("Error fetching promotion details");
            }
        };
        fetchPromotion();
        getPromotionStatus();
        getPromotionCategory();
        getPromotionCondition();
    }, [id]);

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const formattedValues = {
                ...values,
                StartDate: values.StartDate ? values.StartDate.toISOString() : null,
                EndDate: values.EndDate ? values.EndDate.toISOString() : null,
                VisitDate: values.VisitDate ? values.VisitDate.toISOString() : null,
                EndVisitDate: values.EndVisitDate ? values.EndVisitDate.toISOString() : null,
            };
            const res = await UpdatePromotion(Number(id), formattedValues);
            if (res) {
                message.success("แก้ไขข้อมูลโปรโมชั่นสำเร็จ");
                // navigate("/admin/promotionlist");
                setTimeout(() => navigate("/admin/promotionlist"), 2000);
            } else {
                message.error("แก้ไขข้อมูลโปรโมชั่นไม่สำเร็จ");
            }
        } catch (error) {
            message.error("มีปัญหาในการแก้ไขข้อมูลโปรโมชั่น");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="PromotionName" label="Promotion Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="Description" label="Description">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="จำนวนครั้งการใช้งาน"
                            name="NumberPromotionUse"
                            rules={[{ required: true, message: "โปรดกรอกจำนวนครั้งของโปรโมชั่นที่สามารถใช้ได้(ขั้นต่ำ 1)!" }]}
                        >
                            <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="ลดราคา"
                            name="Discount"
                            rules={[
                                { required: true, message: "โปรดกรอกจำนวนลดราคา!" },
                                {
                                    validator: (_, value) =>
                                        value >= 0 && value <= 100
                                            ? Promise.resolve()
                                            : Promise.reject("โปรดกรอกค่าระหว่าง 0 ถึง 100!"),
                                },
                            ]}
                        >
                            <InputNumber min={0} max={100} step={0.01} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="วันหมดอายุโปรโมชั่น"
                            name="EndDate"
                            rules={[{ required: true, message: "โปรดเลือกวันหมดอายุ!" }]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={(current) => current && current < moment().startOf("day")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="วันที่จะมางาน" name="VisitDate">
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={(current) => current && current < moment().startOf("day")}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="วันหมดเวลา"
                            name="EndVisitDate"
                            dependencies={["VisitDate"]}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const visitDate = getFieldValue("VisitDate");
                                        if (!value || (visitDate && value.isAfter(visitDate))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("วันหมดเวลาต้องเป็นวันที่หลังจากวันที่จะมางาน!"));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={(current) => current && current < moment().startOf("day")}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="ConditionID" label="Condition">
                            <Select allowClear>
                                {promotion_condition.map((item) => (
                                    <Option value={item.ID} key={item.ConName}>
                                        {item.ConName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="PromotionStatusID" label="Promotion Status" rules={[{ required: true }]}>
                            <Select allowClear>
                                {promotion_Status.map((item) => (
                                    <Option value={item.ID} key={item.SName}>
                                        {item.SName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="PromotionCategoryID" label="Promotion Category">
                            <Select allowClear>
                                {promotion_category.map((item) => (
                                    <Option value={item.ID} key={item.CName}>
                                        {item.CName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                {/* <Row>
                        <Col span={12}>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                บันทึก
                            </Button>
                            <Link to="/admin/promotionlist">
                                <Button type="default" style={{ marginLeft: 20 }}>
                                    ยกเลิก
                                </Button>
                            </Link>
                        </Col>
                    </Row> */}
                <Row>
                    <Col span={12}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                backgroundColor: "#FFA500",
                                borderColor: "#FFA500",
                                color: "white",
                            }}
                        >
                            บันทึก
                        </Button>
                        <Button
                            type="primary"
                            style={{
                                marginLeft: 20,
                                backgroundColor: "#FFA500",
                                borderColor: "#FFA500",
                                color: "white",
                            }}
                            onClick={() => {
                                messageApi.info("กำลังกลับไปที่รายการโปรโมชั่น...");
                                setTimeout(() => navigate("/admin/promotionlist"), 2000);
                            }}
                        >
                            ยกเลิก
                        </Button>
                    </Col>
                </Row>

            </Form>
        </>
    );
}

export default EditPromotion;
