import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Tour.css";
import Aos from "aos";
import "aos/dist/aos.css";
import { message } from "antd";
import {
  getTicketBookedByBookingID,
  getTicketByID,
  GetTicketTypeByID,
} from "../../../../../services/https/mj";

interface TourProps {
  bookingDetails: { ID: number; AllPrice: number }[];
  userId: number;
}

const Tour: React.FC<TourProps> = ({ bookingDetails }) => {
  const [ticketTypeData, setTicketTypeData] = useState<any[]>([]);// @ts-ignore
  const [allBookedData, setAllBookedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    Aos.init({ duration: 2000 });

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const bookedDataArray = [];
        const allTicketTypes = [];

        for (const booking of bookingDetails) {
          // ใช้ getTicketBookedByBookingID เพื่อหา TicketBooked ที่เกี่ยวข้องกับ BookingID
          const ticketsBooked = await getTicketBookedByBookingID(booking.ID);

          if (ticketsBooked?.length > 0) {
            const bookedData = ticketsBooked[0]; // ใช้เฉพาะ TicketBooked ตัวแรก
            bookedDataArray.push({ bookingID: booking.ID, data: bookedData });

            if (bookedData?.BookingZoos?.length > 0) {
              const promises = bookedData.BookingZoos.map(async (zoo: any) => {
                if (zoo.TicketID) {
                  const ticketData = await getTicketByID(zoo.TicketID);
                  return { ...ticketData, Quantity: zoo.Quantity, BookingID: booking.ID };
                }
                return null;
              });

              const resolvedTickets = await Promise.all(promises);
              const filteredTickets = resolvedTickets.filter((ticket) => ticket !== null);

              if (filteredTickets.length > 0) {
                const firstTicketTypeID = filteredTickets[0]?.TicketType?.ID;

                if (firstTicketTypeID) {
                  const typeData = await GetTicketTypeByID(firstTicketTypeID);
                  allTicketTypes.push({
                    TicketTypeID: firstTicketTypeID,
                    AllPrice: booking.AllPrice,
                    BookingID: booking.ID,
                    ...typeData,
                  });
                }
              }
            }
          }
        }

        setAllBookedData(bookedDataArray);
        setTicketTypeData(allTicketTypes);
      } catch (err: any) {
        setError(err.message || "Failed to fetch ticket details");
        message.error(err.message || "Failed to fetch ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingDetails]);

  const handlePrintTicket = (bookingID: number, allPrice: number) => {
    navigate("/user/ticketdesign", { state: { bookingID, allPrice } });
  };

  return (
    <div className="tours container section">
      <div className="secContainer">
        <div className="tourContainer">
          {loading ? (
            <p>Loading ticket details...</p>
          ) : error ? (
            <p>{error}</p>
          ) : ticketTypeData.length > 0 ? (
            ticketTypeData.slice(0, 2).map((type, index) => (
              <div key={index}>
                <div
                  data-aos="fade-up"
                  data-aos-duration="2000"
                  className="singleTour grid"
                >
                  <div className="imgDiv">
                    {type.Picture ? (
                      <img
                        src={`http://localhost:8000/${type.Picture}`}
                        alt={`Ticket Type ${type.TicketTypeID}`}
                      />
                    ) : (
                      <img src="/assets/placeholder.jpg" alt="Placeholder" />
                    )}
                  </div>
                  <div
                    data-aos="fade-up"
                    data-aos-duration="3000"
                    className="tourInfo"
                  >
                    <div className="ticketDetails">
                      <p style={{ color: "orange", fontSize: "24px", fontWeight: "bold" }}>
                        {type.Ticket || "Unknown Ticket"}
                      </p>
                      <p>{type.Description || "No Description"}</p>
                    </div>
                    <button
                      className="btn"
                      onClick={() => handlePrintTicket(type.BookingID, type.AllPrice)}
                    >
                      Print Ticket
                    </button>
                  </div>
                  <span className="price">${type.AllPrice || "--"}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No ticket types available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tour;
