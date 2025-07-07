import axios from "axios";
import { UsersInterface } from "../../interface/IUser";
import { CalendarInterface } from "../../interface/ICalendar";
import { ReviewInterface } from "../../interface/IReview";
import { UserReviews } from "../../interface/IReview";
import { EventsInterface } from "../../interface/IEvent";
import { HabitatInterface } from "../../interface/IHabitat";
import { AnimalsInterface } from "../../interface/IAnimal";
import { ReportInterface } from "../../interface/IReport";
import { WorkInterface,WorkResponse } from "../../interface/IWork";
import { StockOfFood } from "../../interface/IStockOfFoodInterface";
import { FoodRequisition } from "../../interface/IFoodRequisition";
import { FoodRequisitionDetail,ReduceStockFoodQuantityInput } from "../../interface/IFoodRequisitionDetail";

const apiUrl = "http://localhost:8000";

const getRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const deleteRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const formDataRequestOptions = (method: string, formData: FormData) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");

  return {
    method: method,
    headers: {
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: formData,
  };
};

const postRequestOptions = (body: any) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: JSON.stringify(body),
  };
};

export const getUpcomingEvents = async (): Promise<EventsInterface[]> => {
  const url = `${apiUrl}/events/upcoming`;

  try {
    const response = await fetch(url, getRequestOptions());
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data: EventsInterface[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch upcoming events:", error);
    throw error;
  }
};

export const getCalendars = async (): Promise<CalendarInterface[]> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<CalendarInterface[]>(
      `${apiUrl}/calendar`,
      requestOptions
    );
    return response.data;
  } catch (error) {
    throw new Error("Error fetching calendars: " + (error as Error).message);
  }
};

export const createCalendar = async (
  calendar: Omit<CalendarInterface, "id">
): Promise<CalendarInterface> => {
  try {
    const requestOptions = postRequestOptions(calendar);
    const response = await fetch(`${apiUrl}/create-calendar`, requestOptions);
    if (!response.ok) {
      throw new Error("Error creating calendar");
    }
    const data: CalendarInterface = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw new Error("Error creating calendar: " + (error as Error).message);
  }
};

export const deleteCalendar = async (calendarId: number): Promise<void> => {
  try {
    const requestOptions = deleteRequestOptions();

    await axios.delete(
      `${apiUrl}/delete-calendar/${calendarId}`,
      requestOptions
    );
  } catch (error) {
    throw new Error("Error deleting calendar: " + (error as Error).message);
  }
};


export const ListReview = async (): Promise<ReviewInterface[] | false> => {
  try {
    const requestOptions = getRequestOptions();

    const response = await fetch(`${apiUrl}/reviews`, requestOptions);

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลรีวิว:", error);
    return false;
  }
};

export const listReviewsByUserID = async (
  userID: number
): Promise<ReviewInterface[] | false> => {
  try {
    const response = await fetch(
      `${apiUrl}/reviews/${userID}`,
      getRequestOptions()
    );
    if (!response.ok) throw new Error("Failed to fetch reviews.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return false;
  }
};

export const GetUserByIdReview = async (
  id: number | undefined
): Promise<UserReviews | false> => {
  try {
    if (id === undefined) return false;

    const requestOptions = getRequestOptions();

    const response = await fetch(`${apiUrl}/user-review/${id}`, requestOptions);

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลผู้ใช้ตาม ID:", error);
    return false;
  }
};

export const CreateReview = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const Authorization = localStorage.getItem("token");
    const Bearer = localStorage.getItem("token_type");

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `${Bearer} ${Authorization}`,
      },
      body: formData,
    };

    const response = await fetch(`${apiUrl}/reviews-create`, requestOptions);

    if (!response.ok) {
      console.error("Response status:", response.status);
      throw new Error("Invalid response from server");
    }

    const data = await response.json();
    console.log("Response data:", data); 
    return data;
  } catch (error) {
    console.error("Error creating review:", error);
    return false;
  }
};

