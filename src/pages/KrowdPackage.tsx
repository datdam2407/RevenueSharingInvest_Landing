// material
import {
  Divider,
  Container,
  Grid,
  Box,
  Typography,
  styled,
  CircularProgress,
  TextField,
  Stack,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Input
} from '@mui/material';

// redux
import { dispatch, RootState, useSelector } from 'redux/store';
// icons
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
// material
import { Button, Toolbar } from '@mui/material';
// components
import Page from 'components/Page';
import {
  ProjectDetailDocument,
  ProjectDetailHowItWorks
} from 'components/_external-pages/project-detail/index';

import { useEffect, useState } from 'react';
//Language
import cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import {
  getPackageBYID,
  getProjectListById,
  getProjectPackage
} from 'redux/slices/krowd_slices/project';
import { getAllProjectStage, getProjectStageList } from 'redux/slices/krowd_slices/stage';
import { Icon } from '@iconify/react';
import lockFill from '@iconify/icons-ant-design/lock-outline';
import useAuth from 'hooks/useAuth';
import { getUserKrowdDetail } from 'redux/slices/krowd_slices/investor';
import UserAccountForm from './dashboard/AccountManager/UserAccountForm';
import { Form, FormikProvider, useFormik } from 'formik';
import axios from 'axios';
import { REACT_APP_API_URL } from 'config';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { fCurrency, fCurrencyPackage } from 'utils/formatNumber';
import { LoadingButton } from '@mui/lab';
import eyeFill from '@iconify/icons-eva/eye-fill';
import sield from '@iconify/icons-eva/shield-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// import eyeOffFill from '@iconify/icons-eva/eye-off-2-fill';
import checkFill from '@iconify/icons-eva/checkmark-fill';
import check2Fill from '@iconify/icons-eva/checkmark-circle-2-fill';
import redFill from '@iconify/icons-eva/alert-triangle-fill';
import alertFill from '@iconify/icons-eva/alert-triangle-outline';
import { MIconButton } from 'components/@material-extend';
import { getWalletList } from 'redux/slices/krowd_slices/wallet';
import { PATH_PAGE } from 'routes/paths';
import { Package } from '../@types/krowd/project';
import LoadingScreen from 'components/LoadingScreen';

// ----------------------------------------------------------------------

const LIST_TERM = styled('div')(({}) => ({
  borderTop: '1px solid #e0e0e0',
  border: '1px solid #e0e0e0',
  color: '#000',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '1.2rem',
  padding: '10px 14px 12px'
}));

const Language = [
  {
    code: 'vi',
    name: 'English',
    countryCode: 'vi'
  },
  {
    code: 'en',
    name: 'Vietnamese',
    countryCode: 'en'
  }
];

