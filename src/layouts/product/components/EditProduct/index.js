// src/layouts/product/components/EditProductForm.js
import { API_BASE_URL } from "../../../../config/api";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

function EditProductForm({ productData, onBack, onUpdate }) {
  const [idProduct, setIdProduct] = useState(productData.id_product || null);
  const [name, setName] = useState(productData.name || "");
  const [description, setDescription] = useState(productData.description || "");
  const [price, setPrice] = useState(productData.price || "");
  const [category, setCategory] = useState(productData.category || "");
  const [imageUrl, setImageUrl] = useState(productData.image_url || "");
  const [tokopediaUrl, setTokopediaUrl] = useState(productData.tokopedia_url || ""); // <-- Pastikan ini ada
  const [shopeeUrl, setShopeeUrl] = useState(productData.shopee_url || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(productData.image_url || "");

  const [error, setError] = useState(null);
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  useEffect(() => {
    if (productData) {
      setIdProduct(productData.id_product);
      setName(productData.name || "");
      setDescription(productData.description || "");
      setPrice(productData.price || "");
      setCategory(productData.category || "");
      setImageUrl(productData.image_url || "");
      setPreviewImageUrl(productData.image_url || "");
      setTokopediaUrl(productData.tokopedia_url || ""); // <-- Pastikan ini direset
      setShopeeUrl(productData.shopee_url || "");
      setSelectedFile(null); // Clear selected file when productData changes
    }
  }, [productData]);

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Produk Diperbarui"
      content="Detail produk berhasil diperbarui!" // Teks konfirmasi sukses
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
      title="Pembaruan Produk Gagal"
      content={error || "Terjadi kesalahan yang tidak diketahui."}
      dateTime="Baru saja"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewImageUrl(imageUrl); // Kembali ke URL asli jika file dihapus
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setUploading(false);

    // Basic validation
    if (!name.trim() || !price || !category.trim()) {
      setError("Nama, Harga, dan Kategori tidak boleh kosong.");
      openErrorSB();
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError("Harga harus angka positif.");
      openErrorSB();
      return;
    }
    if (!selectedFile && !imageUrl) {
      setError("Silakan unggah gambar produk atau pastikan ada URL gambar lama.");
      openErrorSB();
      return;
    }

    let finalImageUrl = imageUrl; // Default ke URL gambar yang sudah ada

    try {
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("productImage", selectedFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Gagal mengunggah gambar baru.");
        }
        finalImageUrl = uploadData.filePath;
        setUploading(false);
      }

      const updatedProductData = {
        name,
        description,
        price: parseFloat(price),
        category,
        image_url: finalImageUrl,
        tokopedia_url: tokopediaUrl.trim() || null, // <-- Pastikan ini dikirim
        shopee_url: shopeeUrl.trim() || null,
      };

      console.log("Updating product:", updatedProductData);
      console.log("Final Image URL yang akan dikirim ke backend:", finalImageUrl);
      console.log("Updated Product Data yang akan dikirim:", updatedProductData);

      const response = await fetch(`${API_BASE_URL}/product/${idProduct}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updatedProductData),
      });

      const data = await response.json(); // Ambil data respons dari backend

      if (response.ok) {
        openSuccessSB(); // Tampilkan notifikasi sukses

        // Panggil onUpdate dengan data produk yang sudah diperbarui dari respons backend
        // Ini penting agar ProductList dapat me-refresh data dengan tepat
        onUpdate(data.product); // Asumsi backend mengembalikan { message: ..., product: {...} }

        // Opsional: Kembali ke daftar setelah beberapa detik atau langsung
        setTimeout(() => {
          onBack();
        }, 1500); // Kembali setelah 1.5 detik
      } else {
        setError(data.message || "Gagal memperbarui produk. Silakan coba lagi.");
        openErrorSB();
      }
    } catch (err) {
      console.error("Error in product update:", err);
      setError(err.message || "Tidak dapat terhubung ke server atau gagal update produk.");
      openErrorSB();
      setUploading(false);
    }
  };

  return (
    <Card id="edit-product-form">
      <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6" fontWeight="medium">
          Edit Product (ID: {idProduct})
        </MDTypography>
        <MDButton variant="gradient" color="dark" onClick={onBack}>
          <Icon sx={{ fontWeight: "bold" }}>arrow_back</Icon>
          &nbsp;Back
        </MDButton>
      </MDBox>
      <MDBox p={2}>
        <MDBox component="form" role="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Name"
                variant="standard"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Baju Pria">Baju Pria</MenuItem>
                  <MenuItem value="Aksesoris Wanita">Aksesoris Wanita</MenuItem>
                  <MenuItem value="Tas & Dompet">Tas & Dompet</MenuItem>
                  {/* Tambahkan kategori lain sesuai kebutuhan */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Price"
                variant="standard"
                fullWidth
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Tokopedia URL"
                variant="standard"
                fullWidth
                value={tokopediaUrl}
                onChange={(e) => setTokopediaUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Shopee URL"
                variant="standard"
                fullWidth
                value={shopeeUrl}
                onChange={(e) => setShopeeUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDTypography variant="caption" color="text" display="block" mb={0.5}>
                Product Image (PNG, JPG, GIF)
              </MDTypography>
              <TextField
                type="file"
                variant="standard"
                fullWidth
                onChange={handleFileChange}
                inputProps={{ accept: "image/jpeg,image/png,image/gif" }}
              />
              {/* Preview Gambar */}
              {(previewImageUrl || imageUrl) && (
                <MDBox mt={2} mb={1}>
                  <img
                    src={previewImageUrl || imageUrl}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain" }}
                  />
                </MDBox>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="standard"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={uploading}
              >
                {uploading ? "Uploading Image..." : "Save Changes"}
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      {renderSuccessSB}
      {renderErrorSB}
    </Card>
  );
}

EditProductForm.propTypes = {
  productData: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditProductForm;
