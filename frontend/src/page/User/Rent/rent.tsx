import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import "./Rent.css";
import {
  getRentsByTicketBookedID,
  getAvailableVehicles,
  createTicketRented,
  createVehicleRent,
  updateBookingByID,
  DeleteBooking,
  DeleteTicketBookedByID,
} from "../../../services/https/mj";

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

const Rent: React.FC = () => {
  FontLoaderComponent();
  const location = useLocation();
  const navigate = useNavigate();// @ts-ignore
  const [rentCount, setRentCount] = useState<number>(0);
  const [uid, setUid] = useState<number>(
    Number(localStorage.getItem("userid")) || 0
  );

  const { ticketBookedID, visitDate, totalPrice: initialTotalPrice, bookingID, QuantityCustomer } = location.state || {};
  console.log(visitDate, initialTotalPrice, bookingID, QuantityCustomer, ticketBookedID);

  const formattedVisitDate = visitDate
    ? new Date(visitDate).toISOString().split("T")[0]
    : "Unknown";

  const rentDate = formattedVisitDate;

  const availableTimes = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
  ];

  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [bookedVehicles, setBookedVehicles] = useState<number[]>([]);
  const [totalBookedCount, setTotalBookedCount] = useState<number>(0);// @ts-ignore
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalPriceRent, setTotalPriceRent] = useState<number>(0);
  const [totalQuantityCustomer, setTotalQuantityCustomer] = useState<number>(0);


  const calculateStartEndTime = (time: string) => {
    if (!time) return { startTime: "", endTime: "" };
    const startTime = new Date(`${rentDate}T${time}:00.000Z`);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const formattedStartTime = startTime.toISOString().replace(".000", "");
    const formattedEndTime = endTime.toISOString().replace(".000", "");

    console.log("Formatted StartTime:", formattedStartTime);
    console.log("Formatted EndTime:", formattedEndTime);

    return { startTime: formattedStartTime, endTime: formattedEndTime };
  };
  const { startTime, endTime } = calculateStartEndTime(selectedTime);

  const fetchRentCount = async () => {
    try {
      if (ticketBookedID) {
        console.log(ticketBookedID);
        const rents = await getRentsByTicketBookedID(ticketBookedID);
        console.log(rents);
  
        const totalQuantity = rents.reduce(
          (sum: number, rent: any) => sum + (rent?.TotalQuantity || 0),
          0
        );
  
        console.log("Total QuantityCustomer:", totalQuantity);
        setTotalQuantityCustomer(totalQuantity); // อัปเดต state
        setRentCount(rents?.length || 0);
  
        const totalRentPrice = rents.reduce(
          (total: number, rent: any) => total + (rent.TotalPrice || 0),
          0
        );
        console.log(totalRentPrice);
        setTotalPrice((prev) => prev + totalRentPrice);
      }
    } catch (error) {
      message.error("Failed to fetch rents.");
      console.error(error);
    }
  };
  

  useEffect(() => {
    setUid(Number(localStorage.getItem("userid")));
    fetchRentCount();
    const fetchAvailableVehicles = async () => {
      try {
        console.log("Rent Date:", rentDate);
        console.log("StartTime ISO:", startTime);
        console.log("EndTime ISO:", endTime);

        const vehicles = await getAvailableVehicles(rentDate, startTime, endTime);
        setAvailableVehicles(vehicles);
      } catch (error: any) {
        message.warning(error.message || "Failed to fetch available vehicles.");
      }
    };

    fetchAvailableVehicles();
  }, [rentDate, selectedTime]);

  const golfVehicles = availableVehicles.filter(
    (vehicle) => vehicle.VehicleTypeID === 2
  );
  const bicycles = availableVehicles.filter(
    (vehicle) => vehicle.VehicleTypeID === 1
  );

  console.log(golfVehicles)

  const handleBookingToggle = (vehicle: any) => {
    const isBooked = bookedVehicles.includes(vehicle.ID);
  
    if (isBooked) {
      // ยกเลิกการจอง
      setBookedVehicles((prev) => prev.filter((id) => id !== vehicle.ID));
      setTotalBookedCount((prev) => prev - 1);
      setTotalPrice((prev) => prev - vehicle.Price);
      setTotalPriceRent((prev) => prev - vehicle.Price)
    } else {
      // ตรวจสอบว่าจำนวนที่จองทั้งหมด (รวมการจองใหม่) เกินจำนวนที่อนุญาตหรือไม่
      if (totalQuantityCustomer + totalBookedCount >= QuantityCustomer) {
        message.warning("Cannot book more than the total customer limit.");
        return;
      }
      // เพิ่มการจองใหม่
      setBookedVehicles((prev) => [...prev, vehicle.ID]);
      setTotalBookedCount((prev) => prev + 1);
      setTotalPrice((prev) => prev + vehicle.Price);
      setTotalPriceRent((prev) => prev + vehicle.Price)
    }
  };
  
  

  const getButtonColor = (vehicle: any) => {
    return bookedVehicles.includes(vehicle.ID) ? "gray" : "#048F0D";
  };
  // @ts-ignore
  const validateRentData = (data: any) => {
    if (data.TotalQuantity < 0) {
      return "Total quantity must be a non-negative number.";
    }
    if (!data.RentDate || isNaN(new Date(data.RentDate).getTime())) {
      return "Invalid rent date.";
    }
    if (!data.StartTime || !data.EndTime) {
      return "Start time and end time are required.";
    }
    if (new Date(data.StartTime) >= new Date(data.EndTime)) {
      return "Start time must be earlier than end time.";
    }
    if (data.TotalPrice === undefined || data.TotalPrice < 0) {
      return "Total price must be a non-negative number.";
    }
    if (!data.TicketBookedID) {
      return "TicketBookedID is required.";
    }
    return null;
  };
  // @ts-ignore
  const validateVehicleRentData = (vehicleRentData: any[]): string | null => {
    if (!Array.isArray(vehicleRentData) || vehicleRentData.length === 0) {
      return "VehicleRent data must be a non-empty array.";
    }

    for (const vehicleRent of vehicleRentData) {
      if (!vehicleRent.RentID) {
        return "RentID is required for all vehicle rent entries.";
      }
      if (!vehicleRent.VehicleID) {
        return "VehicleID is required for all vehicle rent entries.";
      }
      if (
        !Number.isInteger(vehicleRent.Quantity) ||
        vehicleRent.Quantity < 0
      ) {
        return "Quantity must be a positive integer for all vehicle rent entries.";
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!ticketBookedID) {
      message.error("TicketBookedID is missing.");
      return;
    }

    const formattedRentDate = `${rentDate}T00:00:00Z`;

    if (totalBookedCount > 0) {
      const rentData = {
        TotalQuantity: totalBookedCount,
        RentDate: formattedRentDate,
        StartTime: startTime,
        EndTime: endTime,
        TotalPrice: totalPriceRent,
        TicketBookedID: ticketBookedID,
      };

      try {
        const rentResult = await createTicketRented(rentData);
        if (rentResult && rentResult.data) {
          const rentID = rentResult.data.ID;
          message.success("Rent created successfully!");

          if (bookedVehicles.length > 0) {
            const vehicleRentData = bookedVehicles.map((vehicleID) => ({
              RentID: rentID,
              VehicleID: vehicleID,
              Quantity: 1,
            }));

            const vehicleRentResult = await createVehicleRent(vehicleRentData);
            if (vehicleRentResult) {
              message.success("VehicleRent created successfully!");
            } else {
              message.error("Failed to create VehicleRent.");
            }
          }
        } else {
          message.error("Failed to create Rent.");
        }
      } catch (error) {
        message.error("An error occurred while creating Rent.");
        console.error(error);
        return;
      }
    }

    try {
      const rentings = await getRentsByTicketBookedID(ticketBookedID);
      const totalRentPriceRentNow = rentings.reduce(
        (total: number, rent: any) => total + (rent.TotalPrice || 0),
        0
      );
      console.log(totalRentPriceRentNow);

      const combinedTotalPriceNew = initialTotalPrice + totalRentPriceRentNow;

      const updateResult = await updateBookingByID(bookingID, {
        AllPrice: combinedTotalPriceNew,
      });

      if (updateResult) {
        message.success("Booking updated successfully!");
        navigate("/user/choosepromotion", { state: { bookingID } });
      } else {
        message.error("Failed to update Booking.");
      }
    } catch (error) {
      message.error("An error occurred while updating Booking.");
      console.error(error);
    }
  };

  const handleCancel = async () => {
    if (!bookingID || !ticketBookedID) {
      message.error("Booking ID หรือ TicketBooked ID ไม่ถูกต้อง");
      return;
    }

    try {
      const ticketDeleted = await DeleteTicketBookedByID(ticketBookedID);
      if (!ticketDeleted) {
        message.error("ลบ TicketBooked ไม่สำเร็จ");
        return;
      }
      message.success("ลบ TicketBooked สำเร็จ");

      const bookingDeleted = await DeleteBooking(Number(uid));
      if (!bookingDeleted) {
        message.error("ลบ Booking ไม่สำเร็จ");
        return;
      }
      message.success("ลบ Booking สำเร็จ");

      navigate("/");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดขณะลบข้อมูล");
      console.error(error);
    }
  };

  const golfVehicleCount = golfVehicles.length;
  const bicycleCount = bicycles.length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "30px" }}>
          <div
            style={{
              fontSize: "60px",
              marginRight: "auto",
              paddingLeft: "20px",
              fontFamily: "'Acme', serif",
              fontWeight: "bold",
              marginLeft: "30px",
              textShadow: "2px 2px rgb(41, 26, 16)",
              color: "#B25900",
            }}
          >
            Vehicle Rental
          </div>

          <div style={{ fontSize: "20px", textAlign: "right", marginLeft: "auto", marginRight: "50px" }}>
            <p style={{ fontFamily: "'Concert One',serif" }}>
              <span style={{ fontWeight: "bold", marginRight: "5px", fontFamily: "'Concert One',serif" }}>Rent Date :</span>
              {rentDate}
            </p>
            <label htmlFor="timePicker" style={{ display: "block", marginBottom: "10px", marginTop: "10px", fontFamily: "'Concert One',serif" }}>
              <span style={{ fontWeight: "bold", fontFamily: "'Concert One',serif" }}>Select Start Time :</span>
              <select
                id="timePicker"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{ marginLeft: "10px", border: "2px solid #FED400", backgroundColor: "#FED400", padding: "0px 10px 0px 10px", borderRadius: "10px" }}
              >
                <option value="" disabled>-- Select Time --</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            {selectedTime && (
              <p>
                <span style={{ fontWeight: "bold", marginRight: "5px", fontSize: "25px", fontFamily: "'Concert One',serif", textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)", color: "#048F0D" }}>Period Time : </span>
                <span style={{ fontWeight: "bold", marginRight: "5px", fontSize: "30px", fontFamily: "'Concert One',serif", textShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)", color: "#048F0D" }}>{startTime.split("T")[1].slice(0, 5)} - {endTime.split("T")[1].slice(0, 5)}</span>
              </p>
            )}
          </div>
        </div>
        
        {selectedTime && (
          <h1 style={{ marginTop: "20px", fontSize: "30px", fontFamily: "'Passion One',serif", color: "#5C3F28", letterSpacing: "0.5px" }}>
            Golf Carts : {golfVehicleCount} available
          </h1>
        )}
        <div className="vehicle-gallery">
          <div className="vehicle-row">
            {golfVehicles.map((vehicle) => (
              <div key={vehicle.ID} className="card-container-vehicle">
                <img
                  src={`http://localhost:8000/${vehicle.Picture}`}
                  alt={vehicle.Name}
                  className="card-img-vehicle"
                />
                <h2 className="card-title-vehicle">{vehicle.Name}</h2>
                <p className="card-description-vehicle">
                  <div>{vehicle.Description}</div>
                  <div style={{ fontFamily: "'Tilt Neon',serif", fontWeight: "bold", fontSize: "25px", color: "red" }}>฿{vehicle.Price}</div>
                </p>
                <Button onClick={() => handleBookingToggle(vehicle)}
                  style={{
                    backgroundColor: getButtonColor(vehicle),
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}>
                  {bookedVehicles.includes(vehicle.ID) ? "Booked" : "Booking"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {selectedTime && (
          <h1 style={{ marginTop: "20px", fontSize: "30px", fontFamily: "'Passion One',serif", color: "#5C3F28", letterSpacing: "1px" }}>
            Bicycles: {bicycleCount} available
          </h1>
        )}
        <div className="vehicle-gallery">
          <div className="vehicle-row">
            {bicycles.map((vehicle) => (
              <div key={vehicle.ID} className="card-container-vehicle">
                <img
                  src={`http://localhost:8000/${vehicle.Picture}`}
                  alt={vehicle.Name}
                  className="card-img-vehicle"
                />
                <h2 className="card-title-vehicle">{vehicle.Name}</h2>
                <p className="card-description-vehicle">
                  <div>{vehicle.Description}</div>
                  <div style={{ fontFamily: "'Tilt Neon',serif", fontWeight: "bold", fontSize: "25px", color: "red" }}>฿{vehicle.Price}</div>
                </p>
                <Button onClick={() => handleBookingToggle(vehicle)}
                  style={{
                    backgroundColor: getButtonColor(vehicle),
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}>
                  {bookedVehicles.includes(vehicle.ID) ? "Booked" : "Booking"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginRight: "30px", marginBottom: "20px" }}>
        <Button
          type="default"
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
            marginTop: "20px"
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
            target.style.color = "#FF0000";
            target.style.borderColor = "#FF0000";
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "none";
            target.style.color = "#B25900";
            target.style.borderColor = "#B25900";
            target.style.backgroundColor = "#FFFFFF";
          }}
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          type="primary"
          style={{
            backgroundColor: "#B25900",
            borderColor: "#B25900",
            color: "#fdfefe",
            fontSize: "25px",
            fontWeight: "bold",
            padding: "10px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            height: "50px",
            width: "150px",
            marginTop: "20px"
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
            target.style.backgroundColor = "#BC752E";
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.boxShadow = "none";
            target.style.backgroundColor = "#B25900";
          }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Rent;