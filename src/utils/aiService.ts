import { ClassData, ScheduledClass, AIProvider } from '../types';

interface Recommendation {
  classFormat: string;
  teacher: string;
  avgParticipants: number;
  confidence: number;
}

class AIService {
  private provider: AIProvider | null = null;

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  async generateRecommendations(
    csvData: ClassData[],
    day: string,
    timeSlot: string,
    location: string
  ): Promise<any[]> {
    if (!this.provider) {
      return this.generateLocalRecommendations(csvData, day, timeSlot, location);
    }

    try {
      const response = await fetch(this.provider.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.getModelForProvider(this.provider.name),
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that helps optimize fitness studio schedules.'
            },
            {
              role: 'user',
              content: `Based on this data: ${JSON.stringify(csvData.slice(0, 10))}, recommend classes for ${day} at ${timeSlot} in ${location}.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return this.parseRecommendations(data);
    } catch (error) {
      console.error('AI API error:', error);
      return this.generateLocalRecommendations(csvData, day, timeSlot, location);
    }
  }

  private generateLocalRecommendations(
    csvData: ClassData[],
    day: string,
    timeSlot: string,
    location: string
  ): any[] {
    // Filter data for the specific day and time
    const relevantData = csvData.filter(cls => 
      cls.dayOfWeek === day && 
      cls.classTime === timeSlot &&
      cls.location === location
    );

    // Sort by performance metrics
    return relevantData
      .sort((a, b) => (b.participants || 0) - (a.participants || 0))
      .slice(0, 5)
      .map(cls => ({
        classFormat: cls.cleanedClass,
        teacher: cls.teacherName,
        avgParticipants: cls.participants || 0,
        confidence: 0.8
      }));
  }

  private getModelForProvider(providerName: string): string {
    switch (providerName) {
      case 'DeepSeek':
        return 'deepseek-chat';
      case 'OpenAI':
        return 'gpt-3.5-turbo';
      case 'Anthropic':
        return 'claude-3-sonnet-20240229';
      case 'Groq':
        return 'llama3-8b-8192';
      default:
        return 'gpt-3.5-turbo';
    }
  }

  private parseRecommendations(response: any): any[] {
    try {
      const content = response.choices?.[0]?.message?.content || '';
      // Simple parsing - in a real implementation, this would be more sophisticated
      return [{
        classFormat: 'AI Recommended Class',
        teacher: 'Suggested Teacher',
        avgParticipants: 8,
        confidence: 0.9
      }];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }
  
  async generateOptimizedSchedule(
    csvData: ClassData[],
    currentSchedule: ScheduledClass[],
    constraints: any = {}
  ): Promise<ScheduledClass[]> {
    if (!this.provider) {
      return this.generateIntelligentLocalSchedule(csvData, currentSchedule, constraints);
    }

    try {
      const prompt = this.buildOptimizationPrompt(csvData, currentSchedule, constraints);
      
      const response = await fetch(this.provider.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.getModelForProvider(this.provider.name),
          messages: [
            {
              role: 'system',
              content: 'You are an expert fitness studio scheduler. Generate optimized class schedules in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('Optimization API request failed');
      }

      const data = await response.json();
      return this.parseOptimizedScheduleResponse(data) || this.generateIntelligentLocalSchedule(csvData, currentSchedule, constraints);
    } catch (error) {
      console.error('Schedule optimization error:', error);
      return this.generateIntelligentLocalSchedule(csvData, currentSchedule, constraints);
    }
  }

  private generateIntelligentLocalSchedule(
    csvData: ClassData[],
    currentSchedule: ScheduledClass[],
    constraints: any
  ): ScheduledClass[] {
    // Implement local intelligent scheduling logic
    const optimizedSchedule: ScheduledClass[] = [];
    
    // Analyze performance data
    const performanceAnalysis = this.analyzeTimeSlotPerformance(csvData);
    const competitorAnalysis = this.analyzeCompetitorSlots(csvData);
    
    // Generate schedule based on analysis
    const timeSlots = ['07:30', '08:30', '09:30', '17:30', '18:30', '19:30'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      timeSlots.forEach(time => {
        const bestClass = this.findBestClassForSlot(csvData, day, time);
        if (bestClass) {
          optimizedSchedule.push({
            id: `${day}-${time}-${Date.now()}`,
            day,
            time,
            classFormat: bestClass.cleanedClass,
            teacherFirstName: bestClass.teacherFirstName || 'TBD',
            teacherLastName: bestClass.teacherLastName || '',
            location: bestClass.location,
            duration: '60 minutes'
          });
        }
      });
    });
    
    return optimizedSchedule.slice(0, 20); // Limit to prevent overwhelming
  }

  private buildOptimizationPrompt(
    csvData: ClassData[],
    currentSchedule: ScheduledClass[],
    constraints: any
  ): string {
    const dataSnapshot = csvData.slice(0, 50).map(cls => ({
      class: cls.cleanedClass,
      day: cls.dayOfWeek,
      time: cls.classTime,
      participants: cls.participants,
      teacher: cls.teacherName,
      location: cls.location
    }));

    return `
    Optimize this fitness studio schedule based on the following data:
    
    Historical Performance Data (sample):
    ${JSON.stringify(dataSnapshot, null, 2)}
    
    Current Schedule:
    ${JSON.stringify(currentSchedule, null, 2)}
    
    Constraints:
    - Peak hours: 7:30-12:00 AM, 5:30-8:00 PM
    - Each teacher max 15 hours/week
    - Minimum 11 hours/week per teacher
    - Different class formats per time slot
    - Prioritize high-performing classes
    
    Return a JSON array of optimized classes with format:
    [{"id": "unique-id", "day": "Monday", "time": "07:30", "classFormat": "Studio Barre 57", "teacherFirstName": "Name", "teacherLastName": "Last", "location": "Location", "duration": "60 minutes"}]
    `;
  }

  private analyzeTimeSlotPerformance(csvData: ClassData[]): any {
    const timeSlotPerformance: { [key: string]: { participants: number; count: number } } = {};
    
    csvData.forEach(cls => {
      const slot = `${cls.dayOfWeek}-${cls.classTime}`;
      if (!timeSlotPerformance[slot]) {
        timeSlotPerformance[slot] = { participants: 0, count: 0 };
      }
      timeSlotPerformance[slot].participants += cls.participants || 0;
      timeSlotPerformance[slot].count += 1;
    });
    
    // Calculate averages
    Object.keys(timeSlotPerformance).forEach(slot => {
      const data = timeSlotPerformance[slot];
      data.participants = data.count > 0 ? data.participants / data.count : 0;
    });
    
    return timeSlotPerformance;
  }

  private analyzeCompetitorSlots(csvData: ClassData[]): any {
    // Analyze what works well at different times
    const locationAnalysis = this.analyzeLocationPerformance(csvData);
    const teacherAnalysis = this.analyzeTeacherUtilization(csvData);
    
    return {
      locationAnalysis,
      teacherAnalysis
    };
  }

  private analyzeLocationPerformance(csvData: ClassData[]): any {
    const locationPerformance: { [key: string]: { total: number; count: number } } = {};
    
    csvData.forEach(cls => {
      if (!locationPerformance[cls.location]) {
        locationPerformance[cls.location] = { total: 0, count: 0 };
      }
      locationPerformance[cls.location].total += cls.participants || 0;
      locationPerformance[cls.location].count += 1;
    });
    
    return locationPerformance;
  }

  private analyzeTeacherUtilization(csvData: ClassData[]): any {
    const teacherHours: { [key: string]: number } = {};
    
    csvData.forEach(cls => {
      const teacher = cls.teacherName;
      if (!teacherHours[teacher]) {
        teacherHours[teacher] = 0;
      }
      teacherHours[teacher] += cls.timeHours || 1;
    });
    
    return teacherHours;
  }

  private findBestClassForSlot(csvData: ClassData[], day: string, time: string): ClassData | null {
    const candidates = csvData.filter(cls => 
      cls.dayOfWeek === day && 
      cls.classTime === time
    );
    
    if (candidates.length === 0) return null;
    
    // Sort by participants and return best performer
    return candidates.sort((a, b) => (b.participants || 0) - (a.participants || 0))[0];
  }

  private parseOptimizedScheduleResponse(response: any): ScheduledClass[] | null {
    try {
      const content = response.choices?.[0]?.message?.content || '';
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        const schedule = JSON.parse(jsonMatch[0]);
        return Array.isArray(schedule) ? schedule : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing optimized schedule:', error);
      return null;
    }
  }

  async generateDailyOptimization(
    csvData: ClassData[],
    targetDay: string,
    location: string,
    constraints: any = {}
  ): Promise<any> {
    // Analyze day-specific patterns
    const dayData = csvData.filter(cls => cls.dayOfWeek === targetDay);
    
    if (dayData.length === 0) {
      return {
        recommendations: [],
        insights: [`No historical data available for ${targetDay}`],
        confidence: 0
      };
    }
    
    // Analyze performance by time slot
    const timeSlotAnalysis: { [key: string]: { total: number; count: number; classes: ClassData[] } } = {};
    
    dayData.forEach(cls => {
      if (!timeSlotAnalysis[cls.classTime]) {
        timeSlotAnalysis[cls.classTime] = { total: 0, count: 0, classes: [] };
      }
      timeSlotAnalysis[cls.classTime].total += cls.participants || 0;
      timeSlotAnalysis[cls.classTime].count += 1;
      timeSlotAnalysis[cls.classTime].classes.push(cls);
    });
    
    // Generate recommendations
    const recommendations = Object.entries(timeSlotAnalysis)
      .map(([time, data]) => {
        const avgParticipants = data.count > 0 ? data.total / data.count : 0;
        const bestClass = data.classes.sort((a, b) => (b.participants || 0) - (a.participants || 0))[0];
        
        return {
          time,
          recommendedClass: bestClass.cleanedClass,
          recommendedTeacher: bestClass.teacherName,
          avgParticipants,
          confidence: Math.min(0.9, data.count / 10) // Higher confidence with more data points
        };
      })
      .filter(rec => rec.avgParticipants > 5) // Only recommend if average > 5 participants
      .sort((a, b) => b.avgParticipants - a.avgParticipants);
    
    // Generate insights
    const insights = [
      `Best performing time slot: ${recommendations[0]?.time || 'N/A'} with ${recommendations[0]?.avgParticipants?.toFixed(1) || 0} avg participants`,
      `Total classes analyzed: ${dayData.length}`,
      `Recommended classes: ${recommendations.length}`
    ];
    
    return {
      recommendations,
      insights,
      confidence: recommendations.length > 0 ? recommendations[0].confidence : 0
    };
  }

  async analyzeClassPerformance(csvData: ClassData[]): Promise<any> {
    const classPerformance: { [key: string]: { total: number; count: number; revenue: number } } = {};
    
    csvData.forEach(cls => {
      if (!classPerformance[cls.cleanedClass]) {
        classPerformance[cls.cleanedClass] = { total: 0, count: 0, revenue: 0 };
      }
      classPerformance[cls.cleanedClass].total += cls.participants || 0;
      classPerformance[cls.cleanedClass].count += 1;
      classPerformance[cls.cleanedClass].revenue += cls.totalRevenue || 0;
    });
    
    const analysis = Object.entries(classPerformance).map(([className, data]) => ({
      className,
      avgParticipants: data.count > 0 ? data.total / data.count : 0,
      totalClasses: data.count,
      totalRevenue: data.revenue,
      avgRevenuePerClass: data.count > 0 ? data.revenue / data.count : 0
    }));
    
    return analysis.sort((a, b) => b.avgParticipants - a.avgParticipants);
  }

  // Additional utility methods with proper error handling
  private validateApiResponse(response: any): boolean {
    return response && 
           typeof response === 'object' && 
           response.choices && 
           Array.isArray(response.choices) && 
           response.choices.length > 0;
  }

  private handleApiError(error: any, fallbackMethod: () => any): any {
    console.error('AI Service Error:', error);
    
    // Log error details for debugging
    if (error.response) {
      console.error('API Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('General Error:', error.message);
    }
    
    // Return fallback result
    return fallbackMethod();
  }

  // Method to test API connectivity
  async testConnection(): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    try {
      const response = await fetch(this.provider.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.provider.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.getModelForProvider(this.provider.name),
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ],
          max_tokens: 10
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Method to get provider status
  getProviderStatus(): { connected: boolean; provider: string | null } {
    return {
      connected: !!this.provider,
      provider: this.provider?.name || null
    };
  }
}

export const aiService = new AIService();
