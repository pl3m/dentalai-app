namespace DentalAI.API.Models;

/// <summary>
/// Request model for note summarization
/// </summary>
public record SummarizeRequest(string NoteContent, int? NoteId = null);

/// <summary>
/// Request model for referrer letter generation
/// </summary>
public record LetterRequest(string SoapSummary, string ReferrerName, string? ReferrerAddress = null, int? NoteId = null, string? PatientName = null);
