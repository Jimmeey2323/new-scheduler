import { ClassData, ScheduledClass, CustomTeacher } from '../types';

export class AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  public async generateSchedule(
    prompt: string,
    csvData: ClassData[],
    customTeachers: CustomTeacher[]
  ): Promise<ScheduledClass[]> {
    try {
      const requestBody = JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(csvData, customTeachers),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseText = responseData.choices[0].message.content;

      console.log("Raw AI Response:", responseText);

      return this.parseScheduleResponse(responseText);
    } catch (error: any) {
      console.error("AI Service Error:", error);
      return [];
    }
  }

  private buildSystemPrompt(csvData: ClassData[], customTeachers: CustomTeacher[]): string {
    const classExamples = csvData.slice(0, 5).map(item => {
      return `{
        classFormat: "${item.cleanedClass}",
        day: "${item.dayOfWeek}",
        time: "${item.classTime}",
        location: "${item.location}",
        teacher: "${item.teacherName}",
        participants: ${item.participants},
        revenue: ${item.totalRevenue}
      }`;
    }).join(', ');

    const teacherList = customTeachers.map(teacher => `"${teacher.firstName} ${teacher.lastName}"`).join(', ');

    return `You are an AI schedule optimizer for a fitness studio.
    You generate an array of classes based on user requests.
    Each class should include: day, time, location, classFormat, teacherFirstName, teacherLastName, duration, participants, revenue, isTopPerformer.
    The schedule should optimize for maximum attendance and revenue.
    Here are some example classes: [${classExamples}].
    Available teachers: [${teacherList}].
    Respond ONLY with a JSON array of class objects. Do not include any other text.`;
  }

  private parseScheduleResponse(responseText: string): ScheduledClass[] {
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      return parsedData.map((item: any, index: number) => ({
        id: `ai-generated-${Date.now()}-${index}`,
        day: item.day || 'Monday',
        time: item.time || '08:00',
        location: item.location || 'Kwality House, Kemps Corner',
        classFormat: item.classFormat || item.class_format || 'Yoga',
        teacherFirstName: item.teacherFirstName || item.teacher?.split(' ')[0] || 'Teacher',
        teacherLastName: item.teacherLastName || item.teacher?.split(' ').slice(1).join(' ') || 'Name',
        duration: item.duration?.toString() || '1',
        participants: typeof item.participants === 'number' ? item.participants : parseInt(item.participants) || 0,
        revenue: typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0,
        isTopPerformer: Boolean(item.isTopPerformer)
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  public async refineSchedule(
    currentSchedule: ScheduledClass[],
    csvData: ClassData[],
    customTeachers: CustomTeacher[],
    refinementGoal: string
  ): Promise<ScheduledClass[]> {
    try {
      const scheduleSummary = currentSchedule.map(cls => {
        return `{
          day: "${cls.day}",
          time: "${cls.time}",
          location: "${cls.location}",
          classFormat: "${cls.classFormat}",
          teacher: "${cls.teacherFirstName} ${cls.teacherLastName}",
          participants: ${cls.participants},
          revenue: ${cls.revenue}
        }`;
      }).join(', ');

      const requestBody = JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.buildRefinementPrompt(csvData, customTeachers, scheduleSummary),
          },
          {
            role: "user",
            content: refinementGoal,
          },
        ],
        temperature: 0.7,
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseText = responseData.choices[0].message.content;

      console.log("Raw AI Refinement Response:", responseText);

      return this.parseScheduleResponse(responseText);
    } catch (error: any) {
      console.error("AI Schedule Refinement Error:", error);
      return [];
    }
  }

  private buildRefinementPrompt(
    csvData: ClassData[],
    customTeachers: CustomTeacher[],
    scheduleSummary: string
  ): string {
    const classExamples = csvData.slice(0, 5).map(item => {
      return `{
        classFormat: "${item.cleanedClass}",
        day: "${item.dayOfWeek}",
        time: "${item.classTime}",
        location: "${item.location}",
        teacher: "${item.teacherName}",
        participants: ${item.participants},
        revenue: ${item.totalRevenue}
      }`;
    }).join(', ');

    const teacherList = customTeachers.map(teacher => `"${teacher.firstName} ${teacher.lastName}"`).join(', ');

    return `You are an AI schedule optimizer for a fitness studio.
      You refine an existing schedule based on user-provided goals.
      Current Schedule: [${scheduleSummary}].
      Each class should include: day, time, location, classFormat, teacherFirstName, teacherLastName, duration, participants, revenue, isTopPerformer.
      The schedule should optimize for maximum attendance and revenue, considering the existing schedule.
      Here are some example classes: [${classExamples}].
      Available teachers: [${teacherList}].
      Respond ONLY with a JSON array of class objects that represent the refined schedule. Do not include any other text.`;
  }

  public async generateDailySchedule(
    day: string,
    timeSlots: string[],
    csvData: ClassData[],
    customTeachers: CustomTeacher[]
  ): Promise<ScheduledClass[]> {
    try {
      const requestBody = JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.buildDailySchedulePrompt(day, timeSlots, csvData, customTeachers),
          },
          {
            role: "user",
            content: `Generate an optimized schedule for ${day} with the following time slots: ${timeSlots.join(', ')}.`,
          },
        ],
        temperature: 0.7,
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const responseText = responseData.choices[0].message.content;

      console.log("Raw AI Daily Schedule Response:", responseText);

      return this.parseScheduleResponse(responseText);
    } catch (error: any) {
      console.error("AI Daily Schedule Error:", error);
      return [];
    }
  }

  private buildDailySchedulePrompt(
    day: string,
    timeSlots: string[],
    csvData: ClassData[],
    customTeachers: CustomTeacher[]
  ): string {
    const classExamples = csvData.slice(0, 5).map(item => {
      return `{
        classFormat: "${item.cleanedClass}",
        day: "${item.dayOfWeek}",
        time: "${item.classTime}",
        location: "${item.location}",
        teacher: "${item.teacherName}",
        participants: ${item.participants},
        revenue: ${item.totalRevenue}
      }`;
    }).join(', ');

    const teacherList = customTeachers.map(teacher => `"${teacher.firstName} ${teacher.lastName}"`).join(', ');

    return `You are an AI schedule optimizer for a fitness studio.
      You generate an optimized schedule for a specific day with given time slots.
      Each class should include: day, time, location, classFormat, teacherFirstName, teacherLastName, duration, participants, revenue, isTopPerformer.
      The schedule should optimize for maximum attendance and revenue.
      Here are some example classes: [${classExamples}].
      Available teachers: [${teacherList}].
      Respond ONLY with a JSON array of class objects for ${day} and time slots ${timeSlots.join(', ')}. Do not include any other text.`;
  }

  public async analyzeMetrics(data: ClassData[]): Promise<{
    totalClasses: number;
    avgParticipants: number;
    totalRevenue: number;
    topFormats: string[];
    topTeachers: string[];
  }> {
    try {
      const metrics = this.extractMetrics(data);
      return metrics;
    } catch (error) {
      console.error("Error analyzing metrics:", error);
      return {
        totalClasses: 0,
        avgParticipants: 0,
        totalRevenue: 0,
        topFormats: [],
        topTeachers: []
      };
    }
  }

  private validateScheduleItem(item: any): boolean {
    return (
      typeof item === 'object' &&
      typeof item.day === 'string' &&
      typeof item.time === 'string' &&
      typeof item.location === 'string' &&
      typeof item.classFormat === 'string'
    );
  }

  private extractMetrics(data: ClassData[]) {
    const metrics = {
      totalClasses: data.length,
      avgParticipants: 0,
      totalRevenue: 0,
      topFormats: [] as string[],
      topTeachers: [] as string[]
    };

    if (data.length > 0) {
      const totalParticipants = data.reduce((sum, item) => {
        const participants = typeof item.participants === 'number' ? item.participants : 0;
        return sum + participants;
      }, 0);
      
      const totalRev = data.reduce((sum, item) => {
        const revenue = typeof item.totalRevenue === 'number' ? item.totalRevenue : 0;
        return sum + revenue;
      }, 0);

      metrics.avgParticipants = totalParticipants / data.length;
      metrics.totalRevenue = totalRev;
    }

    return metrics;
  }
}

export const aiService = new AIService();
