using Microsoft.EntityFrameworkCore;
using DentalAI.API.Models;

namespace DentalAI.API.Data;

public class DentalDbContext(DbContextOptions<DentalDbContext> options) : DbContext(options)
{
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Referral> Referrals => Set<Referral>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<Referral>()
            .HasOne(r => r.Patient)
            .WithMany(p => p.Referrals)
            .HasForeignKey(r => r.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Note>()
            .HasOne(n => n.Patient)
            .WithMany(p => p.Notes)
            .HasForeignKey(n => n.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

