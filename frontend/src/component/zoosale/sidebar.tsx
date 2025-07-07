import { FunctionComponent } from "react";
import { useState } from 'react';
import { Button} from 'antd';
import { Link} from 'react-router-dom';

const SideBarZooSale: FunctionComponent<{ expanded: boolean, onToggle: () => void }> = ({ expanded, onToggle }) => {


    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };
    
    
    // const [expanded, setexpanded] = useState(() => {
    //     const savedexpanded = localStorage.getItem('expanded');
    //     return savedexpanded ? JSON.parse(savedexpanded) : true;
    // });

    // const handleToggle = () => {
    //     const newexpanded = !expanded;
    //     setexpanded(newexpanded);
    //     localStorage.setItem('expanded', JSON.stringify(newexpanded));
    // };

    /**--------------------------------- */
    const [activeButton, setActiveButton] = useState(() => {
        const savedActiveButton = localStorage.getItem('activeButton');
        return savedActiveButton || 'home';
    });

    const handleButtonClick = (buttonId: string) => {
        setActiveButton(buttonId);
        localStorage.setItem('activeButton', buttonId);
    };

    return (
    <div style={{backgroundColor: "rgba(0, 26, 255, 0.2)", backdropFilter: "blur(20px)", backgroundSize: "cover", backgroundPosition: "center", width: expanded ? "300px" : "80px", height: "100vh", zIndex: 3, position: "absolute", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", transition: "width 0.6s ease" }}>  
        
        <img src="/ImgZoosale/zooshoplogowhite.png" alt="" style={{ width: expanded ? "80%" : "0px", height: expanded ? "auto" : "0px", marginTop: expanded ? "55px" : "10px", opacity: expanded ? 1 : 0, transition: "all 0.6s ease" }} />  
        
        <div style={{ transition: "right 0.6s ease" }}>
            {expanded ? (
            <img src="../../../public/ImgZoosale/sidebarmini.png" onClick={onToggle} style={{ position: "absolute", top: "10px", right: expanded ? "10px" : "-50px", width: "50px", cursor: "pointer"}} />
            ) : (
            <img src="../../../public/ImgZoosale/sidebarFull.png" onClick={onToggle} style={{ position: "absolute", top: "10px", right: expanded ? "-50px" : "17px", width: "50px", cursor: "pointer"}} />
            )}
        </div>

        <Link to="../managezooshop" style={{width: "90%", marginTop: expanded ? "10px" : "55px" }}>
            <Button style={{width: "100%", height: "55px", marginTop: expanded? "20px": "0px", border: "0px", display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: activeButton === "home" ? "#007bff" : "transparent"}} onClick={() => handleButtonClick("home")}
            onMouseEnter={(e) => { if (activeButton !== "home") { e.currentTarget.style.backgroundColor = "rgba(83, 139, 243, 0.55)"; }}}
            onMouseLeave={(e) => { if (activeButton !== "home") {e.currentTarget.style.backgroundColor = "transparent";}}}   
            >
                <img src="../../../ImgZoosale/home.png" style={{width: "40px", marginRight: "10px"}} />
                {expanded ? (<p style={{color: activeButton === "home" ? "white" : "white", fontSize: "25px", margin: 0}}>หน้าหลัก</p>) : ""}
            </Button>
        </Link>

        <Link to="../saleproduct" style={{width: "90%", marginTop: "5px"}}>
            <Button style={{width: "100%", height: "55px", border: "0px", display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: activeButton === "sale" ? "#007bff" : "transparent"}} onClick={() => handleButtonClick("sale")}
                onMouseEnter={(e) => { if (activeButton !== "sale") { e.currentTarget.style.backgroundColor = "rgba(83, 139, 243, 0.55)"; }}}
                onMouseLeave={(e) => { if (activeButton !== "sale") {e.currentTarget.style.backgroundColor = "transparent";}}}
                >
                <img src="../../../ImgZoosale/sale-sign.png" style={{width: "40px", marginRight: "10px"}} />
                {expanded ? (<p style={{color: activeButton === "sale" ? "white" : "white", fontSize: "25px", margin: 0}}>ขายสินค้า</p>) : ""}
            </Button>
        </Link>

        <Link to="../receiveproduct" style={{width: "90%", marginTop: "5px"}}>
            <Button style={{width: "100%", height: "55px", border: "0px", display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: activeButton === "receive" ? "#007bff" : "transparent"}} onClick={() => handleButtonClick("receive")}
                onMouseEnter={(e) => { if (activeButton !== "receive") { e.currentTarget.style.backgroundColor = "rgba(83, 139, 243, 0.55)"; }}}
                onMouseLeave={(e) => { if (activeButton !== "receive") {e.currentTarget.style.backgroundColor = "transparent";}}}
                >
                <img src="../../../ImgZoosale/box.png" style={{width: "40px", marginRight: "10px"}} />
                {expanded ? (<p style={{color: activeButton === "receive" ? "white" : "white", fontSize: "25px", margin: 0}}>รับสินค้า</p>) : ""}
            </Button>
        </Link>

        <Link to="../organizeproduct" style={{width: "90%", marginTop: "5px"}}>
            <Button style={{width: "100%", height: "55px", border: "0px", display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: activeButton === "organize" ? "#007bff" : "transparent"}} onClick={() => handleButtonClick("organize")}
                onMouseEnter={(e) => { if (activeButton !== "organize") { e.currentTarget.style.backgroundColor = "rgba(83, 139, 243, 0.55)"; }}}
                onMouseLeave={(e) => { if (activeButton !== "organize") {e.currentTarget.style.backgroundColor = "transparent";}}}
                >
                <img src="../../../ImgZoosale/automated-process.png" style={{width: "40px", marginRight: "10px"}} />
                {expanded ? (<p style={{color: activeButton === "organize" ? "white" : "white", fontSize: "25px", margin: 0}}>จัดสินค้า</p>) : ""}
            </Button>
        </Link>

        <Link to="../manageshelfzone" style={{width: "90%", marginTop: "5px"}}>
            <Button style={{width: "100%", height: "55px", border: "0px", display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: activeButton === "shelf" ? "#007bff" : "transparent"}} onClick={() => handleButtonClick("shelf")}
                onMouseEnter={(e) => { if (activeButton !== "shelf")  { e.currentTarget.style.backgroundColor = "rgba(83, 139, 243, 0.55)"; }}}
                onMouseLeave={(e) => { if (activeButton !== "shelf") {e.currentTarget.style.backgroundColor = "transparent";}}}
                >
                <img src="../../../ImgZoosale/dairy-products.png" style={{width: "40px", marginRight: "10px"}} />
                {expanded ? (<p style={{color: activeButton === "shelf" ? "white" : "white", fontSize: "25px", margin: 0}}>ปรับแต่งชั้นวาง</p>) : ""}
            </Button>
        </Link>

        <Link to="/" onClick={() => handleLogout()} style={{ marginTop: "10px", width: "100%", position: "absolute", bottom: "0", left: "0" }}>
            <Button style={{ width: "100%", height: "55px", border: "0px", display: "flex", alignItems: "center", justifyContent: "flex-start", backgroundColor: "#f74f98"}} onClick={() => handleButtonClick("logout")}>
                <img src="../../../ImgZoosale/exit.png" style={{ width: "40px", marginRight: "10px", marginLeft: expanded? "35px" : "10px", transition: "margin-left 0.5s ease",}} />
                {expanded ? (<p style={{ color: "white", fontSize: "25px", marginTop: "8px"}}>LOG OUT</p>) : ""}
            </Button>
        </Link>



    </div>
    );
};
export default SideBarZooSale;