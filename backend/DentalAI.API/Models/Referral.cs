namespace DentalAI.API.Models;

public class Referral
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    
    // Referrer information
    public string ReferrerName { get; set; } = string.Empty;
    public string ReferrerEmail { get; set; } = string.Empty;
    public string ReferrerPhone { get; set; } = string.Empty;
    public string ReferrerPracticeName { get; set; } = string.Empty;
    
    public string Reason { get; set; } = string.Empty;
    public DateTime ReferredDate { get; set; } = DateTime.UtcNow;
    
    // Token for read-only access
    public string? AccessToken { get; set; }
    public DateTime? AccessTokenExpiry { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Patient Patient { get; set; } = null!;
}

