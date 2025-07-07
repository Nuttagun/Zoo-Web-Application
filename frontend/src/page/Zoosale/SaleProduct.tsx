// @ts-ignore
import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import { Modal, Button, Card, Col, DatePicker, Form, Input, InputNumber, Select, Row, message, Table, Image} from 'antd';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
// @ts-ignore
import Icon, { CameraTwoTone } from '@ant-design/icons';
import { QRCode } from 'antd';
import generatePayload from 'promptpay-qr';
import { SearchProductSale, AddSaleProduct } from "../../services/https/aut/http";
import { SaleProductListIF } from "../../interface/SaleProductListIF"
import LogoZooManage from '../../assets/LogoZooManage.png';
import thaiqrpayment from '/ImgPaymentTicket/thaiqrpayment.png'
import SideBarZooSale from '../../component/zoosale/sidebar';
import { DeleteOutlined } from '@ant-design/icons';
// import '../../custom.css';
import "./aut.css"
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

const { Search } = Input;
function SaleProduct() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(() => {
    const savedExpanded = localStorage.getItem('expanded');
    return savedExpanded ? JSON.parse(savedExpanded) : true;
  });

  console.log("expanded", expanded);

  const handleSidebarToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    localStorage.setItem('expanded', JSON.stringify(newExpanded));
  };


  // Initial State และ Hook
  const [DataSaleProduct, setDataSaleProduct] = useState<any>(null); // ข้อมูลสินค้า ที่ค้นหาจากบาร์โค้ดปัจจุบัน
  const [ModelSearchBarcode, ChangeStateModelSearchBarcode] = useState(false); // เปิด/ปิด popup สินค้าที่สแกน/ค้นหาด้วย Barcode

  const savedProductList = localStorage.getItem("ProductSaleList");  //อ่านค่า localStorage
  const initialProductList = savedProductList ? JSON.parse(savedProductList) : [];//เช็คว่ามี savedProductList ไหม
  const [ProductSaleList, SetProductSaleList] = useState<SaleProductListIF[]>(initialProductList); // รายการสินค้าที่ขาย

  const [totalPrice, setTotalPrice] = useState(0);

  const [ModelQRCodePayment, StateModelQRCodePayment] = useState(false); //เปิดปิดโมเดล QR CODE สแกนจ่าย
  // @ts-ignore
  const [phoneNumber, setPhoneNumber] = useState<string>('0644044078');

  const [qrCode, setQrCode] = useState<string>('');

  const [ModelConfirmCashPayment, StateModelConfirmCashPayment] = useState(false);//โมเดลยืนยันการชำระเงินสด
  const [ModelConfirmQrPayment, StateModelConfirmQrPayment] = useState(false);//โมเดลยืนยันการชำระเงิน QrCode

  const [ModelScanProductSale, StateModelScanProductSale] = useState(false); //ตัวเปิดปิด  โมเดลสแกน
  const [ResaultScan, setResaultScan] = useState<string>('');//ผลการสแกนที่ได้
  const [OnOffScan, setOnOffScan] = useState(true); // สถานะการสแกน

  const [ModelDeleteSaleProduct, SetModelDeleteSaleProduct] = useState(false);  //โมเดลปุ่มลบ
  const [DeleteSaleProduct, SetDeleteSaleProduct] = useState<any | null>(null);  //ข้อมูลสินค้าเลือกลบ
  const [LoadData, SetLoadData] = useState(false);

  const [ModelCashPayment, SetModelCashPayment] = useState(false); //เปิดปิดโมเดล จ่ายด้วยเงินสด

  // const [DeleteProductByID, setDeleteProductByID] = useState<any>(null);//ข้อมูลสินค้าที่กดลบ

  const handleQR = () => {
    setQrCode(generatePayload(phoneNumber, { amount: totalPrice })); // เปลี่ยน String(totalPrice) เป็น totalPrice
  };


  const ColumnsReceiveProduct = [
    {
      title: 'Image',
      dataIndex: 'Path',
      key: 'Path',
      render: (Path: string) => (
        <Image
          src={Path} // ใช้ Base64 string
          alt="product"
          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'ชื่อ',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: 'Barcode',
      dataIndex: 'Barcode',
      key: 'Barcode',
    },
    {
      title: 'ราคา',
      dataIndex: 'Price',
      key: 'Price',
    },
    {
      title: 'จำนวนที่ซื้อ',
      dataIndex: 'quantitySale',
      key: 'quantitySale',
      render: (_: any, record: SaleProductListIF) => (
        <InputNumber
          min={1}
          max={record.QuantityShelf}
          value={record.quantitySale}
          onChange={(value) => {
            // ตรวจสอบว่า value เป็น number หรือไม่
            const validValue = typeof value === 'number' && Number.isInteger(value) ? value : 1;
            updateQuantitySale(record.ID, validValue);
          }}
        />
      ),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      // width: 70,
      render: (_: any, record: SaleProductListIF) => (
        <>
          <Button
            onClick={() => { ClickDeleteProductByID(record); /*SetModelDeleteSaleProduct(true);*/ }}
            style={{ marginLeft: 10 }}
            shape="circle"
            icon={<DeleteOutlined />}  //ปุ่มลบ
            size={"large"}
            danger
          />
        </>
      ),
    },
  ];

  const updateQuantitySale = (id: number, newQuantity: number) => {
    const updatedList = ProductSaleList.map((product) =>
      product.ID === id ? { ...product, quantitySale: newQuantity } : product
    );
    console.log("กดปุ่มเพิ่ม ลด", updatedList);
    SetProductSaleList(updatedList);
    localStorage.setItem("ProductSaleList", JSON.stringify(updatedList));
  };


  const webcamRef = useRef<Webcam>(null);//กล้อง
  const codeReader = new BrowserMultiFormatReader();//เป็นออบเจคไว้อ่าน QR Bar code

  const capture = useCallback(async () => {
    if (OnOffScan && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const result = await codeReader.decodeFromImageUrl(imageSrc);
          const scannedCode = result.getText(); // ค่า Barcode ที่สแกนได้

          if (scannedCode) {
            searchProductSale(scannedCode); // ส่งค่าไปค้นหา
            setResaultScan(''); // รีเซตค่าหลังค้นหา  เดะมันค้างค่าเดิม
          }
        } catch (err) {
          console.error("Error decoding barcode: ", err);
        }
      }
    }
  }, [webcamRef, codeReader, OnOffScan]);

  useEffect(() => {
    const interval = setInterval(() => {
      capture();
    }, 1000);
    return () => clearInterval(interval);
  }, [capture]);


  // useEffect(() => {
  //   if (ResaultScan !== '' && OnOffScan) {
  //     // StateModelScanProductSale(false); // ปิด 
  //     searchProductSale(ResaultScan);
  //     // ChangeStateModelSearchBarcode(true);  // เปิด ModelSearchBarcode
  //     // setOnOffScan(false); // หยุดการสแกนหลังจากมีผลการสแกน
  //     // setResaultScan(''); // เซ็ต ResaultScan เป็น null
  //   }
  // }, [ResaultScan]);



  const ClearListSaleProduct = () => {
    localStorage.removeItem('ProductSaleList');
    SetProductSaleList([]);
  };

  const searchProductSale = async (barcode: string) => {
    if (barcode.trim() !== '') {  // ตรวจสอบว่า value ไม่ว่าง
      console.log("ก่อนกดค้นหาด้วยBarcode", barcode);
      let { response, result } = await SearchProductSale(barcode);

      if (response.status === 200) {
        console.log("หลังกดค้นหาด้วยBarcode", result);
        // เล่นเสียงเมื่อเงื่อนไขถูกต้อง
        const audio = new Audio('/Sound/BarcodeScanner.mp3'); // เส้นทางของไฟล์เสียงที่เก็บใน public
        audio.play(); // เล่นเสียง
        // setOnOffScan(false);
        setResaultScan('');
        setDataSaleProduct(result);
        // StateModelScanProductSale(false);
        // ChangeStateModelSearchBarcode(true);
        // ClickAddToProductSaleList();
        SetLoadData(true);
      }
      else {
        messageApi.open({ type: "warning", content: result.error });
      }
    }
  }

  // ใช้ useEffect เพื่อตรวจสอบเมื่อ DataSaleProduct และ LoadData ถ้าไม่ใช้มันจะโหลดข้อมูลไม่ทัน
  useEffect(() => {
    if (DataSaleProduct && LoadData) {
      ClickAddToProductSaleList();
      SetLoadData(false);
    }
  }, [DataSaleProduct]);

  const ClickAddToProductSaleList = () => {
    // ปิด popup การค้นหา (ถ้าจำเป็น)
    // ChangeStateModelSearchBarcode(false);

    // สร้างข้อมูลใหม่ที่รวมข้อมูลสินค้าปัจจุบัน
    const dataSaveProductSale = {
      ...DataSaleProduct,
      quantitySale: 1//productsale.quantitySale,
    };

    console.log("เพิ่มจำนวนที่กรอกรวมเข้ากับใน ฟอร์อม", dataSaveProductSale);
    console.log("ProductSaleList", ProductSaleList);

    // prevList คือ ค่าของ ProductSaleList เป็นตัวแปรใช้แทนเฉยๆ  
    //prevList.map((product)    product ก็เป็นตัวแปรใช้แทน   prevList  อีกรอบ
    //ในส่วนแรก map วนลูปตาม prevList ซึ่งก็คือข้อมูล ProductSaleList 
    //เช็คว่า id นั้นตรงกับ id ที่ได้จากค้นหาจากบาร์โค้ดไหม
    //ถ้าตรง ทำการบวกจำนวน quantitySale ไปก่อน  แล้วเช็คีกทีว่า เกินกับจำนวนใน Shelf ไหม ถ้้สเกินก็จพแจ้ง  ถ้าไม่ก็เอาค่านั้นที่บวกจำนวนแล้วไปเก็บใส่ updatedList
    //ถ้า id ไม่ตรงกับบาร์โค้ด ก็ให้ใช้ค่าเดิมของ product 

    //ส่วนสอง ถ้า id นั้นเป็นข้อมูลสินค้าใหม่ที่ไม่มีอยู่ในลิสตั้งแต่แรก ก็เอาข้อมูลทั้งก้อน push ใส่ updatedList เลย

    //ที่เหลือก็เซ็ตค่า  โดย  return updatedList ที่ข้อมูลมีการปรับเปลี่ยนเรียบร้อยแล้วออกไป อาณ์กิวเมน  ใน SetProductSaleList(  อาณ์กิวเมน  )

    SetProductSaleList((prevList) => {   //product ในฟังก์ชัน map() มาจาก prevList ซึ่งเป็น array ของสินค้าใน ProductSaleList
      
      //--ส่วนแรก ----- 
      const updatedList = prevList.map((product) => {   //เอา prevList มา .map   product เป็นตัวแทน ข้อมูล รายการของ  ProductSaleList
        if (product.ID === dataSaveProductSale.ID) {  //product.ID คือ   ProductSaleList.ID
          // ถ้า ID ซ้ำ บวก quantitySale ใหม่เข้าไปกับ quantitySale เดิม
          const newQuantitySale = product.quantitySale + dataSaveProductSale.quantitySale;
          if (newQuantitySale > product.QuantityShelf) {
            messageApi.open({ type: "warning", content: "จำนวนสินค้าขายเกินจำนวนที่มีในชั้น" });
            return product; // คืนค่ารายการเดิมโดยไม่เปลี่ยนแปลง
          }
          return {
            ...product,
            quantitySale: product.quantitySale + dataSaveProductSale.quantitySale,
          };
        }
        return product; // ถ้าไม่ซ้ำ ให้คืนค่ารายการเดิม
      });
      //--ส่วนแรก ----- 
      
      //-----ส่วนสอง
      // ถ้า ID ไม่ซ้ำเลย ให้เพิ่มข้อมูลใหม่เข้าไปในลิสต์
      if (!updatedList.some((product) => product.ID === dataSaveProductSale.ID)) {
        updatedList.push(dataSaveProductSale);
      }
      //-----ส่วนสอง

      // เก็บข้อมูลใหม่ใน localStorage
      localStorage.setItem("ProductSaleList", JSON.stringify(updatedList));
      console.log("Updated Product List:", updatedList);

      return updatedList; // คืนค่า state ที่อัปเดต
    });

  };

  const ConfirmDeleteSaleProduct = async (id: number) => {
    // ลบรายการสินค้าที่มี ID ตรงกับที่เลือก
    const updatedProductSaleList = ProductSaleList.filter((product) => product.ID !== id);
    SetProductSaleList(updatedProductSaleList);
    localStorage.setItem("ProductSaleList", JSON.stringify(updatedProductSaleList));
    SetModelDeleteSaleProduct(false);
  };



  const clickConfirmSaleProduct = async (typepay: string) => {
    // กรองข้อมูลจาก ProductSaleList เพื่อให้ได้เฉพาะ ID, Name, Piece, Price, quantitySale
    const filteredProductSaleList = ProductSaleList.map(product => ({
      ID: product.ID,
      Name: product.Name,
      //Piece: product.Piece,
      Price: product.Price,
      quantitySale: product.quantitySale,
    }));

    const roundedPrice = Math.floor(totalPrice * 100) / 100;

    // ดึงข้อมูลจาก localStorage
    const employeeId = Number(localStorage.getItem('employeeid'));

    // สร้างออบเจ็กต์รวมข้อมูล
    const saleDataProduct = {
      ProductSaleList: filteredProductSaleList,
      totalPrice: roundedPrice,
      employeeId: employeeId,
      typepayment: typepay,
    };

    // log สำหรับตรวจสอบ
    console.log("ข้อมูลการขายทั้งหมด:", saleDataProduct);
    let { response, result } = await AddSaleProduct(saleDataProduct);
    if (response.status === 200) {
      messageApi.open({ type: "success", content: result.message });
      StateModelConfirmCashPayment(false);
      StateModelConfirmQrPayment(false);   //หน้าคำนวณเงินทอนกับแสดง QrCode

      StateModelQRCodePayment(false);
      SetModelCashPayment(false);    //หน้ายกดยันการชำระเงิน

      ClearListSaleProduct();
    }
    else{
      console.log("err", result.error);
    }
  };

  useEffect(() => {
    console.log("รายการสินค้าทั้งหมด", ProductSaleList);
    const calculateTotalPrice = () => {
      const total = ProductSaleList.reduce((sum, product) => {   //reduce: ใช้เพื่อลูปรวมค่าในอาร์เรย์  //sum: เป็นตัวแปรที่เก็บผลลัพธ์สะสมจากการคำนวณในแต่ละรอบ
        return sum + (product.quantitySale * product.Price); // เอาตัวแปร sum มาบวกวนซ้ำแต่ล่ะรอบ
      }, 0);  //ซึ่งจะเริ่มต้นด้วยค่าที่เรากำหนดใน reduce (ในกรณีนี้คือ 0)
      // ตัดทศนิยมส่วนเกินออกให้เหลือ 2 ตำแหน่ง
      const truncatedTotal = Math.trunc(total * 100) / 100;
      // 
      // แปลงให้เป็นสตริง และเติม 0 หากเป็นทศนิยม 1 ตำแหน่ง
      //const formattedTotal = truncatedTotal.toFixed(2);
      setTotalPrice(truncatedTotal);
    };
    calculateTotalPrice();
  }, [ProductSaleList]); // ทำงานเมื่อ ProductSaleList เปลี่ยนแปลง

  const ClickDeleteProductByID = async (keyid: any) => {   //ใช้การดึงรูป และข้อมูลจากตัวตารางเลยไม่ต้องดึงผ่าน Backend อีก
    console.log('กดปุ่มลบ ', keyid);
    SetDeleteSaleProduct(keyid);
    SetModelDeleteSaleProduct(true);
    //StateModelOganizeProductByID(true);
    
  };

  useEffect(() => {
    navigate("/zoosale/saleproduct");
    localStorage.setItem('activeButton', 'sale');
  }, []);


  return (
    <div style={{ backgroundImage: "url('/ImgPaymentProduct/BGPaymentProduct.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh" }}>
      {contextHolder}
      <SideBarZooSale expanded={expanded} onToggle={handleSidebarToggle} />
      <nav style={{ height: "52px", backgroundColor: "rgba(255, 255, 255, 0)", backdropFilter: "blur(20px)", boxShadow: "0 1px 12px rgba(0, 0, 0, 0.)", color: "black", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", }}>
        <span>
          <Search onSearch={searchProductSale} allowClear placeholder="Search Barcode" enterButton="ค้นหา" size="large" style={{ width: "600px", marginLeft: "500px", marginTop: '2px' }} />
          {/* ปุ่มเปิดกล้อง    กดเปิดกล้อง ให้ Set setOnOffScan(true) ด้วยให้มันสแกนได้*/}
          <span onClick={() => { StateModelScanProductSale(true); setOnOffScan(true); }} ><Button type="primary" style={{ height: "35px", fontSize: '17px', marginTop: '4px', marginLeft: '20px', backgroundColor: "#1677FF", color: "white" }} >สแกนบาร์โค้ด</Button></span>
        </span>
        <div style={{ position: 'absolute', right: '20px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image src={`data:image/jpeg;base64,${localStorage.getItem("profilezoosale") || ''}`} style={{ height: "50px", width: "50px", borderRadius: "50%", objectFit: "cover", marginTop: "8px" }} />
            <div style={{ color: "white" }}>
              <p style={{ fontSize: '20px', marginTop: '2px', color: "white", }}> <span style={{ marginRight: '5px' }}> {localStorage.getItem('firstnameuser')} </span> {localStorage.getItem('lastnameuser')} </p>
              <p style={{ fontSize: '15px', marginTop: '-3px', color: "white", }}>{localStorage.getItem('roleName')}</p>
            </div>
          </div>
        </div>
      </nav>

      <Modal width={800} open={ModelSearchBarcode} onCancel={() => ChangeStateModelSearchBarcode(false)} footer={null} >
        <Form name='DataSearchProductSale' onFinish={ClickAddToProductSaleList} autoComplete="off">
          {DataSaleProduct && (
            <div>
              {/* แสดงรายละเอียดของสินค้า */}
              <h2>Name Product = <i>{DataSaleProduct.Name}</i></h2>
              <h2>Barcode = <i>{DataSaleProduct.Barcode}</i></h2>
              <Form.Item initialValue={1} label="จำนวน" name="quantitySale" rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "30px", width: "250px" }}>
                <InputNumber min={1} step={1} parser={(value) => parseInt(value || "1", 10)} style={{ width: "100%" }} max={Number(DataSaleProduct.QuantityShelf)} />
              </Form.Item>

              {/* แสดงรูปภาพ */}
              <img
                src={DataSaleProduct.Path}
                alt={DataSaleProduct.Name}
                style={{ height: "200px", width: "200px" }}
              />
              <Button type="primary" htmlType="submit" style={{ fontWeight: "bold", color: "#3c312b", backgroundColor: "#F7B22C", width: "100px", height: "38px", margin: "20px 20px 0px 20px" }}>
                ADD
              </Button>

              <Button type="primary" onClick={() => ChangeStateModelSearchBarcode(false)} style={{ fontWeight: "bold", color: "#3c312b", backgroundColor: "#FF6F00", width: "100px", height: "38px", margin: "20px 20px 0px 20px" }}>
                CANCEL
              </Button>

            </div>
          )}
        </Form>
      </Modal>


      <Modal width={680} open={ModelQRCodePayment} onCancel={() => StateModelQRCodePayment(false)} footer={null}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
          <img style={{ width: '330px', marginBottom: '20px' }} src={thaiqrpayment} alt="payment" />
          <QRCode type="svg" errorLevel="H" value={qrCode} icon={LogoZooManage} style={{ marginTop: '-80px', width: '350px', height: '440px', border: 0 }} />
          <p style={{ marginTop: "-40px", fontSize: "30px", fontWeight: 500 }}>ยอดที่ต้องชำระ<span style={{ marginLeft: '20px', color: 'blue', fontSize: '45px' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalPrice)}</span><span style={{ marginLeft: '20px' }}>บาท</span></p>

          {/* <Button onClick={() => StateModelConfirmPayment(true)} type="primary" shape="default" style={{ marginTop: "15px", backgroundColor: '#9400ce', width: '250px', height: '50px' }}>
            <p style={{ color: 'white', fontSize: '25px' }}>ยืนยันการชำระเงิน</p>
          </Button> */}
          <div style={{marginTop: "15px"}}>
            <Button onClick={() => StateModelQRCodePayment(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "200px", height: "45px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => {StateModelConfirmQrPayment(true); StateModelQRCodePayment(false);}} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "200px", height: "45px", marginLeft: "20px" }}>
              ยืนยันการชำระเงิน
            </Button>
          </div>
        </div>
      </Modal>

      {/* Model กล้องสแกนบาร์โค้ด */}
      <Modal width={600} title={null} open={ModelScanProductSale} onCancel={() => { StateModelScanProductSale(false); setOnOffScan(false); }} footer={null} style={{ borderRadius: '12px', }}>
        <div style={{marginTop: "25px"}}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'environment' }}
            width={900}
            height={500}
          />
          {/* {scannedCode && ( */}
          <div>
          <p style={{marginTop: "20px", fontSize: "20px"}}>Scanned Code: {ResaultScan}</p>
          </div>
          {/* )} */}
        </div>
      </Modal>


      <Modal width={500} footer={null} open={ModelConfirmQrPayment} onCancel={() => StateModelConfirmQrPayment(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 500, fontSize: "20px", marginBottom: "10px" }}>ยืนยันการชำระค่าสินค้าด้วย QrCode</b>
          <div>
            <Button onClick={() => StateModelConfirmQrPayment(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => clickConfirmSaleProduct("QRCode Payment")} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>

      <Modal width={500} footer={null} open={ModelConfirmCashPayment} onCancel={() => StateModelConfirmCashPayment(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 500, fontSize: "20px", marginBottom: "10px" }}>ยืนยันการชำระค่าสินค้าด้วยเงินสด</b>
          <div>
            <Button onClick={() => StateModelConfirmCashPayment(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => clickConfirmSaleProduct("Cash Payment")} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>

      <Modal width={500} footer={null} open={ModelDeleteSaleProduct} onCancel={() => SetModelDeleteSaleProduct(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 480, fontSize: "25px", marginBottom: "10px" }}>ยืนยันการลบรายการขายสินค้า?</b>
          <Image src={DeleteSaleProduct?.Path} alt="product" style={{ height: "150px", width: "auto", borderRadius: "10px", }} />
          <p style={{ marginTop: "15px", fontSize: "20px", }}>{DeleteSaleProduct?.Name}</p>
          <div>
            <Button onClick={() => SetModelDeleteSaleProduct(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => ConfirmDeleteSaleProduct(DeleteSaleProduct.ID)} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ลบ
            </Button>
          </div>
        </div>
      </Modal>


      <Modal width={580} open={ModelCashPayment} onCancel={() => SetModelCashPayment(false)} footer={null}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontWeight: 500, fontSize: "25px", marginBottom: "20px", color: "#7C3AED" }}>คำนวณเงินทอน</h1>
          <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#FDF2F8", borderRadius: "10px", display: "flex", flexDirection: "column" }}>
            <div style={{ marginLeft: "20px" }}>
              <p style={{ fontWeight: 400, fontSize: "16px", color: "#f74f98" }}>ยอดที่ต้องชำระ</p>
              <p style={{ color: "#5B21B6", marginLeft: "0px", marginTop: "-5px", fontSize: "28px", fontWeight: 600 }}>
                ฿{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalPrice)}
              </p>
            </div>
          </div>

          <div style={{ padding: "10px", width: "430px", height: "95px", backgroundColor: "#FFFBEB", borderRadius: "10px", display: "flex", flexDirection: "column", marginTop: "15px" }}>
            <div style={{ marginLeft: "20px" }}>
              <p style={{ fontWeight: 400, fontSize: "16px", color: "#F7B22C" }}>เงินสดที่รับมา</p>
              <Form.Item>
                <InputNumber
                style={{fontSize: "22px", fontWeight: 600, width: "375px"}}
                  min={totalPrice.toString()} // แปลง totalPrice เป็น string
                  defaultValue={parseFloat(totalPrice.toString()).toFixed(2)} // ค่าเริ่มต้นเป็นทศนิยม 2 ตำแหน่ง
                  step={0.01} // รองรับการป้อนทศนิยม 2 ตำแหน่ง
                  formatter={(value) =>
                    `${parseFloat(value || '0').toFixed(2)}`} // จัดรูปแบบให้แสดงเป็นทศนิยม 2 ตำแหน่ง
                  parser={(value) => (value ? value : '0')} // คืนค่ากลับเป็น string
                  onChange={(value) => {
                    const change = value ? parseFloat(value) - totalPrice : 0; // คำนวณเงินทอน
                    const formattedChange = change > 0 ? change.toFixed(2) : (0).toFixed(2); // จัดรูปแบบเงินทอน
                    document.getElementById('changeAmount')!.innerText = `฿${formattedChange}`;
                  }}
                />
              </Form.Item>
            </div>
          </div>
          <div style={{ marginLeft: "-100px", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "300px" }}>
            <p style={{ fontSize: "25px" }}>เงินทอน</p>
            <p id="changeAmount" style={{ position: "absolute", color: "#5B21B6", fontSize: "32px", fontWeight: 500, right: "80px"}}>฿0.00</p>
          </div>
          <div style={{marginTop: "20px"}}>
            <Button onClick={() => SetModelCashPayment(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "200px", height: "45px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => {StateModelConfirmCashPayment(true); SetModelCashPayment(false);}} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "200px", height: "45px", marginLeft: "20px"}}>
              ยืนยันการชำระเงิน
            </Button>
          </div>
        </div>
      </Modal>

      <Card style={{ boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.84)", width: expanded ? 'calc(100% - 340px)' : 'calc(100% - 120px)', height: 'calc(100vh - 160px)', marginTop: '20px', marginLeft: expanded ? '320px' : '100px', transition: 'margin-left 0.6s ease, width 0.6s ease', }} >
        <Table rowKey="ID" dataSource={ProductSaleList} columns={ColumnsReceiveProduct} scroll={{ y: 'calc(100vh - 260px)' }} pagination={false} />
      </Card>

      <Card style={{ position: "fixed", bottom: "5px", boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.84)", width: expanded ? 'calc(100% - 340px)' : 'calc(100% - 120px)', height: '75px', marginTop: '20px', marginLeft: expanded ? '320px' : '100px', transition: 'margin-left 0.6s ease, width 0.6s ease', }} >
        <div style={{ display: 'flex', marginTop: "-8px" }}>
          <Button onClick={() => {
            if (ProductSaleList.length > 0) {
              SetModelCashPayment(true);
            }
            else {
              messageApi.open({ type: "warning", content: "ไม่มีสินค้าในรายการขาย" });
            }
          }}
            type="primary" shape="default" style={{ fontSize: "20px", color: "white", marginLeft: '50px', backgroundColor: '#9400ce', width: '300px', height: '45px' }}>
            เงินสด
          </Button>

          <Button onClick={() => {
            if (ProductSaleList.length > 0) { // เช็คว่ามีข้อมูลใน ProductSaleList หรือไม่
              StateModelQRCodePayment(true);
              handleQR();
            } else {
              messageApi.open({ type: "warning", content: "ไม่มีสินค้าในรายการขาย" });
            }
          }}
            type="primary" shape="default" style={{ fontSize: "20px", color: "white", marginLeft: '50px', backgroundColor: '#f74f98', width: '300px', height: '45px' }}>
            โอนจ่าย
          </Button>

            <p style={{marginLeft: expanded ? "300px" : "500px", transition: 'margin-left 0.6s ease, width 0.6s ease', fontSize: "28px", fontWeight: 500 }}>
              ยอดรวมทั้งหมด
            </p>
            <p style={{ color: "#2563EB", marginLeft: "25px", marginTop: "-5px", fontSize: "35px", fontWeight: 600 }}>
              ฿{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalPrice)}
            </p>
          
        </div>
      </Card>


    </div>
  );

}

export default SaleProduct;
//close aut103