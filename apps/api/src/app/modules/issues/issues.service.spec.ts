import { IssuesService } from './issues.service';

describe('IssuesService', () => {
  it('defaults public issue creation to the primary municipality', async () => {
    const createdIssue = {
      id: 123,
      title: 'Road damage',
      description: 'Damaged road surface',
      category: 'pothole',
      status: 'reported',
      imageUrl: null,
      latitude: 41000000,
      longitude: 29000000,
      address: 'Test address',
      municipalityId: 1,
      userId: null,
      deviceId: 'test-device',
      acknowledgedAt: null,
      inProgressAt: null,
      resolvedAt: null,
      rejectedAt: null,
      rejectReason: null,
      createdAt: new Date('2026-05-12T00:00:00.000Z'),
      updatedAt: new Date('2026-05-12T00:00:00.000Z'),
    };
    const issuesRepository = {
      create: jest.fn().mockResolvedValue(createdIssue),
    };
    const upvotesRepository = {
      countByIssueId: jest.fn().mockResolvedValue(0),
    };
    const service = new IssuesService(issuesRepository as never, upvotesRepository as never);

    await service.createIssue({
      title: 'Road damage',
      description: 'Damaged road surface',
      category: 'pothole',
      latitude: 41,
      longitude: 29,
      address: 'Test address',
      deviceId: 'test-device',
    });

    expect(issuesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        municipalityId: 1,
      })
    );
  });
});
