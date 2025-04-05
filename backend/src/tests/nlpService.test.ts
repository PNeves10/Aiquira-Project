import { NLPService } from '../services/nlpService';
import { DocumentAnalysis, ComplianceDocument } from '../types/analysis';

describe('NLPService', () => {
  beforeEach(() => {
    NLPService.initialize();
  });

  describe('analyzeDocument', () => {
    it('analyzes document sentiment correctly', async () => {
      const text = 'The property is in excellent condition with modern amenities.';
      const result = await NLPService.analyzeDocument(text);

      expect(result.sentiment).toBeDefined();
      expect(result.sentiment.score).toBeGreaterThan(0);
      expect(result.sentiment.label).toBe('positive');
    });

    it('extracts entities correctly', async () => {
      const text = 'The property was built in 01/15/2000 and costs $500,000. The ROI is 5%.';
      const result = await NLPService.analyzeDocument(text);

      expect(result.entities).toHaveLength(3);
      expect(result.entities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'date', value: '01/15/2000' }),
          expect.objectContaining({ type: 'amount', value: '$500,000' }),
          expect.objectContaining({ type: 'percentage', value: '5%' })
        ])
      );
    });

    it('identifies key phrases correctly', async () => {
      const text = 'The property features a modern kitchen, spacious living room, and energy-efficient appliances.';
      const result = await NLPService.analyzeDocument(text);

      expect(result.keyPhrases).toBeDefined();
      expect(result.keyPhrases.length).toBeGreaterThan(0);
      expect(result.keyPhrases[0].importance).toBeGreaterThan(0);
    });

    it('generates document summary correctly', async () => {
      const text = 'The property is located in a prime location. It features modern amenities and has excellent potential for appreciation. The neighborhood is safe and well-maintained.';
      const result = await NLPService.analyzeDocument(text);

      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeLessThan(text.length);
    });
  });

  describe('analyzeComplianceDocument', () => {
    const mockComplianceDocument: ComplianceDocument = {
      id: 'doc-1',
      type: 'inspection-report',
      content: 'The property has several safety violations. The electrical system is non-compliant with current codes. Fire exits are blocked. These issues must be addressed immediately.',
      date: new Date(),
      status: 'valid'
    };

    it('analyzes compliance document correctly', async () => {
      const result = await NLPService.analyzeComplianceDocument(mockComplianceDocument);

      expect(result.complianceStatus).toBe('non-compliant');
      expect(result.issues).toHaveLength(2);
      expect(result.recommendations).toHaveLength(2);
    });

    it('identifies compliance issues correctly', async () => {
      const result = await NLPService.analyzeComplianceDocument(mockComplianceDocument);

      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'compliance',
            severity: 'high',
            description: expect.stringContaining('electrical system')
          }),
          expect.objectContaining({
            type: 'compliance',
            severity: 'high',
            description: expect.stringContaining('fire exits')
          })
        ])
      );
    });

    it('generates appropriate recommendations', async () => {
      const result = await NLPService.analyzeComplianceDocument(mockComplianceDocument);

      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: expect.stringContaining('electrical system'),
            priority: 'high',
            deadline: expect.any(Date)
          }),
          expect.objectContaining({
            action: expect.stringContaining('fire exits'),
            priority: 'high',
            deadline: expect.any(Date)
          })
        ])
      );
    });

    it('handles compliant documents correctly', async () => {
      const compliantDoc: ComplianceDocument = {
        ...mockComplianceDocument,
        content: 'The property meets all safety and building code requirements. All systems are functioning properly.'
      };

      const result = await NLPService.analyzeComplianceDocument(compliantDoc);

      expect(result.complianceStatus).toBe('compliant');
      expect(result.issues).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe('analyzeSentiment', () => {
    it('analyzes positive sentiment correctly', () => {
      const text = 'The property is excellent and well-maintained.';
      const result = NLPService['analyzeSentiment'](text);

      expect(result.score).toBeGreaterThan(0);
      expect(result.label).toBe('positive');
    });

    it('analyzes negative sentiment correctly', () => {
      const text = 'The property is in poor condition and needs major repairs.';
      const result = NLPService['analyzeSentiment'](text);

      expect(result.score).toBeLessThan(0);
      expect(result.label).toBe('negative');
    });

    it('analyzes neutral sentiment correctly', () => {
      const text = 'The property was built in 2000.';
      const result = NLPService['analyzeSentiment'](text);

      expect(result.score).toBe(0);
      expect(result.label).toBe('neutral');
    });
  });

  describe('extractEntities', () => {
    it('extracts dates correctly', () => {
      const text = 'The inspection was conducted on 01/15/2023.';
      const result = NLPService['extractEntities'](text);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'date',
            value: '01/15/2023',
            confidence: 1.0
          })
        ])
      );
    });

    it('extracts monetary values correctly', () => {
      const text = 'The repair cost is $5,000.';
      const result = NLPService['extractEntities'](text);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'amount',
            value: '$5,000',
            confidence: 1.0
          })
        ])
      );
    });

    it('extracts percentages correctly', () => {
      const text = 'The property value increased by 10%.';
      const result = NLPService['extractEntities'](text);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'percentage',
            value: '10%',
            confidence: 1.0
          })
        ])
      );
    });
  });

  describe('extractKeyPhrases', () => {
    it('extracts and ranks key phrases correctly', () => {
      const text = 'The property features a modern kitchen and spacious living room. The neighborhood is safe and well-maintained.';
      const result = NLPService['extractKeyPhrases'](text);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].importance).toBeGreaterThan(result[1].importance);
    });
  });

  describe('identifyComplianceIssues', () => {
    it('identifies high severity issues correctly', () => {
      const text = 'The property has several safety violations that must be addressed immediately.';
      const result = NLPService['identifyComplianceIssues'](text);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'compliance',
            severity: 'high',
            description: expect.stringContaining('safety violations')
          })
        ])
      );
    });

    it('identifies medium severity issues correctly', () => {
      const text = 'The property should have additional safety measures.';
      const result = NLPService['identifyComplianceIssues'](text);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'compliance',
            severity: 'medium',
            description: expect.stringContaining('safety measures')
          })
        ])
      );
    });

    it('identifies low severity issues correctly', () => {
      const text = 'It is recommended to install additional security cameras.';
      const result = NLPService['identifyComplianceIssues'](text);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'compliance',
            severity: 'low',
            description: expect.stringContaining('security cameras')
          })
        ])
      );
    });
  });
}); 