const { Tools } = require("@function/tools");

const commonCustomerRegularMessage = {
  waitMessage: `_Mohon tunggu sebentar..._`,
  errorMessage: `_Maaf, sepertinya terjadi error : (. Harap coba lagi dalam beberapa saat._
> -akhir pesan-`,
  /** @param { string } tagName */
  greetNewUser: (tagName) =>
    `Halo ${tagName} 👋, terimakasih telah menghubungi ${process.env.MARKETPLACE_NAME}
Perkenalkan, saya adalah ${process.env.CHATBOT_NAME} asisten pembantu Admin. Saya dapat membantu Kamu dalam berbagai hal seperti:
- 📒 Mengakses katalog/brosur produk (herbal, beverages, dan cosmetics)
- 📑 Mengakses informasi detail produk (harga, stok, deskripsi)
- 🛒 Melakukan pemesanan produk

Untuk memulai silahkan ketik "*katalog*" untuk mengakses katalog.
Jika kamu perlu informasi lengkap mengenai chatbot silahkan ketik "*bantuan*"
> -akhir pesan-`,
  /** @param { string } text */
  formatAutoResponseMessage: (text) =>
    `${text}\n\n> Ketik "clear" untuk memulai topik baru.`,
  unauthorizedForAdminOnly: `Kode perintah ini hanya dapat digunakan oleh Admin Chatbot.
> -akhir pesan-`,
  acessCatalogue: `*Katalog Produk*
Kamu bisa membuka katalog/brosur PDF terlampir atau

---- *Mencari Informasi Lengkap Produk*
Ketik "*cari <nama produk>*" untuk menampilkan informasi lengkap produk, contoh: "*cari MHS*"

---- *Memesan Produk* (Dropshiper/Dipaket)
Ketik "*pesan <nama produk> # <jumlah>*" untuk menambahkan ke keranjang pemesanan, contoh: "*pesan sarkum # 3*"

---- *Memesan Produk* (Beli Sekarang Diambil Nanti)
Ketik "*beli <nama produk> # <jumlah>*" untuk menambahkan ke keranjang pemesanan, contoh: "*beli sarkum # 3*"

*Tutorial*
Jika Kamu masih bingung, ketik "*tutorial*" untuk melihat video tata cara pemesanan, ketik "*bantuan*" untuk melihat fitur-fitur apa saja yang terdapat pada Chatbot ini.
  
> _${process.env.MARKETPLACE_NAME} - copyright@2024_`,

  prompt_FillCheckoutOrderForms: `Silahkan isikan secara lengkap dan kirimkan ulang form pemesanan berikut setelah pesan ini. Harap tidak mengubah bentuk/format form pemesanan.`,
  prompt_SentPaymentCode: `Silahkan salin kode bayar, dan kirimkan gambar/bukti bayar/transfer dengan caption kode bayar, setelah pesan ini.`,
  prompt_ResubmitConfirmationCode: `Kamu sebelumnya telah mengrimkan form pemesanan, silahkan salin dan kirimkan pesan berikut setelah pesan ini untuk meneruskan pesananmu ke Admin.`,
  prompt_SendOrderConfirmationCode: `Silahkan salin dan kirim kode pesan setelah pesan ini untuk meneruskan pemesanan ke Admin (agar segera disiapkan) dan melanjutkan ke pembayaran. Mohon periksa kembali data pemesananmu sebelum mengkonfirmasi pemesanan.`,

  /* invalid message */

  // products/catalog
  invalid_QueryAccessOrderDetailsInvoiceId: `Silahkan masukan ID Invoice Pemesanan.`,
  invalid_QueryHniIdInput: `Silahkan masukan HNI ID Kamu, contoh: *hniid <HNI ID>*
Contoh lain: *hniid 12345678*
> -akhir pesan-`,
  invalid_QueryAccessCatalog: `Halaman Katalog yang Kamu masukan tidak valid atau tidak dapat ditemukan. (perlu diketahui halaman Katalog harus berupa angka)
> -akhir pesan-`,
  /** @param { string } tagName */
  invalid_NotSelectCategory: `Silahkan pilih kategori yang tersedia, yaitu: *herbal*, *beverages*, dan *cosmetics*.
Contoh penggunaan: *katalog beverages*.
> -akhir pesan-`,
  invalid_QueryProductId: `Masukan ID Produk yang tertera pada Katalog untuk mengakses informasi produk.
Gunakan perintah *produk [ID Produk]*, contoh: *produk 123ABC*.
> -akhir pesan-`,
  invalid_QuerySearchProduct: `Masukan setidaknya 3 huruf dari nama produk yang ingin Kamu cari.
> -akhir pesan-`,
  /** @param { "beli" | "pesan" } type */
  invalid_QueryMultipleOrder: (
    type
  ) => `Untuk memesan produk silahkan ketik *${type} <nama produk> # <jumlah pemesanan>*
Contoh: *${type} Sarkum # 2*
> -akhir pesan-`,
  /** @param { "beli" | "pesan" } type */
  invalid_QueryMulitpleOrderAsIsNaN: (
    type
  ) => `Jumlah pemesanan harus berupa angka positif.
Contoh: *${type} Sarkum # 3*
> -akhir pesan-`,
  invalid_QueryFormsAsEmpty: `Mohon isikan form secara lengkap, harap tidak mengubah format/bentuk form pemesanan.
> -akhir pesan-`,
  invalid_QueryFormsOrder: `Form tidak valid!, mohon untuk tidak mengubah bentuk/format form pemesanan.
Jika masih bingung ketik *tutorial pesan* untuk melihat tata cara pemesanan.
> -akhir pesan-`,
  invalid_QueryPaymentCode: `Silahkan kirim bukti bayar/transfer dengan caption kode bayar yang sebelumnya diberikan.
Jika masih bingung ketik *tutorial bayar* untuk melihat tata cara pembayaran.
> -akhir pesan-`,

  // payment/order
  /** @param { string } tagName */
  invalid_CustomerHasPreviousIncompletedOrders: (
    tagName
  ) => `Dear ${tagName}, Kamu masih memiliki pemesanan produk yang belum dibayar atau diselesaikan.
Silahkan cek data pemesanan dengan menggunakan perintah *keranjang*.
> -akhir pesan-`,
  invalid_QueryInputIsNotNumber: `Jumlah pemesanan harus berupa angka!.
> -akhir pesan-`,
  invalid_QueryOrderInput: `Silahkan masukan ID Produk dan Jumlah Pemesanan, format perintah *pesan [Id Produk] # [Jumlah Pemesanan].
Contoh penggunaan: *pesan 123ABC # 4*.
> -akhir pesan-`,
  invalid_QueryConfirmOrderInputHasEmpty: `Perintah tidak valid!, harap gunakan form pemesanan yang sudah tersedia.
> -akhir pesan-`,
  invalid_QueryOrderIdInput: `Silahkan masukan ORDER-ID, order id dapat diihat melalui data pemesanan Kamu.
Gunakan perintah *keranjang* untuk melihat data pemesanan.
> -akhir pesan-`,
  invalid_QueryUploadPaymentProofInput: `Masukan perintah tidak valid.
Silahkan upload bukti bayar/transfer sesuai nominal pemesanan dengan caption perintah *bayar <Order ID> <VIA>*
Contoh: *bayar ORD-ID-123ABC456 BRI*
> -akhir pesan-`,
  invalid_QueryDeleteOrderInput: `Silahkan masukan ORDER-ID untuk membatalkan pemesanan.
ID Pemesanan bisa kamu dapatkan dengan mengakses data pemesananmu, ketik *keranjang* untuk melihar data pemesanan berlangsung.
> -akhir pesan-`,
  /** @param { string } orderId */
  invalid_CancelOrderAsAlreadyConfirmed: (orderId) =>
    `Tidak bisa membatalkan pemesanan dengan ID Pemesanan *${orderId}* dikarenakan pesanan tersebut sudah dikonfirmasi/selesai.
> -akhir pesan-`,
  /** @param { { productName: string; stock: number; demand: number } } dto */
  invalid_CurrentStockCannotFulfilOrder: ({
    productName,
    stock,
    demand,
  }) => `Maaf jumlah stok produk yang tersedia tidak dapat memenuhi pemesananmu.

Nama Produk: ${productName}
Stok saat ini: ${stock} pcs
Permintaan: ${demand} pcs 

Silahkan hubungi Admin jika stok tidak kunjung diupdate, ketik *admin* untuk mendapatkan kontak Admin.
> -akhir pesan-`,
  invalid_CancelOrderAsAlreadyForwarded: `Pemesanan Kamu sebelumnya telah diteruskan ke Admin.
Mohon tunggu hingga Admin memverifikasi/mengkonfirmasi dan melampirkan pemesanan milik Kamu. Setelah Admin mengkonfirmasi, Kamu dapat memilih melanjutkan pembayaran atau membatalkan pemesanan.
> -akhir pesan-`,
  invalid_HhniIdIsNotAddedYet: `Kamu belum menambahkan HNI ID, ketik "*hniid <NOMOR HNI ID>* untuk menambahkan.
Contoh: "*hniid 0123456*"`,
  invalid_OrderIsAlreadyOngoing: `Pesanan Kamu sebelumnya belum selesai, tunggu hingga pesanan dikonfirmasi Admin.`,

  /* Not Found Message */
  notFound_CustomerHasNeverOrder: `Kamu belum pernah melakukan pemesanan sebelumnya, kamu dapat memesan dengan cara ketik "*pesan <nama produk> # <jumlah pemesanan>*".
Contoh: *pesan Sarkum # 2*
> -akhir pesan-`,
  notFound_CatalogHasEmptyProducts: `Katalog produk kosong, tidak ada produk untuk ditampilkan.
> -akhir pesan-`,
  /** @param { string } query */
  notFound_SearchedProductNotExist: (query) =>
    `Nama produk *${query}* yang Kamu cari tidak dapat ditemukan. Silahkan ketik *katalog* untuk menampilkan Katalog Produk.

Jika produk terdapat pada Katalog dan tetap  tidak bisa ditemukan, silahkan hubungi Admin agar produk ditambahkan pada pencarian, ketik *admin* untuk mendapatkan kontak Admin.
> -akhir pesan-`,
  /** @param { string } productId */
  notFound_ProductId: (productId) =>
    `ID Produk *${productId} yang Kamu masukan tidak dapat ditemukan, silahkan cek melalui katalog.
> -akhir pesan-`,
  /** @param { string } orderId */
  notFound_OrderId: (orderId) =>
    `ID Pemesanan: *${orderId}* yang Kamu masukan tidak valid atau tidak dapat ditemukan.
> -akhir pesan-`,
  /** @param { string } invoiceId */
  notFound_InvoceId: (invoiceId) =>
    `ID Invoice *${invoiceId}* tidak ditemukan!.
> -akhir pesan-`,
  notFound_CustomerHasEmptyBuckets: `Kamu tidak memiliki produk pada keranjang pemesanan, silahkan tambah produk kedalam keranjang dengan cara:
ketik *pesan <nama produk> # <jumlah pemesanan>*
Contoh: *pesan sarkum # 2*
> -akhir pesan-`,
  notFound_CustomerHasEmptyOrder: `Saat ini Kamu tidak memiliki data pemesanan, data pemesanan akan ditampilkan ketika Kamu telah melakukan pemesanan produk.
> -akhir pesan-`,
  notFound_CustomerHasEmptyCompletedOrders: `Kamu saat ini tidak memiliki riwayat pembelian atau pemesanan. Data akan tampil ketika Kamu telah melakukan pemesanan produk.
> -akhir pesan-`,
  notFound_DistrictOnFormsUnrecognized: `Nama Kota/Kabupaten yang Kamu masukan tidak ditemukan, silahkan periksa kembali nama kota yang dimasukan.
  
Kamu bisa mengecek dengan cara ketik:
"*carikota <nama kota/kabupaten>*"
Contoh: *carikota Cilacap*

Untuk memeriksa apakah data kota tersebut terdaftar atau tidak.
> -akhir pesan-`,

  /* Success Message */
  success_DeleteCustomerBuckets: `Sukses menghapus semua produk pada keranjang pemesanan!
> -akhir pesan-`,
  /** @param { string } orderId */
  success_CancelOrder: (orderId) =>
    `Sukses membatalkan pemesanan dengan ID Pemesanan *${orderId}*, cek perubahan dengan mengakses *keranjang*.
> -akhir pesan-`,
  /** @param { string } orderId */
  success_UploadPaymentProof: (
    orderId
  ) => `Sukses menerima bukti pembayaran dengan ID Pemesanan: *${orderId}*.
Silahkan tunggu hingga Admin memverifikasi pemesanan dan bukti bayar Kamu. Invoice akan dikirimkan secara otomatis setelah proses verifikasi berhasil dilakukan.
> -akhir pesan-`,

  /** @param { string } title @param { string } memPrice @param { number } stock @param { number } sold @param { number } poin */
  notification_DisplayShowcasedProduct: (title, memPrice, stock, sold, poin) =>
    `\n*${title}*
Harga/pcs: Rp.${Tools.localePrice(memPrice)}
Stok: ${stock}
Terjual: ${sold} pcs
Poin perolehan/pcs: ${poin}`,
  /** @param { string } hniId */
  notification_SuccessAddedHniId: (hniId) =>
    `Sukses menambahkan *HNI ID ${hniId}*.
> -akhir pesan-`,
  /** @param { string } totals @param { string } query */
  notification_ShowsSearchedProducts: (totals, query) =>
    `Menampilkan ${totals} hasil pencarian produk dengan kata kunci: *${query}*`,
  notification_SuccessAddProductsToBuckets: `Jika terdapat tambahan produk, gunakan format perintah yang sama.
> -akhir pesan-`,
  notification_ForwardingPayment: `Meneruskan pembayaranmu ke Admin...`,
  notification_SuccessSubmitPayment: `Berhasil meneruskan pembayaran ke Admin, silahkan tunggu hingga Admin memverifikasi pembayaran dan pemesananmu. Setelah Admin berhasil memeverifikasi pembayaran, Admin akan memeproses pemesananmu dan mengirimkan Invoice Pemesanan.
> -akhir pesan-`,
  /** @param { string } orderId */
  notification_OrderIsAlreadyPayed: (orderId) =>
    `Pesananmu dengan Order Id ${orderId} sebelumnya telah dibayarkan sebelumnya.
Ketik *pesanan-saya* atau *riwayat* untuk melihat daftar pemesanan selesai.
> -akhir pesan-`,
  /** @param { string } orderId */
  notification_OrderIsAlreadyCompleted: (orderId) =>
    `Pesananmu dengan Order Id ${orderId} sebelumnya telah berstatus selesai.
Ketik *pesanan-saya* atau *riwayat* untuk melihat daftar pemesanan selesai.
> -akhir pesan-`,
  /** @param { string } orderId */
  notification_OrderIsAlreadyForwarded: (orderId) =>
    `Pesananmu dengan Order Id ${orderId} sebelumnya telah diteruskan ke Admin, silahkan tunggu hingga Admin memproses pesananmu.
> -akhir pesan-`,
  /** @param { string } orderId */
  notification_OrderIsAlreadyComfirmed: (orderId) =>
    `Kamu sebelumnya telah menerima lampiran konfirmasi pemesanan dengan ID Pemesanan *${orderId}* dari Admin.
Jika kamu ingin membatalkan pemesanan dan memulai dari awal ketik silahkan "*batal*".
> -akhir pesan-`,
  /** @param { string } transactionId */
  notification_OrderHasCanceled: (
    transactionId
  ) => `*Pemberitahuan Pemesanan Dibatalkan*
Pembayaranmu dengan ID Transaksi ${transactionId} telah diverifikasi dan dinyatakan tidak valid oleh Admin dan pemesananmu batal/tidak diproses.

Kamu dapat memesan ulang dengan cara yang sama pada lengkah-langkah sebelumnya.
> -akhir pesan-`,
  /** @param { string } orderId */
  notification_OrderHasConfirmed: (orderId) =>
    `Pemesananmu dengan ID Pemesanan *${orderId}* telah dikonfirmasi dan sedang diproses oleh Admin!
Silahkan tunggu hingga Admin mengirimkan Invoice Pemesanan.
> -akhir pesan-`,
};

