import { Icon } from '@iconify/react';
import question from '@iconify/icons-bi/question-circle';

// material
import { styled } from '@mui/material/styles';
import {
  Card,
  Typography,
  Stack,
  Divider,
  DialogContentText,
  DialogTitle,
  Dialog,
  DialogContent,
  Container,
  Box,
  Button,
  Grid,
  Tooltip,
  TextField,
  FormHelperText
} from '@mui/material';
// utils
import { fCurrency, fPercent } from '../../../utils/formatNumber';
//
import { useEffect, useState } from 'react';
import { dispatch, RootState, useSelector } from 'redux/store';
import { Wallet } from '../../../@types/krowd/wallet';
import { getWalletByID, getWalletList } from 'redux/slices/krowd_slices/wallet';
import { motion } from 'framer-motion';
import { TextAnimate, varBounceInUp, varWrapEnter } from 'components/animate';
import walletDetails from '@iconify/icons-ant-design/wallet-outlined';
import moneyBillTransfer from '@iconify/icons-fa6-solid/money-bill-transfer';
import { Form, FormikProvider, useFormik } from 'formik';
import axios from 'axios';
import { REACT_APP_API_URL } from 'config';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import dolarMoney from '@iconify/icons-ant-design/dollar-circle-outlined';
import InfoRecieve from '@iconify/icons-ant-design/solution-outline';
import secureInfo from '@iconify/icons-ant-design/security-scan-outlined';
import * as Yup from 'yup';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  backgroundSize: 'cover',
  padding: theme.spacing(3),
  backgroundColor: '#d29f6370',
  display: 'flex',
  color: 'white',
  flexDirection: 'column',
  justifyContent: 'space-between'
}));
// ----------------------------------------------------------------------

