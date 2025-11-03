using Microsoft.EntityFrameworkCore;
using Serilog;
using DentalAI.API.Data;
using DentalAI.API.Models;
using DentalAI.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "DentalAI API", Version = "v1" });
});

// Configure JSON serialization to handle circular references
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Configure CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        var allowedOrigins = new List<string> { "http://localhost:4200" };
        
        // Add production frontend URL from configuration
        var frontendUrl = builder.Configuration["FrontendUrl"];
        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            allowedOrigins.Add(frontendUrl);
        }
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure database based on environment
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (builder.Environment.IsDevelopment())
{
    // SQLite for local development
    builder.Services.AddDbContext<DentalDbContext>(options =>
        options.UseSqlite(connectionString ?? "Data Source=dentalai.db"));
}
else
{
    // SQL Server for Azure production
    builder.Services.AddDbContext<DentalDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// Register AI Service (conditional - only if configured)
var endpoint = builder.Configuration["AzureOpenAI:Endpoint"];
var apiKey = builder.Configuration["AzureOpenAI:ApiKey"];

if (!string.IsNullOrWhiteSpace(endpoint) && !string.IsNullOrWhiteSpace(apiKey))
{
    builder.Services.AddSingleton<IAIService>(sp =>
    {
        var config = sp.GetRequiredService<IConfiguration>();
        var logger = Log.ForContext<AIService>();
        return new AIService(config, logger);
    });
    Log.Information("AIService registered successfully with Azure OpenAI");
}
else
{
    builder.Services.AddSingleton<IAIService>(new NullAIService());
    Log.Warning("Azure OpenAI not configured. AI features will return helpful error messages. Configure AzureOpenAI:Endpoint and AzureOpenAI:ApiKey in appsettings.");
}

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DentalDbContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/", () => Results.Redirect("/swagger"));

// Patient endpoints
app.MapGet("/api/patients", async (DentalDbContext db) =>
    await db.Patients
        .AsNoTracking()
        .OrderBy(p => p.LastName)
        .ThenBy(p => p.FirstName)
        .ToListAsync());

app.MapGet("/api/patients/{id:int}", async (int id, DentalDbContext db) =>
{
    var patient = await db.Patients
        .Include(p => p.Referrals)
        .Include(p => p.Notes)
        .Include(p => p.Appointments)
        .AsNoTracking()
        .FirstOrDefaultAsync(p => p.Id == id);
    
    return patient is null ? Results.NotFound() : Results.Ok(patient);
});

app.MapPost("/api/patients", async (Patient patient, DentalDbContext db) =>
{
    patient.CreatedAt = DateTime.UtcNow;
    patient.UpdatedAt = DateTime.UtcNow;
    
    db.Patients.Add(patient);
    await db.SaveChangesAsync();
    
    return Results.Created($"/api/patients/{patient.Id}", patient);
});

app.MapPut("/api/patients/{id:int}", async (int id, Patient updatedPatient, DentalDbContext db) =>
{
    var patient = await db.Patients.FindAsync(id);
    
    if (patient is null)
        return Results.NotFound();
    
    patient.FirstName = updatedPatient.FirstName;
    patient.LastName = updatedPatient.LastName;
    patient.DateOfBirth = updatedPatient.DateOfBirth;
    patient.Email = updatedPatient.Email;
    patient.Phone = updatedPatient.Phone;
    patient.Address = updatedPatient.Address;
    patient.City = updatedPatient.City;
    patient.State = updatedPatient.State;
    patient.ZipCode = updatedPatient.ZipCode;
    patient.ChiefComplaint = updatedPatient.ChiefComplaint;
    patient.Symptoms = updatedPatient.Symptoms;
    patient.ToothNotation = updatedPatient.ToothNotation;
    patient.UpdatedAt = DateTime.UtcNow;
    
    await db.SaveChangesAsync();
    
    return Results.NoContent();
});

app.MapDelete("/api/patients/{id:int}", async (int id, DentalDbContext db) =>
{
    var patient = await db.Patients.FindAsync(id);
    
    if (patient is null)
        return Results.NotFound();
    
    db.Patients.Remove(patient);
    await db.SaveChangesAsync();
    
    return Results.NoContent();
});

// Referral endpoints
app.MapGet("/api/patients/{patientId:int}/referrals", async (int patientId, DentalDbContext db) =>
    await db.Referrals
        .Where(r => r.PatientId == patientId)
        .AsNoTracking()
        .OrderByDescending(r => r.ReferredDate)
        .ToListAsync());

app.MapPost("/api/patients/{patientId:int}/referrals", async (int patientId, Referral referral, DentalDbContext db) =>
{
    var patient = await db.Patients.FindAsync(patientId);
    if (patient is null)
        return Results.NotFound();
    
    referral.PatientId = patientId;
    referral.ReferredDate = DateTime.UtcNow;
    referral.CreatedAt = DateTime.UtcNow;
    
    // Generate access token for read-only portal
    referral.AccessToken = Guid.NewGuid().ToString();
    referral.AccessTokenExpiry = DateTime.UtcNow.AddMonths(6);
    
    db.Referrals.Add(referral);
    await db.SaveChangesAsync();
    
    return Results.Created($"/api/patients/{patientId}/referrals/{referral.Id}", referral);
});

app.MapGet("/api/referrals/{token}", async (string token, DentalDbContext db) =>
{
    var referral = await db.Referrals
        .Include(r => r.Patient)
        .ThenInclude(p => p.Notes.OrderByDescending(n => n.CreatedAt).Take(5))
        .AsNoTracking()
        .FirstOrDefaultAsync(r => r.AccessToken == token && 
                                  r.AccessTokenExpiry > DateTime.UtcNow);
    
    return referral is null ? Results.NotFound() : Results.Ok(referral);
});

// Appointment endpoints
app.MapGet("/api/patients/{patientId:int}/appointments", async (int patientId, DentalDbContext db) =>
    await db.Appointments
        .Where(a => a.PatientId == patientId)
        .AsNoTracking()
        .OrderBy(a => a.AppointmentDateTime)
        .ToListAsync());

app.MapGet("/api/appointments", async (DateTime? start, DateTime? end, DentalDbContext db) =>
{
    var query = db.Appointments.AsNoTracking();
    
    if (start.HasValue)
        query = query.Where(a => a.AppointmentDateTime >= start.Value);
    
    if (end.HasValue)
        query = query.Where(a => a.AppointmentDateTime <= end.Value);
    
    return await query
        .Include(a => a.Patient)
        .OrderBy(a => a.AppointmentDateTime)
        .ToListAsync();
});

app.MapPost("/api/patients/{patientId:int}/appointments", async (int patientId, Appointment appointment, DentalDbContext db) =>
{
    var patient = await db.Patients.FindAsync(patientId);
    if (patient is null)
        return Results.NotFound();
    
    // Check for conflicts
    var conflicting = await db.Appointments
        .AnyAsync(a => a.AppointmentDateTime == appointment.AppointmentDateTime && 
                      a.Status != "Cancelled");
    
    if (conflicting)
        return Results.BadRequest("Appointment time slot is already booked.");
    
    appointment.PatientId = patientId;
    appointment.CreatedAt = DateTime.UtcNow;
    appointment.UpdatedAt = DateTime.UtcNow;
    
    db.Appointments.Add(appointment);
    await db.SaveChangesAsync();
    
    return Results.Created($"/api/patients/{patientId}/appointments/{appointment.Id}", appointment);
});

app.MapPut("/api/appointments/{id:int}", async (int id, Appointment updatedAppointment, DentalDbContext db) =>
{
    var appointment = await db.Appointments.FindAsync(id);
    
    if (appointment is null)
        return Results.NotFound();
    
    // Check for conflicts if time changed
    if (appointment.AppointmentDateTime != updatedAppointment.AppointmentDateTime)
    {
        var conflicting = await db.Appointments
            .AnyAsync(a => a.Id != id &&
                          a.AppointmentDateTime == updatedAppointment.AppointmentDateTime && 
                          a.Status != "Cancelled");
        
        if (conflicting)
            return Results.BadRequest("Appointment time slot is already booked.");
    }
    
    appointment.AppointmentDateTime = updatedAppointment.AppointmentDateTime;
    appointment.Type = updatedAppointment.Type;
    appointment.Notes = updatedAppointment.Notes;
    appointment.Status = updatedAppointment.Status;
    appointment.UpdatedAt = DateTime.UtcNow;
    
    await db.SaveChangesAsync();
    
    return Results.NoContent();
});

app.MapDelete("/api/appointments/{id:int}", async (int id, DentalDbContext db) =>
{
    var appointment = await db.Appointments.FindAsync(id);
    
    if (appointment is null)
        return Results.NotFound();
    
    db.Appointments.Remove(appointment);
    await db.SaveChangesAsync();
    
    return Results.NoContent();
});

// Note endpoints
app.MapGet("/api/patients/{patientId:int}/notes", async (int patientId, DentalDbContext db) =>
    await db.Notes
        .Where(n => n.PatientId == patientId)
        .AsNoTracking()
        .OrderByDescending(n => n.CreatedAt)
        .ToListAsync());

app.MapPost("/api/patients/{patientId:int}/notes", async (int patientId, Note note, DentalDbContext db) =>
{
    var patient = await db.Patients.FindAsync(patientId);
    if (patient is null)
        return Results.NotFound();
    
    note.PatientId = patientId;
    note.CreatedAt = DateTime.UtcNow;
    note.UpdatedAt = DateTime.UtcNow;
    note.Patient = null!; // Clear navigation property to avoid circular reference
    
    db.Notes.Add(note);
    await db.SaveChangesAsync();
    
    // Detach to ensure no navigation properties are loaded
    db.Entry(note).State = Microsoft.EntityFrameworkCore.EntityState.Detached;
    
    // Reload without navigation property
    var savedNote = await db.Notes
        .AsNoTracking()
        .FirstOrDefaultAsync(n => n.Id == note.Id);
    
    return Results.Created($"/api/patients/{patientId}/notes/{savedNote!.Id}", savedNote);
});

app.MapGet("/api/notes/{id:int}", async (int id, DentalDbContext db) =>
{
    var note = await db.Notes
        .Include(n => n.Patient)
        .AsNoTracking()
        .FirstOrDefaultAsync(n => n.Id == id);
    
    return note is null ? Results.NotFound() : Results.Ok(note);
});

app.MapPut("/api/notes/{id:int}", async (int id, Note updatedNote, DentalDbContext db) =>
{
    var note = await db.Notes.FindAsync(id);
    
    if (note is null)
        return Results.NotFound();
    
    note.Content = updatedNote.Content;
    note.Summary = updatedNote.Summary;
    note.Letter = updatedNote.Letter;
    note.UpdatedAt = DateTime.UtcNow;
    
    await db.SaveChangesAsync();
    
    return Results.NoContent();
});

app.MapDelete("/api/notes/{id:int}", async (int id, DentalDbContext db) =>
{
    var note = await db.Notes.FindAsync(id);
    
    if (note is null)
        return Results.NotFound();
    
    db.Notes.Remove(note);
    await db.SaveChangesAsync();
    
    return Results.NoContent();
});

// AI endpoints
app.MapPost("/api/ai/summarize", async (SummarizeRequest request, IAIService aiService, DentalDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.NoteContent))
        return Results.BadRequest("Note content is required.");
    
    // Guard: reject very short/ambiguous notes to prevent hallucinated summaries
    var trimmed = request.NoteContent.Trim();
    if (trimmed.Length < 50)
    {
        var message = $"Insufficient detail to produce a SOAP summary. Original note: '{trimmed}'";
        // Optionally save the short message if NoteId provided
        if (request.NoteId.HasValue)
        {
            var note = await db.Notes.FindAsync(request.NoteId.Value);
            if (note is not null)
            {
                note.Summary = message;
                note.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }
        }
        return Results.Ok(new { Summary = message });
    }
    
    try
    {
        var summary = await aiService.SummarizeNotesAsync(request.NoteContent);
        
        // Optionally save the summary to the note if noteId is provided
        if (request.NoteId.HasValue)
        {
            var note = await db.Notes.FindAsync(request.NoteId.Value);
            if (note is not null)
            {
                note.Summary = summary;
                note.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }
        }
        
        return Results.Ok(new { Summary = summary });
    }
    catch (InvalidOperationException ex)
    {
        Log.Warning("AI summarization failed: {Error}", ex.Message);
        return Results.BadRequest(new { Error = ex.Message });
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error during note summarization");
        return Results.Problem("An error occurred while summarizing the notes.");
    }
});

