import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

describe('AlertDialog', () => {
  it('is closed initially', () => {
    render(() => (
      <AlertDialog>
        <AlertDialogTrigger>Remove</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    ));
    expect(screen.queryByText('Remove member?')).toBeNull();
  });

  it('renders title and description when open', () => {
    render(() => (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    ));
    expect(screen.getByText('Remove member?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });
});
