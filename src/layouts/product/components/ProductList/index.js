// src/layouts/product/components/ProductList/index.js
import { API_BASE_URL } from "../../../../config/api";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Perbaiki impor NewProductForm dan EditProductForm
import NewProductForm from "layouts/product/components/NewProduct"; // <-- Pastikan path ini benar
import EditProductForm from "layouts/product/components/EditProduct"; // <-- Pastikan path ini benar

function ProductList() {
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  console.log("ProductList dirender. showNewProductForm saat ini:", showNewProductForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State baru untuk Snackbar sukses dan jenis pesan ---
  const [successSB, setSuccessSB] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State baru untuk pesan sukses
  const openSuccessSB = (message) => {
    // Fungsi sekarang menerima pesan
    setSuccessMessage(message);
    setSuccessSB(true);
  };
  const closeSuccessSB = () => setSuccessSB(false);

  // --- State untuk Error Snackbar (jika Anda ingin pesan error spesifik dari ProductList) ---
  const [errorSB, setErrorSB] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const openErrorSB = (message) => {
    setErrorMessage(message);
    setErrorSB(true);
  };
  const closeErrorSB = () => setErrorSB(false);
  // --- Akhir State dan Fungsi Snackbar ---

  const fetchProducts = async () => {
    setLoading(true);
    setError(null); // Reset error dari fetchProducts juga
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Anda tidak terautentikasi. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/product`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Set error state lokal untuk ProductList (untuk tampil di Card error)
        setError(errorData.message || `HTTP error! Status: ${response.status}.`);
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${
            errorData.message || "Terjadi kesalahan di server."
          }`
        );
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      // Pastikan error di sini tidak menimpa pesan error API yang lebih spesifik
      if (!error) {
        // Hanya set error jika belum diset dari respons API
        setError(err.message || "Gagal mengambil data produk.");
      }
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddNewProductClick = () => {
    setShowNewProductForm(true);
    setEditingProduct(null);
    console.log('Tombol "Add New Product" diklik! showNewProductForm sekarang:', true);
  };

  const handleBackFromForm = () => {
    setShowNewProductForm(false);
    setEditingProduct(null);
  };

  const handleProductSaved = (responseData) => {
    // responseData bisa berisi product yang baru ditambahkan/diupdate
    console.log("Product saved/updated:", responseData);
    fetchProducts(); // Ini akan memicu refetch data

    // Tentukan pesan sukses berdasarkan apakah ini ADD atau UPDATE
    // Asumsi: responseData.product.id_product sudah ada jika itu update atau produk baru
    const message =
      responseData && responseData.product && responseData.product.id_product
        ? `Produk "${responseData.product.name}" berhasil ditambah!`
        : "Produk berhasil diperbarui!";

    openSuccessSB(message); // <-- TAMPILKAN SNACKBAR DENGAN PESAN BERBEDA
    handleBackFromForm(); // Kembali ke daftar
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus produk ini?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        openSuccessSB("Produk berhasil dihapus!"); // <-- TAMPILKAN SNACKBAR SUKSES UNTUK DELETE
        fetchProducts(); // Refresh daftar produk
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Gagal menghapus produk.";
        openErrorSB(errorMessage); // <-- TAMPILKAN SNACKBAR ERROR UNTUK DELETE
        throw new Error(errorMessage); // Lemparkan error agar tertangkap di catch
      }
    } catch (err) {
      const displayErrorMessage = err.message || "Error saat menghapus produk. Silakan coba lagi.";
      openErrorSB(displayErrorMessage); // <-- Pastikan error ditangani dan ditampilkan
      console.error("Error deleting product:", err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowNewProductForm(false);
  };

  // --- Render Snackbar Sukses untuk ProductList (menggunakan successMessage) ---
  const renderSuccessSBComponent = // Ubah nama variabel agar tidak bentrok dengan fungsi
    (
      <MDSnackbar
        color="success"
        icon="check"
        title="Operasi Berhasil"
        content={successMessage} // Konten berasal dari state successMessage
        dateTime="Baru saja"
        open={successSB}
        onClose={closeSuccessSB}
        close={closeSuccessSB}
        bgWhite
      />
    );
  // --- Akhir Render Snackbar Sukses ---

  // --- Render Snackbar Error untuk ProductList ---
  const renderErrorSBComponent = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Operasi Gagal"
      content={errorMessage} // Konten berasal dari state errorMessage
      dateTime="Baru saja"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );
  // --- Akhir Render Snackbar Error ---

  if (loading) {
    return (
      <Card id="product-list">
        <MDBox p={2} textAlign="center">
          <MDTypography variant="h6">Loading Products...</MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (error) {
    // Ini adalah error fetching awal, bukan error operasi CRUD
    return (
      <Card id="product-list">
        <MDBox p={2} textAlign="center">
          <MDTypography variant="h6" color="error">
            Error: {error}
          </MDTypography>
          <MDButton variant="gradient" color="info" onClick={fetchProducts}>
            Retry
          </MDButton>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card id="product-list">
      {showNewProductForm ? (
        <NewProductForm onBack={handleBackFromForm} onSave={handleProductSaved} />
      ) : editingProduct ? (
        <EditProductForm
          productData={editingProduct}
          onBack={handleBackFromForm}
          onUpdate={handleProductSaved}
        />
      ) : (
        <>
          <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6" fontWeight="medium">
              Product List
            </MDTypography>
            <MDButton variant="gradient" color="dark" onClick={handleAddNewProductClick}>
              <Icon sx={{ fontWeight: "bold" }}>add</Icon>
              &nbsp;Add New Product
            </MDButton>
          </MDBox>
          <MDBox p={2}>
            <Grid container spacing={3}>
              {products.length > 0 ? (
                products.map((product) => (
                  <Grid item xs={12} key={product.id_product}>
                    <MDBox
                      borderRadius="lg"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      p={3}
                      sx={{
                        border: ({ borders: { borderWidth, borderColor } }) =>
                          `${borderWidth[1]} solid ${borderColor}`,
                      }}
                    >
                      {product.image_url && (
                        <MDBox
                          component="img"
                          src={product.image_url}
                          alt={product.name}
                          objectFit="cover"
                          maxWidth="100%"
                          width="100px"
                          height="auto"
                          maxHeight="100%"
                          mr={2}
                          borderRadius="sm"
                          sx={{ objectFit: "cover" }}
                        />
                      )}
                      <MDBox flexGrow={1}>
                        <MDTypography variant="h6" fontWeight="medium">
                          {product.name}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          Category:{" "}
                          <MDTypography
                            component="span"
                            variant="body2"
                            fontWeight="medium"
                            color="text"
                          >
                            {product.category}
                          </MDTypography>
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          Price:{" "}
                          <MDTypography
                            component="span"
                            variant="body2"
                            fontWeight="medium"
                            color="text"
                          >
                            Rp {parseFloat(product.price).toLocaleString("id-ID")}
                          </MDTypography>
                        </MDTypography>
                        {product.description && (
                          <MDTypography variant="body2" color="text">
                            Description:{" "}
                            <MDTypography
                              component="span"
                              variant="body2"
                              fontWeight="medium"
                              color="text"
                            >
                              {product.description.substring(0, 50)}...
                            </MDTypography>
                          </MDTypography>
                        )}
                      </MDBox>

                      <MDBox mt={1} display="flex" gap={1}>
                        {product.tokopedia_url && (
                          <MDButton
                            component="a"
                            href={product.tokopedia_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="gradient"
                            color="success" // Contoh warna untuk Tokopedia
                            size="small"
                          >
                            <Icon sx={{ mr: 0.5 }}>storefront</Icon> Tokopedia
                          </MDButton>
                        )}
                        {product.shopee_url && (
                          <MDButton
                            component="a"
                            href={product.shopee_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="gradient"
                            color="warning" // Contoh warna untuk Shopee
                            size="small"
                          >
                            <Icon sx={{ mr: 0.5 }}>shopping_bag</Icon> Shopee
                          </MDButton>
                        )}
                      </MDBox>

                      <MDBox
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        alignItems="flex-end"
                        ml="auto"
                      >
                        <MDBox mr={{ xs: 0, sm: 1 }} mb={{ xs: 1, sm: 0 }}>
                          <MDButton
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteProduct(product.id_product)}
                          >
                            <Icon>delete</Icon>&nbsp;delete
                          </MDButton>
                        </MDBox>
                        <MDButton
                          variant="text"
                          color="dark"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Icon>edit</Icon>&nbsp;edit
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <MDTypography variant="body2" color="text" textAlign="center">
                    No products available. Click &quot;Add New Product&quot; to add some.
                  </MDTypography>
                </Grid>
              )}
            </Grid>
          </MDBox>
        </>
      )}
      {renderSuccessSBComponent} {/* <-- Tampilkan Snackbar sukses */}
      {renderErrorSBComponent} {/* <-- Tampilkan Snackbar error */}
    </Card>
  );
}

export default ProductList;
