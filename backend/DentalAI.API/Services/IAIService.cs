namespace DentalAI.API.Services;

/// <summary>
/// Service interface for AI operations using Azure OpenAI
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Converts clinical notes to a SOAP (Subjective, Objective, Assessment, Plan) format summary
    /// </summary>
    /// <param name="clinicalNotes">Raw clinical notes text</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>SOAP formatted summary</returns>
    Task<string> SummarizeNotesAsync(string clinicalNotes, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a professional referrer letter from a SOAP summary
    /// </summary>
    /// <param name="soapSummary">SOAP formatted summary</param>
    /// <param name="referrerName">Name of the referring practitioner</param>
    /// <param name="referrerAddress">Address of the referring practitioner</param>
    /// <param name="patientName">Name of the patient (optional, will be extracted from note if available)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Formatted referrer letter</returns>
    Task<string> GenerateReferrerLetterAsync(
        string soapSummary, 
        string referrerName, 
        string? referrerAddress = null,
        string? patientName = null,
        CancellationToken cancellationToken = default);
}
