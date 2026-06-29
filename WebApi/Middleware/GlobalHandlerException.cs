using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using WebApi.Exceptions;

namespace WebApi.Middleware;

public class GlobalHandlerException : IExceptionHandler
{
    private readonly ILogger<GlobalHandlerException> _logger;
    public GlobalHandlerException(ILogger<GlobalHandlerException> logger)
    {
        this._logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception, 
        CancellationToken cancellationToken
    )
    {
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        int statusCode = exception switch
        {
            BaseException ex1 => (int)ex1.StatusCode,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.StatusCode = statusCode;
        var problems = new ProblemDetails
        {
            Status = statusCode,
            Title = exception is BaseException exp ? GetTitleForStatusCode(exp.StatusCode) : "Internal server error.",
            Detail = exception is BaseException ex ? ex.Message : "An unexpected server error occurred." 
        };

        await context.Response.WriteAsJsonAsync(problems, cancellationToken);
        return true;
    }
    private static string GetTitleForStatusCode(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.BadRequest => "Bad Request",
        HttpStatusCode.NotFound => "Not Found",
        HttpStatusCode.Conflict => "Conflict",
        _ => "Server Error"
    };
}