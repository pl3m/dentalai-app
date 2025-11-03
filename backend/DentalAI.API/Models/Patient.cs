namespace DentalAI.API.Models;

public class Patient
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    
    // Dental-specific fields
    public string? ChiefComplaint { get; set; }
    public string? Symptoms { get; set; }
    public string? ToothNotation { get; set; } // FDI notation for affected teeth
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public List<Referral> Referrals { get; set; } = new();
    public List<Note> Notes { get; set; } = new();
    public List<Appointment> Appointments { get; set; } = new();
}

