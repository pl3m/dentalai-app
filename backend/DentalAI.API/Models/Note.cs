namespace DentalAI.API.Models;

public class Note
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    
    public string Content { get; set; } = string.Empty; // Raw clinical notes
    public string? Summary { get; set; } // AI-generated SOAP summary
    public string? Letter { get; set; } // AI-generated referrer letter
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Patient Patient { get; set; } = null!;
}

