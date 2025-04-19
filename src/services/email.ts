export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachmentPath: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  console.log('Sending email to:', params.to, 'with subject:', params.subject, 'attachment:', params.attachmentPath);
  // Simulate success for the POC
  return true;
}
