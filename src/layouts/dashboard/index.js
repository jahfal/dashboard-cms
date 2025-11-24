/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid"; // Keep Grid if you intend to use it for layout
import Typography from "@mui/material/Typography"; // Import Typography for text

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import Footer from "examples/Footer"; // Not in the photo, so can be removed
// import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart"; // Not in the photo
// import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart"; // Not in the photo
// import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard"; // Not in the photo

// Data (not needed for the simple photo layout)
// import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
// import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components (not needed for the simple photo layout)
// import Projects from "layouts/dashboard/components/Projects";
// import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
  // const { sales, tasks } = reportsLineChartData; // Not needed
  const navigate = useNavigate();

  useEffect(() => {
    // Periksa token di localStorage saat komponen dimuat
    const authToken = localStorage.getItem("authToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Jika tidak ada authToken atau isLoggedIn bukan 'true'
    if (!authToken || isLoggedIn !== "true") {
      // Alihkan pengguna ke halaman sign-in
      navigate("/authentication/sign-in");
    }
  }, [navigate]);

  const loggedInUser = localStorage.getItem("nama") || "your"; // Assuming you store username in localStorage

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} sx={{ textAlign: "center", mt: "10%" }}>
        {" "}
        {/* Add margin-top for vertical centering */}
        <Typography variant="h3" fontWeight="medium" color="text">
          CMS Panel
        </Typography>
        <Typography variant="body1" color="text" sx={{ mt: 1 }}>
          You are logged in to <span style={{ fontWeight: "bold" }}>{loggedInUser}</span> account!
        </Typography>
      </MDBox>
      {/* <Footer /> */} {/* Remove Footer if it's not desired in this simplified view */}
    </DashboardLayout>
  );
}

export default Dashboard;