/* ====================== */

const commonAdminRegularMessage = {
  waitUploadingProduct: `Mohon tunggu sebentar, sedang mengupload data produk...`,
  /** @param { string } transactionId */
  prompt_FillQueryUploadProductForms: `Silahkan isikan Forms Upload Produk Baru setelah pesan ini, data produk akan disimpan ketika kamu mengirimkan form upload produk.`,
  prompt_FillQueryEditProductForms: `Silahkan kirim ulang form edit produk setelah dilakukan perubahan/penyesuaian data produk, harap tidak mengubah struktur format form edit yang ada.`,
  prompt_ApproveOrCancelCustomerOrder: `Silahkan salin dan kirimkan ulang pesan setelah pesan ini untuk mengkonfirmasi/membatalkan pemesanan.`,
  prompt_FillQueryCekOngkirFormsInput: `Mohon isikan dan kirim ulang form cek ongkir berikut setelah pesan ini.`,

  invalid_QueryCekOngkirFormsInput: `Mohon isikan form cek ongkir secara lengkap dan sesuai instruksi.`,
  invalid_QueryCekOngkirFormsWeightInput: `Berat harus berupa angka positif!.`,
  invalid_QueryCekOngkirFormsExpeditionInput: `Ekspedisi hanya dapat berupa: JNE, TIKI, dan POS.`,
  invalid_QueryCekOngkirFormsAsNotMatch: `Forms Tidak Valid!, mohon untuk tidak mengubah struktur/format Form Cek Ongkir.`,
  invalid_QueryOrderIdInput: `Silahkan masukan ORDER-ID, gunakan perintah *listorder* untuk melihat daftar pemesanan berlangsung.`,
  invalid_QueryTransactionIdInput: `Silahkan upload gambar invoice dengan caption *konfirmasi-pemesanan [TRX-ID]*, transaction id didapat setelah customer mengirim bukti bayar/transfer.`,
  invalid_QueryTransactionIdAsEmpty: `Silahkan masukan TRX-ID, untuk melihat list transaksi gunakan perintah *listtransaksi*. Contoh penggunaaan: /*transaksi <ID Transaksi>*.`,
  invalid_QueryEditProductIdInput: `Silahkan masukan ID Produk yang ingin di edit.
Contoh: *edit <ID Produk>*
Contoh lain: *edit 123ABCD*
  
Kamu bisa melihat data lengkap produk dengan mengetik *listproduk* untuk mendapatkan ID Produk.
Kamu dapat melihat keseluruhan data produk dengan mengetik *listproduk*.
> -akhir pesan-`,
  invalid_QueryDeleteProductIdInput: `Silahkan masukan ID Produk yang ingin dihapus.
Contoh: *hapusproduk <ID Produk>*
Contoh lain: *hapusproduk 123ABCD*
  
Kamu dapat melihat keseluruhan data produk dengan mengetik *listproduk*.
> -akhir pesan-`,
  /** @param { string } transactionId */
  invalid_TransactionIdAlreadyConfirmed: (transactionId) =>
    `ID Transaksi *${transactionId}* sudah dikonfirmasi sebelumnya.
> -akhir pesan-`,
  invalid_ProductOutOfStock: `Tidak dapat mengkonfirmasi pemesanan dikarenakan stok produk tidak memenuhi pemesanan. Silahkan ubah data stok produk terlebih dahulu dengan cara ketik *edit <ID Produk>* agar pemesanan bisa diproses.
> -akhir pesan-`,
  invalid_QueryFormsAsEmpty: `Mohon isikan forms secara lengkap dan pastikan tidak mengubah bentuk/struktur/format form.
> -akhir pesan-`,
  invalid_QueryImageInvoiceFormInput: `Mohon upload gambar bukti/invoice pemesanan dengan caption form Invoice Pemesanan yang sudah di isi secara lengkap.
> -akhir pesan-`,
  invalid_QueryImageUploadFormInput: `Mohon upload gambar dengan caption Forms Upload Produk Baru yang sudah diisikan secara lengkap.
> -akhir pesan-`,
  invalid_QueryImageEditFormInput: `Mohon upload gambar dengan caption Forms Edit Produk yang sudah diisikan secara lengkap.
> -akhir pesan-`,
  invalid_QueryFormsUploadNotMatch: `Forms Upload Produk Baru tidak valid!
Mohon isikan forms sesuai dengan ketentuan dan tidak mengubah bentuk atau format forms.

Jika masih bingung, ketik *tutorial upload* untuk melihat tata cara dalam mengupload data produk baru.
> -akhir pesan-`,
  invalid_QueryFormsEditNotMatch: `Forms Edit Produk tidak valid!
Mohon isikan forms sesuai dengan ketentuan dan tidak mengubah bentuk atau format forms.

Jika masih bingung, ketik *tutorial edit* untuk melihat tata cara dalam mengedit data produk baru.
> -akhir pesan-`,
  invalid_QueryFormsDoesNotMatch: `Form tidak valid!, harap tidak mengubah bentuk/format Form Invoice Pemesanan.
> -akhir pesan-`,
  /** @param { string } orderId */
  invalid_OrderIdAlreadySubmitedInvoice: (orderId) =>
    `Kamu sudah mengirimkan Bukti Invoice untuk ID Pemesanan *${orderId}* sebelumnya.
> -akhir pesan-`,

  /** @param { string } productId */
  notFound_ProductId: (productId) =>
    `Id Produk *${productId}* tidak dapat ditemukan. Gunakan perintah *listproduk* untuk melihat daftar keseluruhan produk yang ada.
> -akhir pesan-`,
  /** @param { string } orderId */
  notFound_OrderId: (orderId) =>
    `Order id *${orderId}* tidak dapat ditemukan. Silahkan periksa kembali data pemesanan.
> -akhir pesan-`,
  /** @param { string } transactionId */
  notFound_transactionId: (transactionId) =>
    `ID Transaksi *${transactionId}* tidak dapat ditemukan.
Silahkan periksa kembali data pembayaran, Kamu dapat melihat daftar transaksi dengan mengetik *listtransaksi*.
> -akhir pesan-`,
  /** @param { string } orderId @param { string } transactionId */
  notFound_orderAndTransactionIDs: (orderId, transactionId) =>
    `ID Pemesanan *${orderId}* atau ID Transaksi *${transactionId}* tidak ditemukan!
> -akhir pesan-`,

  /** @param { string } productId */
  success_CreateProduct: (productId) =>
    `Berhasil mengupload produk!, dengan id *${productId}*.
> -akhir pesan-`,
  /** @param { string } productId */
  success_UpdateProduct: (productId) =>
    `Berhasil mengedit/mengupdate produk!, dengan id *${productId}*.
> -akhir pesan-`,
  success_DeleteProduct: (productId) =>
    `Berhasil menghapus produk!, dengan ID Produk *${productId}*.
> -akhir pesan-`,

  /** @param { string } orderId */
  success_ConfirmCustomerOrder: (orderId) =>
    `Sukses mengkonfirmasi pemesanan dengan ID Pemesanan *${orderId}*.
Notifikasi pemberitahuan pesanan diterima telah diteruskan ke Pelanggan.
> -akhir pesan-`,
  /** @param { string } transactionId */
  success_CancelCustomerOrder: (transactionId) =>
    `Sukses membatalkan pemesanan dengan ID Transaksi *${transactionId}*.
Pelanggan telah menerima notifikasi pembatalan pemesanan.
> -akhir pesan-`,

  notification_NoOngoingOrdersExist: `Saat ini tidak ada data pemesanan yang sedang berlangsung.
Data pemesanan berlangsung akan tampil jika terdapat pelanggan yang melakukan pemesanan.
> -akhir pesan-`,
  notification_NoCompletedOrdersExist: `Saat ini tidak ada data pemesanan selesai untuk ditampilkan.
Data pesanan selesai akan muncul jika terdapat pemesanan yang statusnya selesai.
> -akhir pesan-`,
  notification_NoTransactionsExist: `Saat ini tidak ada data pembayaran untuk ditempilkan.
Daftar pembayaran akan muncul jika terdapat Pelanggan yang melakukan transaksi/upload bukti bayar atau berupa pemesanan yang statusnya sudah selesai.
> -akhir pesan-`,
  notification_SendingInvoice: `Mengirimkan Invoice ke Pelanggan...`,
  notification_SuccessSendInvoice: `Sukses mengirimkan Invoice ke Pelanggan!
> -akhir pesan-`,
};

module.exports = { commonCustomerRegularMessage, commonAdminRegularMessage };
