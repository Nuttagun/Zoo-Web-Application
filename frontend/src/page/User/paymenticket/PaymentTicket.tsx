import {  useLocation, useNavigate } from "react-router-dom";
import { Upload, Button, Image, message, QRCode, Card, Modal } from 'antd';
import { useState, useEffect } from 'react';
import generatePayload from 'promptpay-qr';
import LogoZooManage from '../../../assets/LogoZooManage.png';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { AddPaymentTicket } from "../../../../src/services/https/aut/httpPaymentTicket"
import { InboxOutlined } from '@ant-design/icons';
import thaiqrpayment from '/ImgPaymentTicket/thaiqrpayment.png'
import Dragger from "antd/es/upload/Dragger";
import './aut2.css';
function PaymentTicket() {
    const navigate = useNavigate();
    const location = useLocation();

    const { totalPrice, bookingID, bookingData, selectedPromotion } = location.state || {};
    console.log("totalPrice", totalPrice);
    console.log("bookingID", bookingID);
    console.log("bookingData", bookingData);
    console.log("PromotionID", selectedPromotion);

    const [phoneNumber] = useState<string>('0644044078');
    const [qrCode, setQrCode] = useState<string>('');  // gen QRcode ชำระเงิน
    const [messageApi, contextHolder] = message.useMessage();

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [file, setFile] = useState<File | null>(null);      //อัพโหลดรูป
// @ts-ignore
    const [previewImage, setPreviewImage] = useState<string>('');// @ts-ignore
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);  //แสดงรูป

    const [ModelConfirmPayment, StateModelConfirmPayment] = useState(false); //โมเดลยืนยันการชำระเงิน

    const handleQR = () => {
        setQrCode(generatePayload(phoneNumber, { amount: totalPrice }));
    };

    const handleImageChange = (info: { fileList: UploadFile[] }) => {
        setFileList(info.fileList);
        if (info.fileList.length > 0) {
            setFile(info.fileList[0].originFileObj as File);
        } else {
            setFile(null);
        }
    };

    const handlePreview = async (file: UploadFile) => {
        let src = file.url as string;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj as File);
                reader.onload = () => resolve(reader.result as string);
            });
        }
        setPreviewImage(src);
        setPreviewOpen(true);
    };


    const props: UploadProps = {
        name: 'file',
        multiple: false, // ตั้งค่าห้ามอัพโหลดหลายไฟล์
        maxCount: 1, // จำกัดจำนวนไฟล์ที่อัพโหลดเป็น 1
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG files!');
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }
            return true;
        },
        customRequest: ({ onSuccess }) => {
            setTimeout(() => {
                onSuccess && onSuccess('ok'); // ตอบกลับ OK ทันที
            }, 0);
        },
        onChange: handleImageChange,
        onPreview: handlePreview,
    };


    const addPaymentTicket = async () => {
        if (file === null) {
            messageApi.open({ type: "warning", content: "กรุณาอัพโหลดรูป Slip ก่อน", });
            return;
        }
        const dataPaymentTicket = {
            BookingID: bookingID,
            amount: bookingData.total_all_price,
            PromotionID: selectedPromotion,
        };

        const formData = new FormData();
        formData.append('BookingID', dataPaymentTicket.BookingID.toString());
        formData.append('amount', dataPaymentTicket.amount.toString());
        formData.append('PromotionID', dataPaymentTicket?.PromotionID != null ? dataPaymentTicket.PromotionID.toString() : '');

        if (fileList.length > 0) {
            const file = fileList[0].originFileObj as File;
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Image = reader.result as string; // เก็บ Base64 รูปภาพ
                formData.append('[file]', base64Image);
                formData.forEach((value, key) => {
                    console.log(key, value);
                });
                let { response, result } = await AddPaymentTicket(formData);
                console.log("หลัง AddPaymentTicket", response);
                if (response.status === 200) {
                    messageApi.open({ type: "success", content: result.message, });
                    StateModelConfirmPayment(false);
                    setTimeout(() => {
                        navigate("/");  // เปลี่ยนหน้าเมื่อบันทึกสำเร็จ
                    }, 1000);
                }
            };
            reader.readAsDataURL(file); // อ่านไฟล์และแปลงเป็น Base64
        }
    };

    useEffect(() => {
        handleQR();
    }, []);


    return (
        <div style={{ backgroundImage: "url('/ImgPaymentTicket/BGChoosePromotion.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh" }}>
            {contextHolder}
            <div style={{ display: "flex", flexDirection: "row", }}>
                <Card style={{ width: '650px', height: '850px', margin: "35px 0px 0px 200px", overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} >
                    <img
                        style={{ width: '440px', marginBottom: '20px' }}
                        src={thaiqrpayment}
                        alt="payment"
                    />
                    <QRCode type="svg" errorLevel="H" value={qrCode} icon={LogoZooManage} style={{ marginTop: '-25px', width: '440px', height: '440px' }} />
                    <p style={{ fontSize: "40px", fontWeight: 500, textAlign: 'center', fontFamily: "'Mitr', sans-serif"}}>Amount to pay</p>
                    <p style={{ fontSize: "40px", fontWeight: 500, color: "rgb(240, 113, 23)", textAlign: 'center' }}>
                        {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(totalPrice)}
                    </p>
                </Card>



                <Card style={{ width: '800px', height: '850px', margin: "35px 0px 0px 70px", overflowY: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: "rgba(255, 255, 255, 0.9)"}}>
                    <b style={{ fontSize: "35px", fontWeight: 600,  }}>Upload Payment Slip</b>
                    <div style={{ width: '740px', height: '430px', margin: '20px 0', position: 'relative' }}>
                        {/* ถ้ามีการอัพโหลดไฟล์แล้ว ให้แสดงรูปภาพในกรอบ */}
                        {file ? (
                            <Image
                                style={{ width: '100%', height: '430px', objectFit: 'cover', display: 'block', }}
                                src={URL.createObjectURL(file)}
                                alt="uploaded image"
                            />
                        ) : (
                            <Dragger
                                {...props}
                                style={{ width: '100%', height: '100%', border: '2px dashed #d9d9d9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text" style={{fontWeight: 400, fontSize: "20px"}}>Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint" style={{fontWeight: 400, fontSize: "18px"}}>
                                    Support for a single upload only.
                                </p>
                            </Dragger>
                        )}
                    </div>


                    {/* {previewImage && (
                        <Image
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )} */}

                    {/* {file && (
                        <Image
                            style={{ width: '100px', marginTop: '20px' }}
                            src={URL.createObjectURL(file)}
                            alt="uploaded image"
                        />
                    )} */}


                    <Button onClick={() => StateModelConfirmPayment(true)} type="primary" shape="default" style={{ backgroundColor: "rgb(240, 129, 49)", width: "750px", height: "50px", margin: "160px 0px 0px 0px" }}>
                        <b style={{ color: "white", fontSize: "20px", margin: 0 , fontWeight: 500}}>
                            Confirm Payment
                        </b>
                    </Button>
                    <Button onClick={() => setFile(null)} type="default" shape="default" style={{ backgroundColor: "#dcdcdc", width: "750px", height: "50px", margin: "10px 0px 0px 0px" }}>
                        <b style={{ color: "black", fontSize: "20px", margin: 0, fontWeight: 500 }}>
                            Clear File
                        </b>
                    </Button>

                    <Modal width={540} title={null} open={ModelConfirmPayment} onCancel={() => StateModelConfirmPayment(false)} style={{ borderRadius: '20px', }} footer={null}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <b style={{ fontSize: "30px", fontWeight: 500,  }}>ยืนยันการชำระเงิน</b>
                            <p style={{ fontSize: "20px", fontWeight: 400}}>คุณต้องการยืนยันการชำระเงินหรือไม่?</p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                            <Button onClick={() => addPaymentTicket()} type="primary" shape="default" style={{ backgroundColor: "rgb(243, 148, 81)", width: "100px", height: "40px", }}>
                                <b style={{ color: "white", fontSize: "20px", margin: 0 , fontWeight: 500}}>ใช่</b>
                            </Button>

                            <Button onClick={() => StateModelConfirmPayment(false)} type="primary" shape="default" style={{ backgroundColor: "#dcdcdc", width: "100px", height: "40px", }}>
                                <b style={{ color: "black", fontSize: "20px", margin: 0 , fontWeight: 500}}>ไม่</b>
                            </Button>
                        </div>
                    </Modal>

                </Card>
            </div>
        </div>
    );
}
export default PaymentTicket;
