using Azure;
using Azure.AI.OpenAI;
using Azure.Core;
using Microsoft.Extensions.Configuration;
using Serilog;
using OpenAI.Chat;

namespace DentalAI.API.Services;

/// <summary>
/// Azure OpenAI service implementation for note summarization and letter generation
/// </summary>
public class AIService : IAIService
{
    private readonly AzureOpenAIClient _client;
    private readonly string _deploymentName;
    private readonly Serilog.ILogger _logger;

    public AIService(IConfiguration configuration, Serilog.ILogger logger)
    {
        _logger = logger;

        var endpoint = configuration["AzureOpenAI:Endpoint"];
        var apiKey = configuration["AzureOpenAI:ApiKey"];
        _deploymentName = configuration["AzureOpenAI:DeploymentName"] ?? "gpt-4";

        if (string.IsNullOrWhiteSpace(endpoint))
        {
            _logger.Warning("AzureOpenAI:Endpoint is not configured. AI features will not work.");
            throw new InvalidOperationException("Azure OpenAI endpoint is not configured.");
        }

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.Warning("AzureOpenAI:ApiKey is not configured. AI features will not work.");
            throw new InvalidOperationException("Azure OpenAI API key is not configured.");
        }

        var credential = new AzureKeyCredential(apiKey);
        _client = new AzureOpenAIClient(new Uri(endpoint), credential);

        _logger.Information("AIService initialized with deployment: {DeploymentName}", _deploymentName);
    }

    public async Task<string> SummarizeNotesAsync(string clinicalNotes, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(clinicalNotes))
        {
            throw new ArgumentException("Clinical notes cannot be empty.", nameof(clinicalNotes));
        }

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            var systemPrompt = @"You are a dental professional converting clinical notes into a SOAP (Subjective, Objective, Assessment, Plan) format summary.

CRITICAL RULES - Follow these EXACTLY:
1. Extract and format ONLY the information that is explicitly stated in the clinical notes
2. Do NOT add explanations, meta-commentary, or describe what 'should' be in each section
3. Do NOT invent diagnoses, findings, or treatment plans that are not in the notes
4. Do NOT use phrases like 'typically includes', 'should mention', 'may assess', 'could involve', or any template language
5. If information is missing for a section, write ONLY 'Not documented.' - do NOT explain what should go there
6. Output MUST have exactly 4 sections in this exact order, each clearly labeled:
   - Subjective:
   - Objective:
   - Assessment:
   - Plan:
7. Start each section on a new line with the exact heading followed by a colon, then a blank line, then the content
8. Subjective: Extract patient-reported symptoms, complaints, and history from the notes
9. Objective: Extract clinical findings, examination results, and diagnostic tests from the notes
10. Assessment: Extract any diagnoses or clinical judgments stated in the notes
11. Plan: Extract treatment plans, recommendations, and follow-up actions from the notes
12. Be concise - only include what is actually written in the notes
13. Use clear, professional dental terminology
14. Do NOT include: dates, timestamps, patient names, or metadata
15. Do NOT combine sections - each section must be separate and clearly marked

Example format (extract and format only what's in the notes):

Subjective:

[Extract patient-reported symptoms from notes]

Objective:

[Extract clinical findings from notes, or 'Not documented.' if none]

Assessment:

[Extract diagnosis from notes, or 'Not documented.' if none]

Plan:

[Extract treatment plan from notes, or 'Not documented.' if none]";

            var userPrompt = $@"Convert the following clinical notes to SOAP format. Extract ONLY the information that is explicitly written in the notes. Do NOT add explanations or describe what should be in each section.

IMPORTANT: Generate ONLY ONE complete SOAP summary. Do NOT repeat or duplicate the summary.

Clinical notes:
{clinicalNotes}";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userPrompt)
            };

            _logger.Debug("Sending summarize request to Azure OpenAI. Note length: {Length} chars", clinicalNotes.Length);

            var chatClient = _client.GetChatClient(_deploymentName);
            var completionResult = await Task.Run(() => chatClient.CompleteChat(messages), cancellationToken);
            var completion = completionResult.Value;

            stopwatch.Stop();
            
            var summary = completion.Content[0].Text;
            
            // Log token usage if available
            if (completion.Usage is not null)
            {
                _logger.Information(
                    "Summarize completed. Token usage available. Duration: {Duration}ms",
                    stopwatch.ElapsedMilliseconds);
            }
            else
            {
                _logger.Information("Summarize completed. Duration: {Duration}ms", stopwatch.ElapsedMilliseconds);
            }

            return summary;
        }
        catch (RequestFailedException ex)
        {
            _logger.Error(ex, "Azure OpenAI request failed. Status: {Status}, Error: {Error}", ex.Status, ex.Message);
            throw new InvalidOperationException("Failed to summarize clinical notes. Please try again later.", ex);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Unexpected error during note summarization");
            throw;
        }
    }

    public async Task<string> GenerateReferrerLetterAsync(
        string soapSummary, 
        string referrerName, 
        string? referrerAddress = null,
        string? patientName = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(soapSummary))
        {
            throw new ArgumentException("SOAP summary cannot be empty.", nameof(soapSummary));
        }

        if (string.IsNullOrWhiteSpace(referrerName))
        {
            throw new ArgumentException("Referrer name cannot be empty.", nameof(referrerName));
        }

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            var addressSection = string.IsNullOrWhiteSpace(referrerAddress) 
                ? "" 
                : $"\n{referrerAddress}";

            var systemPrompt = @"You are a dental professional writing a professional referral letter to another healthcare provider.
