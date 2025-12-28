// src/config/api.js
import { API_BASE_URL } from "dashboard-cms/src/config/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// ... import komponen Material UI lainnya ...
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid"; // Anda juga menggunakan Grid
import MuiLink from "@mui/material/Link"; // Anda juga menggunakan MuiLink

import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import { jwtDecode } from "jwt-decode"; // <-- TAMBAHKAN INI

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Login Berhasil"
      content="Anda berhasil masuk!"
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
      title="Login Gagal"
      content={error || "Terjadi kesalahan yang tidak diketahui."}
      dateTime="Baru saja"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // ... (Kode Anda untuk login berhasil)
        localStorage.setItem("authToken", data.token);

        const decodedToken = jwtDecode(data.token);
        const userRole = decodedToken.role;
        const userId = decodedToken.id_pengguna;
        const nama = decodedToken.nama;

        if (userRole && userId) {
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userId", userId);
          localStorage.setItem("nama", nama);
          localStorage.setItem("isLoggedIn", "true");

          openSuccessSB();
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          setError("Token respons tidak lengkap (informasi pengguna hilang).");
          openErrorSB();
        }
      } else {
        // Tangani respons 4xx dan 5xx
        // Coba parse respons sebagai JSON, tetapi tangani jika gagal
        try {
          const data = await response.json();
          setError(data.message || "Email atau password salah.");
        } catch (e) {
          setError(`Terjadi kesalahan server: Status ${response.status}.`);
        }
        openErrorSB();
      }
    } catch (err) {
      console.error("Terjadi kesalahan jaringan:", err);
      setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      openErrorSB();
    }
  };

  return (
    // ... (render JSX Anda seperti sebelumnya)
    <BasicLayout image={bgImage}>
      <Card>
        {/* ... (Konten Card Anda) ... */}
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignIn}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                sign in
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
      {renderSuccessSB}
      {renderErrorSB}
    </BasicLayout>
  );
}

export default Basic;
