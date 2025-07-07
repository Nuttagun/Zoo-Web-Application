import { useState, useEffect, useRef, useCallback } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { Upload, Button, Image, Modal, Input, Form, InputNumber, Table, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import ImgCrop from 'antd-img-crop';
import { SearchProductReceive, AddReceiveProduct, GetAllBarcodeProduct } from "../../services/https/aut/http";
import { ReceiveProductListIF } from "../../interface/ReceiveProductListIF"
import './aut.css';

import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

import SideBarZooSale from '../../component/zoosale/sidebar';


const { Search } = Input;

function ReceiveProduct() {  /**........ds45ds45ds454ds...*/
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [FormReceiveProduct] = Form.useForm();
  const [FormTotalPrice] = Form.useForm();


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

  //ไว้เก็บค่าลิสสินค่าที่รับมา
  const savedProductList = localStorage.getItem('ReceiveProductList');
  const initialProductList = savedProductList ? JSON.parse(savedProductList) : [];

  //ใช้การบันทึกรูปใน ลิสก่อน
  const [fileList, setFileList] = useState<UploadFile[]>([]); //ไฟล์ลิสตั้งไว้เพราะอาจมีการลบไฟล์  อัพใหม่ก็ได้
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]); // สำหรับการแก้ไขรูปภาพในแถว
  const [file, setFile] = useState<File | null>(null);      //ไว้เป็นไฟล์ที่จะอัพโหลด
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [ModelAddNewProduct, ChangeStateModelNewProduct] = useState(false); //pop up กรอกข้อมูลสินค้าใหม่

  //กดค้นหาสินค้าแล้วแสดง pop up หากมีข้อมูลที่ตรงกับ database
  const [ModelSearchBarcode, ChangeStateModelSearchBarcode] = useState(false); //popup กรอกข้อมูล
  const [searchBarcodeProduct, setSearchBarcodeProduct] = useState<any>(null);//data ข้อมูลสินค้าชิ้นที่ค้นหา

  const [ModelOldProductScan, ChangeStateModelOldProductScan] = useState(false);//ตัเปิดปิดโมเดลสแกนบาร์โค้ด
  const [ResaultScan, setResaultScan] = useState<string>('');//สแกน
  const [OnOffScan, setOnOffScan] = useState(true); // สถานะการสแกน

  //แสดงรายการสินค้าที่รับมา
  const [ReceiveProductList, SetReceiveProductList] = useState<ReceiveProductListIF[]>(initialProductList);//ข้อมูลสินค้าทั้งหมด  ถ้ารีหน้า ReceiveProductList จะหาย เอา initialProductList มาช่วยเซ้ตค่าเดิมให้กลับมา

  const [ModelConfirmProduct, ChangeStateModelConfirmProduct] = useState(false);//โมเดลยืนยันการรับสินค้า ที่บันทึกลิส


  const [ModelSetClearAllReceiveProduct, SetClearAllReceiveProduct] = useState(false);//โมเดลยืนยันการล้างสินค้า


  const [PriceReceiving, SetPriceReceiving] = useState<number>(0);//ยอดรวมราคาสินค้า

  const [editingID, setEditingID] = useState<string | null>(null); //เก็บ ID สินค้า กดแก้ไข
  const [editingProduct, setEditingProduct] = useState<ReceiveProductListIF | null>(null);//เก็บข้อมูลสินค้า ที่กดแก้ไข

  const [ModeConfirmDelete, ChangeStateConfirmDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ReceiveProductListIF | null>(null);


  const handleEdit = (product: ReceiveProductListIF) => {
    getAllBarcodeProduct();
    console.log("ClickEdit:", product);      //แสดงชื่อ สินค้าที่คลิก
    setEditingID(product.ID);
    setEditingProduct(product); // เก็บข้อมูลของสินค้า ที่คลิก
  };

  const getAllBarcodeProduct = async (): Promise<string[] | null> => {
    let { response, result } = await GetAllBarcodeProduct();
    if (response.status === 200) {
      return result.barcode; // ส่งคืนข้อมูล barcode โดยตรง
    }
    return null; // ส่งคืน null หากเกิดข้อผิดพลาด
  };


  const saveEditedProduct = async () => {
    if (!editingProduct) return;

    if (editingProduct?.Barcode?.length !== 13) {
      messageApi.open({ type: "warning", content: "กรุณากรอก Barcode ให้ครบ 13 หลัก" });
      return;
    }

    const IDProduct = typeof editingProduct.ID === "number";

    if (!IDProduct) { //ถ้าเป็นสินค้าเก่าก็ให้ข่้ามการเช็ค Barcode ซ้ำ เพราะแก้ Barcode ไม่ได้อยู่แล้ว
      // ดึงข้อมูล barcode จากฐานข้อมูล
      const dataFromDatabase = await getAllBarcodeProduct();
      if (!dataFromDatabase) {
        messageApi.open({ type: "error", content: "ไม่สามารถดึงข้อมูล barcode จากฐานข้อมูลได้" });
        return; // ไม่ทำการบันทึก
      }

      // ตรวจสอบว่า barcode ซ้ำกับรายการที่มีอยู่ใน ReceiveProductList
      const isBarcodeDuplicate = ReceiveProductList.some(
        (product: ReceiveProductListIF) =>
          product.Barcode === editingProduct.Barcode && product.ID !== editingProduct.ID
      );

      // ตรวจสอบว่า barcode ซ้ำกับข้อมูลที่มาจากฐานข้อมูล
      const isBarcodeInDatabase = dataFromDatabase.includes(editingProduct.Barcode);

      if (isBarcodeDuplicate) {
        messageApi.open({ type: "error", content: "Barcode นี้ซ้ำกับที่มีอยู่ใน รายการ แล้ว!" });
        return; // ไม่ทำการบันทึก
      }

      if (isBarcodeInDatabase) {
        messageApi.open({ type: "error", content: "Barcode นี้ซ้ำกับที่มีอยู่ใน ฐานข้อมูล แล้ว!" });
        return; // ไม่ทำการบันทึก
      }
    }


    // ถ้า barcode ไม่ซ้ำกับทั้งสองแหล่งข้อมูล ทำการบันทึกข้อมูล
    SetReceiveProductList((prevList) => {
      const updatedList = prevList.map((product) =>
        product.ID === editingProduct.ID ? editingProduct : product
      );
      localStorage.setItem("ReceiveProductList", JSON.stringify(updatedList));
      return updatedList;
    });

    // รีเซ็ตการแก้ไข
    setEditingID(null);
    setEditingProduct(null);
    setEditFileList([]);  //ล้างลิสรูปที่อัพมา
  };





  const handleImageEdit = (info: { fileList: UploadFile[] }) => {
    // จำกัดให้แสดงไฟล์ใน fileList มีแค่ 1 รูป
    setEditFileList(info.fileList.slice(0, 1));

    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj as File;
      //setFileEdit(file);

      // แปลงไฟล์ใหม่เป็น Base64 URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setEditingProduct((prev) => prev && { ...prev, Path: base64Image });
      };
      reader.readAsDataURL(file); // แปลงไฟล์เป็น Base64
    } else {
      //setFileEdit(null);
      setEditingProduct((prev) => prev && { ...prev, Path: '' });
    }
  };

  const handleDeleteProduct = (product: ReceiveProductListIF) => {
    setSelectedProduct(product); // เก็บข้อมูลสินค้าที่จะลบไว้
    ChangeStateConfirmDelete(true); // เปิด Modal
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      // ลบสินค้าออกจากรายการหลังจากกดยืนยัน
      SetReceiveProductList((prevList) => {
        const updatedList = prevList.filter((item) => item.ID !== selectedProduct.ID);
        localStorage.setItem('ReceiveProductList', JSON.stringify(updatedList));
        return updatedList;
      });
    }
    ChangeStateConfirmDelete(false); // ปิด Modal
  };



  const generateNewProductID = () => {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[-:.TZ]/g, ''); // ลบตัวอักษรพิเศษทั้งหมดออก
    return `new-${formattedDate}`;
  };

  const ClickAddNewProduct = async (dataProduct: any) => {
    if (!file) {
      messageApi.open({ type: "error", content: "ไม่มีไฟล์รูปถูกเลือก" });
      return;
    }

    const barcodesFromDB = await getAllBarcodeProduct();
    if (!barcodesFromDB) {
      messageApi.open({ type: "error", content: "ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้" });
      return;
    }

    console.log("dataProduct", dataProduct);
    console.log("barcodesFromDB", barcodesFromDB);

    // ตรวจสอบว่า barcode ซ้ำหรือไม่
    const isBarcodeDuplicateInList = ReceiveProductList.some(
      (product: ReceiveProductListIF) => product.Barcode === dataProduct.barcode
    );

    const isBarcodeDuplicateInDatabase = barcodesFromDB.includes(dataProduct.barcode);

    if (isBarcodeDuplicateInList) {
      messageApi.open({ type: "error", content: "Barcode นี้ซ้ำกับในรายการที่มีอยู่แล้ว!" });
      return; // ไม่ดำเนินการเพิ่มสินค้า
    }

    if (isBarcodeDuplicateInDatabase) {
      messageApi.open({ type: "error", content: "Barcode นี้ซ้ำกับในรายการในDatabase!" });
      return; // ไม่ดำเนินการเพิ่มสินค้า
    }

    // ฟังก์ชันแปลงไฟล์เป็น Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;

      // สร้างข้อมูลสินค้าใหม่
      const newProduct: ReceiveProductListIF = {
        ID: generateNewProductID(), // ใช้ generateID() เพื่อสร้าง ID ใหม่
        Path: base64String, // เก็บ Base64 ของรูปภาพ
        Name: dataProduct.nameproduct,
        Barcode: dataProduct.barcode,
        quantityReceive: dataProduct.pieceproduct,
      };

      // เพิ่มสินค้าใหม่เข้าไปในรายการ
      SetReceiveProductList((prevList) => {
        const updatedList: ReceiveProductListIF[] = [...prevList, newProduct];
        // เก็บรายการใน LocalStorage
        localStorage.setItem('ReceiveProductList', JSON.stringify(updatedList));
        console.log('เพิ่มสินค้าใหม่:', updatedList); // พิมพ์ค่าที่อัปเดตแล้ว
        return updatedList;
      });
      ChangeStateModelNewProduct(false);
      FormReceiveProduct.resetFields();
      setFileList([]);
      setFile(null);
    };

    // อ่านไฟล์ที่ผู้ใช้อัปโหลด
    reader.readAsDataURL(file);
  };



  const handleImageChange = (info: { fileList: UploadFile[] }) => {   // { fileList: UploadFile[] }  เป็นการกำหนดรูปแบบของข้อมูล 
    //fileList: เป็นอาร์เรย์ (array) ที่มีประเภทเป็น UploadFile[] ซึ่งเป็นชนิดข้อมูลที่กำหนดไว้ใน Ant Design สำหรับการจัดการไฟล์ที่ถูกอัปโหลด
    setFileList(info.fileList);//เก็บไฟล์ไว้ในลิสก่อน
    if (info.fileList.length > 0) {
      setFile(info.fileList[0].originFileObj as File);  //info.fileList[0] หมายถึงการเลือก ไฟล์ล่าสุด ผู้ใช้สามารถอัปโหลดได้เพียง 1 รูป ซึ่ง info.fileList จะมีไฟล์ที่ถูกเลือกอยู่ในตำแหน่งแรก (index 0) เสมอ
    } else {                                            // originFileObj as File เป็นการยืนยันกับ TypeScript ว่าเราทราบแน่นอนว่า originFileObj เป็นประเภท File
      setFile(null);  //ถ้าไม่มีรูปแสดงว่าลบไฟล์
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


  const webcamRef = useRef<Webcam>(null);//กล้อง
  const codeReader = new BrowserMultiFormatReader();//เป็นออบเจคไว้อ่าน QR Bar code

  const capture = useCallback(async () => {
    if (OnOffScan && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const result = await codeReader.decodeFromImageUrl(imageSrc);
          setResaultScan(result.getText()); // สิ่งที่อ่านได้จากการสแกน
        } catch (err) {
          console.error("Error decoding barcode: ", err);
        }
      }
    }
  }, [webcamRef, codeReader, OnOffScan]);

  useEffect(() => {
    const interval = setInterval(() => {
      capture();
    }, 800);
    return () => clearInterval(interval);
  }, [capture]);


  useEffect(() => {
    if (ResaultScan !== '' && OnOffScan) {
      ChangeStateModelOldProductScan(false); // ปิด ModelOldProductScan
      searchProductReceive(ResaultScan);
      ChangeStateModelSearchBarcode(true);  // เปิด ModelSearchBarcode
      setOnOffScan(false); // หยุดการสแกนหลังจากมีผลการสแกน
      setResaultScan(''); // เซ็ต ResaultScan เป็น null
    }
  }, [ResaultScan]);


  useEffect(() => {
    navigate("/zoosale/receiveproduct");
  }, []);


  const searchProductReceive = async (Product: string) => {
    if (Product.trim() !== '') {  // ตรวจสอบว่า value ไม่ว่าง
      console.log("ก่อนกดค้นหาด้วยBarcode", Product);
      let { response, result } = await SearchProductReceive(Product);
      if (response.status === 200) {
        messageApi.open({ type: "success", content: result.message });
        setSearchBarcodeProduct(result);
        ChangeStateModelSearchBarcode(true);
      }
      else {
        messageApi.open({ type: "error", content: result.error });
      }

    }
  }


  const AddListReceiveProduct = async () => {
    // สร้าง FormData
    const formData = new FormData();
    // เพิ่มข้อมูลสินค้าที่รับมาใน FormData
    ReceiveProductList.forEach((product: any, index: number) => {
      formData.append(`products[${index}][ID]`, product.ID);
      formData.append(`products[${index}][Barcode]`, product.Barcode);
      formData.append(`products[${index}][Name]`, product.Name);
      formData.append(`products[${index}][Path]`, product.Path);  // Base64 image หรือ Path ของไฟล์
      formData.append(`products[${index}][quantityReceive]`, product.quantityReceive.toString()/*"-256.36"*/);
    });

    const employeeid = localStorage.getItem('employeeid');
    if (!employeeid) {
      console.error('employeeid not found in localStorage');
      return;
    }
    // เพิ่ม totalPrice
    formData.append('totalPrice', PriceReceiving.toString() /* "-23.69"*/);
    formData.append('employeeid', employeeid.toString());

    // แสดงค่าของ formData ก่อนส่งไป API
    console.log("ข้อมูลที่ส่งไปใน FormData:");
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    // ส่งข้อมูลไปยังฟังก์ชัน API (จากไฟล์อื่น)
    let { result, response } = await AddReceiveProduct(formData);  // คุณจะต้องเรียกใช้ฟังก์ชันนี้ในที่อื่นเพื่อทำการยิง API
    if (response.status === 200) {
      console.log("หลังรับสินค้า", result);
      messageApi.open({ type: "success", content: result.message });
      FormTotalPrice.resetFields();  //ล้างฟอร์มราคารวมที่รับมา
      ChangeStateModelConfirmProduct(false);
      ClilkClearAllReceiveProduct();
    }
    else {
      console.log("หลังรับสินค้า", result.error);
      messageApi.open({ type: "error", content: result.error });
      ChangeStateModelConfirmProduct(false);
    }
  };


  const ClickReceiveProduct = (values: any) => {
    ChangeStateModelSearchBarcode(false);
    // สร้างออบเจกต์ใหม่ที่รวม quantityReceive ไว้ใน searchBarcodeProduct
    const dataReceiveProduct = {
      ...searchBarcodeProduct,
      quantityReceive: values.quantityReceive, // ...คือเอาส่วนข้างในอีกชั้นมา
    };//เอาจำนวนที่กรอก  รวมกับข้อมูลสินค้า

    console.log("ClickReceiveProduct", dataReceiveProduct);

    SetReceiveProductList((prevList) => {
      // ตรวจสอบว่า ID ซ้ำหรือไม่
      const updatedList = prevList.map((product) => {
        if (product.ID === dataReceiveProduct.ID) {
          // ถ้า ID ซ้ำ ให้เพิ่ม quantityReceive
          return {
            ...product,
            quantityReceive: product.quantityReceive + dataReceiveProduct.quantityReceive,
          };
        }
        return product; // ถ้าไม่ซ้ำ ให้คืนค่ารายการเดิม
      });

      // ถ้า ID ไม่ซ้ำ ให้เพิ่มข้อมูลใหม่เข้าไปในลิสต์
      if (!prevList.some(product => product.ID === dataReceiveProduct.ID)) {
        updatedList.push(dataReceiveProduct);
      }

      // เก็บข้อมูลใหม่ใน localStorage
      localStorage.setItem('ReceiveProductList', JSON.stringify(updatedList));
      console.log("สินค้าที่มีอยู่แล้ว", updatedList);

      return updatedList;
    });
  };


  const ClilkClearAllReceiveProduct = () => {
    localStorage.removeItem('ReceiveProductList');
    SetReceiveProductList([]);
    SetClearAllReceiveProduct(false);
  };

  const ColumnsReceiveProduct = [
    {
      title: <div style={{ textAlign: 'center' }}>Image</div>,
      dataIndex: 'Path',
      key: 'Path',
      width: 300,
      render: (Path: string, record: ReceiveProductListIF) => (
        (editingID === record.ID) && isNaN(Number(record.ID)) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
            <Image
              src={Path} // แสดงรูปเดิมหรือรูปใหม่ที่แก้ไข
              alt="product"
              style={{ width: '100px', height: '100px', objectFit: 'cover', }}
            />
            <div style={{ marginLeft: "20px" }}>
              <ImgCrop rotationSlider>
                <Upload  //ปิด aut11
                  id={"receiveproduct"}
                  listType="picture-card"
                  customRequest={({ onSuccess }) => { setTimeout(() => { onSuccess && onSuccess("ok"); }, 0); }}
                  fileList={editFileList}
                  onChange={handleImageEdit}
                  onPreview={handlePreview}
                  beforeUpload={(file) => {
                    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                    if (!isJpgOrPng) {
                      message.error('สามารถอัปโหลดได้เฉพาะไฟล์ JPG หรือ PNG เท่านั้น!');
                      return Upload.LIST_IGNORE;
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5; // ตรวจสอบขนาดไฟล์ไม่เกิน 5MB
                    if (!isLt5M) {
                      message.error('ไฟล์ต้องมีขนาดไม่เกิน 5MB!');
                      return Upload.LIST_IGNORE;
                    }
                    return true; // ผ่านการตรวจสอบ
                  }}
                  maxCount={1}
                  style={{ marginLeft: "20px" }}
                >
                  {editFileList.length < 1 && '+ NewImage'/*เช็คความยาว editFileList เพื่อให้อัพโลดได้แค้1*/}
                </Upload>
              </ImgCrop>
            </div>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', }}>
            <Image src={Path} alt="product" style={{ width: '90px', height: '90px', objectFit: 'cover' }} />
          </div>
        )
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>ชื่อ</div>,
      dataIndex: 'Name',
      key: 'Name',
      width: 300,
      render: (Name: string, record: ReceiveProductListIF) => (
        (editingID === record.ID) && isNaN(Number(record.ID)) ? (  //เช็ค ID ตรงกับ ID ที่คลิกแก้ไขไหม
          <div style={{ textAlign: 'center' }}>
            <Input
              style={{ width: "200px", textAlign: 'center'}}
              type="text"
              value={editingProduct?.Name || ''}
              onChange={(e) =>
                setEditingProduct((prev) => prev && { ...prev, Name: e.target.value })
              }
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>{Name}</div>
        )
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>Barcode</div>,
      dataIndex: 'Barcode',
      key: 'Barcode',
      width: 300,
      render: (Barcode: string, record: ReceiveProductListIF) => (
        (editingID === record.ID) && isNaN(Number(record.ID)) ? (
          <div style={{ textAlign: 'center' }}>
            <Input
              type="text"
              maxLength={13} // จำกัดความยาวสูงสุด 13 ตัวอักษร
              value={editingProduct?.Barcode || ''}
              style={{ width: "200px", textAlign: 'center' }}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z0-9]{0,13}$/.test(value)) { // ตรวจสอบความยาวและเฉพาะตัวเลข/ตัวอักษร
                  setEditingProduct((prev) =>
                    prev ? { ...prev, Barcode: value } : null
                  );
                }
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>{Barcode}</div>
        )
      ),
    },


    {
      title: <div style={{ textAlign: 'center' }}>จำนวนที่รับ</div>,
      dataIndex: 'quantityReceive',
      key: 'quantityReceive',
      width: 180,
      render: (quantity: number, record: ReceiveProductListIF) => (
        editingID === record.ID ? (
          <div style={{ textAlign: 'center' }}>
            <InputNumber
              min={1} // ค่าเริ่มต้นคือ 1 และไม่สามารถใส่ค่าต่ำกว่านี้
              type="number"
              style={{width: "130px",}}
              value={editingProduct?.quantityReceive || 1} // ค่าเริ่มต้นเป็น 1
              onChange={(value) => {
                if (Number.isInteger(value)) { // ตรวจสอบว่าเป็นจำนวนเต็ม
                  setEditingProduct((prev) =>
                    prev ? { ...prev, quantityReceive: value ?? 1 } : null
                  );
                }
              }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>{quantity}</div>
        )
      ),
    },

    {
      title: <div style={{ textAlign: 'center' }}>จัดการ</div>,
      dataIndex: 'actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: ReceiveProductListIF) => (
        <div>
          {editingID === record.ID ? (
            <div style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={saveEditedProduct}>
                บันทึก
              </Button>
              <Button
                style={{ marginLeft: '10px' }}
                onClick={() => setEditingID(null)}
              >
                ยกเลิก
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                onClick={() => handleEdit(record)/*ส่งข้อมูล Product แถวที่คลิกไป*/}
              >
                แก้ไข
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => handleDeleteProduct(record)}
                style={{ marginLeft: "10px" }}
              >
                ลบ
              </Button>
            </div>

          )}

        </div>
      ),
    },

  ];




  return (
    <div style={{ backgroundImage: "url('/ImgReceiveProduct/BGReceiveProduct.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh" }}>
      {contextHolder}
      <SideBarZooSale expanded={expanded} onToggle={handleSidebarToggle} />
      <nav style={{ height: "52px", backgroundColor: "rgba(255, 255, 255, 0)", backdropFilter: "blur(20px)", boxShadow: "0 1px 12px rgba(0, 0, 0, 0.)", color: "black", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", }}>
        <Search onSearch={searchProductReceive} /*onChange={(e) => setBarcodeSearch(e.target.value)}*/ allowClear placeholder="Search Barcode" enterButton="ค้นหา" size="large" style={{ width: "26%", marginLeft: expanded ? "750px" : "700px", fontFamily: "'Mitr', sans-serif", color: "white", fontSize: "21px", fontWeight: 400, transition: 'margin-left 0.6s ease', }} />
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
      { }
      <Modal width={500} open={ModelSearchBarcode} onCancel={() => ChangeStateModelSearchBarcode(false)} footer={null} >
        <Form name='DataReceiveProduct' onFinish={ClickReceiveProduct} autoComplete="off">
          {searchBarcodeProduct && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: "25px", fontWeight: 500, color: "#9400ce", marginBottom: "10px" }}>สินค้าที่มีอยู่ในระบบ</p>
              <Image
                src={searchBarcodeProduct.Path}
                alt={searchBarcodeProduct.Name}
                style={{ height: "180px", width: "auto", borderRadius: "10px", }}
              />

              {/* แสดงรายละเอียดของสินค้า */}
              <p style={{ fontSize: "22px", marginTop: "10px", color: "#f74f98", }}>{searchBarcodeProduct.Name}</p>
              {/* <h2>ID Product = <i>{searchBarcodeProduct.ID}</i></h2> */}
              <div style={{ marginTop: "10px" }}>
                <div style={{ padding: "10px", width: "300px", height: "70px", backgroundColor: "#F5F3FF", borderRadius: "10px", }}>
                  <p style={{ fontWeight: 300, fontSize: "16px", color: "#9400ce" }}>หมายเลขบาร์โค้ด</p>
                  <p style={{ fontWeight: 400, fontSize: "16px", color: "black" }}>{searchBarcodeProduct.Barcode}</p>
                </div>
                <div style={{ padding: "10px", width: "300px", height: "85px", backgroundColor: "#FDF2F8", borderRadius: "10px", marginTop: "15px" }}>
                  <p style={{ fontWeight: 300, fontSize: "16px", color: "#f74f98" }}>จำนวนที่รับ</p>
                  <Form.Item initialValue={1} name="quantityReceive" rules={[{ required: true, message: 'กรุณากรอกจำนวน' }, { type: 'integer', message: 'กรุณากรอกจำนวนเต็มเท่านั้น', }]} style={{ marginTop: "0px" }}>
                    <InputNumber step={1} min={1} style={{ width: "70%", fontSize: "18px", fontWeight: 500 }} parser={(value) => Math.floor(Number(value || 0))} />
                  </Form.Item>
                </div>
              </div>

              <div style={{ marginTop: "25px" }}>
                <Button type="primary" onClick={() => ChangeStateModelSearchBarcode(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "140px", height: "38px", }}>
                  ยกเลิก
                </Button>

                <Button type="primary" htmlType="submit" style={{ color: "white", backgroundColor: "#9400ce", width: "140px", height: "38px", marginLeft: "20px" }}>
                  เพิ่มเข้ารายการ
                </Button>

              </div>
            </div>
          )}
        </Form>
      </Modal>

      {/* สินค้าใหม่ */}
      <Modal width={500} open={ModelAddNewProduct} onCancel={() => ChangeStateModelNewProduct(false)} footer={null} >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "10px" }}>รับสินค้า</h1>
          <ImgCrop rotationSlider>
            <Upload listType="picture-card" customRequest={({ onSuccess }) => { setTimeout(() => { onSuccess && onSuccess("ok"); /*ตอบกลับ OK ทันที*/ }, 0); }}
              fileList={fileList} onChange={handleImageChange} onPreview={handlePreview} 
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                  messageApi.open({ type: "warning", content: "สามารถอัปโหลดได้เฉพาะไฟล์ JPG หรือ PNG เท่านั้น!" });
                  return Upload.LIST_IGNORE; // ยกเลิกการอัปโหลดไฟล์นี้
                }
                const isLt5M = file.size / 1024 / 1024 < 5; // ตรวจสอบขนาดไฟล์ไม่เกิน 15MB
                if (!isLt5M) {
                  messageApi.open({ type: "warning", content: "ไฟล์ต้องมีขนาดไม่เกิน 5MB!" });
                  return Upload.LIST_IGNORE; // ยกเลิกการอัปโหลดไฟล์นี้
                }
                return true; // ผ่านการตรวจสอบ
              }}
              >
              {fileList.length < 1 && '+ Upload' /*fileList {เป็นตัวแปรด้านบน เริ่มแรกเป็นค่าว่าง []} จะเก็บรายการไฟล์ที่ถูกเลือกหรืออัปโหลด และจะแสดงไฟล์เหล่านั้นใน UI*/
                //onChange {เป็นตัวอัพเดต fileList} เป็นอีเวนต์ที่ถูกเรียกใช้เมื่อมีการเปลี่ยนแปลงในรายการไฟล์ เช่น เมื่อผู้ใช้เลือกไฟล์ใหม่หรือลบไฟล์                                           
                //onPreview เป็นอีเวนต์ที่ถูกเรียกใช้เมื่อผู้ใช้คลิกเพื่อดูไฟล์ (เช่น ภาพ) ที่ถูกเลือก หลังจากคลอบรูปแล้ว  ไม่ใช่ตอนดูรูปในตาราง
              }
            </Upload>
          </ImgCrop>
          {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
          <Form labelCol={{ span: 24 }} form={FormReceiveProduct} name='DataStockProduct' onFinish={ClickAddNewProduct} autoComplete="off">
            <Form.Item label="ชื่อสินค้า" name="nameproduct" rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "10px", width: "330px" }}>
              <Input style={{ fontSize: "18px" }} />
            </Form.Item>
            <Form.Item label="จำนวน" name="pieceproduct" initialValue={1} rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "10px", width: "330px" }}>
              <InputNumber min={1} step={1} parser={(value) => parseInt(value || "1", 10)} style={{ fontFamily: "'Mitr', sans-serif", fontSize: "18px", width: "100%", fontWeight: 610 }} />
            </Form.Item>
            <Form.Item label="เลขบาร์โค้ด" name="barcode" rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }, { pattern: /^[a-zA-Z0-9]+$/, message: 'กรอกเฉพาะตัวเลขและอักษรภาษาอังกฤษเท่านั้น', }, { len: 13, message: 'กรุณากรอกบาร์โค้ด 13 ตัวอักษร', }]} style={{ marginBottom: "30px", width: "330px" }}>
              <Input maxLength={13} style={{ width: "100%", fontSize: "18px" }} />
            </Form.Item>
            <Button onClick={() => ChangeStateModelNewProduct(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button type="primary" htmlType="submit" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              เพิ่มในรายการ
            </Button>
          </Form>
        </div>
      </Modal>

      {/* ปุ่ม รับสินค้าที่มีอยู่แล้ว กล้อง */}
      <Modal width={600} title={null} open={ModelOldProductScan} onCancel={() => { ChangeStateModelOldProductScan(false); setOnOffScan(false); }} footer={null} style={{ borderRadius: '12px', }}>
        <div>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'environment' }} width={900} height={500} />
          <p style={{ marginTop: "20px", fontSize: "20px" }}>Scanned Code: {ResaultScan}</p>
        </div>
      </Modal>

      {/* ยืนยันรายการรับสินค้า */}
      <Modal width={500} footer={null} open={ModelConfirmProduct} onCancel={() => ChangeStateModelConfirmProduct(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 500, fontSize: "20px", marginBottom: "10px" }}>ยืนยันการรับสินค้า</b>
          <div>
            <Button onClick={() => ChangeStateModelConfirmProduct(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => AddListReceiveProduct()} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ยืนยันการรับสินค้า
            </Button>
          </div>
        </div>
      </Modal>


      <Modal width={500} footer={null} open={ModeConfirmDelete} onCancel={() => ChangeStateConfirmDelete(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 480, fontSize: "25px", marginBottom: "10px" }}>ลบสินค้าออกจากรายการ?</b>
          <Image src={selectedProduct?.Path} alt="product" style={{ height: "150px", width: "auto", borderRadius: "10px", }} />
          <p style={{ marginTop: "15px", fontSize: "20px", }}>{selectedProduct?.Name}</p>
          <div>
            <Button onClick={() => ChangeStateConfirmDelete(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => handleConfirmDelete()} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ลบสินค้า
            </Button>
          </div>
        </div>
      </Modal>

      <div style={{ display: "flex", flexDirection: "row", marginLeft: expanded ? "340px" : "100px", marginTop: "10px", transition: 'margin-left 0.6s ease', }}>
        {/* ปุ่มสแกน Barcode */}
        <Button type="primary" style={{ height: "38px", width: "150px", backgroundColor: "#f74f98", transition: "background-color 0.1s ease", fontFamily: "'Mitr', sans-serif", color: "white", fontSize: "21px", fontWeight: 400, }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f282b3")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f74f98")}
          onClick={() => {
            ChangeStateModelOldProductScan(true); // เปิด Modal
            setOnOffScan(true); // เริ่มการทำงานของ codeReader
          }}>
          สแกนบาร์โค้ด
        </Button>

        {/* ปุ่มสินค้าใหม่ */}
        <Button type="primary" style={{ marginLeft: "15px", height: "38px", width: "150px", backgroundColor: "#f74f98", transition: "background-color 0.1s ease", fontFamily: "'Mitr', sans-serif", color: "white", fontSize: "21px", fontWeight: 400, }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f282b3")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f74f98")}
          onClick={() => ChangeStateModelNewProduct(true)}>
          สินค้าใหม่
        </Button>

        <Button type="primary" style={{ position: "absolute", right: "20px", height: "38px", width: "260px", backgroundColor: "#f74f98", fontFamily: "'Mitr', sans-serif", color: "white", fontSize: "21px", fontWeight: 400, transition: 'margin-left 0s ease', }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f282b3")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f74f98")}
          onClick={() => {
            if (ReceiveProductList.length === 0) {
              messageApi.open({ type: "warning", content: "รายการสินค้าว่างอยู่แล้ว" });
            } else {
              SetClearAllReceiveProduct(true);
            }
          }}>
          ล้างรายการสินค้าทั้งหมด
        </Button>
      </div>

      <Modal width={500} footer={null} open={ModelSetClearAllReceiveProduct} onCancel={() => SetClearAllReceiveProduct(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 500, fontSize: "20px", marginBottom: "10px" }}>ยืนยันการล้างรายการทั้งหมด</b>
          <div>
            <Button onClick={() => SetClearAllReceiveProduct(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => ClilkClearAllReceiveProduct()} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ยืนยัน
            </Button>
          </div>
        </div>
      </Modal>



      <Card style={{ boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.84)", width: expanded ? 'calc(100% - 340px)' : 'calc(100% - 120px)', height: 'calc(100vh - 245px)', marginTop: '20px', marginLeft: expanded ? '320px' : '100px', transition: 'margin-left 0.6s ease, width 0.6s ease', }} >
        {/* ตารางรายการรับสินค้า */}
        <Table scroll={{ y: 580 }} rowKey="ID" dataSource={ReceiveProductList} columns={ColumnsReceiveProduct} pagination={false} style={{ marginTop: '-8px', marginLeft: "25px", marginRight: "20px", transition: 'margin-left 0.6s ease', }} />
      </Card>

      <Card style={{ position: "fixed", bottom: "15px", boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.84)", width: expanded ? 'calc(100% - 340px)' : 'calc(100% - 120px)', height: '100px', marginTop: '20px', marginLeft: expanded ? '320px' : '100px', transition: 'margin-left 0.6s ease, width 0.6s ease', }} >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          {/* ปุ่ม เพิ่มรายการสินค้า */}
          <Form form={FormTotalPrice} name='PriceReceiving' style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "30px", fontWeight: 500 }}
            onFinish={(values) => {
              if (ReceiveProductList.length === 0) {
                messageApi.open({ type: "warning", content: "ไม่มีรายการสินค้า" });
                return;
              }
              SetPriceReceiving(values.priceproduct);
              ChangeStateModelConfirmProduct(true);
            }} autoComplete="off">

            <p style={{ fontSize: "20px", fontWeight: "33px", marginTop: "-20px" }}>ราคารวมทั้งหมด</p>
            <Form.Item name="priceproduct" rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ width: "400px", marginLeft: expanded ? ("40px") : ("10px"), transition: 'margin-left 0.6s ease', }}>
              <InputNumber min={1} step={1} precision={2} parser={(value) => { const parsed = parseFloat(value || "0"); return isNaN(parsed) ? 1 : parsed; }} style={{ fontFamily: "'Mitr', sans-serif", fontSize: "25px", height: "50px", width: "200px" }} />
            </Form.Item>

            <Button disabled={editingID ? (true) : false} htmlType="submit" type="primary" style={{ marginTop: "-20px", position: "absolute", right: "35px", height: "43px", width: "170px", fontFamily: "'Mitr', sans-serif", backgroundColor: "#9400ce", color: "white", fontSize: "21px", fontWeight: 400, }}>
              เพิ่มสินค้า
            </Button>
            {/*  */}
          </Form>
        </div>
      </Card>


    </div>
  );
}

export default ReceiveProduct;


