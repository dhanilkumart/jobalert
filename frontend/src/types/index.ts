export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  source: 'linkedin' | 'naukri' | 'shine' | 'indeed';
  link: string;
  experience?: string;
  salary?: string;
  description?: string;
  postedAt: string;
  tags: string[];
}

export interface User {
  _id: string;
  name: string;
  phone: string;
  jobPreferences: JobPreference[];
  sources: string[];
  alertsEnabled: boolean;
  frequency: 'instant' | 'hourly' | 'daily';
  lastNotifiedAt?: string;
}

export interface JobPreference {
  title: string;
  location: string;
}

export interface JobResponse {
  jobs: Job[];
  total: number;
  page: number;
  pages: number;
}
