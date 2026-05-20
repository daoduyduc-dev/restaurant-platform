# Test Report

Generated: 2026-05-18T09:47:20.820Z

## Customer

### TC001 - Dang nhap
- Steps:
  1. Mo trang dang nhap.
  2. Nhap tai khoan `customer@servegenius.com` va mat khau `customer123`.
  3. Bam `Sign In`.
- Expected:
  Customer dang nhap thanh cong va thay dashboard customer.
- Actual:
  Dashboard customer render thanh cong voi heading `Huong dan dat ban va dat mon`; sidebar hien dung role `CUSTOMER`.
- Status: PASSED

### TC002 - Dat ban tu so do ban
- Steps:
  1. Vao man `So do ban`.
  2. Chon ban `F1-11`.
  3. Nhap thong tin khach `E2E Customer 584008`, phone `0997584008`, 2 khach, thoi gian `2026-05-19 19:00`.
  4. Bam `Confirm Booking`.
- Expected:
  Reservation duoc tao thanh cong va gan cho customer dang dang nhap.
- Actual:
  Dat ban thanh cong cho ban `F1-11` luc `2026-05-19 19:00`; reservation id `d0baa879-88f8-4b36-ab24-bf8f86af8580`, status `RESERVED`.
- Status: PASSED

### TC003 - Dat mon tu menu cho reservation
- Steps:
  1. Vao man `Thuc don`.
  2. Chon 2 mon kha dung va them vao gio.
  3. Bam `Place Order`.
  4. Doi chieu order vua tao tu backend.
- Expected:
  He thong tao order moi cho reservation active, status `OPEN`, dung line items da chon.
- Actual:
  Order `eaa571af-4ff7-43ba-9a08-9b60c6fe40ed` duoc tao cho ban `F1-11` voi 2 mon; status `OPEN`.
- Status: PASSED

### TC004 - Theo doi order cua toi
- Steps:
  1. Vao man `Order cua toi`.
  2. Kiem tra order active cua customer.
- Expected:
  Trang hien thi dung order active voi ban, tong tien, va status hien tai.
- Actual:
  Trang order hien thi dung don `eaa571af-4ff7-43ba-9a08-9b60c6fe40ed` tai `F1-11`; status `OPEN`, tong tien `55`.
- Status: PASSED

## Staff

### TC101 - Dang nhap
- Steps:
  1. Mo trang dang nhap.
  2. Nhap tai khoan `staff@servegenius.com` va mat khau `staff123`.
  3. Bam `Sign In`.
- Expected:
  Staff dang nhap thanh cong va thay dashboard ca lam.
- Actual:
  Dashboard staff render thanh cong voi heading `Ca lam hom nay`; navigation co `Don dat ban`, `Order & bep`, `Thanh toan`.
- Status: PASSED

### TC102 - Tao booking / walk-in
- Steps:
  1. Vao man `Don dat ban`.
  2. Bam `Add Walk-in / Booking`.
  3. Nhap khach `E2E Walkin 584008`, phone `0897584008`, thoi gian `2026-05-20 18:00`, chon ban `F1-01`.
  4. Bam `Save Booking`.
- Expected:
  Staff tao duoc booking moi voi status `RESERVED`.
- Actual:
  Booking walk-in duoc tao thanh cong voi id `ea579f08-8b46-431d-8389-a038cad23ade`, ban `F1-01`, status `RESERVED`.
- Status: PASSED

### TC103 - Check-in reservation cua khach
- Steps:
  1. Vao man `Don dat ban`.
  2. Loc ngay `2026-05-19` va tim reservation cua `E2E Customer 584008`.
  3. Bam `Check In`.
  4. Doi chieu reservation va order tu backend.
- Expected:
  Reservation chuyen sang `CHECKED_IN`, ban thanh `OCCUPIED`, order duoc day sang luong phuc vu.
- Actual:
  Reservation `d0baa879-88f8-4b36-ab24-bf8f86af8580` da duoc check-in; status `CHECKED_IN`, order hien tai `COOKING`.
- Status: PASSED

### TC104 - Xu ly order den SERVED
- Steps:
  1. Vao man `Order & bep`.
  2. Tim card order cua ban `F1-11`.
  3. Thuc hien cac action tu `COOKING` den `READY`, sau do `SERVED`.
  4. Doi chieu lai status order tu backend.
- Expected:
  Staff cap nhat duoc order den trang thai `SERVED`.
- Actual:
  Order `eaa571af-4ff7-43ba-9a08-9b60c6fe40ed` tai `F1-11` da duoc day den status `SERVED`.
- Status: PASSED

### TC105 - Xac nhan thanh toan
- Steps:
  1. Vao man `Thanh toan`.
  2. Chon reservation cua `E2E Customer 584008`.
  3. Kiem tra hoa don va bam `Confirm Payment`.
  4. Doi chieu order va reservation sau thanh toan.
- Expected:
  Order chuyen sang `PAID` va reservation chuyen sang `COMPLETED`.
