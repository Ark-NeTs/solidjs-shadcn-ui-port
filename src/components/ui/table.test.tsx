import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('Table', () => {
  it('renders a semantic table with header and body cells', () => {
    const { getByRole, getAllByRole, getByText } = render(() => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Mert</TableCell>
            <TableCell>Manager</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ));
    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByRole('columnheader')).toHaveLength(2);
    expect(getByText('Mert')).toBeInTheDocument();
    expect(getByText('Manager')).toBeInTheDocument();
  });
});
