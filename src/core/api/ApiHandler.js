import axios from "axios";

export default class ApiHandler {
  constructor(url) {
    this.url = url;
  }

  post = (endpoint, params, headers, data) =>
    axios({
      method: "post",
      url: `${this.url}${endpoint}`,
      params,
      headers,
      data
    });

  get = (endpoint, params, headers) =>
    axios({
      method: "get",
      url: `${this.url}${endpoint}`,
      params,
      headers
    });
}