- Actual:
  Thanh toan thanh cong cho order `eaa571af-4ff7-43ba-9a08-9b60c6fe40ed`; order=`PAID`, reservation=`COMPLETED`.
- Status: PASSED

## Admin

### TC201 - Dang nhap
- Steps:
  1. Mo trang dang nhap.
  2. Nhap tai khoan `admin@servegenius.com` va mat khau `admin123`.
  3. Bam `Sign In`.
- Expected:
  Admin dang nhap thanh cong va thay dashboard quan tri.
- Actual:
  Dashboard admin render thanh cong voi cac module `Bao cao`, `Nhan su`, `Cau hinh`.
- Status: PASSED

### TC202 - Tao mon moi trong menu
- Steps:
  1. Vao man `Thuc don`.
  2. Bam `Add Item`.
  3. Nhap mon `E2E Dish 584008`, gia `37.50`, chon category dau tien, roi luu.
  4. Doi chieu item vua tao tu backend.
- Expected:
  Admin tao thanh cong mon moi trong menu.
- Actual:
  Tao mon thanh cong voi id `bd92ee0e-7a4b-47f2-927c-4eaa43c0be2e`, category `Appetizer`, gia `37.5`.
- Status: PASSED

### TC203 - Chinh sua mon trong menu
- Steps:
  1. Tim mon `E2E Dish 584008` trong man `Thuc don`.
  2. Bam `Edit`.
  3. Cap nhat gia thanh `41.25` va luu.
  4. Doi chieu lai du lieu tu backend.
- Expected:
  Admin cap nhat duoc thong tin mon va gia moi duoc luu thanh cong.
- Actual:
  Mon `E2E Dish 584008` da duoc cap nhat thanh gia `41.25`.
- Status: PASSED

### TC204 - Xem bao cao tong quan
- Steps:
  1. Vao man `Bao cao`.
  2. Kiem tra cac widget doanh thu, so order, va top menu items.
- Expected:
  Admin xem duoc dashboard bao cao voi so lieu va chart.
- Actual:
  Bao cao render thanh cong voi cac card `Total Revenue`, `Completed Orders`, `Avg Order Value`, va phan `Top Menu Items`.
- Status: PASSED

### TC205 - Them nhan su moi
- Steps:
  1. Vao man `Nhan su`.
  2. Bam `Add Staff`.
  3. Nhap ten `E2E Staff 584008`, email `e2e.staff.1779097584008@example.com`, de role mac dinh `WAITER`, roi submit.
  4. Kiem tra tai khoan moi co duoc tao hay khong.
- Expected:
  Admin tao duoc tai khoan nhan su moi va thay nhan su do xuat hien trong danh sach.
- Actual:
  UI hien thi `Failed to add staff`; tai khoan moi khong duoc tao.
- Status: FAILED
- Console error:
  `Failed to load resource: the server responded with a status of 500 ()`
- Nguyen nhan kha nang cao:
  Frontend Staff Management gui role `WAITER`, `RECEPTIONIST`, hoac `MANAGER`, nhung backend chi seed va ho tro `ADMIN`, `STAFF`, `CUSTOMER`.
- De xuat huong sua:
  Chuan hoa role gui tu frontend sang role backend hien co, hoac mo rong backend de ho tro cac role chi tiet.
- Snippet/logic can chinh:
```ts
const ROLE_TO_BACKEND = {
  ADMIN: 'ADMIN',
  MANAGER: 'ADMIN',
  WAITER: 'STAFF',
  RECEPTIONIST: 'STAFF',
};

await api.post('/users', {
  name: formData.name,
  email: formData.email,
  password: formData.password,
  roles: [ROLE_TO_BACKEND[formData.role] || 'STAFF']
});
```

### TC206 - Luu cau hinh he thong
- Steps:
  1. Vao man `Cau hinh`.
  2. Doi `Restaurant Name` thanh `ServeGenius E2E 584008`.
  3. Bam `Save Changes` roi reload trang.
  4. Kiem tra gia tri moi co duoc giu lai hay khong.
- Expected:
  Cau hinh duoc luu ben vung; reload trang van thay gia tri moi.
- Actual:
  Sau reload, `Restaurant Name` quay ve `ServeGenius Restaurant` thay vi giu `ServeGenius E2E 584008`.
- Status: FAILED
- Console error:
  Khong co browser console error duoc capture.
- Nguyen nhan kha nang cao:
  Nut Save trong Settings chi hien toast thanh cong; `handleSave` chua goi API va state cung khong duoc persist. Reload trang se reset ve hard-coded defaults.
- De xuat huong sua:
  Tao API lay/luu settings va nap lai state tu backend khi mo trang.
- Snippet/logic can chinh:
```ts
const handleSave = async () => {
  await api.put('/settings', settings);
  toast.success('Settings saved successfully!');
};

useEffect(() => {
  api.get('/settings').then((res) => setSettings(res.data.data));
}, []);
```
