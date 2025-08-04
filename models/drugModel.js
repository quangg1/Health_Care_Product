const mongoose = require('mongoose');

const giaThuocSchema = new mongoose.Schema({
  ngayKeKhai: String,
  donViKeKhai: String,
  dongGoi: String,
  giaKeKhai: String,
  donViTinh: String
}, { _id: false });

const drugSchema = new mongoose.Schema({
  soDangKy: { type: String, required: true },
  tenThuoc: { type: String, required: true },
  thanhPhan: { type: String },
  congTy: { type: String },
  quocGia: { type: String },

  linkChiTiet: { type: String },
  imageUrl: { type: String },

  dangBaoChe: { type: String },
  dongGoi: { type: String },
  hanSuDung: { type: String },
  congTySx: { type: String },
  congTyDk: { type: String },
  hoatChatVaNongDo: { type: String },
  huongDan: { type: String }, // iframe src link to hướng dẫn

  giaThuoc: [giaThuocSchema]
}, { timestamps: true });

module.exports = mongoose.model('DrugVN', drugSchema);