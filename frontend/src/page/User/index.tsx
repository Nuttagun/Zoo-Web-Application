import NavbarUser from "../../component/user/navbar";
import Reviews from "../reviews/review";
import ShowMap from "./ShowMap/index";
import Event from "./Event/event";
import HomeVideo from "./Home/Home";
import Footer from "./Footer/Footer";
import Main from "./Booking/booking";
import About from "./About/About";
import Animal from "./Animal/animal";
import { getUserById } from "../../services/https/index";
import { useEffect, useState } from "react";
import { UsersInterface } from "../../interface/IUser";

function User() {
  const [userid, setUserid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );
  const [user, setUser] = useState<UsersInterface | null>(null);

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

  return (
    <div>
      <NavbarUser />
      <div>
        {user && Object.keys(user).length > 0 ? (
          <>
            <HomeVideo />
            <div id="booking">
            <Main />
            </div>
            <About />
            <div id="animal">
              <Animal />
            </div>
            <div id="Map">
              <ShowMap />
            </div>
            <div id="event">
              <Event />
            </div>
            <div id="reviews">
              <Reviews />
            </div>
            <Footer />
          </>
        ) : (
          <center style={{ color: "gray" }}>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            No Data Available
          </center>
        )}
      </div>
    </div>
  );
}

export default User;
