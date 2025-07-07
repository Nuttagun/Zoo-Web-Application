import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./work.css";
import Logo from "../../../assets/logotest.png";
import { getFoodRequisitionByWorkID } from "../../../services/https/index";
import { FoodRequisition } from "../../../interface/IFoodRequisition";

const Scription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workID = location.state?.workID;
  const [foodRequisitions, setFoodRequisitions] = useState<
    FoodRequisition[] | null
  >(null);

  const fetchFoodRequisitions = async () => {
    if (!workID) {
      console.error("Work ID is not provided");
      return;
    }

    const data = await getFoodRequisitionByWorkID(workID);
    if (data) {
      console.log("Food Requisitions:", data);
      setFoodRequisitions(data);
    } else {
      console.error("Failed to fetch food requisitions");
    }
  };

  useEffect(() => {
    fetchFoodRequisitions();
  }, [workID]);

  const printInvoice = () => {
    window.print();
  };

  const handleCancel = () => {
    navigate("/zookeeper/detail");
  };

  if (!foodRequisitions || foodRequisitions.length === 0) {
    return null; 
  }

  const habitatName =
    foodRequisitions?.[0]?.Work?.Habitat?.Name || "Unknown Habitat";
  const EmployeeFirstName =
    foodRequisitions?.[0]?.Work?.Employee?.User?.FirstName ||
    "Unknown FirstName";
  const EmployeeLastName =
    foodRequisitions?.[0]?.Work?.Employee?.User?.LastName || "Unknown LastName";
  const EmployeeEmail =
    foodRequisitions?.[0]?.Work?.Employee?.User?.Email || "Unknown Email";

  return (
    <div className="invoice-wrapper" id="print-area">
      <div className="invoice">
        <div className="invoice-container">
          <div className="invoice-head">
            <div className="invoice-head-top">
              <div className="invoice-head-top-left text-start">
                <img src={Logo} alt="Logo" />
              </div>
              <div className="invoice-head-top-right text-end">
                <h3>Animal Feed Receipt</h3>
              </div>
            </div>
            <div className="hr"></div>
            <div className="invoice-head-middle">
              <div className="invoice-head-middle-left text-start">
                <p>
                  <span className="text-bold">Work :</span> {workID}
                </p>
                <p>
                  <span className="text-bold">Date:</span>{" "}
                  {foodRequisitions?.[0]?.RequisitionDate
                    ? new Date(
                        foodRequisitions[0].RequisitionDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="invoice-head-middle-right text-end"></div>
            </div>
            <div className="hr"></div>
            <div className="invoice-head-bottom">
              <div className="invoice-head-bottom-left">
                <ul>
                  <li className="text-bold">Invoiced To:</li>
                  <li>
                    {EmployeeFirstName} {EmployeeLastName}
                  </li>
                  <li>{EmployeeEmail}</li>
                </ul>
              </div>
              <div className="invoice-head-bottom-right">
                <ul className="text-end">
                  <li className="text-bold">Withdraw food at</li>
                  <li>Zootopia</li>
                  <li>Zoo@Zootopia.com</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="overflow-view">
            <div className="invoice-body">
              <table>
                <thead>
                  <tr>
                    <td className="text-bold">Food Item</td>
                    <td className="text-bold">Food Name</td>
                    <td className="text-bold">Food Category</td>
                    <td className="text-bold">QTY</td>
                    <td className="text-bold">HABITAT</td>
                  </tr>
                </thead>
                <tbody>
                  {foodRequisitions?.[0]?.Details.map((detail, index) => (
                    <tr key={index}>
                      <td>{detail.StockOfFoodID}</td>
                      <td>{detail.StockOfFood?.Foodname}</td>
                      <td>
                        {detail.StockOfFood?.CatagoryOfFood?.StockfoodType}
                      </td>
                      <td>{detail.Quantity}</td>
                      <td className="text-end">{habitatName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="invoice-body-bottom">
                <div className="invoice-body-info-item">
                  <div className="info-item-td text-end text-bold">
                    Total FOOD :
                  </div>
                  <div className="info-item-td text-end">
                    {foodRequisitions?.[0]?.Details.reduce(
                      (total, detail) => total + detail.Quantity,
                      0
                    ) || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="invoice-foot text-center">
            <div className="invoice-btns">
              <button
                style={{ marginRight: "10px" }}
                type="button"
                className="invoice-btn"
                onClick={handleCancel}
              >
                <span>
                  <i className="fa-solid fa-arrow-left"></i>
                </span>
                <span>Cancel</span>
              </button>
              <button
                type="button"
                className="invoice-btn"
                onClick={printInvoice}
              >
                <span>
                  <i className="fa-solid fa-print"></i>
                </span>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scription;
