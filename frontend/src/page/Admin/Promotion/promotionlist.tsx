import { useState, useEffect } from "react";
import { Table, Button, Col, Row, Divider, Modal, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ConditionInterface, PromotionCategoryInterface, PromotionInterface, PromotionStatusInterface } from "../../../interface/IPromotion";
import { GetPromotionStatus, GetPromotionCategory, GetCondition, GetAllPromotion, DeletePromotionByID } from "../../../services/https/art/http";
import { useNavigate } from 'react-router-dom';

function PromotionList() {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState<string>("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const navigate = useNavigate();

    const goToCreatePage = () => {
        messageApi.info("กำลังไปที่หน้าสร้างโปรโมชั่น...");
        setTimeout(() => navigate("/admin/createpromotion"), 2000);
        // navigate("/admin/createpromotion"); // เส้นทางที่คุณต้องการนำไป
    };
    const goToEditPage = (id: number) => {
        messageApi.info("กำลังไปที่หน้าแก้ไขโปรโมชั่น...");
        // navigate(`/admin/editpromotion/${id}`); // เส้นทางสำหรับแก้ไขโปรโมชั่น โดยส่ง ID ไปด้วย
        setTimeout(() => navigate(`/admin/editpromotion/${id}`), 2000);

    };

    const [promotion_condition, setPromotion_Condition] = useState<ConditionInterface[]>([]);
    const [promotion_category, setPromotion_Category] = useState<PromotionCategoryInterface[]>([]);
    const [promotion_Status, setPromotion_Status] = useState<PromotionStatusInterface[]>([]);
    const [promotion_Lists, setPromotion_Lists] = useState<PromotionStatusInterface[]>([]);// @ts-ignore
    const [searchText, setSearchText] = useState('');
    console.log(promotion_Lists);

    const getPromotionStatus = async () => {
        let res = await GetPromotionStatus();
        if (res) {
            setPromotion_Status(res);
            // console.log(res)
        }
    };
    const getPromotionCategory = async () => {
        let res = await GetPromotionCategory();
        if (res) {
            setPromotion_Category(res);
            // console.log(res)
        }
    };
    const getPromotionCondition = async () => {
        let res = await GetCondition();
        if (res) {
            setPromotion_Condition(res);
            // console.log(res)
        }
    };
    const getAllPromotion = async () => {
        let res = await GetAllPromotion();
        if (res) {
            setPromotion_Lists(res);
            // console.log(res)
        }
    };


    const columns: ColumnsType<PromotionInterface> = [
        {
            title: <span className="table-header">ID</span>,
            key: "no",
            render: (_, __, index) => {
                const currentPage = pagination.current || 1;
                const pageSize = pagination.pageSize || 5;
                return currentPage === 1 ? index + 1 : (currentPage - 1) * pageSize + index + 1;
            },
        },
        { title: "Promotion Name", dataIndex: "PromotionName", key: "PromotionName" },
        { title: "Discount", dataIndex: "Discount", key: "Discount" },
        { title: "Description", dataIndex: "Description", key: "Description" },
        {
            title: <span className="table-header">Condition</span>,
            dataIndex: "ConditionID",
            key: "Condition",
            render: (ConditionID) => {
                const condition = promotion_condition.find((status) => status.ID === ConditionID);
                return condition ? condition.ConName : "ไม่ได้ระบุ";
            },
        },
        {
            title: <span className="table-header">Promotion Status</span>,
            dataIndex: "PromotionStatusID",
            key: "PromotionStatus",
            render: (PromotionStatusID) => {
                const status = promotion_Status.find((status) => status.ID === PromotionStatusID);
                return status ? status.SName : "ไม่ได้ระบุ";
            },
        },
        {
            title: <span className="table-header">Category</span>,
            dataIndex: "PromotionCategoryID",
            key: "PromotionCategory",
            render: (PromotionCategoryID) => {
                const category = promotion_category.find((category) => category.ID === PromotionCategoryID);
                return category ? category.CName : "ไม่ได้ระบุ";
            },
        },
        {
            title: "Expiry Date",
            dataIndex: "EndDate",
            key: "EndDate",
            render: (EndDate) => {
                const formattedDate = new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }).format(new Date(EndDate)); // แปลงวันที่ให้เป็นรูปแบบ DD/MM/YYYY
                return formattedDate;
            },
        },
        {
            title: "Manage",
            key: "manage",
            render: (_, record) => (
                <>
                    <Button
                        onClick={() => goToEditPage(record.ID || 0)}
                        shape="circle"
                        icon={<EditOutlined />}
                        style={{ marginRight: "8px" }}
                    />
                    <Button
                        onClick={() => showModal(record)}
                        shape="circle"
                        icon={<DeleteOutlined />}
                        danger
                    />
                </>
            ),
        },


    ];

    const showModal = (promotion: PromotionInterface) => {
        // console.log("Selected Promotion ID:", promotion.ID); // ตรวจสอบว่า ID มีค่าหรือไม่
        if (promotion.ID !== undefined && promotion.ID !== null) {
            setModalText(`ต้องการลบข้อมูลโปรโมชั่น "${promotion.PromotionName}"?`);
            setDeleteId(promotion.ID);
            setOpen(true);
        } else {
            console.error("โปรโมชี่น ID เป็นค่า undefined หรือ null.");
        }
    };

    const handleOk = async () => {
        if (deleteId === null) {
            console.error("Delete ID is null");
            return;
        }
        console.log("Deleting Promotion with ID:", deleteId); // ตรวจสอบค่า deleteId

        setConfirmLoading(true);
        try {
            const res = await DeletePromotionByID(deleteId);
            console.log("Delete response:", res); // ตรวจสอบผลลัพธ์จาก API
            if (res) {
                messageApi.open({ type: "success", content: "ลบข้อมูลสำเร็จ" });
                // ลบข้อมูลจาก promotion_Lists ทันที
                setPromotion_Lists((prevLists) =>
                    prevLists.filter((promotion) => promotion.ID !== deleteId)
                );
            } else {
                messageApi.open({ type: "error", content: "เกิดข้อผิดพลาด !" });
            }
        } catch (error) {
            console.error("Error deleting promotion:", error);
            messageApi.open({ type: "error", content: "เกิดข้อผิดพลาด !" });
        }
        setOpen(false);
        setConfirmLoading(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination({ current: page, pageSize });
    };

    useEffect(() => {
        console.log("Promotions data loaded:", promotion_Lists); // ตรวจสอบข้อมูลที่ส่งไปยัง Table
        getPromotionStatus();
        getPromotionCategory();
        getPromotionCondition();
        getAllPromotion();
    }, []);

    return (
        <>
            {contextHolder}
            <Row>
                <Col span={12}>
                    <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#B25900" }}>Manage Promotions</h2>
                    <Button
                        type="primary"
                        // style={{ marginBottom: "16px" }}
                        style={{
                            marginBottom: "16px",
                            backgroundColor: "#FFBB18", // สีพื้นหลัง
                            color: "#000000", // สีข้อความ
                        }}
                        onClick={goToCreatePage}

                    >
                        เพิ่มโปรโมชั่น
                    </Button>
                    {/* <Input
                            placeholder="ค้นหาโปรโมชั่นด้วยชื่อ"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 200, marginBottom: "16px" }}
                            prefix={<SearchOutlined />}
                        />   */}
                </Col>
            </Row>
            <Divider />
            <Table
                rowKey="ID"
                columns={columns}
                dataSource={promotion_Lists}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    onChange: handlePageChange,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'], // เพิ่มตัวเลือกให้ผู้ใช้
                }}
            />
            <Modal
                title="Delete Promotion"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okText="Delete"
                cancelButtonProps={{
                    style: { backgroundColor: "#FF3333", color: "#FFFFFF" },
                }}
            >
                <p>{modalText}</p>
            </Modal>
        </>
    );
}

export default PromotionList;
