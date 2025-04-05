import logger from '../utils/logger';

describe('Logger', () => {
  it('should create a logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBe('info');
  });

  it('should have file transports', () => {
    const transports = logger.transports;
    expect(transports).toHaveLength(2);
    expect(transports[0].filename).toBe('error.log');
    expect(transports[1].filename).toBe('combined.log');
  });

  describe('stream', () => {
    it('should write to logger', () => {
      const consoleSpy = jest.spyOn(console, 'info');
      const message = 'Test message';

      logger.stream.write(message);

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
}); 