app.MapPost("/api/ai/letter", async (LetterRequest request, IAIService aiService, DentalDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.SoapSummary))
        return Results.BadRequest("SOAP summary is required.");
    
    if (string.IsNullOrWhiteSpace(request.ReferrerName))
        return Results.BadRequest("Referrer name is required.");
    
    // Get patient name from note if not provided
    string? patientName = request.PatientName;
    if (string.IsNullOrWhiteSpace(patientName) && request.NoteId.HasValue)
    {
        var note = await db.Notes
            .Include(n => n.Patient)
            .FirstOrDefaultAsync(n => n.Id == request.NoteId.Value);
        if (note?.Patient != null)
        {
            patientName = $"{note.Patient.FirstName} {note.Patient.LastName}".Trim();
        }
    }
    
    try
    {
        var letter = await aiService.GenerateReferrerLetterAsync(
            request.SoapSummary,
            request.ReferrerName,
            request.ReferrerAddress,
            patientName);
        
        // Optionally save the letter to the note if noteId is provided
        if (request.NoteId.HasValue)
        {
            var note = await db.Notes.FindAsync(request.NoteId.Value);
            if (note is not null)
            {
                note.Letter = letter;
                note.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }
        }
        
        return Results.Ok(new { Letter = letter });
    }
    catch (InvalidOperationException ex)
    {
        Log.Warning("AI letter generation failed: {Error}", ex.Message);
        return Results.BadRequest(new { Error = ex.Message });
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error during letter generation");
        return Results.Problem("An error occurred while generating the letter.");
    }
});

app.Run();