export default function KrowdPackage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showCurrency, setShowCurrency] = useState(true);
  const [showIDPayment, setShowIDPayment] = useState(true);
  const [openModalInvestSuccess, setOpenModalInvestSuccess] = useState(false);
  const [openModalInvestError, setOpenModalInvestError] = useState(false);
  const [openInvestedConfirm, setOpenInvestedConfirm] = useState(false);
  const { id = '' } = useParams();
  const [valueMin, setValueMin] = useState<Date | null>(new Date(Date.now()));

  //DATA RESPONSE SUCCESS
  const [resPaymentID, setDataInvestedIDPAY] = useState('');
  const [resQuality, setDataInvestedQuality] = useState('');
  const [resWalletName, setDataInvestedfromWalletName] = useState('');
  const [resFee, setDataInvestedfee] = useState('');
  const [resDate, setDataInvestedDate] = useState('');
  const [PackageName, setPackageName] = useState('');
  const [PackagePrice, setPackagePrice] = useState(0);
  const [PackageQuan, setPackageQuan] = useState(1);
  const [PackageRemainQuan, setPackageRemainQuan] = useState(0);
  const [dataInvestedSuccess, setDataInvestedSuccess] = useState();

  const { enqueueSnackbar } = useSnackbar();

  const onToggleShowCurrency = () => {
    setShowCurrency((prev) => !prev);
  };
  const onToggleShowIDPayment = () => {
    setShowIDPayment((prev) => !prev);
  };
  const handleConfilmInvested = () => {
    setOpenInvestedConfirm(true);
  };
  const handleCloseConfilmInvested = () => {
    setOpenInvestedConfirm(false);
  };

  //--------------------GET DATA----------------------------
  useEffect(() => {
    dispatch(getUserKrowdDetail(user?.id));
    dispatch(getWalletList());

    if (id) {
      dispatch(getProjectPackage(id));
      dispatch(getProjectListById(id));
      // setPackageName('');
      // setPackagePrice(0);
      // setPackageQuan(1);
      // setPackageRemainQuan(0);
    } else {
      dispatch(getProjectPackage(`${localStorage.getItem('projectId')}`));
      dispatch(getProjectListById(`${localStorage.getItem('projectId')}`));
      // setPackageName('');
      // setPackagePrice(0);
      // setPackageQuan(1);
      // setPackageRemainQuan(0);
    }
  }, [dispatch]);

  //--------------------ROOT STATE-------------------------
  //--------------------GET MAIN USER (INVESTOR)------------
  const { investorKrowdDetail: mainInvestor, isLoading } = useSelector(
    (state: RootState) => state.user_InvestorStateKrowd
  );
  //--------------------PROJECT-----------------------------
  const { detailOfProject, packageLists, projectPackageDetails } = useSelector(
    (state: RootState) => state.project
  );
  const { detailOfProjectID: projectID, isLoadingDetailOfProjectID } = detailOfProject;
  //-------------------WALLET BALANCE------------------------
  const { walletList } = useSelector((state: RootState) => state.walletKrowd);
  const { listOfInvestorWallet } = walletList;
  //-------------------PACKAGE-------------------------------
  const { PackageDetails } = projectPackageDetails;
  const { isPackageLoading } = packageLists;
  //-------------------LANGUAGE------------------------------
  const currentLanguageCode = cookies.get('i18next') || 'en';
  const currentLanguage = Language.find((l) => l.code === currentLanguageCode);
  const { t } = useTranslation();

  const handleClickOpenPackage2 = async (v: Package) => {
    // setPackageName(PackageDetails?.name ?? '');
    // setPackagePrice(PackageDetails?.price ?? 0);
    // setPackageQuan(PackageDetails?.quantity ?? 0);
    // setPackageRemainQuan(PackageDetails?.remainingQuantity ?? 0);
    await dispatch(getPackageBYID(v.id));
  };
  // const handleClickRefeshBalance = async (v: Package) => {
  //   dispatch(getWalletTypeByID(v.id));
  // };
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const getEntityList = (type: 'DOCUMENT' | 'HOW_IT_WORKS') => {
    return projectID?.projectEntity.find((pe) => pe.type === type)?.typeItemList;
  };

  const { documents, hows } = {
    documents: getEntityList('DOCUMENT'),
    hows: getEntityList('HOW_IT_WORKS')
  };

  const NewProjectSchema = Yup.object().shape({
    projectId: Yup.string().required('Y??u c???u nh???p d??? ??n')
  });
  function getToken() {
    return window.localStorage.getItem('accessToken');
  }

  function getHeaderFormData() {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
  }
  const formik = useFormik({
    initialValues: {
      projectId: id,
      checkBox: false,
      packageId: PackageDetails?.id,
      quantity: 1
    },
    validationSchema: NewProjectSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const headers = getHeaderFormData();
        await axios
          .post(
            `${REACT_APP_API_URL}/investments`,
            {
              projectId: id,
              packageId: PackageDetails?.id,
              quantity: `${values.quantity}`
            },
            { headers: headers }
          )
          .then((res) => {
            setDataInvestedSuccess(res.data.amount);
            setDataInvestedIDPAY(res.data.id);
            setDataInvestedQuality(res.data.investedQuantity);
            setDataInvestedfromWalletName(res.data.fromWalletName);
            setDataInvestedfee(res.data.fee);
            setDataInvestedDate(res.data.createDate);
            if (res.data.status === 'SUCCESS') {
              setOpenModalInvestSuccess(true);
              enqueueSnackbar('?????u t?? th??nh c??ng', {
                variant: 'success'
              });
            } else {
              setOpenModalInvestError(true);
              enqueueSnackbar('C???p nh???t th???t b???i', {
                variant: 'error'
              });
            }
          })
          .catch(() => {
            setOpenModalInvestError(true);
            enqueueSnackbar('C???p nh???t th???t b???i', {
              variant: 'error'
            });
          })
          .finally(() => {
            resetForm();
            setSubmitting(true);
          });
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }
    }
  });
  const inputProps = {
    step: 1
  };
  const { errors, values, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue } =
    formik;
  return (
    <Page title="Chi ti???t d??? ??n | Krowd">
      {isLoadingDetailOfProjectID && (
        <Box sx={{ height: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <LoadingScreen />
            <Typography variant="h5" sx={{ textAlign: 'center', padding: '1rem', pt: 7 }}>
              KROWD ??ang t???i d??? li???u, vui l??ng ?????i gi??y l??t...
            </Typography>
          </Box>
        </Box>
      )}
      {!isLoadingDetailOfProjectID && projectID && (
        <>
          <Container maxWidth={'lg'}>
            <Box my={2} pt={'7rem'} sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Typography>
                <img style={{ width: '80px' }} src={projectID.business.image} />
              </Typography>
              <Typography variant="h2">{projectID.name}</Typography>
            </Box>
          </Container>
          <Box sx={{ mb: 5 }}>
            <Divider variant="fullWidth" sx={{ opacity: 0.1 }} />
          </Box>
          <Container maxWidth={'lg'}>
            <Box>
              <Grid container justifyContent="space-between">
                <Grid xs={12} sm={7} md={6} lg={8}>
                  <Container sx={{ maxWidth: 600 }}>
                    <Box>
                      <Grid container justifyContent="space-between" alignItems={'baseline'}>
                        <Grid lg={6}>
                          <Typography variant="h3">
                            {t(`Project_package_invest.InvestmentAmount`)}
                          </Typography>
                        </Grid>
                        {listOfInvestorWallet && (
                          <Grid>
                            <Typography variant="h5"> S??? ti???n trong v?? c???a b???n</Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography sx={{ typography: 'h5' }}>
                                {showCurrency
                                  ? '********'
                                  : listOfInvestorWallet.at(1)?.balance &&
                                    fCurrency(`${listOfInvestorWallet.at(1)?.balance}`)}
                              </Typography>
                              <MIconButton
                                color="inherit"
                                onClick={onToggleShowCurrency}
                                sx={{ opacity: 0.48 }}
                                // onClickCapture={() => setBalance(e.balance)}
                              >
                                <Icon icon={showCurrency ? eyeFill : eyeOffFill} />
                              </MIconButton>
                            </Stack>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                    <Box sx={{ pt: 1.5, maxWidth: 600 }}>
                      {t(`Project_package_invest.InvestPaymentsHead`)}
                    </Box>
                    <Box sx={{ pt: 1.5 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 3, sm: 2 }}
                        sx={{ pb: 3 }}
                      >
                        <TextField
                          sx={{ width: 300 }}
                          disabled
                          label="Ch???n g??i c???a b???n mu???n ?????u t??"
                          value={PackageDetails?.name ?? 'L???a ch???n g??i b???n mu???n'}
                        />

                        <TextField
                          sx={{ width: 300 }}
                          disabled
                          label="Gi?? g??i"
                          value={(PackageDetails?.price && fCurrency(PackageDetails!.price)) ?? 0}
                        />

                        <TextField
                          sx={{ width: 300 }}
                          disabled
                          label="S??? g??i c??n l???i"
                          value={
                            (PackageDetails?.remainingQuantity &&
                              PackageDetails?.remainingQuantity) ??
                            ''
                          }
                        />
                      </Stack>
                      {PackageDetails?.price && PackageDetails?.price >= 2000000 ? (
                        <Input
                          type={'number'}
                          sx={{
                            border: '2px solid #ff8500ad',
                            borderRadius: 1,
                            width: 300,
                            height: 60,
                            p: 2
                          }}
                          endAdornment={'G??i'}
                          disableUnderline
                          id="basic-input"
                          {...getFieldProps('quantity')}
                          value={values.quantity}
                        />
                      ) : (
                        <Input
                          sx={{
                            border: '2px solid #0af50a85',
                            borderRadius: 1,
                            width: 300,
                            height: 60,
                            p: 2
                          }}
                          endAdornment={'G??i'}
                          disableUnderline
                          id="basic-input"
                          {...getFieldProps('quantity')}
                          value={values.quantity}
                        />
                      )}
                      {PackageDetails?.price && PackageDetails?.price < 2000000 ? (
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          <Box>
                            <Icon height={20} width={20} icon={checkFill} color={'#00cc17'} />
                          </Box>
                          <Box>
                            <Typography>
                              Hi???n t???i b???n ??ang ch???n g??i {fCurrency(PackageDetails?.price)}.
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          <Box>
                            <Icon height={20} width={20} icon={alertFill} color={'#ff8500ad'} />
                          </Box>
                          <Box>
                            <Typography>
                              ????y l?? g??i "{PackageDetails?.name}". T??y thu???c v??o thu nh???p v?? gi?? tr???
                              r??ng c???a b???n, b???n c?? th??? ????? ??i???u ki???n cho gi???i h???n ?????u t?? cao h??n. H??y
                              c??n nh???c v??? t??i ch??nh tr?????c khi ?????u t??.
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ pt: 1.5, pb: 3, maxWidth: 600 }}>
                      {t(`Project_package_invest.InvestMyself`)}
                    </Box>
                    <Divider sx={{ mt: 7, maxWidth: 600 }} />
                  </Container>
                  <Container sx={{ p: 5 }}>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="h3">
                        {t(`Project_package_invest.PersonalInformation`)}
                        <Icon
                          style={{ marginLeft: '7px' }}
                          icon={lockFill}
                          height={20}
                          width={20}
                        />
                      </Typography>
                    </Box>
                    <Box sx={{ pt: 1.5, maxWidth: 600 }}>
                      {t(`Project_package_invest.PrivatePersonalInfomation`)}
                    </Box>

                    {/* <Box sx={{ pt: 3, pb: 7 }}>
                      <Button variant="contained" onClick={handleClickOpen}>
                        {t(`Project_package_invest.ConfirmInformation`)}
                        {mainInvestor && (
                          <UserAccountForm user={mainInvestor} open={open} onClose={handleClose} />
                        )}
                      </Button>
                    </Box> */}
                    <Divider sx={{ mt: 7, maxWidth: 600 }} />
                  </Container>

                  <Container sx={{ p: 5 }}>
                    <Box>
                      <Typography variant="h3"> {t(`Project_package_invest.Terms`)}</Typography>
                    </Box>
                    <Box sx={{ pt: 1.5, pb: 1.5, maxWidth: 600 }}>
                      <LIST_TERM>
                        Nh?? ?????u t?? c?? th??? h???y b??? s??? ti???n Nh?? ?????u t?? khi ?????u t?? v??o d??? ??n (trong v??ng
                        24 gi???) v?? h??? th???ng s??? ho??n ti???n cho Nh?? ?????u t?? v?? chuy???n v??o v?? c?? trong h???
                        th???ng
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? s??? nh???n ???????c s??? ti???n (chuy???n v??o v?? Krowd) v?? hoa h???ng d???a tr??n
                        c??c t??? l??? doanh thu chia s??? c???a {projectID.name} l??{' '}
                        {projectID.sharedRevenue} %.
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? s??? kh??ng c?? quy???n bi???u quy???t v?? s??? c???p cho m???t ???ng c??? vi??n b??n
                        th??? ba quy???n h???n r???ng r??i ????? h??nh ?????ng thay m???t Nh?? ?????u t??.
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? c?? th??? kh??ng tr??? th??nh ch??? s??? h???u v???n ch??? s??? h???u, nh?? ?????u t?? c??
                        l???i v?? c??c l???i ??ch t??? v???n ch??? s??? h???u trong d??? ??n.
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? khi ?????u t?? s??? ti???n v??o m???t s??? g??i ?????u t?? c???a d??? ??n s??? ??a d???ng h??a
                        r???i ro c???a b???n s??? t???t h??n.
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? hi???u kh??ng c?? g?? ?????m b???o v??? m???i quan h??? gi???a KROWD v??{' '}
                        {projectID.name} sau khi cung c???p ???? ?????u t?? d??? ??n
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? ?????ng ?? th???c hi???n c??c ph????ng ti???n thanh to??n t???t c??? c??c t??i li???u,
                        th??ng b??o v?? th???a thu???n li??n quan ?????n kho???n ?????u t?? c???a nh?? ?????u t??.
                      </LIST_TERM>
                      <LIST_TERM>
                        Kho???n ?????u t?? c???a nh?? ?????u t?? s??? kh??ng th??? chuy???n nh?????ng trong khi d??? ??n v???n
                        c??n ??ang v???n h??nh.
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? ch???c r???ng ???? ?????c c??c t??i li???u li??n quan v?? ?????ng ?? v???i ??i???u kho???n
                        d???ch v???, bao g???m c??c ??i???u kho???n c???a {projectID.name}{' '}
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? hi???u c??c kho???n ?????u t?? n??y r???t r???i ro v?? nh?? ?????u t?? kh??ng n??n ?????u
                        t?? tr??? khi c?? th??? ????? kh??? n??ng ????? m???t t???t c??? c??c kho???n ti???n ?????u t??
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? n??n hi???u r???ng s??? ch???u tr??ch nhi???m v??? t???t c??? c??c kho???n ph?? v?? l???
                        ph?? li??n quan ?????n s??? d???ng ph????ng th???c thanh to??n.
                      </LIST_TERM>
                      <LIST_TERM>
                        Nh?? ?????u t?? x??c nh???n r???ng kho???n ?????u t?? n??y, c??ng v???i t???t c??? c??c Quy ?????nh kh??c
                        c???a {projectID.name} C??c kho???n ?????u t?? huy ?????ng v???n t??? c???ng ?????ng trong su???t
                        qu?? tr??nh v???n h??nh v??o b???t k??? ho???t ?????ng huy ?????ng v???n t??? c???ng ?????ng n??o c???ng
                        th??ng tin, kh??ng v?????t qu?? gi???i h???n ?????u t??.
                      </LIST_TERM>
                      <LIST_TERM>
                        <Box sx={{ display: 'flex' }}>
                          <TextField
                            type={'checkbox'}
                            sx={{ width: '1.5rem' }}
                            {...getFieldProps('checkBox')}
                          />
                          <Typography sx={{ pl: 3 }}>
                            T??i ???? ?????c v?? ch???p nh???n c??c ??i???u kho???n ?????u t??{' '}
                          </Typography>
                        </Box>
                      </LIST_TERM>
                    </Box>
                  </Container>
                  <Container sx={{ p: 5 }}>
                    {/* <Box>
                      <Typography variant="h3">
                        {t(`Project_package_invest.AdditionalInformation`)}
                      </Typography>
                    </Box>
                    <Box sx={{ pt: 1.5, pb: 1.5 }}>
                      {t(`Project_package_invest.DesOfAdditionalInformation`)}
                    </Box>
                    <Box
                      sx={{
                        pt: 1.5,
                        pb: 1.5,
                        backgroundColor: '#8080801c',
                        borderRadius: '5px',
                        maxWidth: 600
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        Vui l??ng ho??n th??nh c??c c??u h???i sau ????? ?????m b???o b???n c?? th??? tham gia v??o chi???n
                        d???ch n??y v?? v???i m???c ????ch ho??n th??nh Bi???u m???u W-9 ho???c M???u W-8BEN ????? tu??n th???
                        c??c y??u c???u b??o c??o thu???. Nh???ng tuy??n b??? n??y ???????c th???c hi???n theo h??nh ph???t
                        khai man v?? s??? ???????c s??? d???ng ????? ??i???n v??o th???a thu???n ????ng k?? c???a b???n.
                      </Box>
                      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                        Nh???ng c??u h???i n??y l?? t??m t???t c??c c??u h???i tr??n M???u ????n W-9 ho???c M???u ????n
                        W-8BEN, n???u c??. N???u nghi ng???, vui l??ng tham kh???o Bi???u m???u W-9 ho???c M???u ????n
                        thay th??? W-8BEN ???????c bao g???m trong Th???a thu???n ????ng k?? trong M???u C.
                      </Box>
                    </Box>
                    <Divider sx={{ mt: 7, maxWidth: 600 }} /> */}

                    {PackageDetails?.price &&
                    values.checkBox &&
                    values.quantity > 0 &&
                    listOfInvestorWallet.at(1)!.balance >=
                      PackageDetails!.price * values.quantity ? (
                      // {values.checkBox ? (
                      <Box sx={{ mt: 3, display: 'flex' }}>
                        {/* <FormikProvider value={formik}> */}
                        {/* <Form noValidate autoComplete="off" onSubmit={handleSubmit}> */}
                        <Button
                          sx={{ width: 300 }}
                          type="submit"
                          variant="contained"
                          // loading={isSubmitting}
                          onClick={handleConfilmInvested}
                        >
                          X??c nh???n ?????u t?? {''} v??o {projectID.name} v???i s??? ti???n{' '}
                          {PackageDetails?.price &&
                            fCurrency(PackageDetails?.price * values.quantity)}{' '}
                        </Button>
                        <Dialog fullWidth maxWidth="sm" open={openInvestedConfirm}>
                          <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
                            <Icon color="#14b7cc" height={60} width={60} icon={sield} />
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
                                X??c nh???n ?????u t?? {''} v??o {projectID.name}
                              </DialogContentText>
                            </Box>
                            <Stack spacing={{ xs: 2, md: 1 }}>
                              <Container sx={{ p: 2 }}>
                                <Box>
                                  <Typography
                                    sx={{ textAlign: 'center', color: '#14b7cc', fontSize: 35 }}
                                  >
                                    S??? ti???n{' '}
                                    {PackageDetails?.price &&
                                      fCurrency(PackageDetails?.price * values.quantity)}{' '}
                                  </Typography>
                                </Box>
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
                                    <strong>D??? ??n</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18',
                                      marginBottom: '0.2rem'
                                    }}
                                  >
                                    <strong>{projectID?.name}</strong>
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
                                    <strong>Th???i gian ?????u t??</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18'
                                    }}
                                  >
                                    {`${valueMin}`.toString().substring(8, 25)}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography
                                    sx={{ paddingLeft: 2, pt: 2, color: '#e65500' }}
                                    variant="h6"
                                  >
                                    L??u ??:
                                  </Typography>

                                  <Typography
                                    sx={{ paddingLeft: 0.4, pt: 2, color: '#e65500' }}
                                    variant="body2"
                                  >
                                    (*) Nh?? ?????u t?? vui l??ng ki???m tra nh???ng th??ng tin c???a m??nh tr?????c
                                    khi ?????u t?? (H??? v?? t??n, S??T, ?????a ch??? gmail).
                                  </Typography>
                                  <Typography
                                    sx={{ paddingLeft: 0.4, pt: 2, color: '#e65500' }}
                                    variant="body2"
                                  >
                                    (*) Nh?? ?????u t?? vui l??ng ki???m tra g??i ?????u t?? bao g???m (t??n g??i, s???
                                    g??i ???? mua, s??? ti???n ?????u t??) ????? tr??nh nh???m l???n khi thanh to??n.
                                  </Typography>
                                  <Typography
                                    sx={{ paddingLeft: 0.4, pt: 2, color: '#e65500' }}
                                    variant="body2"
                                  >
                                    (*) Khi nh?? ?????u t?? b???m x??c nh???n KROWD s??? g???i t???i h??m th?? ??i???n t???
                                    th??ng qua ?????a ch??? gmail c???a nh?? ?????u t?? (B???n h???p ?????ng, x??c nh???n
                                    b???n ???? ?????u t?? v??o d??? ??n, nh???ng th??ng tin li??n quan t???i d??? ??n)
                                  </Typography>
                                </Box>
                              </Container>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }} gap={1}>
                              <Box>
                                <Button
                                  color="error"
                                  onClick={() => setOpenInvestedConfirm(false)}
                                  variant="contained"
                                >
                                  ????ng
                                </Button>
                              </Box>
                              <FormikProvider value={formik}>
                                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                                  <LoadingButton
                                    sx={{ width: 300 }}
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                  >
                                    X??c nh???n ?????u t?? {''}{' '}
                                    {PackageDetails?.price &&
                                      fCurrency(PackageDetails?.price * values.quantity)}{' '}
                                  </LoadingButton>
                                </Form>
                              </FormikProvider>
                            </Box>
                          </DialogContent>
                        </Dialog>
                        <Dialog fullWidth maxWidth="sm" open={openModalInvestError}>
                          <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
                            <Icon color="red" height={60} width={60} icon={redFill} />
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
                                Giao d???ch kh??ng th??nh c??ng
                              </DialogContentText>
                            </Box>
                            <Stack spacing={{ xs: 2, md: 1 }}>
                              <Container sx={{ p: 2 }}>
                                <Box>
                                  <Typography sx={{ textAlign: 'center' }}>
                                    Mua th???t b???i {resQuality} {PackageDetails?.name}{' '}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{ textAlign: 'center', color: 'red', fontSize: 35 }}
                                  >
                                    {fCurrency(`${dataInvestedSuccess}`)}
                                  </Typography>
                                </Box>
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
                                    <strong>D??? ??n</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18',
                                      marginBottom: '0.2rem'
                                    }}
                                  >
                                    <strong>{projectID?.name}</strong>
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
                                    <strong>Th???i gian</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18'
                                    }}
                                  >
                                    {resDate}
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
                                    <strong>Ngu???n ti???n</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18'
                                    }}
                                  >
                                    {resWalletName}
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
                                    <strong>Ph?? giao d???ch</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18'
                                    }}
                                  >
                                    {resFee}
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
                                    <strong>M?? giao d???ch</strong>
                                  </Typography>
                                  <Typography
                                    paragraph
                                    sx={{
                                      color: '#251E18'
                                    }}
                                  >
                                    {resPaymentID}
                                  </Typography>
                                </Box>
                              </Container>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                              <Box>
                                <Button
                                  variant="contained"
                                  href={`${PATH_PAGE.details}/${projectID?.id}`}
                                >
                                  Tr??? v??? d??? ??n
                                </Button>
                              </Box>
                            </Box>
                          </DialogContent>
                        </Dialog>
                        {/* </Form> */}
                        {/* </FormikProvider> */}
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ mt: 3, display: 'flex' }}>
                          {/* <FormikProvider value={formik}> */}
                          {/* <Form noValidate autoComplete="off" onSubmit={handleSubmit}> */}
                          <LoadingButton
                            sx={{ width: 300 }}
                            type="submit"
                            disabled
                            variant="contained"
                            loading={isSubmitting}
                          >
                            X??c nh???n ?????u t?? {''}{' '}
                            {PackageDetails?.price &&
                              fCurrency(PackageDetails?.price * values.quantity)}{' '}
                          </LoadingButton>
                          {/* </Form> */}
                          {/* </FormikProvider> */}
                        </Box>

                        <Box>
                          {PackageDetails?.price &&
                            listOfInvestorWallet.at(1)?.balance &&
                            listOfInvestorWallet.at(1)!.balance <
                              PackageDetails!.price * values.quantity && (
                              <Box sx={{ my: 3, mx: 3, width: 570 }}>
                                <Box sx={{ display: 'flex', mt: 2 }}>
                                  <Box>
                                    <Icon height={20} width={20} icon={alertFill} color={'red'} />
                                  </Box>
                                  <Box>
                                    <Typography color={'red'} sx={{ ml: 1.4, mb: 1 }}>
                                      B???n kh??ng ????? ti???n ???? ????u t?? vui l??ng n???p v??o v?? Krowd b??n d?????i
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography sx={{ textAlign: 'end' }}>
                                  <Button
                                    variant="contained"
                                    target="_blank"
                                    href={PATH_PAGE.pageTopUp}
                                  >
                                    N???p ti???n
                                  </Button>
                                </Typography>
                              </Box>
                            )}
                        </Box>
                      </>
                    )}
                  </Container>
                </Grid>
                <Grid xs={12} sm={4} md={5} lg={3}>
                  {(isPackageLoading && (
                    <Box>
                      <CircularProgress
                        size={100}
                        sx={{ margin: '0px auto', padding: '1rem', display: 'flex' }}
                      />
                      <Typography variant="h5" sx={{ textAlign: 'center', padding: '1rem' }}>
                        ??ang t???i d??? li???u, vui l??ng ?????i gi??y l??t...
                      </Typography>
                    </Box>
                  )) || (
                    <Grid sx={{ mt: 1, my: 1 }}>
                      <Typography variant="h3">G??i ?????u t??</Typography>
                      {packageLists.listOfPackage &&
                        packageLists.listOfPackage.length > 0 &&
                        packageLists.listOfPackage.map((e, index) => (
                          <Grid sx={{ p: 2 }} item key={index} xs={12} sm={12} md={12} lg={12}>
                            <Grid
                              container
                              sx={{
                                color: 'primary.main',
                                display: 'flex'
                              }}
                            >
                              <Grid xs={8} sm={8} md={8} lg={8}>
                                <Typography
                                  variant="overline"
                                  sx={{ color: 'text.secondary', justifyContent: 'left' }}
                                >
                                  {e.name}
                                </Typography>
                              </Grid>
                              {/* <Grid>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: 'primary.main',
                                    justifyContent: 'right'
                                  }}
                                >
                                  {e.remainingQuantity} / {e.quantity}
                                </Typography>
                              </Grid> */}
                              <Grid>
                                {e.remainingQuantity > 0 && e.status === 'IN_STOCK' ? (
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: 'primary.main',
                                      justifyContent: 'right'
                                    }}
                                  >
                                    {e.remainingQuantity} / {e.quantity}
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: 'red',
                                      justifyContent: 'center',
                                      display: 'flex'
                                    }}
                                  >
                                    G??i ???? ???????c ?????u t?? h???t
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                              {index === 1 || index === 2 ? (
                                <Typography
                                  variant="subtitle1"
                                  sx={{ color: 'text.secondary' }}
                                ></Typography>
                              ) : (
                                ''
                              )}
                              <Typography variant="h5">
                                {e.price === 0 ? 'Free' : fCurrencyPackage(e.price)} VND
                              </Typography>
                            </Box>

                            <Stack
                              paddingLeft={0}
                              textAlign={'left'}
                              component="ul"
                              spacing={2}
                              sx={{ my: 1, width: 1 }}
                            >
                              {e.descriptionList.map((item, i) => (
                                <Stack
                                  key={i}
                                  component="li"
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  sx={{
                                    typography: 'body2'
                                  }}
                                >
                                  <Typography variant="body2">{item}</Typography>
                                </Stack>
                              ))}
                            </Stack>
                            <Typography sx={{ textAlign: 'end' }}>
                              {e.status === 'IN_STOCK' && e.remainingQuantity > 0 && (
                                <Button
                                  variant="contained"
                                  fullWidth
                                  onClick={() => handleClickOpenPackage2(e)}
                                  sx={{
                                    backgroundColor: '#FF7F50',
                                    textDecoration: 'none',
                                    mb: 2,
                                    '&:hover': { backgroundColor: '#FF7F50' }
                                  }}
                                >
                                  Ch???n g??i
                                </Button>
                              )}
                            </Typography>

                            <Divider variant="fullWidth" />
                          </Grid>
                        ))}
                      {documents && documents.length > 0 && (
                        <ProjectDetailDocument documents={documents} />
                      )}
                      {/*HOW IT WORK */}
                      {hows && hows.length > 0 && <ProjectDetailHowItWorks hows={hows} />}
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Container>
        </>
      )}
      <Dialog fullWidth maxWidth="sm" open={openModalInvestSuccess}>
        <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Icon color="#14b7cc" height={60} width={60} icon={check2Fill} />
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <DialogContentText
              sx={{ textAlign: 'center', fontWeight: 900, fontSize: 20, color: 'black' }}
            >
              Giao d???ch th??nh c??ng
            </DialogContentText>
          </Box>
          <Stack spacing={{ xs: 2, md: 1 }}>
            <Container sx={{ p: 2 }}>
              <Box>
                <Typography sx={{ textAlign: 'center' }}>
                  Mua th??nh c??ng {resQuality} {PackageDetails?.name}{' '}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ textAlign: 'center', color: '#14b7cc', fontSize: 35 }}>
                  {fCurrency(`${dataInvestedSuccess}`)}
                </Typography>
              </Box>
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
                  <strong>D??? ??n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18',
                    marginBottom: '0.2rem'
                  }}
                >
                  <strong>{projectID?.name}</strong>
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
                  <strong>Th???i gian</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resDate}
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
                  <strong>Ngu???n ti???n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resWalletName}
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
                  <strong>Ph?? giao d???ch</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resFee}
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
                  <strong>M?? giao d???ch</strong>
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
                      {showIDPayment ? '********' : resPaymentID}
                    </Typography>
                  </Stack>
                </Typography>
              </Box>
            </Container>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Box>
              <Button variant="contained" href={`${PATH_PAGE.details}/${projectID?.id}`}>
                Tr??? v??? d??? ??n
              </Button>
            </Box>
            {/* <Box>
              <Button
                color="success"
                variant="contained"
                onClick={() => setOpenModalInvestSuccess(false)}
              >
                Xong
              </Button>
            </Box> */}
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog fullWidth maxWidth="sm" open={openModalInvestError}>
        <DialogTitle sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Icon color="red" height={60} width={60} icon={redFill} />
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <DialogContentText
              sx={{ textAlign: 'center', fontWeight: 900, fontSize: 20, color: 'black' }}
            >
              Giao d???ch kh??ng th??nh c??ng
            </DialogContentText>
          </Box>
          <Stack spacing={{ xs: 2, md: 1 }}>
            <Container sx={{ p: 2 }}>
              <Box>
                <Typography sx={{ textAlign: 'center' }}>
                  Mua th???t b???i {resQuality} {PackageDetails?.name}{' '}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ textAlign: 'center', color: 'red', fontSize: 35 }}>
                  {fCurrency(`${dataInvestedSuccess}`)}
                </Typography>
              </Box>
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
                  <strong>D??? ??n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18',
                    marginBottom: '0.2rem'
                  }}
                >
                  <strong>{projectID?.name}</strong>
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
                  <strong>Th???i gian</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resDate}
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
                  <strong>Ngu???n ti???n</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resWalletName}
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
                  <strong>Ph?? giao d???ch</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resFee}
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
                  <strong>M?? giao d???ch</strong>
                </Typography>
                <Typography
                  paragraph
                  sx={{
                    color: '#251E18'
                  }}
                >
                  {resPaymentID}
                </Typography>
              </Box>
            </Container>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Box>
              <Button variant="contained" href={`${PATH_PAGE.details}/${projectID?.id}`}>
                Tr??? v??? d??? ??n
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
