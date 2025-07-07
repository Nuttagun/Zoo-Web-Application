import { useEffect, useState } from "react";
import "./booking.css";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { HiClipboardList } from "react-icons/hi";
import img from "../../../assets/logotest.png";
import Aos from "aos";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { GetTicketTypes, GetTicketsByTicketTypeID, CreateBooking } from "../../../services/https/mj";
import "aos/dist/aos.css";
import { FaPaw } from "react-icons/fa";

const Main = () => {
  const [uid, setUid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );
  const navigate = useNavigate();
  const [Data, setData] = useState([
    {
      id: 1,
      imgSrc: img,
      destTitle: "Default Title 1",
      location: "Default Location 1",
      grade: "Default Grade 1",
      fees: "Default Fees 1",
      description: "Default Description 1",
    },
    {
      id: 2,
      imgSrc: img,
      destTitle: "Default Title 2",
      location: "Default Location 2",
      grade: "Default Grade 2",
      fees: "Default Fees 2",
      description: "Default Description 2",
    },
    {
      id: 3,
      imgSrc: img,
      destTitle: "Default Title 3",
      location: "Default Location 3",
      grade: "Default Grade 3",
      fees: "Default Fees 3",
      description: "Default Description 3",
    },
  ]);

  useEffect(() => {
    setUid(Number(localStorage.getItem("userid")));
    const fetchTicketData = async () => {
      try {
        const ticketTypes = await GetTicketTypes();
        if (ticketTypes) {
          const updatedBoxes = await Promise.all(
            // @ts-ignore
            ticketTypes.map(async (ticketType: any, index: number) => {
              const tickets = await GetTicketsByTicketTypeID(ticketType.ID);
              console.log(tickets)

              const childTicket = tickets.find(
                (ticket: any) => ticket.Generation?.Generation === "Child"
              );
              const adultTicket = tickets.find( 
                (ticket: any) => ticket.Generation?.Generation === "Adult"
              );
              const otherTicket = tickets.find(
                (ticket: any) => ticket.Generation?.Generation === "Other"
              );

              const childPrice = childTicket ? childTicket.Price : "N/A";
              const adultPrice = adultTicket ? adultTicket.Price : "N/A";
              const otherPrice = otherTicket ? otherTicket.Price : "N/A";

              return {
                imgSrc: ticketType.Picture,
                destTitle: ticketType.Ticket,
                location: "Zoo Location",
                grade: "Exclusive Ticket",
                fees: `- for child ${childPrice} Baht,- for Adult ${adultPrice} Baht,- for Other ${otherPrice} Baht`,
                description: ticketType.Description,
              };
            })
          );

          setData((prevData) =>
            prevData.map((item, index) => ({
              ...item,
              ...updatedBoxes[index],
            }))
          );
        } else {
          message.warning("Unable to fetch Ticket Types.");
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        message.error("An error occurred while loading ticket data.");
      }
    };

    fetchTicketData();
    Aos.init({ duration: 4000 });
  }, []);

  const handleChoose = async (ticketTypeID: number) => {
    try {
      const result = await CreateBooking({
        UserID: uid,
        BookingDate: new Date().toISOString(),
        AllPrice: 0,
      });

      if (result) {
        const bookingID = result.data.id;
        message.success("Booking created successfully!");
        navigate(`/user/ticket/${bookingID}/${ticketTypeID}`);
      } else {
        message.error("Failed to create booking.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      message.error("An error occurred.");
    }
  };

  return (
    <section id="main" className="main section container">
      <div className="secTitle">
        <h3 className="title">Zoo Tickets</h3>
      </div>

      <div className="secContent grid">
        {Data.map(({ id, imgSrc, destTitle, location, fees, description }) => (
          <div key={id} data-aos="fade-up" className="singleDestination">
            <div className="imageDiv">
              <img src={`http://localhost:8000/${imgSrc}`} alt="" />
            </div>

            <div className="cardInfo">
              <h4 className="destTitle">{destTitle}</h4>
              <span className="continent flex">
                <HiOutlineLocationMarker className="icon" />
                <span className="name">{location}</span>
              </span>

              <div className="fees flex">
                <div className="grade">
                  <h5>
                    {fees.split(",").map((line, index) => (
                      <span key={index}>
                        {line.trim()}
                        <div style={{marginTop:"7px"}}></div>
                      </span>
                    ))}
                  </h5>
                </div>
              </div>

              <div className="desc">
                <p style={{display:"flex"}}><FaPaw style={{ fontSize: "1.5em", color: "#B25900" }}/><span style={{marginLeft:"10px", fontWeight:"bold"}}>Explore</span></p>
                <p style={{marginTop:"5px"}}>{description}</p>
              </div>

              <button className="btn flex" onClick={() => handleChoose(id)}>
                Booking <HiClipboardList className="icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Main;
