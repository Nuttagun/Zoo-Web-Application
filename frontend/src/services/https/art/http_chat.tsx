import { ChatInterface } from "../../../interface/IChat";

const apiUrl = "http://localhost:8000";

async function CreateChat(data: ChatInterface) {
  const requestOptions = {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    console.log("Request Options:", requestOptions);
    const response = await fetch(`${apiUrl}/chat_create`, requestOptions);
    console.log("Response Status:", response.status);

    const responseData = await response.json();
    console.log("Response Data:", responseData);

    return {
      status: response.ok,
      message: response.ok ? responseData.message : responseData.error,
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      status: false,
      message: "An error occurred",
    };
  }
}

//chat_zookeeper_create
async function CreateZookeeperChat(data: ChatInterface) {
  const requestOptions = {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    console.log("Request Options:", requestOptions);
    const response = await fetch(`${apiUrl}/chat_zookeeper_create`, requestOptions);
    console.log("Response Status:", response.status);

    const responseData = await response.json();
    console.log("Response Data:", responseData);

    return {
      status: response.ok,
      message: response.ok ? responseData.message : responseData.error,
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      status: false,
      message: "An error occurred",
    };
  }
}

async function GetChat() {
    const requestOptions = {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
};

    let res = await fetch(`${apiUrl}/get_chat`, requestOptions) 
        .then((res) => {
        if (res.status == 200) {
            return res.json();
        } else {
            return false;
        }
        });
    return res;
}

// async function GetChat(userid: string | null) {
//     const requestOptions = {
//       method: "GET",
//       // headers: getAuthHeaders(),
//       headers: {
//         "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       },
//     };
  
//     let res = await fetch(`${apiUrl}/get_chat/${userid}`, requestOptions) 
//       .then((res) => {
//         if (res.status == 200) {
//           return res.json();
//         } else {
//           return false;
//         }
//       });
//     return res;
// }



export {
    CreateChat,
    GetChat,
    CreateZookeeperChat
} 
