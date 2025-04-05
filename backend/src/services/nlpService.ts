import * as natural from 'natural';
import { DocumentAnalysis, ComplianceDocument } from '../types/analysis';

export class NLPService {
  private static tokenizer: natural.WordTokenizer;
  private static tfidf: natural.TfIdf;
  private static classifier: natural.BayesClassifier;

  static initialize() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.classifier = new natural.BayesClassifier();
  }

  static async analyzeDocument(text: string): Promise<DocumentAnalysis> {
    const tokens = this.tokenizer.tokenize(text);
    const sentences = natural.SentenceTokenizer.tokenize(text);
    
    const sentiment = this.analyzeSentiment(text);
    const entities = this.extractEntities(text);
    const keyPhrases = this.extractKeyPhrases(text);
    const complianceIssues = this.identifyComplianceIssues(text);

    return {
      sentiment,
      entities,
      keyPhrases,
      complianceIssues,
      summary: this.generateSummary(sentences)
    };
  }

  static async analyzeComplianceDocument(document: ComplianceDocument): Promise<{
    complianceStatus: 'compliant' | 'non-compliant' | 'needs-review';
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      reference: string;
    }>;
    recommendations: Array<{
      action: string;
      priority: 'low' | 'medium' | 'high';
      deadline?: Date;
    }>;
  }> {
    const analysis = await this.analyzeDocument(document.content);
    const complianceStatus = this.determineComplianceStatus(analysis);
    const issues = this.identifyComplianceIssues(document.content);
    const recommendations = this.generateComplianceRecommendations(analysis, issues);

    return {
      complianceStatus,
      issues,
      recommendations
    };
  }

  private static analyzeSentiment(text: string): {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  } {
    const analyzer = new natural.SentimentAnalyzer();
    const score = analyzer.getSentiment(this.tokenizer.tokenize(text));
    
    return {
      score,
      magnitude: Math.abs(score),
      label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
    };
  }

  private static extractEntities(text: string): Array<{
    type: string;
    value: string;
    confidence: number;
  }> {
    const entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }> = [];

    // Extract dates
    const dates = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || [];
    dates.forEach(date => {
      entities.push({
        type: 'date',
        value: date,
        confidence: 1.0
      });
    });

    // Extract monetary values
    const amounts = text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
    amounts.forEach(amount => {
      entities.push({
        type: 'amount',
        value: amount,
        confidence: 1.0
      });
    });

    // Extract percentages
    const percentages = text.match(/\d+(?:\.\d+)?%/g) || [];
    percentages.forEach(percent => {
      entities.push({
        type: 'percentage',
        value: percent,
        confidence: 1.0
      });
    });

    return entities;
  }

  private static extractKeyPhrases(text: string): Array<{
    phrase: string;
    importance: number;
  }> {
    this.tfidf.addDocument(text);
    const phrases: Array<{
      phrase: string;
      importance: number;
    }> = [];

    this.tfidf.listTerms(0).forEach(item => {
      phrases.push({
        phrase: item.term,
        importance: item.tfidf
      });
    });

    return phrases.sort((a, b) => b.importance - a.importance).slice(0, 10);
  }

  private static identifyComplianceIssues(text: string): Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    reference: string;
  }> {
    const issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      reference: string;
    }> = [];

    // Check for compliance-related keywords
    const complianceKeywords = {
      high: ['violation', 'non-compliant', 'illegal', 'prohibited'],
      medium: ['warning', 'caution', 'should', 'must'],
      low: ['recommended', 'suggested', 'optional']
    };

    Object.entries(complianceKeywords).forEach(([severity, keywords]) => {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const context = this.getContext(text, matches[0]);
          issues.push({
            type: 'compliance',
            severity: severity as 'low' | 'medium' | 'high',
            description: context,
            reference: this.findReference(text, matches[0])
          });
        }
      });
    });

    return issues;
  }

  private static generateSummary(sentences: string[]): string {
    // Implement text summarization using TF-IDF or other algorithms
    // This is a simplified version
    return sentences.slice(0, 3).join(' ');
  }

  private static determineComplianceStatus(analysis: DocumentAnalysis): 'compliant' | 'non-compliant' | 'needs-review' {
    if (analysis.complianceIssues.some(issue => issue.severity === 'high')) {
      return 'non-compliant';
    } else if (analysis.complianceIssues.some(issue => issue.severity === 'medium')) {
      return 'needs-review';
    }
    return 'compliant';
  }

  private static generateComplianceRecommendations(
    analysis: DocumentAnalysis,
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      reference: string;
    }>
  ): Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    deadline?: Date;
  }> {
    return issues.map(issue => ({
      action: `Address ${issue.type} issue: ${issue.description}`,
      priority: issue.severity,
      deadline: issue.severity === 'high' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
    }));
  }

  private static getContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + keyword.length + 50);
    return text.substring(start, end);
  }

  private static findReference(text: string, keyword: string): string {
    // Implement reference finding logic
    // This is a placeholder
    return `Section containing "${keyword}"`;
  }
} 