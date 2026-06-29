using System;
using System.Net;

namespace WebApi.Exceptions;

public class BaseException : Exception
{
    public HttpStatusCode StatusCode { get; }

    // Constructor mặc định với mã lỗi
    public BaseException(HttpStatusCode statusCode, string message) 
        : base(message)
    {
        StatusCode = statusCode;
    }

    // Constructor hỗ trợ bọc lỗi hệ thống (Inner Exception) nếu cần
    public BaseException(HttpStatusCode statusCode, string message, Exception innerException) 
        : base(message, innerException)
    {
        StatusCode = statusCode;
    }
}

public class BadRequestException : BaseException
{
    public BadRequestException(string message) 
        : base(HttpStatusCode.BadRequest, message) { }

    public BadRequestException(string message, Exception innerException) 
        : base(HttpStatusCode.BadRequest, message, innerException) { }
}

public class ConflictException : BaseException
{
    public ConflictException(string message) 
        : base(HttpStatusCode.Conflict, message) { }

    public ConflictException(string message, Exception innerException) 
        : base(HttpStatusCode.Conflict, message, innerException) { }
}

public class NotFoundException : BaseException
{
    public NotFoundException(string message) 
        : base(HttpStatusCode.NotFound, message) { }

    public NotFoundException(string message, Exception innerException) 
        : base(HttpStatusCode.NotFound, message, innerException) { }
}
