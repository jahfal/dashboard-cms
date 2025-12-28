import { useState } from "react";
import { API_BASE_URL } from "../../../config/api";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox"; // Pastikan Checkbox diimpor
// import Switch from "@mui/material/Switch"; // Tidak digunakan di sini, bisa dihapus

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false); // <-- State baru untuk checkbox
  const [error, setError] = useState(null);
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const navigate = useNavigate();

  // Helper functions untuk Snackbar (sudah ada)
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Pendaftaran Berhasil"
      content="Akun Anda berhasil dibuat!"
      dateTime="Baru saja"
      open={successSB}
      onClose={closeSuccessSB}
      close={closeSuccessSB}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Pendaftaran Gagal"
      content={error || "Terjadi kesalahan yang tidak diketahui."}
      dateTime="Baru saja"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError(null);

    // --- Validasi Blank Field dan Terms & Conditions ---
    if (!name.trim()) {
      // .trim() untuk menghapus spasi di awal/akhir
      setError("Nama tidak boleh kosong.");
      openErrorSB();
      return; // Hentikan eksekusi jika ada error
    }
    if (!email.trim()) {
      setError("Email tidak boleh kosong.");
      openErrorSB();
      return;
    }
    if (!password.trim()) {
      setError("Password tidak boleh kosong.");
      openErrorSB();
      return;
    }
    if (!termsAgreed) {
      // Cek state checkbox
      setError("Anda harus menyetujui Syarat dan Ketentuan.");
      openErrorSB();
      return;
    }
    // --- Akhir Validasi ---

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nama: name, email, password, role: "user" }),
      });

      const data = await response.json();

      if (response.ok) {
        openSuccessSB();
        setTimeout(() => {
          navigate("/authentication/sign-in");
        }, 1500);
      } else {
        setError(data.message || "Pendaftaran gagal. Silakan coba lagi.");
        openErrorSB();
      }
    } catch (err) {
      console.error("Terjadi kesalahan jaringan:", err);
      setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      openErrorSB();
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignUp}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                variant="standard"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              {/* Checkbox untuk Terms and Conditions */}
              <Checkbox
                checked={termsAgreed} // Terikat ke state termsAgreed
                onChange={(e) => setTermsAgreed(e.target.checked)} // Update state saat dicentang/tidak
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                onClick={() => setTermsAgreed(!termsAgreed)} // Klik teks juga bisa toggle checkbox
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDButton variant="gradient" color="info" fullWidth type="submit">
              sign up
            </MDButton>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
      {renderSuccessSB}
      {renderErrorSB}
    </CoverLayout>
  );
}

export default Cover;
