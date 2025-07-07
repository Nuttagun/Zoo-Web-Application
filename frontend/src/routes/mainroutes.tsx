import { lazy } from "react";
import { useRoutes, RouteObject} from "react-router-dom";
import Loadable from "../component/third-patry/Loadable";

const Login = Loadable(lazy(() => import("../page/Login/Login")));
const Register = Loadable(lazy(() => import("../page/Signup/signup")));
const AdminLayout = Loadable(lazy(() => import("../page/Admin/AdminLayout/MainLayout")));
const AddEmployee = Loadable(lazy(() => import("../page/Admin/Employee/addemployee")));
const AdminDashboard = Loadable(lazy(() => import("../page/Admin/admindashboard")));
const Userlist = Loadable(lazy(() => import("../page/Admin/User/userlist")));
const Zookeeperlist = Loadable(lazy(() => import("../page/Admin/Employee/zookeeperlist")));
const Vetlist = Loadable(lazy(() => import("../page/Admin/Employee/vetlist")));
const Adminlist = Loadable(lazy(() => import("../page/Admin/Employee/adminlist")));
const Zoosalelist = Loadable(lazy(() => import("../page/Admin/Employee/zoosale")));
const Vahimanelist = Loadable(lazy(() => import("../page/Admin/Employee/vahimanelist")));
const PaymentConfirmation = Loadable(lazy(() => import("../page/Admin/ComfirmPayment/confirmpayment")));
const User = Loadable(lazy(() => import("../page/User/index")));
const Profile = Loadable(lazy(() => import("../page/User/Profile/profile")));
const EditProfile = Loadable(lazy(() => import("../page/User/Profile/editprofile")));
const EditEmployee = Loadable(lazy(() => import("../page/User/Profile/editemployee")));
const Myticket = Loadable(lazy(() => import("../page/User/Ticket/MyTicket/myticket")));
const TicketDesign = Loadable(lazy(() => import("../page/User/Ticket/MyTicket/TIcketDesign/TicketDesign")));
const ChoosePromotion = Loadable(lazy(() => import("../page/User/paymenticket/ChoosePromotion")));
const PaymentTicket = Loadable(lazy(() => import("../page/User/paymenticket/PaymentTicket")));


//ZooSale
const ManageZooShop = Loadable(lazy(() => import("../page/Zoosale/ManageZooShop")));
const ReceiveProduct = Loadable(lazy(() => import("../page/Zoosale/ReceiveProduct")));
const SaleProduct = Loadable(lazy(() => import("../page/Zoosale/SaleProduct")));
const OrganizeProducts = Loadable(lazy(() => import("../page/Zoosale/organizeproduct")));
const ManageShelfZone = Loadable(lazy(() => import("../page/Zoosale/ManageShelfZone")));

//Zookeeper
const ZookeeperLayout = Loadable(lazy(() => import("../page/Zookeeper/ZookeeperLayout/MainLayout")));
const Animal = Loadable(lazy(() => import("../page/Zookeeper/animals/animal")));
const CreateAnimal = Loadable(lazy(() => import("../page/Zookeeper/animals/create/index")));
const EditAnimal = Loadable(lazy(() => import("../page/Zookeeper/animals/edit/index")));
const Habitat = Loadable(lazy(() => import("../page/Zookeeper/habitat/habitat")));
const CreateHabitat = Loadable(lazy(() => import("../page/Zookeeper/habitat/create/index")));
const EditHabitat = Loadable(lazy(() => import("../page/Zookeeper/habitat/edit/index")));
const Report = Loadable(lazy(() => import("../page/Zookeeper/report/report")));
const CreateReport = Loadable(lazy(() => import("../page/Zookeeper/report/create/index")));
const EditReport = Loadable(lazy(() => import("../page/Zookeeper/report/edit/index")));
const Calendar = Loadable(lazy(() => import("../page/Zookeeper/calendar/calendar")));
const Event = Loadable(lazy(() => import("../page/Zookeeper/event/event")));
const CreateEvent = Loadable(lazy(() => import("../page/Zookeeper/event/create/index")));
const EditEvent = Loadable(lazy(() => import("../page/Zookeeper/event/edit/index")));
const Work = Loadable(lazy(() => import("../page/Zookeeper/work/work")));
const CreateWork = Loadable(lazy(() => import("../page/Zookeeper/work/work")));
const Detail = Loadable(lazy(() => import("../page/Zookeeper/work/Detail/Popular")));
const Scription = Loadable(lazy(() => import("../page/Zookeeper/work/scription")));
const Stock = Loadable(lazy(() => import("../page/Zookeeper/stock/stock")));
const CreateStockFood = Loadable(lazy(() => import("../page/Zookeeper/stock/create/createFoodindex")));
const EditStock = Loadable(lazy(() => import("../page/Zookeeper/stock/edit/editFoodindex")));