export const listBookingsByUserID = async (
  userID: number
): Promise<any | false> => {
  try {
    const response = await axios.get(
      `${apiUrl}/bookings/user/${userID}`,
      getRequestOptions()
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Error fetching bookings");
    }
  } catch (error) {
    console.error("Error fetching bookings by user ID:", error);
    return false;
  }
};

export const GetReviewsByID = async (
  id: number
): Promise<ReviewInterface | false> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await fetch(`${apiUrl}/review/${id}`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to fetch review by ID");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching review by ID:", error);
    return false;
  }
};


export const UpdateReview = async (
  id: number,
  data: ReviewInterface,
  file?: File
): Promise<ReviewInterface | false> => {
  const formData = new FormData();
  console.log("Updating review data:", data);


  for (const key in data) {
    if (data[key as keyof ReviewInterface] !== undefined) {
      formData.append(key, data[key as keyof ReviewInterface] as string);
    }
  }


  if (file) {
    formData.append("Picture", file);
  }

  try {
    const requestOptions = formDataRequestOptions("PATCH", formData); 

    const response = await fetch(`${apiUrl}/reviews/${id}`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to update review");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating review:", error);
    return false;
  }
};

export const GetAllRatingsAvg = async (): Promise<
  { rating: number; percentage: number }[] | false
