// src/layouts/product/components/NewProductForm.js

import { useState } from "react";

import PropTypes from "prop-types"; // Tambahkan baris ini jika belum ada

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material"; // Pastikan semua import MUI yang dibutuhkan ada

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

function NewProductForm({ onBack, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  // const [imageUrl, setImageUrl] = useState(""); // <-- HILANGKAN INI jika pakai upload file
  const [selectedFile, setSelectedFile] = useState(null); // <-- State untuk file yang dipilih
  const [previewImageUrl, setPreviewImageUrl] = useState(""); // <-- State untuk preview gambar
  const [tokopediaUrl, setTokopediaUrl] = useState(""); // <-- Pastikan ini ada
  const [shopeeUrl, setShopeeUrl] = useState("");

  const [error, setError] = useState(null);
  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false);
  const [uploading, setUploading] = useState(false); // <-- State untuk status upload

  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Produk Tersimpan"
      content="Detail produk baru berhasil disimpan!"
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
      title="Penyimpanan Produk Gagal"
      content={error || "Terjadi kesalahan yang tidak diketahui."}
      dateTime="Baru saja"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  // <-- Handle file selection (Baru untuk Upload)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Buat URL lokal untuk preview gambar
      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewImageUrl("");
    }
  };
  // -->

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setUploading(false); // Reset status upload saat submit dimulai

    // Basic validation (sesuaikan validasi)
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
    if (!selectedFile) {
      // <-- Validasi jika file belum dipilih untuk upload
      setError("Silakan unggah gambar produk.");
      openErrorSB();
      return;
    }
    // Validasi Stock dihilangkan

    let finalImageUrl = ""; // Variabel untuk menyimpan URL gambar setelah diunggah

    try {
      setUploading(true); // Mulai status upload

      // <-- Bagian Upload Gambar ke Backend
      const formData = new FormData();
      formData.append("productImage", selectedFile); // 'productImage' harus sesuai dengan nama field di multer

      const uploadResponse = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        headers: {
          // Penting: Jangan set Content-Type header saat menggunakan FormData
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Gagal mengunggah gambar.");
      }
      finalImageUrl = uploadData.filePath; // Dapatkan URL file dari respons upload
      // -->

      setUploading(false); // Selesai upload

      // <-- Bagian Simpan Data Produk ke Database
      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        image_url: finalImageUrl, // Gunakan URL gambar yang sudah diunggah
        tokopedia_url: tokopediaUrl.trim() || null, // <-- Pastikan ini dikirim
        shopee_url: shopeeUrl.trim() || null,
      };

      console.log("Saving new product:", productData);

      const response = await fetch("http://localhost:3000/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        openSuccessSB();
        onSave(data);
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setSelectedFile(null); // Reset file input
        setPreviewImageUrl(""); // Reset preview
      } else {
        setError(data.message || "Gagal menyimpan produk. Silakan coba lagi.");
        openErrorSB();
      }
    } catch (err) {
      console.error("Error in product submission:", err);
      setError(err.message || "Tidak dapat terhubung ke server atau gagal upload/simpan produk.");
      openErrorSB();
      setUploading(false); // Pastikan status uploading direset juga jika ada error
    }
  };

  return (
    <Card id="new-product-form">
      <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6" fontWeight="medium">
          Add New Product
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
              {" "}
              {/* <-- Tambahkan ini untuk input file dan preview */}
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
              {previewImageUrl && (
                <MDBox mt={2} mb={1}>
                  <img
                    src={previewImageUrl}
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
            {/* Image URL textfield dihilangkan karena akan menggunakan upload */}
            {/* <Grid item xs={12}> // Ini adalah input Image URL lama
              <TextField
                label="Image URL"
                variant="standard"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Grid> */}
            <Grid item xs={12}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={uploading}
              >
                {uploading ? "Uploading Image..." : "Save Product"}{" "}
                {/* Teks tombol berubah saat upload */}
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

NewProductForm.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NewProductForm;
