# AI Analysis Component Guide

## Overview
The AI Analysis component is a powerful tool that provides comprehensive analysis of assets using artificial intelligence. It displays risk scores, market insights, and identified issues in an interactive and user-friendly interface.

## Features
- **Risk Score Visualization**: Circular progress indicator showing risk level
- **Market Insights**: Trend analysis with confidence levels
- **Expandable Sections**: Collapsible sections for detailed information
- **Interactive Tooltips**: Additional context on hover
- **Responsive Design**: Works well on all screen sizes
- **Accessibility Support**: Keyboard navigation and screen reader compatibility

## Usage

### Basic Implementation
```tsx
import { AIAnalysis } from './components/AIAnalysis';

function App() {
  return (
    <AIAnalysis assetId="your-asset-id" />
  );
}
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| assetId | string | Yes | Unique identifier of the asset to analyze |

## Component Structure

### Risk Score
- Displays a circular progress indicator
- Color-coded based on risk level:
  - Green: Low risk (0-30)
  - Yellow: Medium risk (31-70)
  - Red: High risk (71-100)
- Hover for additional information

### Market Insights
- Shows current market trend (positive/neutral/negative)
- Displays confidence level with progress bar
- Expandable section for key market factors
- Animated list items for better visualization

### Issues Section
- Lists identified issues with severity levels
- Each issue card includes:
  - Description
  - Impact assessment
  - Recommended resolution
- Expandable details for each issue
- Color-coded severity indicators

## Best Practices

### 1. Asset ID Format
- Use alphanumeric characters, hyphens, and underscores
- Minimum length: 1 character
- Example: `asset-123` or `property_456`

### 2. Error Handling
- The component handles various error states:
  - Invalid asset ID
  - Network errors
  - API errors
- Error messages are displayed with technical details in expandable sections

### 3. Loading States
- Shows a skeleton loader while fetching data
- Provides visual feedback for better user experience
- Maintains layout stability during loading

### 4. Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Examples

### Basic Usage
```tsx
<AIAnalysis assetId="property-123" />
```

### With Custom Styling
```tsx
<div className="max-w-4xl mx-auto">
  <AIAnalysis assetId="property-123" />
</div>
```

### Error Handling
```tsx
try {
  <AIAnalysis assetId="invalid-id" />
} catch (error) {
  // Component will display error state
}
```

## Troubleshooting

### Common Issues
1. **Invalid Asset ID**
   - Ensure the asset ID follows the correct format
   - Check for special characters

2. **Loading Issues**
   - Verify network connectivity
   - Check API endpoint availability
   - Review API response format

3. **Display Problems**
   - Check browser console for errors
   - Verify component dependencies
   - Ensure proper CSS loading

### Performance Optimization
- Component uses lazy loading for expandable sections
- Implements efficient re-rendering
- Optimizes animations for smooth performance

## API Integration

### Endpoint
```
GET /api/analysis/{assetId}
```

### Response Format
```typescript
{
  riskScore: number;
  marketInsights: {
    trend: 'positive' | 'neutral' | 'negative';
    confidence: number;
    factors: string[];
  };
  recommendations: string[];
  issues: {
    severity: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    resolution: string;
  }[];
}
```

## Contributing
When contributing to the AI Analysis component:
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test across different devices and browsers

## Support
For additional support:
- Check the [API Documentation](./api/openapi.yaml)
- Review the [Storybook Documentation](./storybook)
- Contact support@aiquira.com 