> => {
  try {
    const requestOptions = getRequestOptions();

    const response = await fetch(`${apiUrl}/ratings`, requestOptions);

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    const data = await response.json();

    if (!Array.isArray(data.ratings)) return false;

    const ratings: number[] = data.ratings;
    const ratingCount = ratings.length;

    const ratingSummary = ratings.reduce<{ [key: number]: number }>(
      (acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      {}
    );

    const avgRatings = Object.keys(ratingSummary).map((rating) => ({
      rating: Number(rating),
      percentage: (ratingSummary[Number(rating)] / ratingCount) * 100,
    }));

    return avgRatings;
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงค่าเฉลี่ยคะแนนรีวิว:", error);
    return false;
  }
};

export const onLikeButtonClick = async (
  reviewID: number,
  userID: number
): Promise<any | false> => {
  try {
    const postOptions = postRequestOptions({
      user_id: userID,
      review_id: reviewID,
    });

    const response = await fetch(`${apiUrl}/reviews/like`, postOptions);

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการกดไลค์:", error);
    return false;
  }
};

export const fetchLikeStatus = async (
  reviewID: number,
  userID: number
): Promise<{ hasLiked: boolean; likeCount: number } | false> => {
  try {
    const requestOptions = getRequestOptions();

    const response = await fetch(
      `${apiUrl}/reviews/${userID}/${reviewID}/like`,
      requestOptions
    );

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    const data = await response.json();
    return {
      hasLiked: data.hasLiked ?? false,
      likeCount: data.likeCount ?? 0,
    };
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงสถานะไลค์:", error);
    return false;
  }
};

export const onUnlikeButtonClick = async (reviewID: number, userID: number) => {
  try {
    const deleteOptions = deleteRequestOptions();

    const response = await fetch(`${apiUrl}/reviews/unlike`, {
      ...deleteOptions,
      body: JSON.stringify({ user_id: userID, review_id: reviewID }),
    });

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการยกเลิกไลค์:", error);
    return false;
  }
};

export const GetFilteredReviews = async (
  starLevel: string
): Promise<ReviewInterface[] | false> => {
  try {
    const query = new URLSearchParams();
    query.append("starLevel", starLevel);

    const requestOptions = getRequestOptions();

    const response = await fetch(
      `${apiUrl}/reviews/filter?${query.toString()}`,
      {
        ...requestOptions,
        method: "GET",
      }
    );

    if (response.status === 204) return [];
    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");

    return await response.json();
  } catch {
    return false;
  }
};

export const SearchReviewsByKeyword = async (
  keyword: string
): Promise<ReviewInterface[] | false> => {
  try {
    const query = new URLSearchParams();
    query.append("keyword", keyword);

    const requestOptions = getRequestOptions();

    const response = await fetch(
      `${apiUrl}/reviews/search?${query.toString()}`,
      {
        ...requestOptions,
        method: "GET",
      }
    );

    if (response.status === 204) return [];
    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");

    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการค้นหารีวิวตามคำสำคัญ:", error);
    return false;
  }
};

export const CreateEvent = async (formData: FormData): Promise<any | false> => {
  try {
    const response = await fetch(`${apiUrl}/events-create`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (response.status !== 201)
      throw new Error("Invalid response from server");

    return await response.json();
  } catch (error) {
    console.error("Error creating event:", error);
    return false;
  }
};

export const ListEvent = async (): Promise<EventsInterface[] | false> => {
  try {
    const response = await fetch(`${apiUrl}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลรีวิว:", error);
    return false;
  }
};

async function DeleteEventByID(id: number | undefined) {
  const requestOptions = deleteRequestOptions();

  let res = await fetch(`${apiUrl}/events/${id}`, requestOptions).then(
    (res) => {
      if (res.status == 200) {
        return true;
      } else {
        return false;
      }
    }
  );

  return res;
}


async function GetEventById(id: number | undefined) {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/event/${id}`, requestOptions).then((res) => {
    if (res.status == 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}


async function UpdateEvent(data: EventsInterface, file?: File) {
  console.log("Data Event Update:", data);
  const formData = new FormData();

  for (const key in data) {
    formData.append(key, data[key as keyof EventsInterface] as string);
  }

  if (file) {
    formData.append("Picture", file);
  }

  const requestOptions = {
    method: "PATCH",
    body: formData,
    headers: {
      Authorization: `${localStorage.getItem(
        "token_type"
      )} ${localStorage.getItem("token")}`,
    },
  };

  let res = await fetch(`${apiUrl}/events/${data.ID}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    }
  );

  return res;
}


export const ListHabitat = async (): Promise<HabitatInterface[] | false> => {
  try {
    const response = await fetch(`${apiUrl}/habitats`, getRequestOptions());

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูล habitat:", error);
    return false;
  }
};



export const ListHabitatAvalibleforAnimal = async (): Promise<HabitatInterface[] | false> => {
  try {
    const response = await fetch(`${apiUrl}/habitats/available`, getRequestOptions());

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูล habitat:", error);
    return false;
  }
};


export const CreateHabitat = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const response = await axios.post(`${apiUrl}/habitats-create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (response.status !== 201) {
      throw new Error("Failed to create habitat.");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating habitat:", error);
    return false;
  }
};


export const GetHabitatById = async (
  id: number | undefined
): Promise<HabitatInterface | false> => {
  try {
    const response = await fetch(
      `${apiUrl}/habitat/${id}`,
      getRequestOptions()
    ); 

    if (response.status === 200) {
      return await response.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลสัตว์ตาม ID:", error);
    return false;
  }
};

async function UpdateHabitat(data: HabitatInterface, file?: File) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key as keyof HabitatInterface] as string);
  }

  if (file) {
    formData.append("Picture", file);
  }
  console.log("Data Habitat update", data);
  const requestOptions = formDataRequestOptions("PATCH", formData);

  try {
    const res = await fetch(`${apiUrl}/habitats/${data.ID}`, requestOptions);
    if (res.status === 200) {
      return await res.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating animal:", error);
    return false;
  }
}

export const DeleteHabitatByID = async (
  id: number | undefined
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${apiUrl}/habitats/${id}`,
      deleteRequestOptions()
    );

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการลบสัตว์:", error);
    return false;
  }
};


async function GetSexs() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/sexs`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

async function GetBiological() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/biologicals`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

async function GetStatusAnimal() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/status-animals`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

async function GetBehaviorals() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/behaviorals`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

async function GetZones() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/zones`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}


export const ListAnimal = async (): Promise<AnimalsInterface[] | false> => {
  try {
    const response = await fetch(`${apiUrl}/animals`, getRequestOptions());

    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");
    return await response.json();
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลสัตว์:", error);
    return false;
  }
};


export const CreateAnimal = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const response = await axios.post(`${apiUrl}/animals-create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (response.status !== 201) {
      throw new Error("Error creating animal");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating animal:", error);
    return false;
  }
};


export const DeleteAnimalByID = async (
  id: number | undefined
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${apiUrl}/animals/${id}`,
      deleteRequestOptions()
    );

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการลบสัตว์:", error);
    return false;
  }
};


export const GetAnimalById = async (
  id: number | undefined
): Promise<AnimalsInterface | false> => {
  try {
    const response = await fetch(`${apiUrl}/animal/${id}`, getRequestOptions()); 

    if (response.status === 200) {
      return await response.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลสัตว์ตาม ID:", error);
    return false;
  }
};

async function UpdateAnimal(data: AnimalsInterface, file?: File) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key as keyof AnimalsInterface] as string);
  }

  if (file) {
    formData.append("Picture", file);
  }
  console.log("Data Animal update", data);
  const requestOptions = formDataRequestOptions("PATCH", formData);

  try {
    const res = await fetch(`${apiUrl}/animals/${data.ID}`, requestOptions);
    if (res.status === 200) {
      return await res.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating animal:", error);
    return false;
  }
}


export const CreateReport = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const requestOptions = formDataRequestOptions("POST", formData); 

    const response = await fetch(`${apiUrl}/reports-create`, requestOptions);

    if (!response.ok) throw new Error("Failed to create report.");

    return await response.json(); 
  } catch (error) {
    console.error("Error creating report:", error);
    return false; 
  }
};

