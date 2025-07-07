import { Button, Image, Modal, Input, Form, InputNumber, Select, message, Card,  } from 'antd';
import { Table } from 'antd';
import { useState, useEffect } from 'react';
import type { TableColumnsType } from 'antd';
import { GetProductForOrganize, GetAllShelfZone, AddProductToShelfZone, MoveProductShelfZone, GetProductForDisposal, AddDisposal } from "../../services/https/aut/http";
import { ShelfZoneIF } from "../../interface/ShelfZone"
import SideBarZooSale from '../../component/zoosale/sidebar'; // @ts-ignore
import JsBarcode from 'jsbarcode';
import "./aut.css"
const { Option } = Select;
const { Search } = Input;
function Organizeproduct() {
  const [messageApi, contextHolder] = message.useMessage();

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


  const [formOganizeProduct] = Form.useForm();
  const [formMoveProduct] = Form.useForm();
  const [FormDisposal] = Form.useForm();
  
  const [ProductOrganize, setProductOrganize] = useState([]);

  const [ModelOganizeProductByID, StateModelOganizeProductByID] = useState(false); //popup จัดสินค้าเข้าชั้นวาง
  const [dataOganizeProductByID, setOganizeProductByID] = useState<any>(null);//ข้อมูลสินค้าที่จะจัด

  const [ModelMoveProductByID, StateModelMoveProductByID] = useState(false); //popup ย้ายชั้นวาง
  const [MoveProductByID, setMoveProductByID] = useState<any>(null);//ข้อมูลสินค้าที่จะย้าย


  const [DataShelfZone, setDataShelfZone] = useState<ShelfZoneIF[]>([]);

  const [filteredData, setFilteredData] = useState(ProductOrganize);
  const [searchField, setSearchField] = useState<string>("Name"); // ตัวเลือกเริ่มต้นคือค้นหาจาก "Name"

  const [DataDisposal, SetDataDisposal] = useState<any[]>([]); // กำหนดให้เป็น array
  const [ModelDisposal, SetModelDisposal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; quantityShelf: number } | null>(null);


  const handleSearch = (value: string) => {
    if (value === "") {
      setFilteredData(ProductOrganize); // แสดงรายการทั้งหมดเมื่อช่องค้นหาว่าง
    } else {
      const filtered = ProductOrganize.filter((product) => {
        // ค้นหาจากฟิลด์ที่เลือก เช่น "Name", "Price", "Piece", "QuantityShelf"
        return (product as any)[searchField]?.toString().toLowerCase().includes(value.toLowerCase());
      });
      setFilteredData(filtered);
    }
  };

  useEffect(() => {
    // เมื่อ dataProduct เปลี่ยนแปลงให้ตั้งค่า filteredData เป็น dataProduct
    setFilteredData(ProductOrganize);
  }, [ProductOrganize]);

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
          style={{borderRadius: "10px",}}
        />
      ),
      width: 50
    },
    { title: 'Product Name', dataIndex: 'Name', key: 'productname', width: 60, sorter: (a, b) => a.Name.localeCompare(b.Name), sortDirections: ['ascend', 'descend'],},
    { title: 'Price', dataIndex: 'Price', key: 'price', width: 50, sorter: (a, b) => a.Price - b.Price, sortDirections: ['ascend', 'descend'],},
    { title: 'จำนวน(Stock)', dataIndex: 'Piece', key: 'piece', width: 50, sorter: (a, b) => a.Piece - b.Piece, sortDirections: ['ascend', 'descend'],},
    { title: 'จำนวน(Shelf)', dataIndex: 'QuantityShelf', key: 'QuantityShelf', width: 60, sorter: (a, b) => a.QuantityShelf - b.QuantityShelf,  sortDirections: ['ascend', 'descend'],},
    { title: 'Barcode', dataIndex: 'Barcode', key: 'Barcode',  width: 50, sorter: (a, b) => a.Barcode.localeCompare(b.Barcode), sortDirections: ['ascend', 'descend'],},
    { title: 'ShelfZone', dataIndex: 'ShelfZone', key: 'ShelfZone', width: 50,
      render: (shelfZone: any) => shelfZone.ID !== 0 ? shelfZone.shelfname : 'No ShelfZone',  // ตรวจสอบก่อนเข้าถึง
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      width: 70,
      render: (keyid) => (   //render: (keyid)  ตรง keyid  เป็นชื่ออะไรก็ได้ คือข้อมูลทั้งหมดของตารางนี้
        <>
          <Button onClick={() => organizeProductByID(keyid)} type="primary" >
            จัดเข้าชั้นวาง
          </Button>

          {keyid.ShelfZone.ID !== 0 && (
            <Button onClick={() => moveShelfProduct(keyid)} type="primary" shape="default" style={{ marginLeft: "5px", backgroundColor: '#f74f98' }}>
              ย้ายชั้นวาง
            </Button>
          )}
        </>
      ),
    },
  ];


  const moveShelfProduct = async (keyid: any) => {
    console.log('ข้อมูลที่ส่งมาหลังกดปุ่มย้าย ', keyid);
    setMoveProductByID(keyid);

    if (keyid) {
      // เซตค่า shelfid ในฟอร์มเป็น ID แต่ยังคงแสดงชื่อชั้นวาง
      formMoveProduct.setFieldsValue({
        shelfid: keyid.ShelfZone.ID !== 0 ? keyid.ShelfZone.ID : undefined  //มันเป็นการ เซ็ตค่า value
      });                                                                    //แต่เป็นการบอกว่าให้เลือกตัวเลือกที่มี ID ตรงกันใน Option ที่มีอยู่ใน Select
    }
    getallShelfZone();
    StateModelMoveProductByID(true);
  };


  const ClickMoveProductShelfZone = async (data: any) => {
    console.log('ก่อนส่ง ClickMoveProductShelfZone', data);
    let { result, response } = await MoveProductShelfZone(data);
    if (response.status === 200) {
      getProductForOrganize();
      messageApi.open({ type: "success", content: result.message });
      StateModelMoveProductByID(false);
    }
    else {
      console.log("result", result.error)
    }
  }

  const organizeProductByID = async (keyid: any) => {   //ใช้การดึงรูป และข้อมูลจากตัวตารางเลยไม่ต้องดึงผ่าน Backend อีก
    console.log('ข้อมูลที่ส่งมาหลังกดปุ่ม ', keyid);
    if (keyid.Piece === 0){
      messageApi.open({ type: "error", content: "สินค้าใน Stock หมด" });
      return;
    }
    setOganizeProductByID(keyid);
    if (keyid) {
      formOganizeProduct.setFieldsValue({
        priceproduct: keyid.Price === 0 ? 1 : keyid.Price,
        quantityShelf: 1,
        shelfid: keyid.ShelfZone.ID !== 0 ? keyid.ShelfZone.ID : undefined     // * * * ใช้ตัวแปนที่ส่งเข้ามาเลยเพราะว่ามันอาจโหลดไม่ทัน
      });
    }
    getallShelfZone();
    StateModelOganizeProductByID(true);
  };

  const getallShelfZone = async () => {
    let res = await GetAllShelfZone();
    console.log('GetAllShelfZone', res);
    setDataShelfZone(res);
  };

  const ClickAddProductToShelfZone = async (data: any) => {
    console.log('ก่อนส่ง AddProductToShelfZone', data);

    let { response, result } = await AddProductToShelfZone(data);

    if (!response.ok) {
      messageApi.open({ type: "error", content: result.error });
    }
    else {
      getProductForOrganize();
      StateModelOganizeProductByID(false);
      messageApi.open({ type: "success", content: result.message });
      // // สร้าง modal container
      // const modalContainer = document.createElement('dialog');
      // modalContainer.style.width = '400px';
      // modalContainer.style.border = '1px solid #ccc';
      // modalContainer.style.padding = '20px';
      // modalContainer.style.borderRadius = '8px';
      // modalContainer.style.textAlign = 'center';
      // modalContainer.innerHTML = `
      //   <style>
      //     @media print {
      //       #printButton, #cancelButton {
      //         display: none; /* ซ่อนปุ่มในโหมดพิมพ์ */
      //       }
      //     }
      //   </style>
      //   <div class="label">
      //     <h3>${data.productName}</h3>
      //     <p>ราคา: ${data.priceproduct.toFixed(2)} บาท</p>
      //     <canvas id="barcode"></canvas>
      //     <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
      //       <button id="printButton" style="padding: 10px 20px; background: #007BFF; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
      //         พิมพ์
      //       </button>
      //       <button id="cancelButton" style="padding: 10px 20px; background: #FF4B4B; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
      //         ยกเลิก
      //       </button>
      //     </div>
      //   </div>
      // `;

      // // เพิ่ม modal ไปยัง body
      // document.body.appendChild(modalContainer);

      // // สร้างบาร์โค้ด
      // const barcodeCanvas = modalContainer.querySelector('#barcode') as HTMLCanvasElement;
      // JsBarcode(barcodeCanvas, data.BarcodeProduct, {
      //   format: 'CODE128',
      //   displayValue: true,
      // });

      // // เพิ่ม event ให้ปุ่มพิมพ์
      // const printButton = modalContainer.querySelector('#printButton') as HTMLButtonElement;
      // printButton.onclick = () => {
      //   modalContainer.setAttribute('style', 'display: block;'); // แก้ปัญหาไม่พิมพ์ modal
      //   window.print();
      // };

      // // เพิ่ม event ให้ปุ่มยกเลิก
      // const cancelButton = modalContainer.querySelector('#cancelButton') as HTMLButtonElement;
      // cancelButton.onclick = () => {
      //   modalContainer.close();
      //   modalContainer.remove();
      // };

      // // แสดง modal
      // modalContainer.showModal();
    }
  };


  const getProductForOrganize = async () => {
    let res = await GetProductForOrganize();
    console.log('getProductForOrganize', res);
    setProductOrganize(res);
  };

  const ProductDisposal = async () => {
    let { response, result } = await GetProductForDisposal();
    if (response.status === 200){
      console.log("ProductDisposal", result)
      SetDataDisposal(result.products);
      SetModelDisposal(true);
    }
    else{
      console.log(result)
      messageApi.open({ type: "error", content: result.message });
    }
  }

  
  const FormAddDisposal = async (data: any) => {
    console.log("Formจำหน่ายออก", data);
    const employeeid = Number(localStorage.getItem("employeeid"));
    const formattedData = {
      product_id: data.productid,
      quantity: data.quantitydisposal,
      reason: data.reason,
      employee_id: employeeid,
    };
    console.log("ก่อนจำหน่ายออก", formattedData);

    let { response, result } = await AddDisposal(formattedData);
    if (response.status === 200){
      console.log("AddDisposal", result);
      FormDisposal.resetFields();
      getProductForOrganize();
      SetModelDisposal(false);
      SetDataDisposal([]);
      setSelectedProduct(null);
      messageApi.open({ type: "success", content: result.message });
    }
    else{
      console.log(result)
      messageApi.open({ type: "error", content: result.error });
    }
  }

  useEffect(() => {
    getProductForOrganize();
  }, []);

  return (
    <div style={{ backgroundImage: "url('/ImgOganizeProduct/BGOganizeProduct.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh" }}>
      {contextHolder}
      <SideBarZooSale expanded={expanded} onToggle={handleSidebarToggle} />
      <nav
        style={{
          height: "52px",
          backgroundColor: "rgba(255, 255, 255, 0)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 1px 12px rgba(0, 0, 0, 0.)",
          color: "black",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: expanded? "740px" : "700px", marginTop: "10px", transition: 'margin-left 0.6s ease',}}>
          <Button type="primary" style={{ marginLeft: "-400px", height: "45px", marginRight: "200px", width: "200px", backgroundColor: "#f74f98", transition: "background-color 0.1s ease", fontFamily: "'Mitr', sans-serif", color: "white", fontSize: "21px", fontWeight: 400, }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f282b3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f74f98")}
            onClick={() => ProductDisposal()}
            >
            จำหน่ายออก
          </Button>

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
      <Modal width={600} open={ModelOganizeProductByID} onCancel={() => { StateModelOganizeProductByID(false); formOganizeProduct.resetFields(); }} footer={null} >
        {dataOganizeProductByID && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "20px", color: "#7C3AED" }}>จัดสินค้าเข้าชั้นวาง</h1>
            <Image src={`http://localhost:8000/${dataOganizeProductByID.Path}`} alt={dataOganizeProductByID.Name} style={{ width: "140px", height: "auto", borderRadius: "10px", }} />
            <p style={{ fontSize: "22px", marginTop: "10px", color: "#f74f98", }}>{dataOganizeProductByID.Name}</p>
            <p style={{ fontSize: "18px", marginBottom: "10px", color: "black", }}>{dataOganizeProductByID.Barcode}</p>

            <Form name='DataOganizeProduct' autoComplete="off" form={formOganizeProduct}
              onFinish={(values) => {
                const updatedValues = {
                  ...values,
                  productID: dataOganizeProductByID.ID,
                  productName: dataOganizeProductByID.Name,
                  BarcodeProduct: dataOganizeProductByID.Barcode//
                };
                ClickAddProductToShelfZone(updatedValues);
              }}
            >

              <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#FDF2F8", borderRadius: "10px", display: "flex", flexDirection: "column" }}>
                <div style={{ marginLeft: "20px" }}>
                  <p style={{ fontWeight: 400, fontSize: "16px", color: "#f74f98" }}>ราคา</p>
                  <Form.Item name="priceproduct" rules={[{ required: true, message: 'กรุณาระบุราคา' }]} style={{ width: "370px" }}>
                    <InputNumber min={1} step={0.01} precision={2} parser={(value) => { const parsed = parseFloat(value || "0"); return isNaN(parsed) ? 1 : parsed; }} style={{ width: "370px" }} />
                  </Form.Item>
                </div>
              </div>

              <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#F5F3FF", borderRadius: "10px", display: "flex", flexDirection: "column", marginTop: "15px" }}>
                <div style={{ marginLeft: "20px" }}>
                  <p style={{ fontWeight: 400, fontSize: "16px", color: "#9400ce" }}>จำนวนที่จัดเข้าชั้นวาง</p>
                  <Form.Item name="quantityShelf" rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]} style={{ marginBottom: "30px", width: "250px" }}>
                    <InputNumber max={dataOganizeProductByID.Piece} min={1} step={1} style={{ width: "370px" }} parser={(value) => Math.floor(Number(value) || 0)} />
                  </Form.Item>
                </div>
              </div>

              <div style={{ padding: "10px", width: "430px", height: "95px", backgroundColor: "#FFFBEB", borderRadius: "10px", display: "flex", flexDirection: "column", marginTop: "15px" }}>
                <div style={{ marginLeft: "20px" }}>
                  <p style={{ fontWeight: 400, fontSize: "16px", color: "#F7B22C" }}>ชั้นวาง</p>
                  <Form.Item name="shelfid" rules={[{ required: true, message: 'กรุณาเลือกชั้นวาง' }]} style={{ marginBottom: "30px", width: "250px" }}>
                    <Select disabled={dataOganizeProductByID?.ShelfZone?.ID !== 0} style={{ width: "370px" }}>
                      {DataShelfZone.map(Shelf => (
                        <Option key={Shelf.ID} value={Shelf.ID}>{Shelf.shelfname}</Option>))}
                      {/*ค่า value ใน Option เป็นตัวที่ถูกส่งไปเมื่อผู้ใช้เลือกตัวเลือกนั้น*/}
                    </Select>
                  </Form.Item>
                  <p style={{ marginTop: "-28px", fontWeight: 300, fontSize: "15px", color: "black" }}>{dataOganizeProductByID.ShelfZone.ID !== 0 ? (<p>กรุณาทำการเลือกการย้ายชั้นวางหากต้องการ</p>) : (<p></p>)}</p>
                </div>
              </div>

              <div style={{ marginTop: "25px" }}>
                <Button type="primary" onClick={() => StateModelOganizeProductByID(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "200px", height: "38px", }}>
                  ยกเลิก
                </Button>

                <Button type="primary" htmlType="submit" style={{ fontWeight: 400, color: "white", backgroundColor: "#9400ce", width: "200px", height: "38px", marginLeft: "28px" }}>
                  จัดเข้าชั้นวาง
                </Button>
              </div>

            </Form>

          </div>
        )}
      </Modal>


      <Modal width={600} open={ModelDisposal} onCancel={() => SetModelDisposal(false)} footer={null}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontWeight: 500, fontSize: '20px', marginBottom: '20px', color: '#7C3AED' }}>จำหน่ายสินค้าออก</h1>
          <Form
            form={FormDisposal}
            name="FormDisposal"
            autoComplete="off"
            onFinish={(values) => {
              // console.log('Form Values:', values);
              FormAddDisposal(values);
            }}
          >
            {/* สินค้าที่จะจำหน่ายออก */}
            <div style={{ padding: '10px', width: '430px', backgroundColor: '#FFFBEB', borderRadius: '10px', marginBottom: '15px' }}>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ fontWeight: 400, fontSize: '16px', color: '#F7B22C' }}>สินค้าที่จะจำหน่ายออก</p>
                <Form.Item name="productid" rules={[{ required: true, message: 'กรุณาเลือกสินค้า' }]} style={{ marginBottom: '30px', width: '250px' }}>
                  <Select
                    style={{ width: '370px' }}
                    onChange={(value) => {
                      const product = DataDisposal.find((Dis) => Dis.ID === value);
                      if (product) {
                        setSelectedProduct({ id: product.ID, quantityShelf: product.QuantityShelf });
                      }
                    }}
                  >
                    {DataDisposal.map((Dis) => (
                      <Option key={Dis.ID} value={Dis.ID}>
                        ชื่อ: {Dis.Name} บาร์โค้ด: {Dis.Barcode}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* จำนวนที่จำหน่ายออก */}
            <div style={{ padding: '10px', width: '430px', backgroundColor: '#F5F3FF', borderRadius: '10px', marginTop: '15px' }}>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ fontWeight: 400, fontSize: '16px', color: '#9400ce' }}>จำนวนที่จำหน่ายออก</p>
                <Form.Item
                  name="quantitydisposal"
                  rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}
                  style={{ marginBottom: '30px', width: '250px' }}
                >
                  <InputNumber
                    disabled={selectedProduct === null}
                    max={selectedProduct?.quantityShelf || 1}
                    min={1}
                    step={1}
                    style={{ width: '370px' }}
                    parser={(value) => Math.floor(Number(value) || 0)}
                  />
                </Form.Item>
              </div>
            </div>

            {/* เหตุผล */}
            <div style={{ padding: '10px', width: '430px', backgroundColor: '#FDF2F8', borderRadius: '10px', marginTop: "15px" }}>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ fontWeight: 400, fontSize: '16px', color: '#f74f98' }}>เหตุผล</p>
                <Form.Item name="reason" rules={[{ required: true, message: 'กรุณาระบุเหตุผล' }]} style={{ width: '370px' }}>
                  <Input style={{ width: '370px' }} />
                </Form.Item>
              </div>
            </div>

            {/* ปุ่ม */}
            <div style={{ marginTop: '25px' }}>
              <Button
                type="primary"
                onClick={() => SetModelDisposal(false)}
                style={{ color: 'black', backgroundColor: '#e2e2e2', width: '200px', height: '38px' }}
              >
                ยกเลิก
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                style={{ fontWeight: 400, color: 'white', backgroundColor: '#9400ce', width: '200px', height: '38px', marginLeft: '28px' }}
              >
                จำหน่ายสินค้าออก
              </Button>
            </div>
          </Form>
        </div>
      </Modal>




      <Modal width={500} open={ModelMoveProductByID} onCancel={() => { StateModelMoveProductByID(false); formMoveProduct.resetFields(); }} footer={null}>
        {MoveProductByID && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "20px", color: "#7C3AED" }}>ย้ายสินค้า</h1>
            <Image src={`http://localhost:8000/${MoveProductByID.Path}`} alt="Product" style={{ width: "140px", height: "auto", borderRadius: "10px", }} />
            <p style={{ fontSize: "22px", marginTop: "10px", color: "#f74f98", }}>{MoveProductByID.Name}</p>

            <Form name='DataMoveProduct' autoComplete="off" form={formMoveProduct}
              onFinish={(value) => {
                if (value.shelfid === MoveProductByID.ShelfZone.ID) {
                  messageApi.open({ type: "warning", content: "ท่านเลือกชั้นวางเดิม" });
                  return;
                }
                const updatedValues = {
                  ...value,
                  productID: MoveProductByID.ID,
                };
                ClickMoveProductShelfZone(updatedValues);
              }}>



              <div style={{ padding: "10px", width: "430px", height: "90px", backgroundColor: "#F5F3FF", borderRadius: "10px", display: "flex", flexDirection: "column", marginTop: "15px" }}>
                <div style={{ marginLeft: "20px" }}>
                  <p style={{ fontWeight: 400, fontSize: "16px", color: "#9400ce" }}>ชั้นวางที่จะเปลี่ยน</p>
                  <Form.Item name="shelfid" rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]} style={{ marginBottom: "30px", width: "250px" }}>
                    <Select style={{ width: "370px", height: "40px" }}>
                      {DataShelfZone.map(Shelf => (
                        <Option key={Shelf.ID} value={Shelf.ID}>{/*ค่า value ใน Option เป็นตัวที่ถูกส่งไปเมื่อผู้ใช้เลือกตัวเลือกนั้นๆ  (ตัวเลือกที่ส่งไปตอนกด submit)*/}
                          {Shelf.shelfname} {/* เราต้องการให้ผู้ใช้เห็น ชื่อ ของชั้นวาง (shelfname), ดังนั้นในแต่ละ Option เราจะกำหนดค่า value ให้เป็น ID (ที่เป็นค่าที่ต้องการส่งไป) แต่ให้แสดง shelfname (ชื่อของชั้นวาง) เป็นเนื้อหาภายใน Option*/}
                          {/*การเพิ่ม value ช่วยให้เราสามารถทำให้ข้อมูลที่ส่งออกไปเป็นสิ่งที่เราต้องการ เช่น ID */}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div style={{ marginTop: "25px" }}>
                <Button type="primary" onClick={() => StateModelMoveProductByID(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "200px", height: "38px", }}>
                  ยกเลิก
                </Button>

                <Button type="primary" htmlType="submit" style={{ fontWeight: 400, color: "white", backgroundColor: "#9400ce", width: "200px", height: "38px", marginLeft: "28px" }}>
                  ย้ายชั้นวาง
                </Button>
              </div>

            </Form>
          </div>
        )}
      </Modal>



      <Card style={{ boxShadow: "0 1px 20px rgba(0, 0, 0, 10)", backgroundColor: "rgba(255, 255, 255, 0.84)", width: expanded ? 'calc(100% - 340px)' : 'calc(100% - 120px)', height: '820px', marginTop: '20px', marginLeft: expanded ? '320px' : '100px', transition: 'margin-left 0.6s ease, width 0.6s ease', }} >
        <Table columns={columns} dataSource={filteredData} rowKey="ID" scroll={{ y: 'calc(100vh - 260px)' }} pagination={{ pageSize: 20 }} />
      </Card>
    </div>
  );
}

export default Organizeproduct;