const RootStyleContainer = styled(motion.div)(({ theme }) => ({
  backgroundPosition: 'center',
  width: '100%',
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#ff8900bf'
}));
type Package = {
  id: string;
};
export default function ProjectPaymentWallet({ wallet }: { wallet: Wallet }) {
  useEffect(() => {
    dispatch(getWalletList());
  }, [dispatch]);
  const { investorKrowdDetail: mainInvestor } = useSelector(
    (state: RootState) => state.user_InvestorStateKrowd
  );
  const { enqueueSnackbar } = useSnackbar();

  const [openModalShareInvest, setOpenModalShareInvest] = useState(false);
  const [openModalTransfer, setOpenModalTransfer] = useState(false);
  const { isLoading, walletList } = useSelector((state: RootState) => state.walletKrowd);
  const { listOfInvestorWallet } = walletList;
  const [walletIDTranferFrom, setWalletIDTranferFrom] = useState('');

  const ToWalletId = listOfInvestorWallet
    .slice(4, 5)
    .find((e: any) => e.walletType.name === 'V?? thu ti???n');

  const handleClickRefeshBalance = async (v: Package) => {
    dispatch(getWalletByID(v.id));
    setOpenModalShareInvest(true);
  };
  const handleClickTranferMoney = async (v: Package) => {
    dispatch(getWalletByID(v.id));
    setWalletIDTranferFrom(v.id);
    setOpenModalTransfer(true);
  };
  function getToken() {
    return window.localStorage.getItem('accessToken');
  }
  function getHeaderFormData() {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
  }
  const TransferSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Vui l??ng nh???p s??? ti???n b???n c???n r??t')
      .min(100000, 'Y??u c???u t???i thi???u m???i l???n r??t l?? 100,000??')
      .max(500000000, 'Y??u c???u t???i ??a m???i l???n r??t l?? 500,000,000??')
  });
  const formikTranfer = useFormik({
    initialValues: {
      fromWalletId: walletIDTranferFrom,
      toWalletId: ToWalletId?.id ?? '',
      amount: 0
    },
    enableReinitialize: true,
    validationSchema: TransferSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const headers = getHeaderFormData();
        await axios
          .put(REACT_APP_API_URL + `/wallets`, values, {
            headers: headers
          })
          .then((res) => {
            enqueueSnackbar('Chuy???n ti???n th??nh c??ng', {
              variant: 'success'
            });
            resetForm();
            setOpenModalTransfer(false);
            dispatch(getWalletList());
          })
          .catch(() => {
            enqueueSnackbar('Chuy???n ti???n th???t b???i vui l??ng ki???m tra l???i s??? d?? c???a b???n', {
              variant: 'error'
            });
          })
          .finally(() => {
            setSubmitting(true);
          });
      } catch (error) {
        setSubmitting(false);
      }
    }
  });

  const {
    errors: errorsTranfer,
    values: valuesTranfer,
    touched: touchedTranfer,
    isSubmitting: isSubmittingTranfer,
    handleSubmit: handleSubmitTranfer,
    getFieldProps: getFieldPropsTranfer,
    setFieldValue: setFieldValueTranfer
  } = formikTranfer;
  return (
    <RootStyleContainer initial="initial" animate="animate" variants={varWrapEnter}>
      {listOfInvestorWallet &&
        listOfInvestorWallet.length > 0 &&
        listOfInvestorWallet.slice(3, 4).map((e, i) => (
          <RootStyle key={i}>
            <Stack spacing={1} sx={{ p: 3 }}>
              <Grid container>
                <Grid lg={6}>
                  <Typography sx={{ typography: 'h6' }}>{e.walletType.name}</Typography>
                </Grid>
                <Grid>
                  <Button
                    sx={{
                      display: 'flex',
                      border: '1px solid white',
                      color: 'white'
                    }}
                    onClick={() => handleClickRefeshBalance(e)}
                  >
                    {/* <Icon icon={refresh} /> */}
                    <Typography sx={{ typography: 'subtitle2', gap: 1, pl: 1 }}>
                      Chi ti???t t??i kho???n v??
                    </Typography>
                  </Button>
                  <Dialog fullWidth maxWidth="sm" open={openModalShareInvest}>
                    <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
                      <Icon color="#14b7cc" height={60} width={60} icon={walletDetails} />
                    </DialogTitle>
                    <DialogContent>
                      <Box mt={1}>
                        <DialogContentText
                          sx={{
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: 20,
                            color: 'black'
                          }}
                        >
                          Chi ti???t t??i kho???n v??
                        </DialogContentText>
                      </Box>
                      <Stack spacing={{ xs: 2, md: 1 }}>
                        <Container sx={{ p: 2 }}>
                          <Divider sx={{ my: 2 }} />
                          <Card sx={{ p: 2, mb: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: '0.5rem',
                                p: 1
                              }}
                            >
                              <Typography
                                paragraph
                                sx={{
                                  color: '#251E18',
                                  marginBottom: '0.2rem'
                                }}
                              >
                                S??? d?? kh??? d???ng: <br />
                                <strong style={{ color: 'green' }}>{fCurrency(e.balance)}</strong>
                              </Typography>
                              <Typography
                                paragraph
                                sx={{
                                  color: '#251E18',
                                  marginBottom: '0.2rem'
                                }}
                              >
                                T???ng s??? d?? <br />
                                <strong>{fCurrency(e.balance)}</strong>
                              </Typography>
                            </Box>
                          </Card>

                          <Card sx={{ p: 2 }}>
                            <Typography sx={{ mb: 2 }}>TH??NG TIN CHI TI???T</Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                p: 1,
                                mb: 1,
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography
                                paragraph
                                sx={{
                                  color: '#251E18',

                                  marginBottom: '0.2rem'
                                }}
                              >
                                Lo???i t??i kho???n <br />
                                <strong>{e.walletType.name}</strong>
                              </Typography>
                            </Box>
                            <Divider />

                            <Box
                              sx={{
                                display: 'flex',
                                p: 1,
                                mb: 1,

                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography
                                paragraph
                                sx={{
                                  color: '#251E18',
                                  marginBottom: '0.2rem'
                                }}
                              >
                                T??i kho???n s??? ??i???n tho???i
                                <br />
                                <strong>{mainInvestor?.phoneNum}</strong>
                              </Typography>
                            </Box>
                            <Divider />

                            <Box
                              sx={{
                                display: 'flex',
                                p: 1,
                                mb: 1,

                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography
                                paragraph
                                sx={{
                                  color: '#251E18',
                                  marginBottom: '0.2rem'
                                }}
                              >
                                Ng??y m??? t??i kho???n <br />
                                <strong>{e.createDate}</strong>
                              </Typography>
                            </Box>
                          </Card>
                          {/* <Box my={2} p={2}>
                            <Typography>Ch??a c???p nh???t</Typography>
                          </Box> */}
                        </Container>
                      </Stack>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                        <Box>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenModalShareInvest(false)}
                          >
                            ????ng
                          </Button>
                        </Box>
                        {/* <Button
                          href={PATH_PAGE.pageTopUp}
                          target="_blank"
                          sx={{
                            display: 'flex',
                            border: '1px solid white'
                          }}
                          variant="contained"
                        >
                          + N???p ti???n
                        </Button> */}
                      </Box>
                    </DialogContent>
                  </Dialog>
                </Grid>
              </Grid>
              <Grid container alignItems={'flex-start'}>
                <Grid lg={6}>
                  <TextAnimate
                    text={fCurrency(e.balance)}
                    sx={{ typography: 'h4' }}
                    variants={varBounceInUp}
                  />
                </Grid>
                <Grid sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    sx={{ mt: 1, display: 'flex', border: '1px solid white', color: 'white' }}
                    onClick={() => handleClickTranferMoney(e)}
                  >
                    + Chuy???n ti???n
                  </Button>
                  <Dialog fullWidth maxWidth="sm" open={openModalTransfer}>
                    <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
                      <Box mt={1} display={'flex'} justifyContent={'flex-end'}>
                        <Box>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenModalTransfer(false)}
                          >
                            X
                          </Button>
                        </Box>
                      </Box>
                      <Icon color="#14b7cc" height={60} width={60} icon={moneyBillTransfer} />
                      <Box mt={1}>
                        <DialogContentText
                          sx={{
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: 20,
                            color: 'black'
                          }}
                        >
                          T???o l???nh chuy???n ti???n
                        </DialogContentText>
                      </Box>
                    </DialogTitle>
                    <DialogContent>
                      <Typography>
                        S??? d?? v??: <strong>{fCurrency(e.balance)}</strong>
                      </Typography>
                      <FormikProvider value={formikTranfer}>
                        <Form noValidate autoComplete="off" onSubmit={handleSubmitTranfer}>
                          <Tooltip
                            title="Giao d???ch t??? 100,000?? - 500,000,000??"
                            placement="bottom-end"
                          >
                            <TextField
                              required
                              fullWidth
                              type={'number'}
                              label="S??? ti???n VND"
                              {...getFieldPropsTranfer('amount')}
                              sx={{ my: 2 }}
                              InputProps={{
                                endAdornment: <Icon color="#ff9b26e0" icon={question} />
                              }}
                            />
                          </Tooltip>
                          {touchedTranfer.amount && errorsTranfer.amount && (
                            <FormHelperText error sx={{ px: 2 }}>
                              {touchedTranfer.amount && errorsTranfer.amount}
                            </FormHelperText>
                          )}
                          <Box sx={{ color: '#d58311' }}>
                            <Typography sx={{ my: 1, fontWeight: 500 }}>L??u ??:</Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box>
                                <Icon color="#d58311" width={20} height={20} icon={InfoRecieve} />
                              </Box>
                              <Box>
                                <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                  S??? ti???n trong v?? d??? ??n thanh to??n c???a b???n s??? ???????c chuy???n v??o v??
                                  thu ti???n.
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box>
                                <Icon color="#d58311" width={20} height={20} icon={dolarMoney} />
                              </Box>
                              <Box>
                                <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                  S??? ti???n b???n chuy???n kh??ng v?????t qu?? s??? d?? trong v?? hi???n t???i.
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box>
                                <Icon color="#d58311" width={20} height={20} icon={secureInfo} />
                              </Box>
                              <Box>
                                <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                  B???n c???n giao d???ch chuy???n ti???n t???i thi???u l?? 100,000??
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          {e.balance > 0 ? (
                            <LoadingButton
                              fullWidth
                              type="submit"
                              variant="contained"
                              size="large"
                              loading={isSubmittingTranfer}
                            >
                              Chuy???n ti???n
                            </LoadingButton>
                          ) : (
                            <LoadingButton
                              disabled
                              fullWidth
                              type="submit"
                              variant="contained"
                              size="large"
                              loading={isSubmittingTranfer}
                            >
                              Chuy???n ti???n
                            </LoadingButton>
                          )}
                        </Form>
                      </FormikProvider>
                    </DialogContent>
                  </Dialog>
                </Grid>
              </Grid>
              <Typography variant="body2" component="span" sx={{ opacity: 0.72, pt: 2 }}>
                V?? d??ng ????? ch???a s??? d?? t??? c??c kho???n thanh to??n b???n ???? ?????u t?? tr??n Krowd
              </Typography>
            </Stack>
          </RootStyle>
        ))}
    </RootStyleContainer>
  );
}