CRITICAL RULES - Follow these exactly:
1. Start directly with 'Dear Dr. [Name],' - NO pleasantries like 'I hope this finds you well'
2. First sentence must clearly state the specific referral reason using the ACTUAL patient name provided (e.g., 'I am referring John Smith for evaluation and treatment of irreversible pulpitis in tooth #30')
3. Replace ALL instances of '[Patient Name]' or 'the patient' with the ACTUAL patient name provided in the request
4. Use the patient's name when referring to them throughout the letter (e.g., 'John Smith reports...', 'John Smith's examination revealed...')
5. Present clinical information in a clear, organized format using the SOAP structure
6. Include ALL key clinical details from the SOAP summary - subjective symptoms, objective findings, assessment/diagnosis, and plan
7. Be concise and direct - avoid verbose language
8. Do NOT include: dates, timestamps, 'Referral Status', author names, positions, or metadata
9. Do NOT use phrases like: 'I hope', 'you may recall', 'collaboration', 'training', 'feel free to reach out'
10. Do NOT assume this is for routine care - use the SPECIFIC diagnosis/reason from the SOAP summary
11. End with simple: 'Sincerely, [Your Name]' - nothing else
12. Focus ONLY on clinical facts and what follow-up is needed";

            var patientNameSection = string.IsNullOrWhiteSpace(patientName) 
                ? "" 
                : $"\n\nPatient Name: {patientName}";

            var userPrompt = $@"Write a professional referral letter to:
{referrerName}{addressSection}{patientNameSection}

Using this SOAP summary:
{soapSummary}

Format (MUST include all 4 sections):
Dear Dr. [Name],

I am referring {(string.IsNullOrWhiteSpace(patientName) ? "[Patient Name]" : patientName)} for [SPECIFIC REASON FROM ASSESSMENT - e.g., 'evaluation and treatment of irreversible pulpitis in tooth #30'].

Subjective: {(string.IsNullOrWhiteSpace(patientName) ? "[Patient Name]" : patientName)}'s chief complaint and symptoms from SOAP summary

Objective: Clinical findings, examination results, diagnostic tests from SOAP summary

Assessment: Diagnosis from SOAP summary (THIS SECTION IS REQUIRED - DO NOT SKIP IT)

Plan: Treatment provided to date and what follow-up is needed from SOAP summary

Sincerely,
[Your Name]

CRITICAL REQUIREMENTS:
- Start immediately with the referral statement - NO pleasantries
- Use the SPECIFIC diagnosis/reason from the Assessment section in the opening sentence
- Include ALL 4 sections: Subjective, Objective, Assessment, Plan
- The Assessment section MUST be included - it contains the diagnosis
- Include ALL clinical details but be concise
- NO dates, timestamps, or metadata
- NO closing pleasantries like 'please feel free to reach out'";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userPrompt)
            };

            _logger.Debug("Sending letter generation request to Azure OpenAI for referrer: {ReferrerName}", referrerName);

            var chatClient = _client.GetChatClient(_deploymentName);
            var completionResult = await Task.Run(() => chatClient.CompleteChat(messages), cancellationToken);
            var completion = completionResult.Value;

            stopwatch.Stop();
            
            var letter = completion.Content[0].Text;
            
            // Log token usage if available
            if (completion.Usage is not null)
            {
                _logger.Information(
                    "Letter generation completed. Token usage available. Duration: {Duration}ms",
                    stopwatch.ElapsedMilliseconds);
            }
            else
            {
                _logger.Information("Letter generation completed. Duration: {Duration}ms", stopwatch.ElapsedMilliseconds);
            }

            return letter;
        }
        catch (RequestFailedException ex)
        {
            _logger.Error(ex, "Azure OpenAI request failed. Status: {Status}, Error: {Error}", ex.Status, ex.Message);
            throw new InvalidOperationException("Failed to generate referrer letter. Please try again later.", ex);
        }
        catch (Exception ex)
        {
            _logger.Error(ex, "Unexpected error during letter generation");
            throw;
        }
    }
}