export const GetReportById = async (id: number): Promise<ReportInterface | false> => {
  try {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");

    const response = await axios.get<ReportInterface>(`${apiUrl}/report/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching report by ID:", error);
    return false;
  }
};


export const ListReports = async () => {
  try {
    const options = getRequestOptions();
    const response = await axios(`${apiUrl}/reports`, options);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};


export const GetAnimalByHealth = async () => {
  try {
    const options = getRequestOptions();
    const response = await axios(`${apiUrl}/animals-sick`, options);
    return response.data;
  } catch (error) {
    console.error("Error fetching sick animals:", error);
    throw error;
  }
};

export const DeleteReportByID = async (
  id: number | undefined
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${apiUrl}/reports/${id}`,
      deleteRequestOptions()
    ); 

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการลบสัตว์:", error);
    return false;
  }
};

export const UpdateReport = async (id: number,data: { [key: string]: any }, file?: File ): Promise<any | false> => {
  const formData = new FormData();

  for (const key in data) {
    if (data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  }

  if (file) {
    formData.append("picture", file);
  }

  try {
    console.log(data)
    const response = await fetch(
      `${apiUrl}/reports/${id}`,
      formDataRequestOptions("PATCH", formData)
    );

    if (!response.ok) {
      console.error("Failed to update report:", response.statusText);
      return false; 
    }

    return await response.json(); 
  } catch (error) {
    console.error("Error updating report:", error);
    return false; 
  }
};


export const CreateWork = async (
  input: WorkInterface
): Promise<WorkResponse | false> => {
  try {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");

    if (!token || !tokenType) {
      console.error("Missing authentication token.");
      return false;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${tokenType} ${token}`,
    };

    const response = await axios.post(
      "http://localhost:8000/works",
      input,
      { headers }
    );

    if (response.status === 201) {
      console.log("Work created successfully:", response.data);
      return response.data;
    } else {
      console.error("Unexpected response status:", response.status);
      return false;
    }
  } catch (error: any) {
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error creating work:", error.message);
    }
    return false;
  }
};

export const GetAllStockFood = async (): Promise<StockOfFood[] | false> => {
  try {
    const response = await axios.get(`${apiUrl}/stocks-food`, getRequestOptions());
    if (response.status === 200) {
      return response.data.data;
    }
    throw new Error("Error fetching stock food data.");
  } catch (error) {
    console.error("Error fetching stock food:", error);
    return false;
  }
};

export const CreateFoodRequisition = async (
  input: FoodRequisition
): Promise<any> => {
  if (!input.WorkID) {
    throw new Error("WorkID is undefined. Cannot proceed with the requisition.");
  }

  try {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${tokenType} ${token}`,
    };

    const response = await axios.post(`${apiUrl}/foodrequisition`, input, { headers });

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Unexpected response from the server");
    }
  } catch (error: any) {
    console.error("Failed to create food requisition:", error);
    throw error.response?.data?.error || "An error occurred while creating the food requisition";
  }
};


