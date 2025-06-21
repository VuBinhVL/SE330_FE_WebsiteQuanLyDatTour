const BE_ENDPOINT = "http://localhost:8080";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getHeaders = () => {
  const token = localStorage.getItem("jwtToken");
  return token
    ? { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` }
    : DEFAULT_HEADERS;
};

const handleResponse = async (res, onSuccess, onFail) => {
  const data = await res.json();
  console.log("Response từ server:", { status: res.status, data });
  if (res.ok) {
    onSuccess(data);
  } else {
    onFail({ response: res, data });
  }
};

const request = async (
  method,
  uri,
  data,
  onSuccess,
  onFail,
  onException,
  isUpload = false
) => {
  try {
    const fullUrl = BE_ENDPOINT + uri;
    console.log(`Gửi ${method} request:`, { fullUrl, data });
    const config = {
      method,
      headers: isUpload ? undefined : getHeaders(),
      body: data ? (isUpload ? data : JSON.stringify(data)) : undefined,
    };
    const res = await fetch(fullUrl, config);
    await handleResponse(res, onSuccess, onFail);
  } catch (err) {
    console.error("HTTP error:", err);
    onException();
  }
};

// Giao diện public
const fetchGet = (uri, onSuccess, onFail, onException) =>
  request("GET", uri, null, onSuccess, onFail, onException);

const fetchPost = (uri, data, onSuccess, onFail, onException) =>
  request("POST", uri, data, onSuccess, onFail, onException);

const fetchPut = (uri, data, onSuccess, onFail, onException) =>
  request("PUT", uri, data, onSuccess, onFail, onException);

const fetchDelete = (uri, onSuccess, onFail, onException) =>
  request("DELETE", uri, null, onSuccess, onFail, onException);

const fetchUpload = (uri, formData, onSuccess, onFail, onException) =>
  request("POST", uri, formData, onSuccess, onFail, onException, true);

export { fetchGet, fetchPost, fetchPut, fetchDelete, fetchUpload, BE_ENDPOINT };