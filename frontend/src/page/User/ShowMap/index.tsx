import MapZoo from "../../../assets/mapzoo.jpg";

const index = () => {
  return (
    <div style={{width:"100%",height:"100%"}}>
      <center>
        <h1 style={{marginBottom:"20px",fontFamily:"fantasy",fontSize:"28px",color:"gray"}}>MAP OF LITTLE ZOO</h1>
        <img src={MapZoo} style={{ width: "1100px", height: "500px" }} />
      </center>
    </div>
  );
};

export default index;