export const CreateFoodRequisitionDetail = async (
  input: FoodRequisitionDetail
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${tokenType} ${token}`,
    };

    const response = await axios.post(
      "http://localhost:8000/food-requisition-detail",
      input,
      { headers }
    );

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Unexpected response from server");
    }
  } catch (error: any) {
    console.error("Failed to create Food Requisition Detail:", error);
    throw new Error(
      error.response?.data?.error ||
        "An error occurred while creating the food requisition detail"
    );
  }
};

export const ReduceStockFoodQuantity = async (
  stockFoodId: number,
  input: ReduceStockFoodQuantityInput
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${tokenType} ${token}`,
    };

    const response = await axios.put(
      `${apiUrl}/stock-food/${stockFoodId}/reduce`,
      input,
      { headers }
    );

    if (response.status === 200) {
      console.log("Stock reduced successfully:", response.data);
      return response.data; 
    } else {
      throw new Error("Unexpected response from server");
    }
  } catch (error: any) {
    console.error("Error reducing stock quantity:", error);
    throw error.response?.data?.error || "Failed to reduce stock quantity";
  }
};

export const getUserById = async (id: string): Promise<UsersInterface> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<UsersInterface>(`${apiUrl}/users/${id}`, requestOptions);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Error fetching user by ID: " + (error as Error).message);
  }
};

async function GetUserAll() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/users`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

// Get work details by EmployeeID
export const getWorkByEmployeeID = async (
  employeeID: number
): Promise<WorkInterface[] | false> => {
  try {
    const response = await axios.get<WorkInterface[]>(
      `${apiUrl}/work/employee/${employeeID}`,
      getRequestOptions()
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch work details by EmployeeID");
    }
  } catch (error) {
    console.error("Error fetching work by EmployeeID:", error);
    return false;
  }
};

// Get food requisitions by WorkID
export const getFoodRequisitionByWorkID = async (
  workID: number
): Promise<FoodRequisition[] | false> => {
  try {
    const response = await axios.get<FoodRequisition[]>(
      `${apiUrl}/foodrequisitions/work/${workID}`,
      getRequestOptions()
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch food requisitions by WorkID");
    }
  } catch (error) {
    console.error("Error fetching food requisitions by WorkID:", error);
    return false;
  }
};

export const getTicketByBookingID = async (
  bookingID: number
): Promise<any | false> => {
  try {
    const response = await axios.get(
      `${apiUrl}/ticketbooking/${bookingID}`,
      getRequestOptions()
    );

    if (response.status === 200) {
      return response.data; // ส่งข้อมูล JSON กลับ
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching ticket by booking ID:", error);
    return false; 
  }
};


export {
  GetSexs,
  GetBiological,
  GetBehaviorals,
  GetZones,
  DeleteEventByID,
  GetEventById,
  UpdateEvent,
  UpdateAnimal,
  UpdateHabitat,
  GetStatusAnimal,
  GetUserAll,
};