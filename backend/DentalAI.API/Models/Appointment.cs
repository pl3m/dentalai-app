namespace DentalAI.API.Models;

public class Appointment
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    
    public DateTime AppointmentDateTime { get; set; }
    public string Type { get; set; } = string.Empty; // Consult, Treatment, Follow-up
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled, NoShow
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Patient Patient { get; set; } = null!;
}

