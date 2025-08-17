import json

# ===== CONFIG =====
file_path = "cham-soc-rang-mieng.json"  # tên file dataset hiện tại
main_category = "Chăm sóc cá nhân"  # category lớn
sub_category = "Chăm sóc răng miệng"  # category nhỏ
# ==================

with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Thêm category vào từng sản phẩm
for item in data:
    item["main_category"] = main_category
    item["sub_category"] = sub_category

# Ghi đè lại file cũ
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Đã thêm category vào {len(data)} sản phẩm trong '{file_path}'")