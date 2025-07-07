import { Button, Form, Input, message, Divider } from "antd";
import { LoginInterface } from "../../interface/Login";
import { useNavigate, Link } from "react-router-dom";
import { AddLogin } from "../../services/https/httpLogin";
import redpanda from "../../assets/login/redpanda.png";  //assets\login\redpanda.png
import { GetEmployeeByUserID } from "../../services/https/Garfield/http";
import { useState } from "react";

function Login() {

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [Slide, SetSlide] = useState(false);

  const clickLoginbt = async (datalogin: LoginInterface) => {
    console.log("ก่อนLogin: ", datalogin);
    let res = await AddLogin(datalogin);
    console.log(res);
    console.log("หลังLogin: ", res);

    if (res.status === 200) {
      SetSlide(true);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("roleName", res.data.UserRole.RoleName);
      localStorage.setItem("userid", res.data.UserID);
      localStorage.setItem("firstnameuser", res.data.FirstNameUser);
      localStorage.setItem("lastnameuser", res.data.LastNameUser);

      const RoleName = localStorage.getItem("roleName");

      const userID = localStorage.getItem("userid");
      console.log(userID)
      if (userID && (RoleName !== "User")) {
        try {
          const employeeID = await GetEmployeeByUserID(Number(userID));
          console.log(employeeID)
          if (employeeID !== null && employeeID !== undefined) {
            localStorage.setItem("employeeid", employeeID.toString());
            console.log("EmployeeID saved to localStorage:", employeeID);
          } else {
            console.warn("EmployeeID is null or undefined.");
          }
        } catch (error) {
          console.error("Failed to fetch EmployeeID:", error);
        }
      }

      if (RoleName === "Admin") {
        messageApi.success("ท่านได้ทำการ เข้าสู่ระบบ " + RoleName + " สำเร็จ");
        setTimeout(() => {
          navigate("/admin");
        }, 900);
      } else if (RoleName === "User") {
        messageApi.success("ท่านได้ทำการ เข้าสู่ระบบ " + RoleName + " สำเร็จ");
        setTimeout(() => {
          navigate("/user");
        }, 900);
      } else if (RoleName === "Zookeeper") {
        messageApi.success("ท่านได้ทำการ เข้าสู่ระบบ " + RoleName + " สำเร็จ");
        setTimeout(() => {
          navigate("/zookeeper");
        }, 900);
      } else if (RoleName === "ZooSale") {
        messageApi.success("ท่านได้ทำการ เข้าสู่ระบบ " + RoleName + " สำเร็จ");
        setTimeout(() => {
          navigate("/zoosale");
        }, 900);
      } else if (RoleName === "Veterinarian") {
        messageApi.success("ท่านได้ทำการ เข้าสู่ระบบ " + RoleName + " สำเร็จ");
        setTimeout(() => {
          navigate("/vetdashboard");
        }, 900);
      } else if (RoleName === "VehicleManager") {
        messageApi.success("ท่านได้ทำการ เข้าสู่ระบบ " + RoleName + " สำเร็จ");
        setTimeout(() => {
          navigate("/vehiclemanager");
        }, 900);
      }
    } else {
      messageApi.open({
        type: "warning",
        content: "รหัสผ่านหรือข้อมูลผู้ใช้ไม่ถูกต้อง!! กรุณากรอกข้อมูลใหม่",
      });
    }
  };
  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" }}>
      {contextHolder}
      <div style={{ backgroundImage: `url(${redpanda})`, backgroundRepeat: "no-repeat", backgroundSize: "contain", backgroundPosition: "bottom left", width: "1200px", height: "800px", boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5)", backgroundColor: "#fff", display: "flex", overflow: "hidden", borderRadius: "50px", position: "relative" }}>
        <div style={{ position: "absolute", right: "0", top: "0", height: "100%", width: Slide? "100%" : "58%", transition: "width 0.6s ease", borderRadius: "50px 0 0 50px", backgroundColor: "#fff", zIndex: 500, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column", justifyContent: "flex-start", padding: "30px" }}>
          <h1 style={{ marginTop: "80px", textAlign: "center", fontWeight: "bold", fontSize: "45px", marginBottom: "20px" }}>Welcome To <span style={{ color: "rgb(255, 128, 43)" }}>Zootopia</span></h1>
          <p style={{fontSize: "16px", marginTop: "-15px", marginBottom: "0px", textAlign: "center", color: "rgb(156, 161, 162)"}}>Please login to your account</p>
          <Form layout="vertical" onFinish={clickLoginbt} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Form.Item name="username" style={{marginTop: "40px"}} rules={[{ required: true, message: "Please input your username!" }]}>
              <Input style={{fontSize: "22px", fontWeight: 400, width: "460px", height: "65px", backgroundColor: "rgb(245, 247, 249)", borderRadius: "15px"}} placeholder="Enter your username" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
              <Input.Password style={{fontSize: "22px", fontWeight: 400, width: "460px", height: "65px", backgroundColor: "rgb(245, 247, 249)", borderRadius: "15px", marginTop: "10px"}} placeholder="Enter your password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" style={{ marginTop: "30px", width: "460px", height: "60px", backgroundColor: "rgb(255, 128, 43)", fontSize: "20px"}}>LOGIN</Button>
            </Form.Item>
          </Form>
          <Divider style={{ marginTop: "40px", height: "1px", backgroundColor: "rgb(247, 247, 247)", margin: "20px auto" }} />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <p style={{fontSize: "16px", color: "rgb(156, 161, 162)"}}>Don't have an account?{" "}
              <Link to="/register">
                <Button type="link" style={{ textDecoration: "underline", fontSize: "16px", padding: 0 , color: "rgb(255, 128, 43)"}}>Register</Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default Login;
