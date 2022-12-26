// material
import { Container } from '@mui/material';

import WalletTransactionTable from 'components/table/WalletTransactionTable';
import Page from 'components/Page';
import { BlogPostsSearch, BlogPostsSort } from 'components/_dashboard/project';
import { useEffect, useState } from 'react';
import { dispatch, RootState, useSelector } from 'redux/store';
import { getWalletList } from 'redux/slices/krowd_slices/wallet';

// ----------------------------------------------------------------------

export default function UserWalletTransaction() {
  return (
    <Page title="Giao dịch ví | Krowd">
      <Container maxWidth={false}>
        <WalletTransactionTable />
      </Container>
    </Page>
  );
}
