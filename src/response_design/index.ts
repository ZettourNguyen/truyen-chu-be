class RESPONSE {
  statusCode: number;
  message: string;
  data: any;
  constructor(statusCode:number, message:string, data:any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (this.constructor === RESPONSE) {
      throw new Error("Cannot instantiate abstract class ERROR");
    }
  }
}

class Response200 extends RESPONSE {
  constructor(data:any) {
    super(200, "OK", data);
  }
}

class Response201 extends RESPONSE {
  constructor(data:any) {
    super(201, "Created success", data);
  }
}

class Response204 extends RESPONSE {
  constructor() {
    super(204, "No Content", undefined); // Không cần truyền data
  }
}

class ERROR400 extends RESPONSE {
  constructor(data:any) {
    super(400, "Bad Request", data);
  }
}
class ERROR401 extends RESPONSE {
  constructor(data:any) {
    super(401, "Unauthorized", data);
  }
}

class ERROR403 extends RESPONSE {
  constructor(data:any) {
    super(403, "Forbidden", data);
  }
}
class ERROR404 extends RESPONSE {
  constructor(data:any) {
    super(404, "Not Found", data);
  }
}
class ERROR500 extends RESPONSE {
  constructor(data:any) {
    super(500, "Internal Server Error", data);
  }
}

class ERROR503 extends RESPONSE {
  constructor(data:any) {
    super(503, "Service Unavailable", data);
  }
}

// Factory pattern
class ResponseFactory {
  static createResponse(statusCode:number, data:any) {
    switch (statusCode) {
      case 200:
        return new Response200(data);
      case 201:
        return new Response201(data);
      case 204:
        return new Response204(); // Không cần truyền data
      case 400:
        return new ERROR400(data);
      case 401:
        return new ERROR401(data);
      case 403:
        return new ERROR403(data);
      case 404:
        return new ERROR404(data);
      case 500:
        return new ERROR500(data);
      case 503:
        return new ERROR503(data);
      default:
        throw new Error("Invalid status code");
    }
  }
}

export default ResponseFactory;
