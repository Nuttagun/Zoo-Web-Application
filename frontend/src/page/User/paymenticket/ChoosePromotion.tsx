import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Button, message, Row, Col, Card, Table , Image} from 'antd';
import { GetDataBookingByID, GetDataVehicleByBookingID, GetDataPromotionCanUse, } from "../../../../src/services/https/aut/httpPaymentTicket"
import "./aut2.css"
function ChoosePromotion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingID } = location.state || {};
  console.log("bookingID", bookingID);

  const [bookingData, setBookingData] = useState<any>(null);
  const [promodata, setpromodata] = useState<any[]>([]);
// @ts-ignore
  const [messageApi, contextHolder] = message.useMessage();

  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null); // เก็บ ID ของโปรโมชั่นที่เลือก

  const [DataVehicle, saveDataVehicle] = useState<any>(null);

  const columns = [
    {
      title: 'Vehicle Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: 'Picture',
      dataIndex: 'picture',
      key: 'picture',
      render: (url: string) => (
        <Image src={`data:image/jpeg;base64,${url}`} alt="Vehicle" style={{ width: '70px', height: 'auto' }} />
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => <span>{price} บาท</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: string) => <span>{quantity}</span>,
    },
  ];


  useEffect(() => {
    if (bookingID !== null) {
      GetDataBooking();
      GetDataVehicle();
    }
  }, []);

  const handleSelectPromotion = (promo: any) => {
    if (selectedPromotion === promo.ID) {
      // หากเลือกโปรโมชั่นเดิม ให้ยกเลิกการเลือก
      setSelectedPromotion(null);
      setTotalPrice(bookingData?.total_all_price); // คืนค่าเป็นราคาเต็ม
    } else {
      // หากเลือกโปรโมชั่นใหม่
      setSelectedPromotion(promo.ID);
      const discount = (promo.Discount / 100) * bookingData?.total_all_price;
      setTotalPrice(bookingData?.total_all_price - discount); // คำนวณราคาหลังหักส่วนลด
    }
  };


  const GetDataPromotion = async (data: any) => {
    console.log("ก่อน GetDataPromotion", data);
    let { response, result } = await GetDataPromotionCanUse(data);
    if (response.status === 200) {
      console.log("หลังGetAllDataPromotion", result);
      setpromodata(result.promotions);
    }
    else {
      console.log("Err", result.message);
    }
  }

  const GetDataBooking = async () => {
    let { response, result } = await GetDataBookingByID(bookingID);
    if (response.status === 200) {
      console.log("หลังGetDataBookingByID", result);
      const BookingCheckCondition = {
        bookingdate: result.BookingDate,
        visitdate: result.visitdate,
        quantitychild: result.QuantityChild,
        quantityadult: result.QuantityAdult,
        quantityother: result.QuantityOther
      };
      setBookingData(result);
      setTotalPrice(result.total_all_price);
      GetDataPromotion(BookingCheckCondition);
    }
  }

  const GetDataVehicle = async () => {
    let { response, result } = await GetDataVehicleByBookingID(bookingID);
    if (response.status === 200) {
      console.log("หลังGetDataVehicle", result);
      saveDataVehicle(result);
    }
    else {
      console.log("Error", result.error);
    }
  }

  const NextPages = () => {
    navigate("/user/paymentticket", { state: { totalPrice, bookingID, bookingData, selectedPromotion } });
  }

  return (
    <div style={{ backgroundImage: "url('/ImgPaymentTicket/BGChoosePromotion.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh",}}>
      {contextHolder}
      <div style={{ display: "flex", flexDirection: "row", }}>
        <Card style={{ boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.95)", width: '980px', height: '870px', marginBottom: '18px', margin: "35px 0px 0px 100px", overflowY: 'auto' }} title={<span style={{ fontSize: '20px', fontFamily: "'Mitr', sans-serif" }}>เลือก Promotion</span>} >
          <Row gutter={24}>
          {promodata && promodata.length > 0 ? (
              promodata.map((promo) => (
                <Col span={12} key={promo.ID} style={{ marginBottom: "20px" }}>
                  <div style={{ backgroundImage: "url('/ImgPaymentTicket/BGCardPromotion.png')", backgroundSize: 'cover', width: '420px', height: '200px', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', }}>
                    {/* {backgroundImage: `url(${promo.ImageURL})`, }    ใช้แบบนี้ถ้าพี่อาต์มีรูป*/}
                    {/* <div style={{height: "200px"}}>
                  <img src="/path/to/your/image.png" alt="Silent Ninja Stalker"style={{width: '100%',height: 'auto',borderBottom: '1px solid #e0e0e0',}}/>
                </div> */}
                    <div style={{ padding: '15px' }}>
                      <h1 style={{ textShadow: '3px 3px 2px rgba(0, 0, 0, 0.7)', color: 'white', fontSize: '25px', margin: '5px 0', fontWeight: 500 }}>{promo.PromotionName}<b style={{ marginLeft: "3px", fontSize:"22px", fontWeight: 500 }}>   Save{promo.Discount}%</b></h1>
                      <b style={{ textShadow: '2px 2px 1px rgba(0, 0, 0, 5.0)', color: 'white', fontSize: '18px', margin: '0', fontWeight: 400 }}>{promo.Description}</b>
                      <h3 style={{ fontWeight: 500, textShadow: '1px 1px 2px rgba(255, 255, 255, 8.6)', color: 'black', fontSize: '16px', margin: '0' }}>ถึง {new Date(promo.EndDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                      <Button onClick={() => handleSelectPromotion(promo)} style={{ position: 'absolute', bottom: '10px', left: '23px', right: '10px', width: '400px', backgroundColor: selectedPromotion === promo.ID ? '#ff4d4f' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '18px', }}>
                        {selectedPromotion === promo.ID ? 'CANCEL' : 'CHOOSE'}
                      </Button>
                    </div>
                  </div>
                </Col>
              ))) : (<b style={{ fontSize: "30px", fontWeight: 700 }}>ไม่มีโปรโมชั่นส่วนลด</b>)
            }
          </Row>
        </Card>

        <div>
          <Card style={{ boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.95)", width: '680px', height: '800px', margin: "35px 0px 18px 40px", overflowY: 'auto' }} title={<span style={{ fontSize: '20px', fontFamily: "'Mitr', sans-serif"}}>รายละเอียดการจอง</span>}>

            <div>
              {bookingData ? (
                <>
                  <p style={{ fontSize: "20px", fontWeight: 500, fontFamily: "'Mitr', sans-serif" }}>
                    ชื่อผู้จอง: <span style={{ fontWeight: 400 }}>{bookingData?.UserFirstName} {bookingData?.UserLastName}</span>
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: 500 }}>
                    จำนวนทั้งหมด: <span style={{ fontWeight: 400 }}>{bookingData?.quantity_customer} ท่าน</span> 
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: 500 }}>
                    วันเข้าชม: <span style={{ fontWeight: 400 }}>{new Date(bookingData?.visitdate).toLocaleDateString("th-TH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</span>
                  </p>

                  {/* {DataVehicle?.vehicles ? (
                    <>
                      <p style={{ fontSize: "20px", fontWeight: 500 }}>เวลาใช้งานรถ</p>
                      <p style={{ fontSize: "20px", fontWeight: 500 }}>
                        Start Time:{" "}<span style={{ fontWeight: 400 }}>
                        {DataVehicle.start_time
                          ? new Intl.DateTimeFormat("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZone: "UTC",
                            hour12: false,
                          }).format(new Date(DataVehicle.start_time))
                          : "N/A"}</span>
                      </p>

                      <p style={{ fontSize: "20px", fontWeight: 500 }}>
                        End Time:{" "}<span style={{ fontWeight: 400 }}>
                        {DataVehicle.end_time
                          ? new Intl.DateTimeFormat("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZone: "UTC",
                            hour12: false,
                          }).format(new Date(DataVehicle.end_time))
                          : "N/A"}</span>
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: "30px", fontWeight: 500 }}>No vehicles data available.</p>
                  )} */}

                  {DataVehicle?.vehicles && DataVehicle?.vehicles.length > 0 && (
                    <Table
                      dataSource={DataVehicle.vehicles}
                      columns={columns} // ใช้ตัวแปร columns ที่แยกออกมา
                      rowKey="name"
                      pagination={false} // ปิดการแสดงหน้า
                      scroll={{ y: 365 }}
                    />
                  )}

                  <p style={{ fontSize: "28px", fontWeight: 500, color: "red", textDecoration: selectedPromotion ? 'line-through' : 'none' }}>
                  ยอดที่ต้องชำระทั้งหมด : <span style={{ fontWeight: 400 }}>{bookingData?.total_all_price}</span> บาท
                  </p>
                  {selectedPromotion && (
                    <p style={{ fontSize: "28px", fontWeight: 500, color: "red" }}>
                      ราคาหลังจากส่วนลด : <span style={{ fontWeight: 400 }}>{totalPrice} </span>บาท
                    </p>
                  )}
                </>
              ) : ""}

            </div>
            {/*  */}
          </Card>
          <Button onClick={NextPages} type="primary" shape="default" style={{ background: "linear-gradient(90deg,rgb(224, 183, 19), rgb(202, 111, 6)", width: "680px", height: "50px", margin: "1px 0px 0px 40px" }}>
            <b style={{ color: "white", fontSize: "25px", fontWeight: 500}}>
              Payment
            </b>
          </Button>
        </div>
      </div>

    </div>
  );
}
export default ChoosePromotion;
