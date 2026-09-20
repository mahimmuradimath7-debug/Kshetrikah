/**
 * KSHETRIKAH (क्षेत्रिकः) - CIBRC Treatment Adherence Calendar (.ics) Generator
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * Generates RFC 5545 compliant iCalendar (.ics) files for farmer mobile phones:
 * - Day 0: Field Sanitation & Bio-fungicide spray
 * - Day 3: Foliar scouting & ETL threshold count
 * - Day 7: Secondary targeted spray window
 * - Day 14: CIBRC Pre-Harvest Interval (PHI) clearance
 */

function formatIcsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    '00Z'
  );
}

export interface CalendarEventSchedule {
  title: string;
  description: string;
  daysFromNow: number;
  durationHours?: number;
}

export function generateTreatmentIcs(diseaseName: string, cropName: string, phiDays: number = 10): string {
  const now = new Date();
  const events: CalendarEventSchedule[] = [
    {
      title: `[क्षेत्रिकः Day 0] Immediate Treatment: ${diseaseName}`,
      description: `Immediate field sanitation and bio-control application for ${cropName} against ${diseaseName}. Maintain row aeration and prune infected foliage.`,
      daysFromNow: 0,
      durationHours: 1,
    },
    {
      title: `[क्षेत्रिकः Day 3] Scouting & ETL Re-check: ${diseaseName}`,
      description: `Inspect 20 random ${cropName} plants across an X-pattern. Count active lesions/moths and verify if symptoms have stabilized below Economic Threshold Level (ETL).`,
      daysFromNow: 3,
      durationHours: 1,
    },
    {
      title: `[क्षेत्रिकः Day 7] Secondary Targeted Spray: ${diseaseName}`,
      description: `If disease progression is still active above ETL, apply secondary CIBRC approved formulation in calm morning hours (7-9:30 AM).`,
      daysFromNow: 7,
      durationHours: 1,
    },
    {
      title: `[क्षेत्रिकः Day ${phiDays}] CIBRC Pre-Harvest Interval (PHI) Safe Clearance`,
      description: `Harvest safety threshold reached for ${cropName}. Pesticide residues have safely degraded below Maximum Residue Limits (MRL). Certified safe for APMC market dispatch.`,
      daysFromNow: phiDays,
      durationHours: 1,
    },
  ];

  let icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TEAM BITHEADS//Kshetrikah Crop Health//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Kshetrikah Crop Treatment Adherence',
    'X-WR-TIMEZONE:Asia/Kolkata',
  ].join('\r\n');

  for (const ev of events) {
    const start = new Date(now.getTime() + ev.daysFromNow * 24 * 3600 * 1000);
    start.setHours(7, 30, 0, 0); // Default 7:30 AM morning spray time
    const end = new Date(start.getTime() + (ev.durationHours || 1) * 3600 * 1000);

    const uid = `ksh-${Date.now()}-${ev.daysFromNow}@kshetrikah.bitheads.in`;

    icsString += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.description}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Agricultural spray / inspection schedule',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  }

  icsString += '\r\nEND:VCALENDAR';
  return icsString;
}

export function downloadCalendarFile(icsContent: string, filename: string = 'kshetrikah_treatment_schedule.ics'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