//Vehicle Manager
const Vehicle = Loadable(lazy(() => import("../page/VehicleManager/vehicle")));
const VehicleLayout = Loadable(lazy(() => import("../component/vehiclemanager/topbar")));
const CreateVehicle = Loadable(lazy(() => import("../page/VehicleManager/create/create")));
const EditVehicle = Loadable(lazy(() => import("../page/VehicleManager/edit/update")));

//BookTicket and RentVehicle
const Ticket = Loadable(lazy(() => import("../page/User/Ticket/ticket")));
const Booked = Loadable(lazy(() => import("../page/User/Ticket/booked")));
const Rent = Loadable(lazy(() => import("../page/User/Rent/rent")));

const VetDashboard = Loadable(lazy(() => import("../page/Vetdashboard/AnimalOverview")));
const MedicalRecord = Loadable(lazy(() => import("../page/Vetdashboard/MedicalRecord")));
const AnimalDied = Loadable(lazy(() => import("../page/Vetdashboard/AnimalDiedPage")));
const Prescriptions = Loadable(lazy(() => import("../page/Vetdashboard/PrescriptionPage")));
const Analysis = Loadable(lazy(() => import("../page/Vetdashboard/Analysis")));
const ReportForVet = Loadable(lazy(() => import("../page/Vetdashboard/ReportPage")));
const MedicineManager = Loadable(lazy(() => import("../page/Vetdashboard/MedicineManager")));
const MedicineType = Loadable(lazy(() => import("../page/Vetdashboard/MedicineType")))

const CreatePromotionPages = Loadable(lazy(() => import("../page/Admin/Promotion/Create")));
const PromotionList = Loadable(lazy(() => import("../page/Admin/Promotion/promotionlist")));
const EditPromotion = Loadable(lazy(() => import("../page/Admin/Promotion/Edit")));
//User

//Chat
const AdminChat = Loadable(lazy(() => import("../page/Admin/AdminChat/adminchat")));
const ZookeeperChat = Loadable(lazy(() => import("../page/Zookeeper/zookeeeper_chat/zookeeper_chat")));

const AdminRoutes = (): RouteObject[] => [
  {
    path: "/", element: <AdminLayout />, 
  },                                          
  {
    path: "/admin", element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "addemployee", element: <AddEmployee /> },
      { path: "userlist", element: <Userlist /> },
      { path: "adminlist", element: <Adminlist /> },
      { path: "zookeeperlist", element: <Zookeeperlist /> },
      { path: "vetlist", element: <Vetlist /> },
      { path: "zoosalelist", element: <Zoosalelist /> },
      { path: "vahimanelist", element: <Vahimanelist /> },
      { path: "paymentconfirm", element: <PaymentConfirmation /> },
      { path: "createpromotion", element: <CreatePromotionPages/>},
      { path: "promotionlist", element: <PromotionList/>},
      { path: "/admin/editpromotion/:id", element: <EditPromotion/>},
      { path: "/admin/admin_chat", element: <AdminChat/>},
      { path: "editprofile/:id", element: <EditProfile /> },
      { path: "edit/:id", element: <EditEmployee /> },
    ],
  },
];

const UserRoutes = (): RouteObject[] => [
  {
    path: "/", element: <User />, 
  },                                          
  {
    path: "/user",
    children: [
      { index: true, element: <User /> },
      { path: "/user/ticket/:bookingID/:ticketTypeID", element: <Ticket /> },
      { path: "rent", element: <Rent /> },
      { path: "booked", element: <Booked /> },
      { path: "myticket", element: <Myticket /> },
      { path: "profile", element: <Profile /> },
      { path: "choosepromotion", element: <ChoosePromotion /> },
      { path: "paymentticket", element: <PaymentTicket /> },
      { path: "editprofile/:id", element: <EditProfile /> },
    ],
  },
  {
    path: "/user/ticketdesign",
    element: <TicketDesign />,
  },
];

