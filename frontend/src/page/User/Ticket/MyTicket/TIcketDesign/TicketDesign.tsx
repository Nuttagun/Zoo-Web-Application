import "./design.css";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Spin, message, Button } from "antd";
import {
  getTicketBookedByBookingID,
  getTicketByID,
  getUserById,
  getRentsByTicketBookedID,
} from "../../../../../services/https/mj/index";
import { UsersInterface } from "../../../../../interface/IUser";

interface VehicleType {
  VehicleType: string;
}

interface Vehicle {
  Name: string;
  Price: number;
  Description: string;
  VehicleType: VehicleType;
}

interface VehicleRent {
  Vehicle: Vehicle;
}

interface RentDetail {
  ID: number;
  TotalQuantity: number;
  TotalPrice: number;
  RentDate: string;
  StartTime: string;
  EndTime: string;
  VehicleRent?: VehicleRent[];
}


const TicketComponent: React.FC = () => {
  const location = useLocation();
  const { bookingID, allPrice } = location.state || {}; // @ts-ignore
  const [ticketypeDetails, setTickettypeDetails] = useState<any | null>(null); // @ts-ignore
  const [ticketDetails, setTicketDetails] = useState<any | null>(null);
  const [ticketDetailsReal, setTicketDetailsReal] = useState<any[]>([]);
  const [rentDetails, setRentDetails] = useState<RentDetail[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );
  const [user, setUser] = useState<UsersInterface | null>(null);

  const GetUser = async () => {
    let res = await getUserById(uid.toString());
    if (res) {
      setUser(res);
    }
  };

  useEffect(() => {
    setUid(Number(localStorage.getItem("userid")));
    GetUser();
    const fetchDetails = async () => {
      try {
        setLoading(true);

        const ticketsBooked = await getTicketBookedByBookingID(bookingID);
        console.log(bookingID);
        if (!ticketsBooked || ticketsBooked.length === 0) {
          throw new Error("No TicketBooked found for the given booking ID.");
        }

        const bookedData = ticketsBooked[0];
        setTicketDetails(bookedData);
        console.log(bookedData)

        if (bookedData?.BookingZoos?.length > 0) {
          const promises = bookedData.BookingZoos.map(async (zoo: any) => {
            if (zoo.TicketID) {
              const ticketData = await getTicketByID(zoo.TicketID);
              return { ...ticketData, Quantity: zoo.Quantity };
            }
            return null;
          });

          const resolvedTickets = await Promise.all(promises);
          setTicketDetailsReal(
            resolvedTickets.filter((ticket) => ticket !== null)
          );
          console.log(resolvedTickets.filter((ticket) => ticket !== null));
        }

        try {
          // ดึงข้อมูล RentDetails และจัดการข้อผิดพลาดภายใน
          const rentData = await getRentsByTicketBookedID(bookingID);
          console.log(rentData);
          if (rentData) {
            setRentDetails(rentData);
            console.log("test:", rentData);
          } else {
            setRentDetails(null);
          }
        } catch (rentError) {
          console.warn("Failed to fetch RentDetails:", rentError);
          setRentDetails(null); // ตั้งค่าเป็น null ถ้าไม่มี rent หรือเกิดข้อผิดพลาด
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch ticket details");
        message.error(err.message || "Failed to fetch ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingID]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "red", marginTop: "20px" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!bookingID || !allPrice) {
    return <center>Error: Missing ticket information.</center>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="container-fluid" style={{ marginTop: "100px" }}>
        {/* Ticket Details */}
        <div className="col-sm-6 text-right" style={{ marginRight: "50px" }}>
          {ticketDetailsReal.map((ticket, index) => (
            <div
              key={index}
              className="ticket light"
              style={{ marginRight: "20px" }}
            >
              <div
                className="ticket-head text-center"
                style={{
                  backgroundImage: `url(http://localhost:8000/${
                    ticket.TicketType?.Picture || ""
                  })`,
                }}
              >
                <div className="layer"></div>
                <div className="from-to">
                  {ticket.TicketType?.Ticket || "Unknown"} FOR{" "}
                  {ticket.Generation?.Generation}
                </div>
              </div>
              <div className="ticket-body">
                <div className="passenger">
                  <p>Name</p>
                  <h4 style={{ color: "white" }}>
                    {user?.FirstName} {user?.LastName}
                  </h4>
                </div>
                <div className="flight-info row">
                  <div className="col-xs-6">
                    <p>Quantity</p>
                    <h4 style={{ color: "white" }}>{ticket.Quantity || 0}</h4>
                  </div>
                  <div className="col-xs-6">
                    <p>Total Price</p>
                    <h4 style={{ color: "white" }}>
                      {(ticket.Price || 0) * (ticket.Quantity || 0)}
                    </h4>
                  </div>
                </div>
                <div className="flight-date">
                  Visit Date:{" "}
                  {
                    new Date(ticket.VisitDate || Date.now())
                      .toISOString()
                      .split("T")[0]
                  }
                </div>
              </div>
              <div className="footer">
                <p
                  style={{
                    marginLeft: "20px",
                    marginTop: "20px",
                    color: "white",
                  }}
                >
                  Description
                </p>
                <div className="disclaimer">
                  {ticket.TicketType?.Description || "Unknown"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-xs-6 text-left hidden-xs">
          {rentDetails &&
            rentDetails.length > 0 &&
            rentDetails.map((rentDetail, rentIndex) => (
              <div
                key={rentIndex}
                className="ticket dark"
                style={{ marginRight: "20px" }}
              >
                <div
                  className="ticket-head text-center"
                  style={{
                    backgroundImage:
                      "url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/584938/bg_15.png)",
                  }}
                >
                  <div className="layer"></div>
                  <div className="from-to">
                    Rent Details <span className="icon icon-vehicle"></span>
                  </div>
                </div>
                <div className="ticket-body">
                  <div className="passenger">
                    <p>Passenger</p>
                    <h4>
                      {user?.FirstName} {user?.LastName}
                    </h4>
                  </div>
                  <div className="flight-info row">
                    <div className="col-xs-6">
                      <p>Total Quantity</p>
                      <h4>{rentDetail.TotalQuantity || 0}</h4>
                    </div>
                    <div className="col-xs-6">
                      <p>Total Price</p>
                      <h4>{rentDetail.TotalPrice || 0}</h4>
                    </div>
                  </div>
                  {rentDetail.VehicleRent &&
                    rentDetail.VehicleRent.map((vehicle, vehicleIndex) => (
                      <div key={vehicleIndex} style={{ marginTop: "10px" }}>
                        <div className="col-xs-6">
                          <p>Vehicle Name</p>
                          <h4>{vehicle.Vehicle?.Name || "Unknown"}</h4>
                        </div>
                        <div className="col-xs-6">
                          <p>Type</p>
                          <h4>
                            {vehicle.Vehicle?.VehicleType?.VehicleType ||
                              "Unknown"}
                          </h4>
                        </div>
                      </div>
                    ))}
                  <div className="flight-date">
                    Rent Date:{" "}
                    {
                      new Date(rentDetail.RentDate || Date.now())
                        .toISOString()
                        .split("T")[0]
                    }
                  </div>
                  <div className="flight-date">
                    Time use:{" "}
                    {new Date(
                      rentDetail.StartTime || Date.now()
                    ).toLocaleTimeString()}{" "}
                    -{" "}
                    {new Date(
                      rentDetail.EndTime || Date.now()
                    ).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button type="primary" onClick={handlePrint} className="print-button">
          Print Ticket
        </Button>
      </div>
    </>
  );
};

export default TicketComponent;
