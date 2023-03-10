import { Icon } from '@iconify/react';
import calendar from '@iconify/icons-bi/calendar-date';
import dolarMoney from '@iconify/icons-ant-design/dollar-circle-outlined';
import InfoRecieve from '@iconify/icons-ant-design/solution-outline';
import secureInfo from '@iconify/icons-ant-design/security-scan-outlined';
import shieldCheck from '@iconify/icons-bi/shield-check';
import question from '@iconify/icons-bi/question-circle';
// material
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// ----------------------------------------------------------------------
import moneyBillTransfer from '@iconify/icons-fa6-solid/money-bill-transfer';

import check2Fill from '@iconify/icons-eva/checkmark-circle-2-fill';
import { MIconButton } from 'components/@material-extend';
import { styled } from '@mui/material/styles';
import {
  Card,
  Typography,
  Stack,
  Grid,
  Button,
  Divider,
  DialogContentText,
  DialogTitle,
  Dialog,
  DialogContent,
  Container,
  Box,
  Tooltip,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormHelperText
} from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';
//
import { dispatch, RootState, useSelector } from 'redux/store';
import { Wallet } from '../../../@types/krowd/wallet';
import { getWalletByID, getWalletList } from 'redux/slices/krowd_slices/wallet';
import { animate, motion } from 'framer-motion';
import React, { useState } from 'react';
import walletDetails from '@iconify/icons-ant-design/wallet-outlined';

import { TextAnimate, varBounceInUp, varWrapEnter } from 'components/animate';
import { getUserKrowdDetail } from 'redux/slices/krowd_slices/investor';
import useAuth from 'hooks/useAuth';
import { Form, FormikProvider, useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { REACT_APP_API_URL } from 'config';
import { useSnackbar } from 'notistack';
import { PATH_DASHBOARD } from 'routes/paths';
import * as Yup from 'yup';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  backgroundSize: 'cover',
  padding: theme.spacing(3),
  backgroundRepeat: 'no-repeat',
  backgroundColor: '#d29f6370',
  display: 'flex',
  color: 'white',
  flexDirection: 'column',
  justifyContent: 'space-between'
}));
const RootStyleContainer = styled(motion.div)(({ theme }) => ({
  backgroundPosition: 'center',
  width: '100%',
  backgroundColor: '#ff8900bf'
}));
// ----------------------------------------------------------------------