const ZookeeperRoutes = (): RouteObject[] => [
  {
    path: "/",
    element: <ZookeeperLayout />,  
    children: [
      { index: true, element: <Animal /> },  
    ],
  },
  {
    path: "/zookeeper",
    element: <ZookeeperLayout />,  
    children: [
      { index: true, element: <Animal /> },
      { path: "create-animal", element: <CreateAnimal /> },
      { path: "animals/edit/:id", element: <EditAnimal /> },
      { path: "habitat", element: <Habitat /> },
      { path: "create-habitat", element: <CreateHabitat /> },
      { path: "habitat/edit/:id", element: <EditHabitat /> },
      { path: "report", element: <Report /> },
      { path: "create-report", element: <CreateReport /> },
      { path: "report/edit/:id", element: <EditReport /> },
      { path: "calendar", element: <Calendar /> },
      { path: "event", element: <Event /> },
      { path: "create-event", element: <CreateEvent /> },
      { path: "events/edit/:id", element: <EditEvent /> },
      { path: "work", element: <Work /> },
      { path: "detail", element: <Detail /> },
      { path: "stock", element: <Stock /> },
      { path: "stock/edit/:id", element: <EditStock />},
      { path: "createfood", element: <CreateStockFood />},
      { path: "create-work", element: <CreateWork /> },
      { path: "zookeeper_chat", element: <ZookeeperChat/>},
      { path: "login", element: <Login /> },
      { path: "editprofile/:id", element: <EditProfile /> },
    ],
  },
  {
    path: "/zookeeper/scription",
    element: <Scription />,
  },
];


const VehicleManager = (): RouteObject[] => [
  {
    path: "/",
    element: <VehicleLayout />,  
    children: [
      { index: true, element: <Vehicle /> },  
    ],
  },
  {
    path: "/vehiclemanager",
    element: <VehicleLayout />, 
    children: [
      { index: true, element: <Vehicle /> },
      { path: "create-vehicle", element: <CreateVehicle /> },
      { path: "vehicles/edit/:id", element: <EditVehicle /> },
      { path: "login", element: <Login /> },
      { path: "editprofile/:id", element: <EditProfile /> }, 
    ],
  },
];


const ZooSaleRoutes = (): RouteObject[] => [
  {
    path: "/", element: <ManageZooShop />, 
  },                                          
  {
    path: "/zoosale",
    children: [
      { index: true, element: <ManageZooShop /> },
      {path: "managezooshop", element: <ManageZooShop /> },
      {path: "receiveproduct", element: <ReceiveProduct/>},
      {path: "saleproduct", element: <SaleProduct/>},
      {path: "organizeproduct", element: <OrganizeProducts/>},
      {path: "manageshelfzone", element: <ManageShelfZone/>},
      { path: "*", element: <ManageZooShop /> },
      { path: "editprofile/:id", element: <EditProfile /> },
    ],
  },
  { path: "*", element: <ManageZooShop /> }, 
];


const MainRoutes = (): RouteObject[] => [
  {
    path: "/",
    children: [
      { index: true, element: <Login /> },
      {path: "/register", element: <Register/>},
      { path: "*", element: <Login /> },
      {path: "/register", element: <Register/>},
    ],
  },
];


const VetDashboardRoutes = (): RouteObject[] => [
  {
    path: "/vetdashboard", 
    element: <VetDashboard />, 
  },
  {
    path: "/vetdashboard",
    children: [
      { index: true, element: <VetDashboard /> }, 
      { path: "medicalrecord", element: <MedicalRecord /> }, 
      { path: "animaldied", element: <AnimalDied /> }, 
      { path: "prescriptions", element: <Prescriptions /> }, 
      { path: "analysis", element: <Analysis /> },
      { path: "report", element: <ReportForVet /> }, 
      { path: "medicinemanage", element: <MedicineManager />},
      { path: "medicinetype", element: <MedicineType/>},
      { path: "editprofile/:id", element: <EditProfile /> },
    ],
  },
];



function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';
  const roleName = localStorage.getItem('roleName');
  const employeeID = localStorage.getItem('employeeid');
  const userid = localStorage.getItem('userid');

  console.log("isLoggedIn:", isLoggedIn);
  console.log("roleName:", roleName);
  console.log("employeeid:", employeeID);
  console.log("userid:", userid);

  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    switch (roleName) {
      case 'Admin':
        routes = AdminRoutes();
        break;
      case 'User':
        routes = UserRoutes();
        break;
      case 'Zookeeper':
        routes = ZookeeperRoutes();
        break;
      case 'VehicleManager':
        routes = VehicleManager();
        break;
      case 'ZooSale':
        routes = ZooSaleRoutes();
        break;
      case 'Veterinarian':
        routes = VetDashboardRoutes();
        break;
      default:
        routes = MainRoutes();
        break;
    }
  } 
  else {
    routes = MainRoutes();
  }

  return useRoutes(routes);
}
export default ConfigRoutes;
