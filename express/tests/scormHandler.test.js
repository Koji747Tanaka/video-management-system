const packageScorm = require('../helpers/scormHandler');
const scopackager = require('simple-scorm-packager');

jest.mock('simple-scorm-packager');

describe('packageScorm', () => {
  test('should call scopackager with correct parameters', () => {
    const sourceFolderName = 'TestCourse';
    const mockCallback = jest.fn();
    packageScorm(sourceFolderName, mockCallback);

    // Define expected parameters
    const expectedParams = {
      version: '2004 4th Edition',
      organization: 'Chiba University',
      title: sourceFolderName,
      language: 'fr-FR',
      identifier: '00',
      masteryScore: 80,
      startingPage: 'index.html',
      source: `./public/transcoded/${sourceFolderName}`,
      package: {
        name: sourceFolderName,
        zip: true,
        outputFolder: './scormPackages'
      }
    };

    // Check if scopackager was called with correct parameters
    expect(scopackager).toHaveBeenCalledWith(expectedParams, mockCallback);
  });
});