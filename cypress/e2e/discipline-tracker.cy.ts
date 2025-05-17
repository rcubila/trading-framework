describe('Discipline Tracker', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.intercept('POST', '/auth/v1/token', {
      statusCode: 200,
      body: {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
    });

    // Mock data fetching
    cy.intercept('GET', '/rest/v1/discipline_tracker*', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '/rest/v1/goals*', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '/rest/v1/trading_rules*', {
      statusCode: 200,
      body: [],
    });

    cy.visit('/discipline-tracker');
  });

  it('displays the main components', () => {
    cy.get('h1').should('contain', 'Discipline Tracker');
    cy.get('button').contains('Add Entry').should('exist');
    cy.get('button').contains('Add Goal').should('exist');
  });

  it('can add a new entry', () => {
    cy.intercept('POST', '/rest/v1/discipline_tracker', {
      statusCode: 201,
      body: {
        id: 'test-entry-id',
        date: '2024-03-20',
        rating: 4,
        mood: 'Positive',
        rules_followed: ['Rule1'],
        rules_broken: [],
        learnings: 'Test learning',
        notes: 'Test notes',
      },
    });

    cy.get('button').contains('Add Entry').click();
    cy.get('input[name="rating"]').type('4');
    cy.get('select[name="mood"]').select('Positive');
    cy.get('textarea[name="learnings"]').type('Test learning');
    cy.get('textarea[name="notes"]').type('Test notes');
    cy.get('button').contains('Save').click();

    cy.get('[data-testid="entries-list"]').should('contain', 'Test learning');
  });

  it('can add a new goal', () => {
    cy.intercept('POST', '/rest/v1/goals', {
      statusCode: 201,
      body: {
        id: 'test-goal-id',
        title: 'Test Goal',
        description: 'Test Description',
        targetDate: '2024-12-31',
        status: 'not_started',
        metrics: [],
        progress: 0,
      },
    });

    cy.get('button').contains('Add Goal').click();
    cy.get('input[name="title"]').type('Test Goal');
    cy.get('textarea[name="description"]').type('Test Description');
    cy.get('input[name="targetDate"]').type('2024-12-31');
    cy.get('button').contains('Save').click();

    cy.get('[data-testid="goals-list"]').should('contain', 'Test Goal');
  });

  it('can add a new trading rule', () => {
    cy.intercept('POST', '/rest/v1/trading_rules', {
      statusCode: 201,
      body: {
        id: 'test-rule-id',
        name: 'Test Rule',
        category: 'Entry',
        description: 'Test Description',
        importance: 'Critical',
      },
    });

    cy.get('button').contains('Add Rule').click();
    cy.get('input[name="name"]').type('Test Rule');
    cy.get('select[name="category"]').select('Entry');
    cy.get('textarea[name="description"]').type('Test Description');
    cy.get('select[name="importance"]').select('Critical');
    cy.get('button').contains('Save').click();

    cy.get('[data-testid="rules-list"]').should('contain', 'Test Rule');
  });

  it('displays statistics correctly', () => {
    // Mock entries data with statistics
    cy.intercept('GET', '/rest/v1/discipline_tracker*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          date: '2024-03-20',
          rating: 4,
          mood: 'Positive',
          rules_followed: ['Rule1', 'Rule2'],
          rules_broken: ['Rule3'],
          learnings: 'Test learning',
          notes: 'Test notes',
        },
        {
          id: '2',
          date: '2024-03-19',
          rating: 5,
          mood: 'Neutral',
          rules_followed: ['Rule1'],
          rules_broken: [],
          learnings: 'Another learning',
          notes: 'More notes',
        },
      ],
    });

    cy.visit('/discipline-tracker');
    cy.get('[data-testid="average-rating"]').should('contain', '4.5');
    cy.get('[data-testid="compliance-rate"]').should('contain', '75');
  });

  it('handles error states gracefully', () => {
    // Mock failed data fetching
    cy.intercept('GET', '/rest/v1/discipline_tracker*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    });

    cy.visit('/discipline-tracker');
    cy.get('[data-testid="error-message"]').should('exist');
    cy.get('[data-testid="retry-button"]').should('exist');
  });
}); 