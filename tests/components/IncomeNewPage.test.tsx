/**
 * @jest-environment node
 */
import React from 'react';
import IncomeNewPage from '@/app/income/new/page';

jest.mock('@/components/forms/IncomeForm', () => ({
  IncomeForm: ({ serviceTypes }: { serviceTypes: Array<{ id: number; name: string }> }) =>
    React.createElement('div', {
      'data-testid': 'income-form',
      'data-service-types': JSON.stringify(serviceTypes),
    }),
}));

describe('IncomeNewPage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('passes service types array from /api/service-types to IncomeForm', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, name: 'Manicure' },
        { id: 2, name: 'Pedicure' },
      ],
    }) as jest.Mock;

    const element = await IncomeNewPage();
    const formElement = (element as React.ReactElement).props.children[2] as React.ReactElement;

    expect(formElement.props.serviceTypes).toEqual([
      { id: 1, name: 'Manicure' },
      { id: 2, name: 'Pedicure' },
    ]);
  });

  it('falls back to an empty array when the service-types request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => [],
    }) as jest.Mock;

    const element = await IncomeNewPage();
    const formElement = (element as React.ReactElement).props.children[2] as React.ReactElement;

    expect(formElement.props.serviceTypes).toEqual([]);
  });
});