type Package = {
  id: string;
};
export default function CollectionWallet({ wallet }: { wallet: Wallet }) {
  const { isLoading, walletList } = useSelector((state: RootState) => state.walletKrowd);
  const { listOfInvestorWallet } = walletList;
  const { investorKrowdDetail: mainInvestor } = useSelector(
    (state: RootState) => state.user_InvestorStateKrowd
  );
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [walletIDWithDraw, setWalletIDWithDraw] = useState('');

  const [openModalShareInvest, setOpenModalShareInvest] = useState(false);

  const [openModalWithDraw, setOpenModalWithDraw] = useState(false);

  const [check, setCheck] = useState(false);
  const [accountNameResponse, setAccountNameResponse] = useState('');
  const [bankNameResponse, setBankNameResponse] = useState('');
  const [bankAccountResponse, setBankAccountResponse] = useState('');
  const [IDResponse, setIDResponse] = useState('');
  const [amountResponse, setAmoutResponse] = useState(0);
  const [openModalWithdrawRequestSuccess, setOpenModalWithdrawRequestSuccess] = useState(false);
  const [showIDPayment, setShowIDPayment] = useState(true);

  const [walletIDTranferFrom, setWalletIDTranferFrom] = useState('');
  const [openModalTransfer, setOpenModalTransfer] = useState(false);

  const ToWalletId =
    listOfInvestorWallet &&
    listOfInvestorWallet.slice(1, 2).find((e: any) => e.walletType.name === 'V?? ?????u t?? chung');

  const handleClickRefeshBalance = async (v: Package) => {
    dispatch(getWalletByID(v.id));
    dispatch(getUserKrowdDetail(user?.id));
    setOpenModalShareInvest(true);
  };
  const handleClickWithDraw = async (v: Package) => {
    setOpenModalWithDraw(true);
    setWalletIDWithDraw(v.id);

    dispatch(getUserKrowdDetail(user?.id));
  };
  const onToggleShowIDPayment = () => {
    setShowIDPayment((prev) => !prev);
  };
  const handleCheckBox = async () => {
    dispatch(getUserKrowdDetail(user?.id));
    if (check === false) {
      setCheck(true);
      setFieldValueWithDraw('bankName', mainInvestor?.bankName);
      setFieldValueWithDraw('bankAccount', mainInvestor?.bankAccount);
      setFieldValueWithDraw('accountName', `${mainInvestor?.firstName} ${mainInvestor?.lastName}`);
    } else {
      setCheck(false);
      setFieldValueWithDraw('bankName', '');
      setFieldValueWithDraw('bankAccount', '');
      setFieldValueWithDraw('accountName', '');
    }
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
  function getHeaderFormData2() {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
  }
  // CHuy???n ti???n
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

  //R??t ti???n
  const WithDrawSchema = Yup.object().shape({
    bankName: Yup.string().required('Y??u c???u nh???p t??n ng??n h??ng'),
    bankAccount: Yup.string().required('Y??u c???u nh???p t??i kho???n ng??n h??ng'),
    accountName: Yup.string().required('Y??u c???u nh???p t??n ch??? kho???n'),
    amount: Yup.number()
      .required('Vui l??ng nh???p s??? ti???n b???n c???n r??t')
      .min(100000, 'Y??u c???u t???i thi???u m???i l???n r??t l?? 100,000??')
      .max(500000000, 'Y??u c???u t???i ??a m???i l???n r??t l?? 500,000,000??')
  });
  const formikWithDraw = useFormik({
    initialValues: {
      fromWalletId: walletIDWithDraw,
      bankName: '',
      accountName: '',
      bankAccount: '',
      amount: 0
    },
    enableReinitialize: true,
    validationSchema: WithDrawSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const headers = getHeaderFormData2();
        await axios
          .post(REACT_APP_API_URL + `/withdraw_requests`, values, {
            headers: headers
          })
          .then((res) => {
            enqueueSnackbar('G???i y??u c???u r??t ti???n th??nh c??ng', {
              variant: 'success'
            });
            setOpenModalWithdrawRequestSuccess(true);
            setAccountNameResponse(res.data.accountName);
            setBankAccountResponse(res.data.bankAccount);
            setBankNameResponse(res.data.bankName);
            setAmoutResponse(res.data.amount);
            setIDResponse(res.data.id);
            dispatch(getWalletByID(walletIDWithDraw));
            resetForm();
            setOpenModalWithDraw(false);
          })
          .catch(() => {
            enqueueSnackbar('G???i y??u c???u r??t ti???n th???t b???i vui l??ng ki???m tra th??ng tin b???n nh???p', {
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
    errors: errorsWithDraw,
    values: valuesWithDraw,
    touched: touchedWithDraw,
    isSubmitting: isSubmittingWithDraw,
    handleSubmit: handleSubmitWithDraw,
    getFieldProps: getFieldPropsWithDraw,
    setFieldValue: setFieldValueWithDraw
  } = formikWithDraw;

  return (
    <RootStyleContainer initial="initial" animate="animate" variants={varWrapEnter}>
      {listOfInvestorWallet &&
        listOfInvestorWallet.length > 0 &&
        listOfInvestorWallet.slice(4, 5).map((e, i) => (
          <RootStyle key={i}>
            <Stack spacing={1} sx={{ p: 3 }}>
              <Grid container>
                <Grid lg={5}>
                  <Typography sx={{ typography: 'h6' }}>{e.walletType.name}</Typography>
                  <Typography>
                    <TextAnimate
                      sx={{ typography: 'h4' }}
                      text={fCurrency(e.balance)}
                      variants={varBounceInUp}
                    />

                    {/* {fCurrency(e.balance)} */}
                  </Typography>{' '}
                </Grid>

                <Grid lg={7}>
                  <Button
                    sx={{
                      display: 'flex',
                      border: '1px solid white',
                      color: 'white',
                      mb: 1
                    }}
                    onClick={() => handleClickRefeshBalance(e)}
                  >
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
                          <Box my={2} p={2}>
                            <Typography></Typography>
                            <Button href={PATH_DASHBOARD.transaction.walletTransaction}>
                              Xem l???ch s??? giao d???ch v??{' '}
                            </Button>
                          </Box>
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
                      </Box>
                    </DialogContent>
                  </Dialog>

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
                                    S??? ti???n trong v?? thu ti???n c???a b???n s??? ???????c chuy???n v??o v?? ?????u t??
                                    chung.
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
                    <Button
                      sx={{ mt: 1, display: 'flex', border: '1px solid white', color: 'white' }}
                      onClick={() => handleClickWithDraw(e)}
                    >
                      - R??t ti???n
                    </Button>
                    <Dialog fullWidth maxWidth="sm" open={openModalWithDraw}>
                      <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
                        <Box mt={1} display={'flex'} justifyContent={'flex-end'}>
                          <Box>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => setOpenModalWithDraw(false)}
                            >
                              X
                            </Button>
                          </Box>
                        </Box>
                        <Icon color="#14b7cc" height={60} width={60} icon={walletDetails} />
                        <Box mt={1}>
                          <DialogContentText
                            sx={{
                              textAlign: 'center',
                              fontWeight: 900,
                              fontSize: 20,
                              color: 'black'
                            }}
                          >
                            T???o l???nh r??t ti???n
                          </DialogContentText>
                        </Box>
                      </DialogTitle>
                      <DialogContent>
                        <Typography>
                          S??? d?? v??: <strong>{fCurrency(e.balance)}</strong>
                        </Typography>
                        <FormikProvider value={formikWithDraw}>
                          <Form noValidate autoComplete="off" onSubmit={handleSubmitWithDraw}>
                            <TextField
                              required
                              fullWidth
                              label="T??n ng??n h??ng"
                              {...getFieldPropsWithDraw('bankName')}
                              sx={{ mt: 2 }}
                            />
                            {touchedWithDraw.bankName && errorsWithDraw.bankName && (
                              <FormHelperText error sx={{ px: 2 }}>
                                {touchedWithDraw.bankName && errorsWithDraw.bankName}
                              </FormHelperText>
                            )}
                            <TextField
                              required
                              fullWidth
                              label="T??i kho???n ng??n h??ng"
                              {...getFieldPropsWithDraw('bankAccount')}
                              sx={{ mt: 2 }}
                            />
                            {touchedWithDraw.bankAccount && errorsWithDraw.bankAccount && (
                              <FormHelperText error sx={{ px: 2 }}>
                                {touchedWithDraw.bankAccount && errorsWithDraw.bankAccount}
                              </FormHelperText>
                            )}
                            <TextField
                              required
                              fullWidth
                              label="T??n ch??? t??i kho???n"
                              {...getFieldPropsWithDraw('accountName')}
                              sx={{ mt: 2 }}
                            />
                            {touchedWithDraw.accountName && errorsWithDraw.accountName && (
                              <FormHelperText error sx={{ px: 2 }}>
                                {touchedWithDraw.accountName && errorsWithDraw.accountName}
                              </FormHelperText>
                            )}
                            <Tooltip
                              title="Giao d???ch t??? 100,000?? - 500,000,000??"
                              placement="bottom-end"
                            >
                              <TextField
                                required
                                fullWidth
                                type={'number'}
                                label="S??? ti???n VND"
                                {...getFieldPropsWithDraw('amount')}
                                sx={{ mt: 2 }}
                                InputProps={{
                                  endAdornment: <Icon color="#ff9b26e0" icon={question} />
                                }}
                              />
                            </Tooltip>
                            {touchedWithDraw.amount && errorsWithDraw.amount && (
                              <FormHelperText error sx={{ px: 2 }}>
                                {touchedWithDraw.amount && errorsWithDraw.amount}
                              </FormHelperText>
                            )}

                            <Box display={'flex'} alignItems={'center'}>
                              <Checkbox onClick={handleCheckBox} />
                              <Typography>S??? d???ng th??ng tin hi???n c??</Typography>
                            </Box>
                            <RadioGroup row sx={{ my: 2 }} {...getFieldPropsWithDraw('amount')}>
                              <FormControlLabel
                                value="300000"
                                control={<Radio />}
                                label="300,000??"
                                sx={{ px: 2 }}
                              />
                              <FormControlLabel
                                value="500000"
                                control={<Radio />}
                                label="500,000??"
                                sx={{ px: 2.7 }}
                              />
                              <FormControlLabel
                                value="1000000"
                                control={<Radio />}
                                label="1,000,000??"
                                sx={{ px: 2 }}
                              />
                              <FormControlLabel
                                value="3000000"
                                control={<Radio />}
                                label="3,000,000??"
                                sx={{ px: 2 }}
                              />
                              <FormControlLabel
                                value="5000000"
                                control={<Radio />}
                                label="5,000,000??"
                                sx={{ px: 1 }}
                              />
                              <FormControlLabel
                                value="10000000"
                                control={<Radio />}
                                label="10,000,000??"
                                sx={{ px: 2.3 }}
                              />
                            </RadioGroup>
                            <Box sx={{ color: '#d58311' }}>
                              <Typography sx={{ my: 1, fontWeight: 500 }}>L??u ??:</Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box>
                                  <Icon color="#d58311" width={20} height={20} icon={calendar} />
                                </Box>
                                <Box>
                                  <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                    S??? ti???n b???n r??t s??? ???????c chuy???n v??o t??i kho???n c???a b???n ch???m nh???t
                                    l?? 24h sau khi t???o l???nh r??t ti???n.
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box>
                                  <Icon color="#d58311" width={20} height={20} icon={dolarMoney} />
                                </Box>
                                <Box>
                                  <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                    S??? ti???n b???n r??t kh??ng v?????t qu?? s??? d?? trong v?? hi???n t???i.
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box>
                                  <Icon color="#d58311" width={20} height={20} icon={InfoRecieve} />
                                </Box>
                                <Box>
                                  <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                    Th??ng tin r??t ti???n l?? th??ng tin t??i kho???n c???a b???n ho???c th??ng tin
                                    ng?????i m?? b???n quen bi???t (M???i th??ng tin ?????u ph???i tr??ng kh???p v???i
                                    th??ng tin ???? ????ng k?? b??n ng??n h??ng ????).
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box>
                                  <Icon color="#d58311" width={20} height={20} icon={secureInfo} />
                                </Box>
                                <Box>
                                  <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                    Vui l??ng ki???m tra th??ng tin tr?????c khi g???i l???nh r??t ti???n.
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                              <Box>
                                <Icon color="green" width={20} height={20} icon={shieldCheck} />
                              </Box>
                              <Box>
                                <Typography sx={{ textAlign: 'left', ml: 1 }}>
                                  M???i th??ng tin kh??ch h??ng ?????u ???????c m?? h??a ????? b???o m???t th??ng tin
                                  kh??ch h??ng.
                                </Typography>
                              </Box>
                            </Box>
                            {e.balance > 0 ? (
                              <LoadingButton
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                loading={isSubmittingWithDraw}
                              >
                                R??t ti???n
                              </LoadingButton>
                            ) : (
                              <LoadingButton
                                disabled
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                loading={isSubmittingWithDraw}
                              >
                                R??t ti???n
                              </LoadingButton>
                            )}
                          </Form>
                        </FormikProvider>
                      </DialogContent>
                    </Dialog>
                  </Grid>
                </Grid>
              </Grid>
              <Stack direction="row" alignItems="center" flexWrap="wrap">
                <Typography variant="body2" component="span" sx={{ opacity: 0.72, pt: 2 }}>
                  V?? d??ng ????? ch???a s??? d?? nh???n t??? v?? D??? ??n thanh to??n
                </Typography>
              </Stack>
            </Stack>
          </RootStyle>
        ))}
      <Dialog fullWidth maxWidth="sm" open={openModalWithdrawRequestSuccess}>
        <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Icon color="#14b7cc" height={60} width={60} icon={check2Fill} />
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <DialogContentText
              sx={{ textAlign: 'center', fontWeight: 900, fontSize: 20, color: 'black' }}
            >
              G???i y??u c???u th??nh c??ng
            </DialogContentText>
          </Box>
          <Stack spacing={{ xs: 2, md: 1 }}>
            <Container sx={{ p: 2 }}>
              <Box>
                <Typography sx={{ textAlign: 'center' }}>Y??u c???u ???? ho??n th??nh</Typography>
              </Box>
              {/* <Box>
                <Typography sx={{ textAlign: 'center', color: '#14b7cc', fontSize: 35 }}>
                  {fCurrency(`${dataInvestedSuccess}`)}
                </Typography>
              </Box> */}
              <Divider sx={{ my: 2 }} />
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
                  <strong>T???ng s??? ti???n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18',
                    marginBottom: '0.2rem'
                  }}
                >
                  <strong> {fCurrency(amountResponse)}</strong>
                </Typography>
              </Box>
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
                  <strong>S??? ti???n thanh to??n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18',
                    marginBottom: '0.2rem'
                  }}
                >
                  <strong> {fCurrency(amountResponse)}</strong>
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  p: 1,

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
                  <strong>Giao d???ch</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {/* {resDate} */}
                  R??t ti???n kh???i v??
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  p: 1,
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
                  <strong>T??n ng?????i nh???n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {accountNameResponse}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  p: 1,
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
                  <strong>Ng??n h??ng th??? h?????ng</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {bankNameResponse}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  p: 1,
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
                  <strong>T??i kho???n ng?????i nh???n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {bankAccountResponse}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  p: 1,

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
                  <strong>M?? y??u c???u</strong>
                </Typography>

                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <MIconButton
                      color="inherit"
                      onClick={onToggleShowIDPayment}
                      sx={{ opacity: 0.48 }}
                    >
                      <Icon icon={showIDPayment ? eyeFill : eyeOffFill} />
                    </MIconButton>
                    <Typography sx={{ typography: 'body2' }}>
                      {showIDPayment ? '********' : IDResponse}
                    </Typography>
                  </Stack>
                </Typography>
              </Box>
            </Container>
          </Stack>
          <Box>
            <Button
              fullWidth
              color="error"
              variant="contained"
              onClick={() => setOpenModalWithdrawRequestSuccess(false)}
            >
              ????ng
            </Button>
          </Box>
          <Box p={3}>
            <Typography variant="body2">
              N???u c?? b???t k??? th???c m???c n??o li??n quan ?????n y??u c???u n??y, xin vui l??ng li??n l???c v???i b???
              ph???n h??? tr??? c???a Krowd t???i <span style={{ color: '#14b7cc' }}>19007777</span>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </RootStyleContainer>
  );
}
