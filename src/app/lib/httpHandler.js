const BE_ENDPOINT = "http://localhost:8081";

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
  res.ok ? onSuccess(data) : onFail(data);
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
    const config = {
      method,
      headers: isUpload ? undefined : getHeaders(),
      body: data ? (isUpload ? data : JSON.stringify(data)) : undefined,
    };
    const res = await fetch(BE_ENDPOINT + uri, config);
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

const fetchDelete = (uri, data, onSuccess, onFail, onException) =>
  request("DELETE", uri, data, onSuccess, onFail, onException);

const fetchUpload = (uri, formData, onSuccess, onFail, onException) =>
  request("POST", uri, formData, onSuccess, onFail, onException, true);

export { fetchGet, fetchPost, fetchPut, fetchDelete, fetchUpload, BE_ENDPOINT };
