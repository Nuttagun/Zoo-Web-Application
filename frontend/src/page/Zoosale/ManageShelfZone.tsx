/**เด้งง popup ตั้งชื่อกล่องและเก็บตำแหน่งกล่องนั้นไว้ได้ด้วย แสดงค่ากล่องออกมาดู และลบได้ แก้ไขและเปลี่ยนสีได้ตรง consolelog แก้ได้ตรง/////*/
import  { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import SideBarZooSale from '../../component/zoosale/sidebar';
import { AddShelfZoneData, getAllDataShelf, ConfirmDeleteUpdateShelf } from "../../services/https/aut/http";
import {  Button, Image, Modal, Input, Form, message, Card } from 'antd';
import "./aut.css" // @ts-ignore
import { colors } from '@mui/material';

interface Shelf {
    id: string;
    name: string;
    color: string;
    width: number;
    height: number;
    x: number;
    y: number;
}

function ManageShelfZone() {
    const [messageApi, contextHolder] = message.useMessage(); // Initialize message API

    /*SideBar */
    const [expanded, setExpanded] = useState(() => {
        const savedExpanded = localStorage.getItem('expanded');
        const expandedValue = savedExpanded ? JSON.parse(savedExpanded) : true;
        console.log("Loaded expanded from localStorage:", expandedValue); // Console log when loading
        return expandedValue;
    });

    const handleSidebarToggle = () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        localStorage.setItem('expanded', JSON.stringify(newExpanded));
        console.log("Saved expanded to localStorage:", newExpanded); // Console log when saving
    };


    const prepareShelfData = (shelves: Shelf[]) => {
        return shelves.map(shelf => ({
            id: shelf.id,            // เพิ่ม id ในข้อมูลที่จะส่ง
            shelfname: shelf.name,   // แมพกับ ShelfName ใน Go
            color: shelf.color,      // แมพกับ Color ใน Go
            height: shelf.height,    // แมพกับ Height ใน Go
            width: shelf.width,      // แมพกับ Width ใน Go
            positionx: shelf.x,      // แมพกับ Positionx ใน Go
            positiony: shelf.y       // แมพกับ Positiony ใน Go
        }));
    };

    const AddShelfData = async () => {
        const preparedData = prepareShelfData(shelves);
        console.log("ก่อนส่ง", preparedData);

        let { response, result } = await AddShelfZoneData(preparedData);
        console.log("หลัง AddShelfZoneData", response);
        console.log("หลังresult AddShelfZoneData", result);
        if (response.status === 200) {
            messageApi.open({ type: "success", content: result.message });
            setSelectedShelfId(null);
            getAllShelf();
        }
        else {
            messageApi.open({ type: "error", content: result.error });
        }
    };

    const getAllShelf = async () => {
        let { response, result } = await getAllDataShelf();
        // console.log("หลัง getAllShelf", response);
        if (response.status === 200) {
            console.log("ข้อมูลหลัง getAllShelf", result);
            const mappedShelves = result.map((item: any) => ({
                id: String(item.ID),
                name: item.shelfname,
                color: item.color,
                width: item.width,
                height: item.height,
                x: item.positionx,
                y: item.positiony
            }));

            // เก็บข้อมูลที่แมปแล้วลงใน localStorage
            localStorage.setItem('shelves', JSON.stringify(mappedShelves));

            // อัปเดต state ของ shelves
            setShelves(mappedShelves);
        }
    };


    const [shelves, setShelves] = useState<Shelf[]>(() => {
        const savedShelves = localStorage.getItem('shelves');
        const shelvesValue = savedShelves ? JSON.parse(savedShelves) : [];
        console.log("Loaded shelves from localStorage:", shelvesValue); // Console log when loading
        return shelvesValue;
    });
// @ts-ignore
    const [newShelfName, setNewShelfName] = useState('');// @ts-ignore
    const [newShelfColor, setNewShelfColor] = useState('#ff6347');
// @ts-ignore
    const [EditShelfName, setEditShelfName] = useState('');// @ts-ignore
    const [EditShelfColor, setEditShelfColor] = useState('#ff6347');
    
    const [showPopupAddShelf, setShowPopupAddShelf] = useState(false);
    const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
    // @ts-ignore
    const [confirmDeleteID, setConfirmDeleteID] = useState<string | null>(null); // id Shelf ที่จะลบ
    const [ConfirmDeleteShelf, SetConfirmDeleteShelf] = useState(false);

    const [showPopupEditShelf, setShowPopupEditShelf] = useState(false);

    const [formAddShelf] = Form.useForm();
    const [formEditShelf] = Form.useForm();

    const generateNumericId = () => {
        const now = new Date();
        const id = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${now.getDate()
                .toString()
                .padStart(2, "0")}-${now.getHours()
                    .toString()
                    .padStart(2, "0")}-${now.getMinutes()
                        .toString()
                        .padStart(2, "0")}-${now.getSeconds()
                            .toString()
                            .padStart(2, "0")}-${now.getMilliseconds()
                                .toString()
                                .padStart(3, "0")}`;
        return id;
    };



    const ClickAddShelf = () => {
        formAddShelf.resetFields();
        // setNewShelfName('');
        // setNewShelfColor('#ff6347');
        setShowPopupAddShelf(true);
    };

    const handleAddShelf = (addshelf: any) => {
        console.log("AddShelf", addshelf);
        if (!addshelf.nameShelf.trim()) {
            messageApi.open({ type: "warning", content: "Shelf name cannot be empty" });
            return;
        }

        // ตรวจสอบชื่อที่ซ้ำกัน
        const isDuplicateName = shelves.some(shelf => shelf.name === addshelf.nameShelf.trim());
        if (isDuplicateName) {
            messageApi.open({ type: "error", content: "ชื่อชั้นวางซ้ำกัน กรุณาตั้งชื่อใหม่" });
            return;
        }

        /*let updatedShelves;
        if (selectedShelfId === null) {
            // ถ้าไม่มีการเลือกกล่อง (สร้างใหม่)
            const newShelf: Shelf = {
                id: generateNumericId(),
                name: newShelfName.trim(),
                color: newShelfColor,
                width: 100,
                height: 100,
                x: 320,
                y: 70,
            };
            updatedShelves = [...shelves, newShelf];
        } else {
            // ถ้าเลือกกล่องที่จะแก้ไข
            updatedShelves = shelves.map(shelf =>
                shelf.id === selectedShelfId
                    ? { ...shelf, name: newShelfName, color: newShelfColor }
                    : shelf
            );
        }*/

        const newShelf: Shelf = {
            id: generateNumericId(),
            name: addshelf.nameShelf.trim(),
            color: addshelf.color,
            width: 100,
            height: 100,
            x: 320,
            y: 70,
        };
        const updatedShelves = [...shelves, newShelf];

        setShelves(updatedShelves);
        localStorage.setItem('shelves', JSON.stringify(updatedShelves));
        console.log("Saved shelves to localStorage:", updatedShelves); // Console log when saving

        formAddShelf.resetFields();
        // setNewShelfColor('#ff6347');
        setShowPopupAddShelf(false);
        setSelectedShelfId(null);  // รีเซ็ต selectedShelfId
    };

    const ClickEditShelf = () => {
        if (selectedShelfId === null) return;
        formEditShelf.resetFields();
        const selectedShelf = shelves.find(shelf => shelf.id === selectedShelfId);
        if (selectedShelf) {
            console.log("ชั้นวางที่กดแก้ไข: ", selectedShelf);
            formEditShelf.setFieldsValue({
                nameEditShelf: selectedShelf.name,
                color: selectedShelf.color, // เซ็ตค่าสี
            });
            // setEditShelfColor(selectedShelf.color);
            setShowPopupEditShelf(true);  // เปิด popup เมื่อแก้ไข
        }
    };

    const handleEditShelf = (editshelf: any) => {
        console.log("editShelf", editshelf);
        if (!editshelf.nameEditShelf.trim()) {
            messageApi.open({ type: "warning", content: "Shelf name cannot be empty" });
            return;
        }
    
        // ตรวจสอบชื่อที่ซ้ำกันเฉพาะเมื่อชื่อใหม่ต่างจากชื่อเดิม
        const isDuplicateName = shelves.some(shelf =>     // some() ซึ่งจะทำการวนผ่านแต่ละอีเลเมนต์ในอาร์เรย์ shelves
            shelf.name === editshelf.nameEditShelf.trim() && shelf.id !== selectedShelfId   //ชื่อชั้นวางใหม่ซ้ำกับชื่อชั้นวางที่มีอยู่ และ  ID ชั้นวางนั้นไม่ตรงกับที่เลือก   เพราะถ้าแก้ไขชั้นวางแค่สี  ชื่อก็เป็นชื่อเดิม  มันก็ถือว้าไม่ซ้ำ
        );
        if (isDuplicateName) {
            messageApi.open({ type: "error", content: "ชื่อชั้นวางซ้ำกัน กรุณาตั้งชื่อใหม่" });
            return;
        }
    
        const updatedShelves = shelves.map(shelf =>   //วนลูปเพื่อเปลี่ยนค่า Shelf id ที่แก้   ถ้า ID ไม่ตรงก็เป็นค่าเดิม  ถ้า ID ตรง (shelf.id === selectedShelfId) แก้ Set ค่า ID นั้น เป็นค่าที่ส่งเข้ามา 
            shelf.id === selectedShelfId
                ? { ...shelf, name: editshelf.nameEditShelf, color: editshelf.color}
                : shelf
        );
    
        setShelves(updatedShelves);
        localStorage.setItem('shelves', JSON.stringify(updatedShelves));
        console.log("Edited shelf in localStorage:", updatedShelves); // Console log when editing
    
        setShowPopupEditShelf(false);
        setSelectedShelfId(null);  // รีเซ็ต selectedShelfId
    };
    // @ts-ignore
    const handleDeleteShelf = (id: string) => {
        setConfirmDeleteID(id);

    };


    // const updatedShelves = shelves.filter(shelf => shelf.id.toString() !== confirmDelete.toString());
    // setShelves(updatedShelves);
    // localStorage.setItem('shelves', JSON.stringify(updatedShelves));
    // console.log("Deleted shelf from localStorage:", updatedShelves); // Console log when deleting
    // setConfirmDelete(null);

    const confirmDeleteUpdateShelf = async () => { //ทำการอัพเดตข้อมูล  ถ้า Shelf ไหนไม่ถูกส่งไปแสดงว่ามันถูกลบ
        if (selectedShelfId !== null) {
            console.log("ID confirmDelete", selectedShelfId);

            let updatedShelves: Shelf[] = JSON.parse(localStorage.getItem('shelves') || '[]');
            updatedShelves = updatedShelves.filter(shelves => shelves.id !== selectedShelfId); //กรองเอา ID ไว้เฉพาะ ID ที่ไม่ได้เลือกเก็บไว้
            // localStorage.setItem('shelves', JSON.stringify(updatedShelves));  //ค่อยเซ้ตเข้า Local storeate เมื่ออัพเดต Shelf เรียบร้อยก่อน
            console.log("ข้อมูลจากgetItemShelf: ", localStorage.getItem('shelves'));

            // เปลี่ยนชื่อฟิลด์ให้ตรงกับที่เซิร์ฟเวอร์ต้องการ
            const preparedShelves = prepareShelfData(updatedShelves);  //prepareShelfData  เพื่อปรับชื่อให้ตรงกับ database
            console.log("ก่อน Deleteปรับชื่อ: ", preparedShelves);
            let { response, result } = await ConfirmDeleteUpdateShelf(preparedShelves);

            if (response.status === 200) {
                getAllShelf();
                setSelectedShelfId(null);
                SetConfirmDeleteShelf(false);
                messageApi.open({ type: "success", content: result.message });
            }
            else {
                messageApi.open({ type: "error", content: result.error });
            }

        }
    };

    useEffect(() => {
        getAllShelf();
    }, []);

    return (
        <div style={{ backgroundImage: "url('/ImgManageShelf/BGManageShelf.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", overflowX: "hidden", height: "100vh" }}>
            {contextHolder}
            <SideBarZooSale expanded={expanded} onToggle={handleSidebarToggle} />

            <nav style={{ height: "52px", backgroundColor: "rgba(255, 255, 255, 0)", backdropFilter: "blur(20px)", boxShadow: "0 1px 12px rgba(0, 0, 0, 0.)", color: "black", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", }}>
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

            <Modal width={500} footer={null} open={showPopupAddShelf} onCancel={() => setShowPopupAddShelf(false)} >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "20px", color: "#7C3AED" }}>เพิ่มชั้นวาง</h1>
                    <Form
                        form={formAddShelf}
                        onFinish={handleAddShelf}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                        <Form.Item label="ชื่อชั้นวาง" name="nameShelf" rules={[{ required: true, message: 'กรุณากรอกชื่อชั้นวาง' },
                        {
                            validator: (_, value) => {
                                if (/\s/.test(value)) {
                                    return Promise.reject('ห้ามมีช่องว่างในชื่อชั้นวาง');
                                }
                                return Promise.resolve();
                            },
                        },]} style={{ marginBottom: "10px", width: "330px" }}>
                            <Input /*onChange={(e) => setNewShelfName(e.target.value)}*/ style={{ fontSize: "18px" }} />
                        </Form.Item>
                        <Form.Item name="color" initialValue={"#ff6347"}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginTop: "10px", marginLeft: "-150px"}}>
                                <p>เลือกสี: </p>
                                <input type="color" defaultValue="#ff6347" style={{ marginLeft: "10px", width: "50px", height: "50px" }} /*onChange={(e) => setNewShelfColor(e.target.value)}*/ />
                            </div>
                        </Form.Item>
                        <div style={{ marginTop: "30px" }}>
                            <Button type="primary" onClick={() => setShowPopupAddShelf(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
                                ยกเลิก
                            </Button>

                            <Button type="primary" htmlType="submit" style={{ fontWeight: 400, color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", marginLeft: "28px" }}>
                                เพิ่มชั้นวาง
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>

            <Modal width={500} footer={null} open={showPopupEditShelf} onCancel={() => setShowPopupEditShelf(false)} >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "20px", color: "#7C3AED" }}>แก้ไขชั้นวาง</h1>
                    <Form
                        form={formEditShelf}
                        onFinish={handleEditShelf}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                        <Form.Item label="ชื่อชั้นวาง" name="nameEditShelf"  rules={[{ required: true, message: 'กรุณากรอกชื่อชั้นวาง' },
                        {
                            validator: (_, value) => {
                                if (/\s/.test(value)) {
                                    return Promise.reject('ห้ามมีช่องว่างในชื่อชั้นวาง');
                                }
                                return Promise.resolve();
                            },
                        },]} style={{ marginBottom: "10px", width: "330px" }}>
                            <Input /*onChange={(e) => setEditShelfName(e.target.value)}*/ style={{ fontSize: "18px" }} />
                        </Form.Item>
                        <Form.Item name="color">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginTop: "10px", marginLeft: "-150px" }}>
                                <p>เลือกสี: </p>
                                <input type="color" value={formEditShelf.getFieldValue('color') || "#000000"}  onChange={(e) => setEditShelfColor(e.target.value)} /*onChange ไว้ให้สีมันแก้ไขได้เฉยๆ*/ style={{ marginLeft: "10px", width: "50px", height: "50px" }}  />
                            </div>
                        </Form.Item>
                        <div style={{ marginTop: "30px" }}>
                            <Button type="primary" onClick={() => setShowPopupEditShelf(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
                                ยกเลิก
                            </Button>

                            <Button type="primary" htmlType="submit" style={{ fontWeight: 400, color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", marginLeft: "28px" }}>
                                แก้ไขชั้นวาง
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>

            <Modal width={500} open={ConfirmDeleteShelf} onCancel={() => { SetConfirmDeleteShelf(false);}} footer={null}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontWeight: 500, fontSize: "20px", marginBottom: "20px", color: "#7C3AED" }}>ลบชั้นวาง</h1>
                    <p>{shelves.find(shelf => shelf.id === selectedShelfId)?.name}</p>
                    <div style={{ marginTop: "30px" }}>
                        <Button type="primary" onClick={() => SetConfirmDeleteShelf(false)} style={{ color: "black", backgroundColor: "#e2e2e2", width: "150px", height: "38px", }}>
                            ยกเลิก
                        </Button>

                        <Button type="primary" onClick={confirmDeleteUpdateShelf} style={{ fontWeight: 400, color: "white", backgroundColor: "#9400ce", width: "150px", height: "38px", marginLeft: "28px" }}>
                            ลบชั้นวาง
                        </Button>
                    </div>
                </div>
            </Modal>

            <Card title="ผังชั้นวาง" headStyle={{ textAlign: "center", fontSize: "28px", fontWeight: 500 }} style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", width: "1190px", height: "820px", margin: "20px 0px 0px 320px", position: "relative" }}>
                <div style={{ width: "1140px", height: "650px", border: "2px dashed #000", borderRadius: "10px" }}>
                    {shelves.map(shelf => (
                        <Rnd
                            key={shelf.id}
                            bounds="parent" // จำกัดการลากให้อยู่ภายใน parent
                            size={{
                                width: parseInt(shelf.width.toString(), 10),
                                height: parseInt(shelf.height.toString(), 10),
                            }}
                            position={{
                                x: parseInt(shelf.x.toString(), 10),
                                y: parseInt(shelf.y.toString(), 10)
                            }}// @ts-ignore
                            onDragStop={(e, d) => {
                                const updatedShelves = shelves.map(s =>
                                    s.id === shelf.id
                                        ? {
                                            ...s,
                                            x: Math.round(d.x),
                                            y: Math.round(d.y)
                                        }
                                        : s
                                );
                                setShelves(updatedShelves);
                                localStorage.setItem('shelves', JSON.stringify(updatedShelves));
                                console.log("Saved shelf position to localStorage:", updatedShelves);
                            }}// @ts-ignore
                            onResizeStop={(e, dir, ref, delta, pos) => {
                                const updatedShelves = shelves.map(s =>
                                    s.id === shelf.id
                                        ? {
                                            ...s,
                                            width: Math.round(parseInt(ref.style.width, 10)),
                                            height: Math.round(parseInt(ref.style.height, 10)),
                                            x: Math.round(pos.x),
                                            y: Math.round(pos.y)
                                        }
                                        : s
                                );
                                setShelves(updatedShelves);
                                localStorage.setItem('shelves', JSON.stringify(updatedShelves));
                                console.log("Saved shelf size to localStorage:", updatedShelves);
                            }}
                            style={{
                                borderRadius: '10px',
                                background: shelf.color,
                                border: '2px solid #000',
                                textAlign: 'center',
                                lineHeight: `${shelf.height}px`,
                                color: '#fff',
                                fontWeight: 'bold',
                                position: 'absolute',
                                cursor: 'pointer',
                            }}
                            onClick={() => setSelectedShelfId(shelf.id === selectedShelfId ? null : shelf.id)}
                        >
                            <div style={{ fontSize: "18px", fontWeight: 300 }}>{shelf.name}</div>
                        </Rnd>
                    ))}
                </div>

                <div style={{ marginTop: "22px", display: "flex" }} >

                    <Button onClick={ClickAddShelf} type="primary" style={{ height: "45px", width: "120px", backgroundColor: "#f74f98", color: "white", }}
                        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#f282b3";}}
                        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#f74f98";}}>
                        เพิ่มชั้นวาง
                    </Button>

                    <Button onClick={AddShelfData} type="primary" style={{ height: "45px", width: "120px", marginLeft: "20px", backgroundColor: "#9400ce", color: "white", }}
                        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#ab72c9";}}
                        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#9400ce";}}>
                        บันทึกข้อมูล
                    </Button>

                    <Button
                        onClick={() => {
                            if (selectedShelfId == null) {
                                messageApi.open({ type: "error", content: "กรุณาเลือกชั้นวางที่จะแก้ไขก่อน" });
                            } else {
                                ClickEditShelf();
                            }
                        }}
                        disabled={selectedShelfId == null}
                        type="primary" style={{ marginLeft: "50px", height: "45px", width: "90px", backgroundColor: selectedShelfId === null ? "#a4c0fc":"#4880FF", color: "white", }}
                        onMouseEnter={(e) => {
                            if (selectedShelfId !== null) {  // ตรวจสอบว่า selectedShelfId ไม่เป็น null
                                e.currentTarget.style.backgroundColor = "#8fb0f7";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedShelfId !== null) {  // ตรวจสอบว่า selectedShelfId ไม่เป็น null
                                e.currentTarget.style.backgroundColor = "#4880FF";
                            }
                        }}
                    >
                        แก้ไข
                    </Button>

                    <Button
                        onClick={() => {
                            if (selectedShelfId == null) {
                                messageApi.open({ type: "error", content: "กรุณาเลือกชั้นวางที่จะลบก่อน" });
                            } else {
                                //handleDeleteShelf(selectedShelfId);
                                SetConfirmDeleteShelf(true);
                            }
                        }}
                        disabled={selectedShelfId == null}
                        type="primary" style={{ height: "45px", width: "90px", marginLeft: "20px", backgroundColor: selectedShelfId == null ? "#e5a2a2" : "#EF4444", color: "white", }}
                        onMouseEnter={(e) => {
                            if (selectedShelfId !== null) {  // ตรวจสอบว่า selectedShelfId ไม่เป็น null
                                e.currentTarget.style.backgroundColor = "#e87878";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedShelfId !== null) {  // ตรวจสอบว่า selectedShelfId ไม่เป็น null
                                e.currentTarget.style.backgroundColor = "#EF4444";
                            }
                        }}
                    >
                        ลบ
                    </Button>

                    <div style={{marginTop: "-10px", marginLeft: "350px"}}>
                        {selectedShelfId && (
                            <>
                                <p style={{ fontSize: "18px" }}>
                                    ชั้นวางที่เลือก: {shelves.find(shelf => shelf.id === selectedShelfId)?.name}
                                </p>
                                    <div
                                        style={{
                                            width: "100px",
                                            height: "30px",
                                            marginTop: "8px",
                                            backgroundColor: shelves.find(shelf => shelf.id === selectedShelfId)?.color || "#FFFFFF",
                                            border: "1px solid #000",
                                        }}
                                    />
                            </>
                        )}

                    </div>


                </div>

            </Card>
        </div>
    );
}

export default ManageShelfZone;