namespace DentalAI.API.Services;

/// <summary>
/// Null implementation of IAIService when Azure OpenAI is not configured
/// </summary>
public class NullAIService : IAIService
{
    public Task<string> SummarizeNotesAsync(string clinicalNotes, CancellationToken cancellationToken = default)
    {
        throw new InvalidOperationException("Azure OpenAI is not configured. Please configure AzureOpenAI:Endpoint and AzureOpenAI:ApiKey in appsettings.");
    }

    public Task<string> GenerateReferrerLetterAsync(string soapSummary, string referrerName, string? referrerAddress = null, string? patientName = null, CancellationToken cancellationToken = default)
    {
        throw new InvalidOperationException("Azure OpenAI is not configured. Please configure AzureOpenAI:Endpoint and AzureOpenAI:ApiKey in appsettings.");
    }
}

