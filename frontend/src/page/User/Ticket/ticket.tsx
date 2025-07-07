import React, { useState, useEffect } from "react";
import { Button, DatePicker, Divider, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import { GetTicketsByTicketTypeID, createTicketBooked, createBookingZoo, DeleteBooking } from "../../../services/https/mj";
import dayjs from 'dayjs';


interface CalendarProps {
  onSelectDate: (date: string | null) => void;
}
 
const Calendar: React.FC<CalendarProps> = ({ onSelectDate }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateSelect = (date: any) => {
    if (date) {
      const currentDate = dayjs();
      const selectedDateTime = dayjs(date);

      if (selectedDateTime.isSame(currentDate, 'day') && selectedDateTime.hour() >= 17) {
        message.warning("You cannot select today after 5:00 PM.");
        return;
      }

      const utcDate = new Date(Date.UTC(date.year(), date.month(), date.date(), 0, 0, 0));
      const formattedDate = utcDate.toISOString();
      setSelectedDate(formattedDate);
      onSelectDate(formattedDate);
      localStorage.setItem("selectedDate", formattedDate);
      console.log("Selected date:", formattedDate);
    } else {
      setSelectedDate(null);
      onSelectDate(null);
    }
  };

  return (
    <>
      <DatePicker 
        onChange={handleDateSelect}
        style={{ 
          width: "100%", 
          marginBottom: "16px", 
          backgroundColor: "#FED400", 
          color: "#048F0D",
          borderColor: "#FED400", 
        }}
        disabledDate={(current) => {
          const currentDate = dayjs();
          const isBeforeToday = current.isBefore(currentDate.startOf('day')); 
          const isToday = current.isSame(currentDate, 'day'); 
          const isAfter12PM = currentDate.hour() >= 12;
          return isBeforeToday || (isToday && isAfter12PM);
        }}
      />
      {selectedDate && (
        <p style={{ color: "#048F0D" }}>
          Selected Date : {dayjs(selectedDate).format("DD MMMM YYYY")}
        </p>
      )}
    </>
  );
};


const Counter: React.FC<{
  count: number;
  setCount: (value: number) => void;
}> = ({ count, setCount }) => {
  const [minusBtnStyle, setMinusBtnStyle] = useState({
    boxShadow: "none",
    transform: "scale(1)",
  });

  const [plusBtnStyle, setPlusBtnStyle] = useState({
    boxShadow: "none",
    transform: "scale(1)",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={() => setCount(Math.max(count - 1, 0))}
        style={{
          position: "relative",
          border: "none",
          background: "none",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        <FaPaw
          style={{
            fontSize: "50px",
            color: "#895E3C",
            borderRadius: "30%",
            transition: "box-shadow 0.2s ease, transform 0.1s ease, color 0.2s ease",
            cursor: "pointer",
            ...minusBtnStyle,
          }}
          onMouseEnter={() => setMinusBtnStyle({ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "scale(1.05)" })}
          onMouseLeave={() => setMinusBtnStyle({ boxShadow: "none", transform: "scale(1)" })}
          onMouseDown={() => setMinusBtnStyle({ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "scale(0.97)" })}
          onMouseUp={() => setMinusBtnStyle({ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "scale(1.05)" })}
        />
        <span
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "24px",
            color: "#fdfefe",
            fontWeight: "bold",
          }}
        >
          -
        </span>
      </button>

      <span style={{ fontSize: "20px", minWidth: "50px", textAlign: "center" }}>
        {count}
      </span>

      <button
        onClick={() => setCount(Math.min(count + 1, 10))}
        style={{
          position: "relative",
          border: "none",
          background: "none",
          padding: "10px",
          cursor: "pointer",
        }}
      >
       <FaPaw
          style={{
            fontSize: "50px",
            color: "#895E3C",
            borderRadius: "30%",
            transition: "box-shadow 0.2s ease, transform 0.1s ease, color 0.2s ease",
            cursor: "pointer",
            ...plusBtnStyle,
          }}
          onMouseEnter={() => setPlusBtnStyle({ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "scale(1.05)" })}
          onMouseLeave={() => setPlusBtnStyle({ boxShadow: "none", transform: "scale(1)" })}
          onMouseDown={() => setPlusBtnStyle({ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "scale(0.97)" })}
          onMouseUp={() => setPlusBtnStyle({ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", transform: "scale(1.05)" })}
        />
        <span
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "24px",
            color: "#fdfefe",
            fontWeight: "bold",
          }}
        >
          +
        </span>
      </button>
    </div>
  );
};

const FontLoaderComponent = () => {
  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Acme&family=Alegreya:ital,wght@0,400..900;1,400..900&family=Bai+Jamjuree:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&family=Chakra+Petch:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Concert+One&family=Frank+Ruhl+Libre:wght@300..900&family=Itim&family=Krub:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&family=Lilita+One&family=Mali:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&family=Noto+Sans+Thai+Looped:wght@100;200;300;400;500;600;700;800;900&family=Passion+One:wght@400;700;900&family=Patua+One&family=Rancho&family=Signika:wght@300..700&family=Tilt+Neon&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);
}

const Ticket: React.FC = () => {
  const { bookingID, ticketTypeID } = useParams<{ bookingID: string; ticketTypeID: string; }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [ticketTypeName, setTicketTypeName] = useState<string>("");
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [ages, setAges] = useState<{ [key: string]: string }>({});
  const [counts, setCounts] = useState<{ [key: string]: number }>({ Child: 0, Adult: 0, Other: 0 });
  const [uid, setUid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );
  const navigate = useNavigate();
  FontLoaderComponent();

  useEffect(() => {
    const fetchPrices = async () => {
      if (ticketTypeID) {
        const tickets = await GetTicketsByTicketTypeID(Number(ticketTypeID));
        const priceMap: { [key: string]: number } = {};
        const ageMap: { [key: string]: string } = {};
        tickets.forEach((ticket: any) => {
          const generation = ticket.Generation?.Generation || "Unknown";
          priceMap[generation] = ticket.Price;
          ageMap[generation] = ticket.Generation?.Age || "N/A";
        });
        setPrices(priceMap);
        setAges(ageMap);
      }
    };

    fetchPrices();
  }, [ticketTypeID]);

  console.log(ticketTypeID)

  useEffect(() => {
    setUid(Number(localStorage.getItem("userid")));
    const fetchTicketTypeName = async () => {
      try {
        if (ticketTypeID) {
          const tickets = await GetTicketsByTicketTypeID(Number(ticketTypeID));
          console.log("Fetched Tickets:", tickets);
  
          if (tickets.length > 0 && tickets[0].TicketType?.Ticket) {
            setTicketTypeName(tickets[0].TicketType?.Ticket);
          } else {
            console.warn("Ticket type name is missing or undefined.");
            setTicketTypeName("No ticket type available");
          }
        }
      } catch (error) {
        console.error("Error fetching ticket type:", error);
        message.error("Failed to load ticket type information.");
      } 
    };
  
    fetchTicketTypeName();
  }, [ticketTypeID]);
  
  
  const handleCreateTicketBooked = async () => {
    if (!selectedDate) {
      message.warning("Please select a visit date before proceeding.");
      return;
    }

    const totalQuantity = counts.Child + counts.Adult + counts.Other;
    if (totalQuantity < 1) {
      message.warning("Please select at least one ticket before proceeding.");
      return;
    }

    if (!bookingID) {
      message.error("Invalid booking ID. Please try again.");
      return;
    }    

    if (
      (counts.Child > 0 && prices.Child === undefined) ||
      (counts.Adult > 0 && prices.Adult === undefined) ||
      (counts.Other > 0 && prices.Other === undefined)
    ) {
      message.error("Ticket price data is missing. Please try again later.");
      return;
    }

    const totalPrice =
      counts.Child * (prices.Child || 0) +
      counts.Adult * (prices.Adult || 0) +
      counts.Other * (prices.Other || 0);

    const ticketBookedData = {
      VisitDate: selectedDate,
      QuantityCustomer: totalQuantity,
      TotalPrice: totalPrice,
      BookingID: Number(bookingID),
    };

    console.log("Sending ticketBookedData:", ticketBookedData);

    try {
      const ticketBookedResult = await createTicketBooked(ticketBookedData);
      console.log("ticketBookedResult:", ticketBookedResult);
  
      if (ticketBookedResult) {
        message.success("TicketBooked created successfully!");
  
        const tickets = await GetTicketsByTicketTypeID(Number(ticketTypeID));
        console.log(tickets)
        const bookingZooPromises = Object.keys(counts)
          .filter((generation) => counts[generation] > 0)
          .map((generation) => {
            const matchingTicket = tickets.find(
              (ticket: any) => ticket.Generation?.Generation === generation
            );

            if (!matchingTicket) {
              console.error(`No matching ticket found for generation: ${generation}`);
              return null;
            }
            
            const quantity = counts[generation];
            const ticketBookedID = ticketBookedResult.data.id;
            
            if (quantity <= 0) {
              console.error(`Quantity for generation ${generation} must be greater than 0.`);
              return null;
            }
            
            if (!ticketBookedID) {
              console.error("Invalid TicketBookedID.");
              return null;
            }
            
            const bookingZooData = {
              Quantity: quantity,
              TicketID: matchingTicket.ID,
              TicketBookedID: ticketBookedID,
            };

            console.log("Validated BookingZoo data:", bookingZooData);

            return createBookingZoo(bookingZooData);
          });
  
        await Promise.all(bookingZooPromises);
  
        navigate("/user/rent", {
          state: {
            ticketBookedID: ticketBookedResult.data.id,
            visitDate: selectedDate,
            totalPrice,
            bookingID: Number(bookingID),
            QuantityCustomer: totalQuantity,
          },
        });
      } else {
        throw new Error("Failed to create TicketBooked.");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while creating TicketBooked.");
    }
  };

  const handleCancel = async () => {
    if (!bookingID) {
      message.error("Invalid booking ID.");
      return;
    }
  
    try {
      await DeleteBooking(Number(uid)); 
      message.success("Booking cancelled successfully.");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting booking:", error);
      message.error("Failed to cancel booking.");
    }
  };
  
  return (
    <>
      <div 
        style={{ 
          borderRadius: "15px", 
          padding: "20px", 
          minHeight: "95vh", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between",
          margin: "20px"        
        }}
      >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div 
          style={{ 
            marginTop: "15px", 
            fontSize: "70px", 
            fontFamily: "'Acme', serif",
            fontWeight: "bold", 
            letterSpacing: "2px", 
            textShadow: "2px 2px rgb(41, 26, 16)",
            color: "#B25900",
          }}
        >
          {ticketTypeName}
        </div>

        <div style={{ padding: "20px" }}>
          <Calendar onSelectDate={(date) => setSelectedDate(date)} />
        </div>

        <Divider style={{ width: "60vw", marginBottom: "20px", marginTop: "5px", borderBottom: "2px solid #895E3C" }} />

        {["Child", "Adult", "Other"].map((generation) => (
          <div key={generation} style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              alignItems: "center",
              textAlign: "center",
              marginLeft:"8%",
              width: "80%",
            }}
          >
            <div style={{ fontSize: "50px", fontFamily: "'Rancho', serif", fontWeight: "bold"}}>
              {generation}
            </div>

            <div style={{ fontSize: "20px", fontFamily: "'Bai Jamjuree', sans-serif" }}>
              {ages[generation] ? `Age ${ages[generation]}` : "N/A"}
            </div>

            <div style={{ fontSize: "40px", fontFamily: "'Passion One', sans-serif", color: "#048F0D" }}>
              {prices[generation] !== undefined
                ? prices[generation] === 0
                  ? "FREE"
                  : `฿${prices[generation]}`
                  : "N/A"}
            </div>

            <Counter
              count={counts[generation]}
              setCount={(value: number) =>
                setCounts((prev) => ({
                  ...prev,
                  [generation]: value,
                }))
              }
            />
          </div>
          <Divider style={{ width: "80vw", margin: "10px auto", borderBottom: "1px solid #895E3C" }} />
          </div>
        ))}
       </div>

        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
          onClick={handleCancel}
          style={{
            borderColor: "#B25900",
            color: "#B25900",
            fontSize: "25px",
            fontWeight: "bold",
            padding: "10px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            border: "3px solid #B25900",
            height: "50px",
            width: "150px",
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"; // เมื่อเมาส์เข้าให้เพิ่มเงา
            target.style.color = "#FF0000";
            target.style.borderColor = "#FF0000";
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "none"; // เมื่อเมาส์ออกให้ลบเงา
            target.style.color = "#B25900";
            target.style.borderColor = "#B25900";
            target.style.backgroundColor = "#FFFFFF";
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateTicketBooked}
          style={{
            backgroundColor: "#B25900", // สีพื้นหลัง
            borderColor: "#B25900", // สีขอบ
            color: "#fdfefe", // สีตัวหนังสือ
            fontSize: "25px",
            fontWeight: "bold",
            padding: "10px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // เงา
            height: "50px",
            width: "150px",
          }}          
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"; // เมื่อเมาส์เข้าให้เพิ่มเงา
            target.style.backgroundColor = "#BC752E";
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "none"; // เมื่อเมาส์ออกให้ลบเงา
            target.style.backgroundColor = "#B25900";
          }}
        >
          Next
        </Button>
      </div>
    </div>
    </>
  );
};

export default Ticket;