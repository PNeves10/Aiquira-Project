import { Request } from 'express';
import { logUserAnalytics } from '../utils/logger';
import mongoose from 'mongoose';

// Analytics event schema
const analyticsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  event: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed },
  sessionId: String,
  userAgent: String,
  ip: String,
  path: String,
  method: String,
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

// Analytics service
export class AnalyticsService {
  // Track user event
  static async trackEvent(
    userId: string,
    event: string,
    data: any,
    req?: Request
  ) {
    try {
      const analytics = new Analytics({
        userId,
        event,
        data,
        ...(req && {
          sessionId: req.session?.id,
          userAgent: req.userAgent,
          ip: req.ip,
          path: req.path,
          method: req.method,
        }),
      });
      
      await analytics.save();
      logUserAnalytics(event, data, req);
      
      return analytics;
    } catch (error) {
      console.error('Error tracking analytics:', error);
      throw error;
    }
  }
  
  // Get user analytics
  static async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const query: any = { userId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    return Analytics.find(query).sort({ timestamp: -1 });
  }
  
  // Get event analytics
  static async getEventAnalytics(event: string, startDate?: Date, endDate?: Date) {
    const query: any = { event };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    return Analytics.find(query).sort({ timestamp: -1 });
  }
  
  // Get analytics summary
  static async getAnalyticsSummary(startDate?: Date, endDate?: Date) {
    const query: any = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }
    
    const summary = await Analytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          lastOccurrence: { $max: '$timestamp' },
        },
      },
    ]);
    
    return summary;
  }
  
  // Track page view
  static async trackPageView(userId: string, req: Request) {
    return this.trackEvent(userId, 'page_view', {
      title: req.query.title,
      referrer: req.headers.referer,
      duration: req.query.duration,
    }, req);
  }
  
  // Track user interaction
  static async trackInteraction(
    userId: string,
    interactionType: string,
    data: any,
    req: Request
  ) {
    return this.trackEvent(userId, `interaction_${interactionType}`, data, req);
  }
  
  // Track error
  static async trackError(userId: string, error: Error, req: Request) {
    return this.trackEvent(userId, 'error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }, req);
  }
  
  // Track performance
  static async trackPerformance(
    userId: string,
    operation: string,
    duration: number,
    req: Request
  ) {
    return this.trackEvent(userId, 'performance', {
      operation,
      duration,
    }, req);
  }
  
  // Clean up old analytics data
  static async cleanupOldData(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    await Analytics.deleteMany({
      timestamp: { $lt: cutoffDate },
    });
  }
} 