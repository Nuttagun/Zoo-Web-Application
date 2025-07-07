// @ts-ignore
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Avatar, Divider, Space, Table, Tag, Typography } from 'antd';
// @ts-ignore
import type { TableProps, TableColumnsType } from 'antd';
// @ts-ignore
import { Upload, Button, Image, Modal, Input, Form, message, InputNumber, Card, Row, Col, Select } from 'antd';
// @ts-ignore
import ImgCrop from 'antd-img-crop'; // @ts-ignore
import { EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { getAllProductStock, GetDataEmployeeByID, DeleteProductByID, AddEditProduct } from "../../services/https/aut/http";
import type { UploadFile } from 'antd/es/upload/interface';
import SideBarZooSale from '../../component/zoosale/sidebar';
import { ProductListMainIF } from "../../interface/ProductListMainIF"
import "./aut.css"
import { UsersInterface } from '../../interface/IUser';
import { getUserById } from '../../services/https';
const { Search } = Input;
const { Option } = Select;


function ZooShop() {
  const [FormEditProduct] = Form.useForm();
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

  const [editFileList, setEditFileList] = useState<UploadFile[]>([]); // สำหรับการแก้ไขรูปภาพในแถว
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage(); // Initialize message API


  const [dataProduct, setDataProduct] = useState<ProductListMainIF[]>([]); // เพิ่ม state สำหรับเก็บข้อมูลสินค้า

  const [ModelEditProduct, StateModelEditProduct] = useState(false); //โมเดลแก้ไข 
  const [ModelDeleteProduct, StateModelDeleteProduct] = useState(false);  //โมเดลปุ่มลบ
  const [selectedProduct, setSelectedDeleteProduct] = useState<any | null>(null);  //ข้อมูลสินค้าเลือกลบ
  const [SelectedEditProduct, setSelectedEditProduct] = useState<ProductListMainIF | null>(null);  //ข้อมูลสินค้าเลือกแก้ไข

  const [filteredData, setFilteredData] = useState(dataProduct);
  const [searchField, setSearchField] = useState<string>("Name"); // ตัวเลือกเริ่มต้นคือค้นหาจาก "Name"

  // ฟังก์ชันการค้นหา
  const handleSearch = (value: string) => {
    if (value === "") {
      setFilteredData(dataProduct); // แสดงรายการทั้งหมดเมื่อช่องค้นหาว่าง
    } else {
      const filtered = dataProduct.filter((product) => {
        // ค้นหาจากฟิลด์ที่เลือก เช่น "Name", "Price", "Piece", "QuantityShelf"
        return (product as any)[searchField]?.toString().toLowerCase().includes(value.toLowerCase());
      });
      setFilteredData(filtered);
    }
  };


  useEffect(() => {
    // เมื่อ dataProduct เปลี่ยนแปลงให้ตั้งค่า filteredData เป็น dataProduct
    setFilteredData(dataProduct);
  }, [dataProduct]);


  const handleImageEdit = (info: { fileList: UploadFile[] }) => {
    // จำกัดให้แสดงไฟล์ใน fileList มีแค่ 1 รูป
    setEditFileList(info.fileList.slice(0, 1));
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

  const columns: TableColumnsType = [
    {
      title: 'Image',
      key: 'ID',
      dataIndex: 'Path', // ดึงค่า Path จากข้อมูล
      render: (path: string) => (
        <Image
          width={90}
          src={`http://localhost:8000/${path}`} // ใช้ path ที่ดึงมาจากฐานข้อมูล
          alt="ProductImage"
          style={{ borderRadius: "10px", }}
        />
      ),
      width: 60
    },
    { title: 'Product Name', dataIndex: 'Name', key: 'productname', width: 80, sorter: (a, b) => a.Name.localeCompare(b.Name), sortDirections: ['ascend', 'descend'], },
    { title: 'Price', dataIndex: 'Price', key: 'price', width: 60, sorter: (a, b) => a.Price - b.Price, sortDirections: ['ascend', 'descend'], },
    { title: 'จำนวน(Stock)', dataIndex: 'Piece', key: 'piece', width: 60, sorter: (a, b) => a.Piece - b.Piece, sortDirections: ['ascend', 'descend'], },
    {
      title: 'จำนวน(Shelf)', dataIndex: 'QuantityShelf', key: 'QuantityShelf', width: 60, sorter: (a, b) => a.QuantityShelf - b.QuantityShelf, sortDirections: ['ascend', 'descend'],
      render: (quantity) => {
        ///// กำหนดสีตาม QuantityShelf
        const color = quantity === 0 ? 'volcano' : 'green';
        return (
          <Tag style={{ fontFamily: "'Mitr', sans-serif" }} color={color} >
            {quantity}
          </Tag>
        );
      },
    },

    { title: 'Barcode', dataIndex: 'Barcode', key: 'Barcode', width: 50, sorter: (a, b) => a.Barcode.localeCompare(b.Barcode), sortDirections: ['ascend', 'descend'], },
    {
      title: 'ShelfZone', dataIndex: 'ShelfZone', key: 'ShelfZone', width: 50,
      render: (shelfZone: any) => shelfZone.ID !== 0 ? shelfZone.shelfname : 'No ShelfZone',  // ตรวจสอบก่อนเข้าถึง
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      width: 70,
      // @ts-ignore
      render: (record) => (
        <>
          <Button onClick={() => handleEditProduct(record)} type="primary" >
            แก้ไข
          </Button>
          <Button onClick={() => handleDeleteProduct(record)} style={{ marginLeft: 10 }} type="primary" danger>
            ลบ
          </Button>
        </>
      ),
    },
  ];

  const getAllProductStocks = async () => {
    let res = await getAllProductStock();
    console.log('getAllProductStock', res);
    setDataProduct(res);
  };

  const getDataEmployeeByID = async () => {
    const userid = localStorage.getItem('userid');
    let res = await GetDataEmployeeByID(userid);
    console.log("getdataEmployee", res);
    localStorage.setItem('employeeid', res.employee);
    localStorage.setItem('profilezoosale', res.profile_base64);
    console.log('employeeid', localStorage.getItem('employeeid'));
  };

  const handleDeleteProduct = (product: any) => {
    setSelectedDeleteProduct(product); // เก็บข้อมูลสินค้าที่จะลบไว้
    StateModelDeleteProduct(true); // เปิด Modal
  };

  const handleConfirmDelete = async () => {
    console.log("Product Delete", selectedProduct.ID);
    let { response, result } = await DeleteProductByID(selectedProduct.ID);
    if (response.status === 200) {
      getAllProductStocks();
      StateModelDeleteProduct(false);
      messageApi.open({ type: "success", content: result.message });
    }
    else {
      messageApi.open({ type: "error", content: result.error });
    }
  };

  const handleEditProduct = (product: any) => {
    console.log(product);
    // ดึงชื่อ shelfname ออกมาจาก ShelfZone
    const shelfname = product?.ShelfZone.ID !== 0 ? product.ShelfZone.shelfname : "";
    console.log("shelfname", shelfname);
    setSelectedEditProduct({
      ...product,
      shelfname: shelfname,
    });
    // StateModelEditProduct(true);
  };

  useEffect(() => {
    if (SelectedEditProduct) {
      FormEditProduct.setFieldsValue({
        nameproduct: SelectedEditProduct?.Name,
        priceproduct: SelectedEditProduct?.Price === 0 ? 1 : SelectedEditProduct?.Price, // ถ้า Price เป็น 0 เซ็ตเป็น 1
        pieceproduct: SelectedEditProduct?.Piece,
        quantityshelfproduct: SelectedEditProduct?.QuantityShelf,
        barcodeproduct: SelectedEditProduct?.Barcode,
        shelfzone: SelectedEditProduct?.shelfname
      });
      console.log("SelectedEditProduct", SelectedEditProduct);
      StateModelEditProduct(true);
    }
  }, [SelectedEditProduct]);

  const ClickEditProduct = async (values: any) => {
    console.log("กด แก้ไขข้อมูลสินค้า:", values);
    const formData = new FormData();
    // เพิ่มข้อมูลที่จะแก้ไขลงใน FormData
    // ตรวจสอบว่า SelectedEditProduct ไม่เป็น null หรือ undefined
    if (SelectedEditProduct) {
      formData.append('idproduct', SelectedEditProduct.ID.toString());
    } else {
      console.error('SelectedEditProduct is null or undefined');
      return;
    }
    formData.append('nameproduct', values.nameproduct);
    formData.append('priceproduct', values.priceproduct.toString());
    //formData.append('pieceproduct', values.pieceproduct.toString());
    //formData.append('quantityshelfproduct', values.quantityshelfproduct.toString());
    formData.append('barcodeproduct', values.barcodeproduct);
    //formData.append('shelfzone', values.shelfzone || '');

    // เพิ่มรูปภาพใหม่ลงใน FormData (ถ้ามี)
    if (editFileList.length > 0) {
      const file = editFileList[0].originFileObj; // ดึงไฟล์จาก fileList
      if (file) {
        formData.append('image', file);
      }
    } else {
      formData.append('image', ''); // กรณีไม่มีรูปใหม่
    }
    console.log("ข้อมูลที่ส่งไปใน FormData:");
    formData.forEach((value, key) => {
      console.log(key, value);
    });
    EditProduct(formData);
  };


  const EditProduct = async (formData: any) => {
    let { response, result } = await AddEditProduct(formData);
    if (response.status === 200) {
      getAllProductStocks();
      StateModelEditProduct(false);
      setEditFileList([]);
      messageApi.open({ type: "success", content: result.message });
    }
    else {
      messageApi.open({ type: "error", content: result.error });
    }
  };


  useEffect(() => {
    getAllProductStocks();
    getDataEmployeeByID();
    navigate("/zoosale/managezooshop");
    localStorage.setItem('activeButton', 'home');
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [userid, setUserid] = useState<number>(Number(localStorage.getItem("userid")) || 0);
  const getUser = async () => {
          let res = await getUserById(userid.toString());
          console.log(res);
          if (res) {
              setUser(res);
          }
        };
  
      useEffect(() => {
          setUserid(Number(localStorage.getItem("userid")));
          getUser();
        }, []);

  // backgroundImage: "url('/path/to/your/image.jpg')",  // ระบุ path ของรูปภาพ
  // backgroundSize: "cover",  // ทำให้รูปขยายเต็มพื้นที่
  // backgroundPosition: "center",  // จัดตำแหน่งรูปให้อยู่ตรงกลาง
  // backgroundRepeat: "no-repeat",  // ไม่ต้องการให้รูปซ้ำ
  return (
    <div style={{ backgroundImage: "url('/ImgZoosale/background.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh" }}>
      {contextHolder}
      {/* สินค้าใหม่ */}

      <Modal width={600} open={ModelEditProduct} onCancel={() => { FormEditProduct.resetFields(); StateModelEditProduct(false) }} footer={null}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "20px", color: "#7C3AED" }}>แก้ไขข้อมูลสินค้า</h1>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: "25px" }}>{/* ตรงนี้ทำให้รูปเดิมและตรงส่วนอัพโหลดอยู่ในแนวนอนเเหมือนกัน */}
            <Image src={`http://localhost:8000/${SelectedEditProduct?.Path}`} alt="product" style={{ width: "180px", height: "auto", borderRadius: "10px", }} />
            <div style={{ border: "2px dashed rgb(247, 109, 155)", padding: "10px", width: "230px", height: "180px", borderRadius: "10px", marginLeft: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
              <p style={{ fontWeight: 400, fontSize: "16px", marginBottom: "5px", color: "#f74f98" }}>อัพโหลดรูปใหม่</p>
              <ImgCrop rotationSlider>
                <Upload
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
                  {editFileList.length < 1 && (<span style={{ color: "#f74f98" }}>+ Upload</span>)}
                </Upload>
              </ImgCrop>
            </div>
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

          <Form form={FormEditProduct} name='DataStockProduct' onFinish={ClickEditProduct} autoComplete="off" >

            <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#FDF2F8", borderRadius: "10px", display: "flex", flexDirection: "column" }}>
              <div style={{ marginLeft: "20px" }}>
                <p style={{ fontWeight: 400, fontSize: "16px", color: "#f74f98" }}>ชื่อสินค้า</p>
                <Form.Item name="nameproduct" rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]} style={{ width: "370px" }}>
                  <Input style={{ fontSize: "15px" }} />
                </Form.Item>
              </div>
            </div>

            <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#F5F3FF", borderRadius: "10px", display: "flex", flexDirection: "column", marginTop: "15px" }}>
              <div style={{ marginLeft: "20px" }}>
                <p style={{ fontWeight: 400, fontSize: "16px", color: "#9400ce" }}>ราคา</p>
                <Form.Item name="priceproduct" initialValue={1} rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "30px", width: "250px" }}>
                  <InputNumber min={1} step={0.01} precision={2} parser={(value) => { const parsed = parseFloat(value || "0"); return isNaN(parsed) ? 1 : parsed; }} style={{ width: "370px" }} />
                </Form.Item>
              </div>
            </div>

            {/* <Form.Item label="จำนวน(Stock)" name="pieceproduct" initialValue={1} rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "30px", width: "250px" }}>
              <InputNumber min={1} step={1} parser={(value) => parseInt(value || "1", 10)} style={{ width: "100%" }} />
            </Form.Item> */}
            {/* <Form.Item label="จำนวน(Shelf)" name="quantityshelfproduct" initialValue={1} rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "30px", width: "250px" }}> */}
            {/* <InputNumber min={/*SelectedEditProduct?.shelfname ? 1 : *//*0} disabled={SelectedEditProduct?.shelfname === ""} step={1} parser={(value) => parseInt(value || "1", 10)} style={{ width: "100%" }} /> */}
            {/* </Form.Item> */}

            <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#FFFBEB", borderRadius: "10px", display: "flex", flexDirection: "column", marginTop: "15px" }}>
              <div style={{ marginLeft: "20px" }}>
                <p style={{ fontWeight: 400, fontSize: "16px", color: "#F7B22C" }}>บาร์โค้ด</p>
                <Form.Item name="barcodeproduct" rules={[{ required: true, message: 'กรุณากรอกBarcode' }, { pattern: /^[a-zA-Z0-9]+$/, message: 'กรอกเฉพาะตัวเลขและอักษรภาษาอังกฤษเท่านั้น', }, { len: 13, message: 'กรอกบาร์โค้ด 13 ตัวอักษร', }]} style={{ marginBottom: "30px", width: "250px" }}>
                  <Input maxLength={13} style={{ width: "370px" }} />
                </Form.Item>
              </div>
            </div>
            {/* <Form.Item label="ชั้นวาง" name="shelfzone" style={{ marginBottom: "30px", width: "250px" }}>
              <Input disabled style={{ width: "100%" }} />
            </Form.Item> */}

            <div style={{ marginTop: "25px" }}>
              <Button type="primary" onClick={() => StateModelEditProduct(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "200px", height: "38px", }}>
                ยกเลิก
              </Button>

              <Button type="primary" htmlType="submit" style={{ fontWeight: 400, color: "white", backgroundColor: "#9400ce", width: "200px", height: "38px", marginLeft: "28px" }}>
                แก้ไขสินค้า
              </Button>
            </div>

          </Form>
        </div>
      </Modal>

      <Modal width={500} footer={null} open={ModelDeleteProduct} onCancel={() => StateModelDeleteProduct(false)} style={{ borderRadius: '12px', }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <b style={{ fontWeight: 480, fontSize: "25px", marginBottom: "10px" }}>ยืนยันการลบสินค้า?</b>
          <Image src={`http://localhost:8000/${selectedProduct?.Path}`} alt="product" style={{ height: "150px", width: "auto", borderRadius: "10px", }} />
          <p style={{ marginTop: "15px", fontSize: "20px", }}>{selectedProduct?.Name}</p>
          <div>
            <Button onClick={() => StateModelDeleteProduct(false)} type="primary" style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
              ยกเลิก
            </Button>
            <Button onClick={() => handleConfirmDelete()} type="primary" style={{ color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", margin: "20px 20px 0px 20px" }}>
              ลบ
            </Button>
          </div>
        </div>
      </Modal>

      <SideBarZooSale expanded={expanded} onToggle={handleSidebarToggle} />
      <nav
        style={{
          height: "50px",
          backgroundColor: "rgba(255, 255, 255, 0)",
          backdropFilter: "blur(0px)",
          boxShadow: "0 1px 12px rgba(0, 0, 0, 0.00)",
          color: "black",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: expanded ? "740px" : "700px", marginTop: "10px", transition: 'margin-left 0.6s ease', }}>
          <Select
            defaultValue="Name"
            style={{ width: "150px", height: "38px" }}
            onChange={(value) => setSearchField(value)}
          >
            <Option value="Name">Name</Option>
            <Option value="Price">Price</Option>
            <Option value="Barcode">Barcode</Option>
            <Option value="Piece">Piece (Stock)</Option>
            <Option value="QuantityShelf">Quantity (Shelf)</Option>
          </Select>

          <Search
            allowClear
            placeholder={`Search ${searchField}`}
            enterButton="Search"
            size="large"
            onChange={(e) => handleSearch(e.target.value)} // ค้นหาทันทีที่พิมพ์
            style={{
              width: "400px",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src={`data:image/jpeg;base64,${localStorage.getItem("profilezoosale") || ''}`} style={{ height: "50px", width: "50px", borderRadius: "50%", objectFit: "cover", marginTop: "8px" }} />
          <div style={{ color: "white" }}>
            <p style={{ fontSize: '20px', marginTop: '2px', color: "white", }} onClick={showModal} > <span style={{ marginRight: '5px' }}> {localStorage.getItem('firstnameuser')} </span> {localStorage.getItem('lastnameuser')}</p>
            <p style={{ fontSize: '15px', marginTop: '-3px', color: "white", }}>{localStorage.getItem('roleName')}</p>
          </div>
        </div>
      </nav>
      <Card style={{ boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.84)", width: expanded ? 'calc(100% - 340px)' : 'calc(100% - 120px)', height: 'calc(100vh - 110px)', marginTop: '20px', marginLeft: expanded ? '320px' : '100px', transition: 'margin-left 0.6s ease, width 0.6s ease', }} >
        <Table columns={columns} dataSource={filteredData} rowKey="ID" scroll={{ y: 'calc(100vh - 260px)' }} pagination={{ pageSize: 20 }} />
      </Card>
      {/* หน้าแก้ไขโปรไฟล์ */}
      <Modal
        title={<Typography.Title level={3}>User Profile</Typography.Title>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            if (user) {
              setIsModalVisible(false); // ปิด Modal
              navigate(`/zoosale/editprofile/${user.ID}`); // เปลี่ยนเส้นทาง
            }
          }} style={{ backgroundColor: "#fabb18" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ffcc33"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fabb18"}>
            Edit Profile
          </Button>,
          <Button key="close" onClick={handleCancel} type="primary" style={{ backgroundColor: "#E63946" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FF4D4F")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E63946")}>
            Close
          </Button>,
        ]}
      >
        {user ? (
          <Card bordered={false} style={{ textAlign: "center" }}>
            <Avatar size={120} src={user?.Profile ? `http://localhost:8000/${user.Profile}` : undefined} icon={!user?.Profile && <UserOutlined />} />
            <Typography.Title level={4} style={{ marginTop: "10px" }}>
              {user.FirstName}
            </Typography.Title>
            <Divider />
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Row>
                <Col span={24} style={{ textAlign: "left" }}>
                  <Typography.Text>
                    <MailOutlined style={{ marginRight: 8 }} /> {user.Email}
                  </Typography.Text>
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ textAlign: "left" }}>
                  <Typography.Text>
                    <PhoneOutlined style={{ marginRight: 8 }} /> {user.PhoneNumber}
                  </Typography.Text>
                </Col>
              </Row>
            </Space>
          </Card>
        ) : (
          <Typography.Text>Loading...</Typography.Text>
        )}
      </Modal>
    </div>
  );
}
export default ZooShop;  ///    /คือเปลี่ยนไปเป็นตัวนั้นเลย   ../  ก็เหมื่อนกับออก Directory